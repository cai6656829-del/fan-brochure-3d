import React, { useState, useRef } from "react";
import { PageData } from "../types";
import { X, Upload, Image as ImageIcon, Check, Trash2, RefreshCw, Layers } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  pages: PageData[];
  onClose: () => void;
  onUpdatePageImage: (pageId: string, imageUrl: string | undefined) => void;
  onBatchUpdateImages: (updates: { pageId: string; imageUrl: string }[]) => void;
  onResetAllCustomImages: () => void;
}

export function PageUploadManagerModal({
  isOpen,
  pages,
  onClose,
  onUpdatePageImage,
  onBatchUpdateImages,
  onResetAllCustomImages,
}: UploadModalProps) {
  const [selectedPageId, setSelectedPageId] = useState<string>(pages[0]?.id || "p-cover");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);
  const [dragOverPageId, setDragOverPageId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSingleFileUpload = (pageId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        onUpdatePageImage(pageId, e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBatchFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    
    // Sort files by name (e.g. 1.jpg, 2.jpg or P01.png, P02.png)
    fileArray.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));

    const updates: { pageId: string; imageUrl: string }[] = [];
    let processed = 0;

    fileArray.slice(0, 8).forEach((file, index) => {
      const targetPage = pages[index];
      if (!targetPage) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === "string") {
          updates.push({ pageId: targetPage.id, imageUrl: e.target.result });
        }
        processed++;
        if (processed === Math.min(fileArray.length, 8)) {
          onBatchUpdateImages(updates);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const selectedPage = pages.find((p) => p.id === selectedPageId) || pages[0];

  return (
    <div
      id="upload-manager-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] glass-panel text-[#F0F4F8] rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP HEADER */}
        <header className="flex items-center justify-between px-5 py-3.5 bg-black/40 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full glass-crystal-primary text-white flex items-center justify-center shadow-lg">
              <Upload size={14} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">
                Upload 8P Brochure Artworks (210 × 285 cm)
              </h2>
              <p className="text-[11px] text-gray-400 font-sans">
                Upload individual page artworks or batch import 8 files to preview on the 3D accordion model in real time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pages.some((p) => p.customImageUrl) && (
              <button
                id="btn-reset-all-artworks"
                onClick={onResetAllCustomImages}
                className="px-3 py-1.5 text-xs font-mono rounded-full glass-crystal-btn text-rose-300 border-rose-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Reset all pages to default templates"
              >
                <RefreshCw size={12} />
                <span>Reset Defaults</span>
              </button>
            )}
            <button
              id="btn-close-upload-modal"
              onClick={onClose}
              className="glass-crystal-btn p-2 rounded-full text-gray-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>
        </header>

        {/* BODY: BATCH ACTION + 8P GRID */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-gradient-to-b from-[#14171C] to-[#0A0B0E]">
          {/* BATCH UPLOAD BAR */}
          <div className="p-3.5 bg-white/[0.03] rounded-2xl border border-dashed border-gray-500/40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-gray-200">
              <Layers size={18} className="text-gray-300 flex-shrink-0" />
              <div>
                <span className="font-bold text-white">Batch Import 8 Pages</span>
                <span className="text-gray-400 ml-1 hidden sm:inline">
                  (Auto-mapped sequentially from P.01 Cover to P.08 Back Cover)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={batchFileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleBatchFileUpload(e.target.files);
                  e.target.value = "";
                }}
              />
              <button
                id="btn-batch-upload-trigger"
                onClick={() => batchFileInputRef.current?.click()}
                className="glass-crystal-primary px-4 py-2 text-xs font-medium flex items-center gap-1.5 text-white transition-all shadow-md rounded-full cursor-pointer"
              >
                <Upload size={13} />
                <span>Select Multiple Files</span>
              </button>
            </div>
          </div>

          {/* 8P PAGE CARDS GRID (4 FRONT + 4 BACK) */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-2 px-1">
              <span className="font-bold text-white">8P Individual Panels (Click or Drag & Drop)</span>
              <span>Aspect Ratio: 210 × 285 cm</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {pages.map((page, idx) => {
                const hasCustom = !!page.customImageUrl;
                const isDragOver = dragOverPageId === page.id;
                const isFront = page.side === "front";

                return (
                  <div
                    key={page.id}
                    className={`relative bg-black/40 rounded-xl border transition-all overflow-hidden flex flex-col ${
                      isDragOver
                        ? "border-white/70 ring-2 ring-white/40 bg-white/10"
                        : hasCustom
                        ? "border-white/30 shadow-md"
                        : "border-white/10 hover:border-white/25"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverPageId(page.id);
                    }}
                    onDragLeave={() => setDragOverPageId(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverPageId(null);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleSingleFileUpload(page.id, file);
                    }}
                  >
                    {/* Header of each Page Card */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 bg-white/[0.02] border-b border-white/5 text-[10px] font-mono">
                      <div className="flex items-center gap-1">
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded-full text-[9px] ${
                            isFront ? "bg-white/15 text-gray-200" : "bg-white/10 text-gray-400"
                          }`}
                        >
                          {isFront ? "RECTO" : "VERSO"}
                        </span>
                        <span className="font-bold text-white truncate max-w-[65px]">
                          {page.code}
                        </span>
                      </div>
                      {hasCustom ? (
                        <span className="text-gray-300 flex items-center gap-0.5 text-[9px] font-bold">
                          <Check size={11} /> Custom
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[9px]">Default</span>
                      )}
                    </div>

                    {/* Thumbnail / Artwork preview */}
                    <div className="relative aspect-[210/285] bg-black/50 flex items-center justify-center overflow-hidden group">
                      {hasCustom ? (
                        <img
                          src={page.customImageUrl}
                          alt={page.code}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      ) : (
                        <div className="text-center p-2">
                          <ImageIcon size={24} className="mx-auto text-gray-400 mb-1" />
                          <div className="text-[10px] font-serif font-bold text-gray-200">
                            {page.title}
                          </div>
                          <div className="text-[8px] font-mono text-gray-400">{page.subtitle}</div>
                        </div>
                      )}

                      {/* Hover overlay actions */}
                      <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                        <label
                          htmlFor={`file-upload-${page.id}`}
                          className="cursor-pointer px-3 py-1.5 rounded-full glass-crystal-primary text-white text-[10px] font-medium transition-all flex items-center gap-1 shadow-md"
                        >
                          <Upload size={11} />
                          <span>{hasCustom ? "Replace" : "Upload"}</span>
                        </label>
                        <input
                          id={`file-upload-${page.id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleSingleFileUpload(page.id, file);
                            e.target.value = "";
                          }}
                        />

                        {hasCustom && (
                          <button
                            id={`btn-remove-custom-${page.id}`}
                            onClick={() => onUpdatePageImage(page.id, undefined)}
                            className="px-2.5 py-1 rounded-full bg-rose-600/80 text-white text-[9px] font-mono hover:bg-rose-700 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={10} />
                            <span>Reset</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Footer label */}
                    <div className="px-2 py-1 bg-black/40 text-[9px] font-mono text-gray-400 border-t border-white/5 truncate">
                      {page.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <footer className="px-5 py-3.5 bg-black/40 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-gray-400 font-sans flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_#34D399]"></span>
            <span>Local persistence active. Artwork remains saved across page refreshes.</span>
          </div>
          <button
            id="btn-upload-modal-done"
            onClick={onClose}
            className="glass-crystal-primary px-5 py-2 text-xs font-semibold text-white transition-all shadow-md rounded-full cursor-pointer"
          >
            Done & View 3D
          </button>
        </footer>
      </div>
    </div>
  );
}
