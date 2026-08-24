import React, { useEffect } from "react";
import { PageData } from "../types";
import { PageFaceContent } from "./PageFaceContent";
import {
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface HighResDetailModalProps {
  page: PageData | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  allPages: PageData[];
  onSelectPage: (p: PageData) => void;
  onOpenUploadModal?: () => void;
}

export function HighResDetailModal({
  page,
  onClose,
  onPrev,
  onNext,
  allPages,
  onSelectPage,
}: HighResDetailModalProps) {
  // Keyboard navigation support (Escape to close, Left/Right arrows to flip pages)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && onPrev) {
        onPrev();
      } else if (e.key === "ArrowRight" && onNext) {
        onNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrev, onNext]);

  if (!page) return null;

  return (
    <div
      id="highres-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="highres-modal-container"
        className="relative w-full max-w-3xl max-h-[95vh] glass-panel text-[#F0F4F8] rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          id="btn-close-modal"
          onClick={onClose}
          className="glass-crystal-btn absolute top-3.5 right-3.5 z-40 p-2 rounded-full text-gray-400 hover:text-white transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Close"
          title="Close Preview (Esc)"
        >
          <X size={16} />
        </button>

        {/* MAIN BODY: HIGH-RES PAGE ARTWORK / LAYOUT ONLY */}
        <div className="relative flex-1 bg-gradient-to-b from-[#14171C] to-[#0A0B0E] p-4 sm:p-6 md:p-8 flex items-center justify-center overflow-auto min-h-[380px]">
          {/* Main High-Res Sheet with Paper Drop Shadow (210 x 285 cm aspect ratio) */}
          <div
            className="relative w-full max-w-[460px] aspect-[210/285] bg-[#1E222A] rounded-xs shadow-2xl overflow-hidden"
            style={{
              boxShadow: "0 30px 70px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.08)",
            }}
          >
            <PageFaceContent page={page} isHighRes={true} />
          </div>

          {/* Quick prev/next overlay buttons on sides */}
          {onPrev && (
            <button
              id="btn-modal-prev-page"
              onClick={onPrev}
              className="glass-crystal-btn absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full text-white flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer"
              aria-label="Previous Page"
              title="Previous Page (←)"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          {onNext && (
            <button
              id="btn-modal-next-page"
              onClick={onNext}
              className="glass-crystal-btn absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full text-white flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer"
              aria-label="Next Page"
              title="Next Page (→)"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>

        {/* BOTTOM BAR: 8P PAGE QUICK SELECTOR (CLEAN & MINIMAL) */}
        <footer className="px-4 py-2.5 bg-black/40 border-t border-white/10 flex items-center justify-between gap-2 overflow-x-auto select-none">
          <span className="text-[10px] font-mono text-gray-400 whitespace-nowrap hidden sm:inline">
            8P Pages:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto justify-start sm:justify-center">
            {allPages.map((p) => {
              const isSelected = p.id === page.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPage(p)}
                  className={`px-3 py-1 rounded-full text-left transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "glass-crystal-primary text-white font-bold"
                      : "glass-crystal-btn text-gray-400 hover:text-white"
                  }`}
                  title={`${p.code}: ${p.title}`}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: p.accent }}
                  />
                  <span className="text-[10px] font-mono font-medium">{p.code}</span>
                </button>
              );
            })}
          </div>
        </footer>
      </div>
    </div>
  );
}

