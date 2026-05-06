"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Loader2 } from "lucide-react";

interface BarcodeScannerProps {
  onResult: (result: string) => void;
  onError?: (error: any) => void;
}

export default function BarcodeScanner({ onResult, onError }: BarcodeScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          setHasPermission(true);
          const html5QrCode = new Html5Qrcode("reader");
          scannerRef.current = html5QrCode;

          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 150 },
              aspectRatio: 1,
            },
            (decodedText) => {
              onResult(decodedText);
              // Stop scanning once we get a result
              if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().catch(console.error);
              }
            },
            (errorMessage) => {
              // Ignore frequent scan errors (expected when no barcode is in view)
            }
          );
        } else {
          setHasPermission(false);
        }
      } catch (err) {
        setHasPermission(false);
        if (onError) onError(err);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [onResult, onError]);

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-red-400 glass-card">
        <p>Camera permission denied or no camera found.</p>
        <p className="text-sm mt-2 text-white/50">Please enable camera access in your browser settings to scan barcodes.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square md:aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(195,255,0,0.1)]">
      {hasPermission === null && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}
      
      <div id="reader" className="w-full h-full object-cover" />
      
      {/* Target Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
        <div className="w-[250px] h-[150px] border-2 border-primary rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex items-center justify-center relative">
          {/* Corner accents */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-primary" />
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-primary" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-primary" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-primary" />
          
          {/* Scanning line animation */}
          <div className="w-full h-0.5 bg-primary absolute shadow-[0_0_8px_#c3ff00] animate-scan" />
        </div>
      </div>
    </div>
  );
}
