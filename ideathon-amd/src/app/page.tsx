"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, Zap, CheckCircle2, ChevronRight, Activity, Barcode, X, Edit3, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { uploadMealImage, createMeal } from "@/lib/firebase/meals";
import { isMockMode } from "@/lib/firebase/config";
import BarcodeScanner from "@/components/BarcodeScanner";
import { fetchProductByBarcode, ProductNutrition } from "@/lib/api/openFoodFacts";
import { analyzeImageWithGemini, GeminiAnalysisResult } from "@/lib/api/geminiVision";
import { getPersonalizedRecommendation, NutritionRecommendation } from "@/lib/api/nutritionRecommendation";
import NutritionRecommendationCard from "@/components/NutritionRecommendationCard";

type ScanMode = "ai" | "barcode";

interface EditableNutrition {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
}

export default function CameraPage() {
  const [scanMode, setScanMode] = useState<ScanMode>("ai");

  // Shared state
  const [scanComplete, setScanComplete] = useState(false);
  const [loadingLog, setLoadingLog] = useState(false);

  // AI mode state
  const [imageCaptured, setImageCaptured] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<GeminiAnalysisResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<EditableNutrition | null>(null);

  // Barcode mode state
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);
  const [productData, setProductData] = useState<ProductNutrition | null>(null);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);

  // Recommendation state
  const [recommendation, setRecommendation] = useState<NutritionRecommendation | null>(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [user, loading, router]);

  // ─── AI Flow ───────────────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setFileToUpload(file);
    setImageCaptured(URL.createObjectURL(file));
    setIsAnalyzing(true);
    setAiError(null);
    setScanComplete(false);

    try {
      const result = await analyzeImageWithGemini(file);
      setAiResult(result);
      const ed = {
        name: result.foods.map((f) => f.name).join(", ") || "Unknown food",
        calories: result.totalCalories,
        protein: result.totalProtein,
        carbs: result.totalCarbs,
        fats: result.totalFats,
        fiber: result.totalFiber,
        sugar: result.totalSugar,
      };
      setEditableData(ed);
      setScanComplete(true);
      // Fire recommendation immediately after scan
      if (profile) {
        setLoadingRec(true);
        setRecError(null);
        getPersonalizedRecommendation(profile, result.foods.map(f => f.name), {
          ...ed, healthScore: result.healthScore,
        }).then(setRecommendation).catch((e) => setRecError(e.message)).finally(() => setLoadingRec(false));
      }
    } catch (err: any) {
      setAiError(err.message || "AI analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ─── Barcode Flow ───────────────────────────────────────────────
  const handleBarcodeResult = async (barcode: string) => {
    if (isFetchingProduct || scanComplete) return;
    setIsFetchingProduct(true);
    setBarcodeError(null);
    try {
      const product = await fetchProductByBarcode(barcode);
      if (product) {
        setProductData(product);
        setScanComplete(true);
        // Fire recommendation for barcode product
        if (profile) {
          setLoadingRec(true);
          setRecError(null);
          getPersonalizedRecommendation(profile, [product.name], {
            calories: product.calories, protein: product.protein, carbs: product.carbs,
            fats: product.fats, fiber: product.fiber, sugar: product.sugar,
            healthScore: product.healthScore,
          }).then(setRecommendation).catch((e) => setRecError(e.message)).finally(() => setLoadingRec(false));
        }
      } else {
        setBarcodeError(`Product not found for barcode: ${barcode}`);
      }
    } catch {
      setBarcodeError("Error fetching product data.");
    } finally {
      setIsFetchingProduct(false);
    }
  };

  // ─── Log Meal ───────────────────────────────────────────────────
  const handleLogMeal = async () => {
    if (!user) return;
    setLoadingLog(true);
    try {
      if (isMockMode) {
        setTimeout(() => router.push("/feed"), 800);
        return;
      }

      let imageURL = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800";
      if (scanMode === "ai" && fileToUpload) {
        imageURL = await uploadMealImage(user.uid, fileToUpload);
      } else if (scanMode === "barcode" && productData?.image) {
        imageURL = productData.image;
      }

      const src = scanMode === "barcode" ? productData : editableData;
      const aiSrc = scanMode === "ai" && editableData ? editableData : null;
      const barcodeSrc = scanMode === "barcode" && productData ? productData : null;

      await createMeal({
        userId: user.uid,
        imageURL,
        detectedFoods: scanMode === "barcode"
          ? [barcodeSrc!.name]
          : aiResult?.foods.map((f) => f.name) ?? [aiSrc?.name ?? "Food"],
        calories: aiSrc?.calories ?? barcodeSrc?.calories ?? 0,
        protein: aiSrc?.protein ?? barcodeSrc?.protein ?? 0,
        carbs: aiSrc?.carbs ?? barcodeSrc?.carbs ?? 0,
        fats: aiSrc?.fats ?? barcodeSrc?.fats ?? 0,
        fiber: aiSrc?.fiber ?? barcodeSrc?.fiber ?? 0,
        sugar: aiSrc?.sugar ?? barcodeSrc?.sugar ?? 0,
        nutritionScore: scanMode === "barcode" ? (barcodeSrc?.healthScore ?? 50) : (aiResult?.healthScore ?? 50),
        mealTimestamp: Date.now(),
        createdAt: Date.now(),
      });

      router.push("/feed");
    } catch (err) {
      console.error("Error logging meal:", err);
    } finally {
      if (!isMockMode) setLoadingLog(false);
    }
  };

  // ─── Reset ──────────────────────────────────────────────────────
  const reset = () => {
    setImageCaptured(null);
    setFileToUpload(null);
    setScanComplete(false);
    setIsAnalyzing(false);
    setAiResult(null);
    setAiError(null);
    setEditableData(null);
    setIsEditing(false);
    setIsFetchingProduct(false);
    setProductData(null);
    setBarcodeError(null);
    setRecommendation(null);
    setLoadingRec(false);
    setRecError(null);
  };

  // ─── Derived display values ─────────────────────────────────────
  const displayName = scanMode === "barcode"
    ? (productData?.name ?? "")
    : (editableData?.name ?? "");
  const displayCal = scanMode === "barcode" ? (productData?.calories ?? 0) : (editableData?.calories ?? 0);
  const displayProtein = scanMode === "barcode" ? (productData?.protein ?? 0) : (editableData?.protein ?? 0);
  const displayCarbs = scanMode === "barcode" ? (productData?.carbs ?? 0) : (editableData?.carbs ?? 0);
  const displayFats = scanMode === "barcode" ? (productData?.fats ?? 0) : (editableData?.fats ?? 0);
  const displayFiber = scanMode === "barcode" ? (productData?.fiber ?? 0) : (editableData?.fiber ?? 0);
  const displaySugar = scanMode === "barcode" ? (productData?.sugar ?? 0) : (editableData?.sugar ?? 0);
  const displayGrade = scanMode === "barcode" ? (productData?.grade ?? "–") : (aiResult ? `${aiResult.confidence}%` : "–");
  const isLowConfidence = scanMode === "ai" && aiResult && aiResult.confidence < 70;

  if (loading || !user) return <div className="min-h-screen bg-black" />;

  const showScanner = !scanComplete && !(scanMode === "ai" && imageCaptured);

  return (
    <main className="relative min-h-screen bg-black flex flex-col items-center justify-start pt-12 pb-24 overflow-hidden">

      {/* Mode toggle — visible only on the scan screen */}
      {showScanner && (
        <div className="z-20 w-full px-6 mb-8 mt-4 flex justify-center">
          <div className="glass flex items-center p-1 rounded-full gap-1 w-full max-w-xs">
            {(["ai", "barcode"] as ScanMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => { setScanMode(mode); reset(); }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all",
                  scanMode === mode ? "bg-white/10 text-white shadow-md" : "text-white/50 hover:text-white"
                )}
              >
                {mode === "ai" ? <Camera className="w-4 h-4" /> : <Barcode className="w-4 h-4" />}
                {mode === "ai" ? "AI Photo" : "Barcode"}
              </button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">

        {/* ── SCAN VIEW ─────────────────────────────────────── */}
        {showScanner && (
          <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full flex-1 flex flex-col items-center justify-center px-6">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

            {scanMode === "ai" ? (
              <>
                <div className="text-center z-10 space-y-3 mb-12">
                  <h1 className="text-4xl font-bold tracking-tight text-white">Snap your meal</h1>
                  <p className="text-white/60">Gemini AI will detect every food item and its macros.</p>
                </div>
                <div className="relative w-72 h-72 rounded-full border border-white/10 flex items-center justify-center z-10 mb-16 shadow-[0_0_100px_rgba(195,255,0,0.1)]">
                  <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping" style={{ animationDuration: "3s" }} />
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-xl">
                    <div className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center">
                      <Camera className="w-8 h-8 text-black" />
                    </div>
                  </button>
                </div>
                <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                <button onClick={() => fileInputRef.current?.click()}
                  className="glass px-6 py-3 rounded-full flex items-center gap-2 font-medium hover:bg-white/10 transition-colors text-sm z-10">
                  <Upload className="w-4 h-4" /> Upload Photo
                </button>
              </>
            ) : (
              <div className="w-full max-w-md flex flex-col items-center z-10">
                <div className="text-center space-y-3 mb-8">
                  <h1 className="text-3xl font-bold tracking-tight text-white">Scan Barcode</h1>
                  <p className="text-white/60">Point your camera at any food product barcode.</p>
                </div>
                <BarcodeScanner onResult={handleBarcodeResult} />
                {isFetchingProduct && (
                  <div className="mt-8 flex flex-col items-center gap-3 text-primary">
                    <Activity className="w-6 h-6 animate-pulse" />
                    <p className="font-medium animate-pulse">Fetching product data…</p>
                  </div>
                )}
                {barcodeError && (
                  <div className="mt-6 bg-red-500/10 border border-red-500/40 rounded-2xl p-4 text-center w-full max-w-xs space-y-3">
                    <p className="text-red-400 text-sm font-medium">{barcodeError}</p>
                    <button onClick={() => { setBarcodeError(null); setScanMode("ai"); }}
                      className="w-full text-xs bg-primary text-black font-semibold py-2.5 rounded-lg hover:bg-primary/90 transition-colors">
                      Try AI Photo Instead
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── AI ANALYZING VIEW ─────────────────────────────── */}
        {scanMode === "ai" && imageCaptured && !scanComplete && (
          <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="w-full flex flex-col items-center px-4 max-w-md mx-auto z-10">
            <div className="w-full h-64 rounded-3xl overflow-hidden shadow-2xl relative mb-8">
              <img src={imageCaptured} alt="Food" className="w-full h-full object-cover" />
              {isAnalyzing && (
                <>
                  <motion.div
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 w-full h-1 bg-primary shadow-[0_0_15px_#c3ff00]"
                    style={{ position: "absolute" }}
                  />
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
                    <Zap className="w-10 h-10 text-primary animate-pulse" />
                    <span className="text-white font-semibold">Gemini is analyzing…</span>
                    <span className="text-white/60 text-sm">Identifying foods & estimating nutrition</span>
                  </div>
                </>
              )}
              {aiError && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 p-6">
                  <p className="text-red-400 text-center text-sm">{aiError}</p>
                  <button onClick={reset} className="bg-primary text-black font-semibold px-4 py-2 rounded-lg text-sm">Try Again</button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── NUTRITION DASHBOARD ───────────────────────────── */}
        {scanComplete && (
          <motion.div key="dashboard" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col px-4 z-10 max-w-md mx-auto overflow-y-auto hide-scrollbar">

            {/* Header */}
            <div className="sticky top-0 z-20 py-4 flex items-center justify-between bg-black/80 backdrop-blur-md">
              <button onClick={reset} className="text-white/70 hover:text-white p-2 rounded-full bg-white/5 border border-white/10">
                <X className="w-5 h-5" />
              </button>
              <h2 className="font-bold text-lg">Nutrition Dashboard</h2>
              <div className="w-9" />
            </div>

            {/* Food image */}
            {scanMode === "ai" && imageCaptured && (
              <div className="w-full h-48 rounded-3xl overflow-hidden mb-5 shadow-2xl shrink-0">
                <img src={imageCaptured} alt="Meal" className="w-full h-full object-cover" />
              </div>
            )}
            {scanMode === "barcode" && productData?.image && (
              <div className="w-full h-44 rounded-3xl overflow-hidden mb-5 shadow-2xl shrink-0 bg-white/5 flex items-center justify-center p-4">
                <img src={productData.image} alt={productData.name} className="max-h-full object-contain drop-shadow-lg" />
              </div>
            )}

            {/* ⚠️ Demo Mode Banner — shown when no Gemini API key is set */}
            {scanMode === "ai" && aiResult?.isMockAnalysis && (
              <div className="mb-4 flex items-start gap-3 bg-amber-500/10 border border-amber-500/40 rounded-2xl p-4">
                <span className="text-2xl shrink-0">⚠️</span>
                <div>
                  <p className="text-amber-400 font-semibold text-sm mb-1">Demo Mode — AI not active</p>
                  <p className="text-white/60 text-xs leading-relaxed">
                    No Gemini API key is configured, so the food shown below is <strong className="text-white/80">placeholder data</strong>, not a real analysis of your image.
                    Add <code className="bg-white/10 px-1 py-0.5 rounded text-white/80 text-[10px]">NEXT_PUBLIC_GEMINI_API_KEY</code> to your <code className="bg-white/10 px-1 py-0.5 rounded text-white/80 text-[10px]">.env.local</code> to enable real food recognition.
                  </p>
                </div>
              </div>
            )}

            {/* Detected items (AI only) */}
            {scanMode === "ai" && aiResult && aiResult.foods.length > 1 && !aiResult.isMockAnalysis && (
              <div className="glass-card p-4 mb-4 space-y-2">
                <p className="text-xs uppercase tracking-widest text-white/50 mb-3">Detected Items</p>
                {aiResult.foods.map((f, i) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                    <div>
                      <span className="font-medium text-white">{f.name}</span>
                      <span className="text-white/50 ml-2 text-xs">{f.portion}</span>
                    </div>
                    <span className="text-primary font-semibold">{f.calories} kcal</span>
                  </div>
                ))}
              </div>
            )}


            {/* Product / meal header card */}
            <div className="glass-card flex items-start justify-between mb-4">
              <div className="flex-1 pr-3">
                {isEditing && editableData ? (
                  <input
                    value={editableData.name}
                    onChange={(e) => setEditableData({ ...editableData, name: e.target.value })}
                    className="w-full bg-white/10 rounded-lg px-3 py-1.5 text-white font-bold text-lg border border-white/20 outline-none focus:border-primary"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-white leading-tight">{displayName || "Unknown Food"}</h2>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  {scanMode === "barcode" ? (
                    <span className="text-xs text-primary flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Verified via OpenFoodFacts</span>
                  ) : (
                    <span className={cn("text-xs flex items-center gap-1", isLowConfidence ? "text-yellow-400" : "text-primary")}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {aiResult?.confidenceLabel} Confidence · {aiResult?.confidence}%
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 shrink-0 rounded-full border-4 border-primary flex items-center justify-center bg-black shadow-[0_0_12px_rgba(195,255,0,0.2)]">
                  <span className="font-bold text-sm text-primary">{displayGrade}</span>
                </div>
                {scanMode === "ai" && isLowConfidence && !isEditing && (
                  <button onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-[10px] text-yellow-400 hover:text-yellow-300 transition-colors">
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                )}
                {isEditing && (
                  <button onClick={() => setIsEditing(false)}
                    className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors">
                    <Check className="w-3 h-3" /> Done
                  </button>
                )}
              </div>
            </div>

            {/* Macro grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Calories */}
              <div className="glass-card flex flex-col items-center justify-center py-6">
                <Activity className="w-5 h-5 text-white/40 mb-2" />
                {isEditing && editableData ? (
                  <input type="number" value={editableData.calories}
                    onChange={(e) => setEditableData({ ...editableData, calories: +e.target.value })}
                    className="w-24 text-center bg-white/10 rounded-lg px-2 py-1 text-white font-bold text-3xl border border-white/20 outline-none focus:border-primary" />
                ) : (
                  <span className="text-4xl font-bold text-white mb-1">{displayCal}</span>
                )}
                <span className="text-xs text-white/50 uppercase tracking-wider">Calories</span>
              </div>

              {/* Protein / Carbs / Fat bars */}
              <div className="glass-card flex flex-col justify-center gap-3 p-5">
                {[
                  { label: "Protein", key: "protein", value: displayProtein, color: "bg-primary", max: 50 },
                  { label: "Carbs", key: "carbs", value: displayCarbs, color: "bg-blue-400", max: 300 },
                  { label: "Fat", key: "fats", value: displayFats, color: "bg-red-400", max: 65 },
                ].map(({ label, key, value, color, max }) => (
                  <div key={key}>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-white/60">{label}</span>
                      {isEditing && editableData ? (
                        <input type="number" value={(editableData as any)[key]}
                          onChange={(e) => setEditableData({ ...editableData!, [key]: +e.target.value })}
                          className="w-14 text-right bg-white/10 rounded px-1 text-white text-xs border border-white/20 outline-none focus:border-primary" />
                      ) : (
                        <span className={cn("font-semibold", color.replace("bg-", "text-"))}>{value}g</span>
                      )}
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fiber / Sugar + Ingredients */}
            <div className="glass-card p-5 mb-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 border-b border-white/10 pb-4">
                {[
                  { label: "Dietary Fiber", key: "fiber", value: displayFiber },
                  { label: "Total Sugars", key: "sugar", value: displaySugar },
                ].map(({ label, key, value }) => (
                  <div key={key}>
                    <span className="block text-xs text-white/50 uppercase mb-1">{label}</span>
                    {isEditing && editableData ? (
                      <input type="number" value={(editableData as any)[key]}
                        onChange={(e) => setEditableData({ ...editableData!, [key]: +e.target.value })}
                        className="w-full bg-white/10 rounded px-2 py-1 text-white font-medium text-sm border border-white/20 outline-none focus:border-primary" />
                    ) : (
                      <span className="font-medium text-white">{value}g</span>
                    )}
                  </div>
                ))}
              </div>
              {scanMode === "barcode" && productData?.ingredients && (
                <div>
                  <span className="block text-xs text-white/50 uppercase mb-2">Ingredients</span>
                  <p className="text-sm text-white/80 leading-relaxed line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">
                    {productData.ingredients}
                  </p>
                </div>
              )}
              {scanMode === "ai" && isLowConfidence && !isEditing && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                  <span className="text-yellow-400 text-xs leading-relaxed">
                    ⚠️ Low confidence — tap <strong>Edit</strong> to correct the food name and nutrition values.
                  </span>
                </div>
              )}
            </div>

            {/* AI Personalized Recommendation */}
            <NutritionRecommendationCard
              recommendation={recommendation}
              loading={loadingRec}
              error={recError}
            />

            {/* Confirm Button */}
            <div className="pb-6 pt-2">
              <button onClick={handleLogMeal} disabled={loadingLog}
                className="w-full bg-primary text-black font-bold text-lg py-4 rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(195,255,0,0.3)] hover:shadow-[0_0_35px_rgba(195,255,0,0.5)] disabled:opacity-60 active:scale-[0.98] flex items-center justify-center gap-2">
                {loadingLog ? "Saving…" : "Confirm Consumption"}
                {!loadingLog && <ChevronRight className="w-5 h-5" />}
              </button>
            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}
