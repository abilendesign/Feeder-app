"use client";

import { useEffect, useRef, useState } from "react";

export default function CameraCapture({
  onCapture,
  onClose,
}: {
  onCapture: (file: File) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setError("No se pudo abrir la cámara. Revisa los permisos del navegador.");
      }
    })();
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCapture(new File([blob], "escaneo.jpg", { type: "image/jpeg" }));
        }
        onClose();
      },
      "image/jpeg",
      0.9
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center text-neutral-200">
          <p className="text-sm">{error}</p>
          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-800 px-4 py-2 text-sm ring-1 ring-white/10"
          >
            Cerrar
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            playsInline
            muted
            className="min-h-0 w-full flex-1 object-contain"
          />
          <div className="flex items-center justify-center gap-4 p-4">
            <button
              onClick={onClose}
              className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-200 ring-1 ring-white/10 hover:bg-neutral-700"
            >
              Cancelar
            </button>
            <button
              onClick={capture}
              className="rounded-full bg-[#d6ff00] px-6 py-3 text-sm font-semibold text-black"
            >
              Capturar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
