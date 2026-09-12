"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("center");
  const lastTapRef = useRef(0);
  const gallery = images.length > 0 ? images : ["/placeholder.png"];

  const goPrev = useCallback(
    () => setActive((i) => (i - 1 + gallery.length) % gallery.length),
    [gallery.length]
  );
  const goNext = useCallback(
    () => setActive((i) => (i + 1) % gallery.length),
    [gallery.length]
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, goPrev, goNext]);

  useEffect(() => {
    setZoomed(false); // reset zoom whenever the active image changes
  }, [active]);

  // Double-tap (mobile) or double-click (desktop) toggles a 2.5x zoom,
  // centered on the tap point — a lightweight alternative to full pinch
  // gesture handling.
  const handleImageTap = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const point = "touches" in e ? e.touches[0] : (e as React.MouseEvent);
    const x = ((point.clientX - rect.left) / rect.width) * 100;
    const y = ((point.clientY - rect.top) / rect.height) * 100;

    if (now - lastTapRef.current < 300) {
      setZoomOrigin(`${x}% ${y}%`);
      setZoomed((z) => !z);
    }
    lastTapRef.current = now;
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="relative w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden block group"
      >
        <Image
          src={gallery[active]}
          alt={name}
          fill
          className="object-contain"
          priority
        />
        <span className="absolute bottom-3 right-3 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition">
          <ZoomIn className="w-4 h-4" />
        </span>
      </button>

      {gallery.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {gallery.map((img, idx) => (
            <button
              key={img + idx}
              onClick={() => setActive(idx)}
              className={`relative w-16 h-16 shrink-0 rounded border-2 ${
                active === idx ? "border-green-600" : "border-transparent"
              }`}
            >
              <Image src={img} alt={`${name} ${idx}`} fill className="object-cover rounded" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => !zoomed && setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white z-10"
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>

          {gallery.length > 1 && !zoomed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-4 text-white z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
          )}

          <div
            className="relative w-full max-w-3xl h-[80vh] mx-4 overflow-hidden touch-none"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={handleImageTap}
            onTouchEnd={handleImageTap}
          >
            <Image
              src={gallery[active]}
              alt={name}
              fill
              className="object-contain transition-transform duration-200"
              style={{
                transform: zoomed ? "scale(2.5)" : "scale(1)",
                transformOrigin: zoomOrigin,
              }}
            />
            {!zoomed && (
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/70 text-xs">
                বড় করে দেখতে ডাবল-ট্যাপ করুন
              </span>
            )}
          </div>

          {gallery.length > 1 && !zoomed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-4 text-white z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
