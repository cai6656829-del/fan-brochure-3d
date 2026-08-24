import React from "react";
import { PageData } from "../types";

export function MockupIcon({ kind, accent }: { kind: string; accent: string }) {
  const common = { fill: "none", stroke: accent, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  if (kind === "identity") {
    return (
      <svg viewBox="0 0 120 90" className="w-full h-full" aria-hidden="true">
        <rect x="12" y="15" width="96" height="60" rx="3" fill="#FAF9F5" stroke="#D8D5CB" strokeWidth="1" />
        <circle cx="36" cy="38" r="10" stroke={accent} strokeWidth="1.6" fill="none" />
        <line x1="28" y1="38" x2="44" y2="38" stroke={accent} strokeWidth="1.6" />
        <line x1="56" y1="32" x2="92" y2="32" stroke="#15130F" strokeWidth="1.8" />
        <line x1="56" y1="42" x2="80" y2="42" stroke="#7A776E" strokeWidth="1.2" />
        <line x1="24" y1="60" x2="70" y2="60" stroke="#9E9B91" strokeWidth="1" strokeDasharray="3 2" />
        <circle cx="94" cy="62" r="3" fill={accent} />
      </svg>
    );
  }

  if (kind === "packaging") {
    return (
      <svg viewBox="0 0 120 90" className="w-full h-full" aria-hidden="true">
        {/* Shopping bag / Kraft package */}
        <path d="M26 32 L94 32 L88 80 L32 80 Z" fill="#FAF9F5" stroke="#D8D5CB" strokeWidth="1" />
        <path d="M46 32 C46 18 74 18 74 32" stroke={accent} strokeWidth="1.6" fill="none" />
        <rect x="42" y="46" width="36" height="20" rx="1" fill="#FAF9F5" stroke={accent} strokeWidth="1.2" />
        <line x1="48" y1="53" x2="72" y2="53" stroke="#15130F" strokeWidth="1.4" />
        <line x1="52" y1="59" x2="68" y2="59" stroke="#9E9B91" strokeWidth="1" />
      </svg>
    );
  }

  if (kind === "signage") {
    return (
      <svg viewBox="0 0 120 90" className="w-full h-full" aria-hidden="true">
        {/* Blade sign / architectural totem */}
        <rect x="18" y="16" width="84" height="42" rx="2" fill="#FAF9F5" stroke="#D8D5CB" strokeWidth="1" />
        <line x1="60" y1="58" x2="60" y2="82" stroke="#7A776E" strokeWidth="1.8" />
        <line x1="42" y1="82" x2="78" y2="82" stroke="#15130F" strokeWidth="2" />
        <rect x="30" y="26" width="60" height="22" rx="1" fill={accent} fillOpacity="0.08" stroke={accent} strokeWidth="1" />
        <line x1="38" y1="37" x2="82" y2="37" stroke={accent} strokeWidth="1.5" />
      </svg>
    );
  }

  if (kind === "digital") {
    return (
      <svg viewBox="0 0 120 90" className="w-full h-full" aria-hidden="true">
        {/* Device screen */}
        <rect x="30" y="12" width="60" height="70" rx="6" fill="#FAF9F5" stroke="#D8D5CB" strokeWidth="1" />
        <rect x="36" y="18" width="48" height="52" rx="2" fill="#FFFFFF" stroke="#E7E5DE" strokeWidth="0.8" />
        <circle cx="60" cy="76" r="2.5" fill="#7A776E" />
        {/* Telemetry wave */}
        <path d="M40 44 L48 44 L52 32 L56 56 L60 40 L64 48 L72 44 L80 44" stroke={accent} strokeWidth="1.5" fill="none" />
      </svg>
    );
  }

  if (kind === "print") {
    return (
      <svg viewBox="0 0 120 90" className="w-full h-full" aria-hidden="true">
        {/* Hardcover Monograph */}
        <rect x="22" y="14" width="76" height="64" rx="2" fill="#FAF9F5" stroke="#D8D5CB" strokeWidth="1" />
        <line x1="32" y1="14" x2="32" y2="78" stroke="#7A776E" strokeWidth="1" />
        <line x1="44" y1="30" x2="84" y2="30" stroke="#15130F" strokeWidth="1.6" />
        <line x1="44" y1="40" x2="76" y2="40" stroke="#9E9B91" strokeWidth="1.2" />
        <rect x="44" y="52" width="24" height="14" fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="1" />
      </svg>
    );
  }

  // default grid icon
  return (
    <svg viewBox="0 0 120 90" className="w-full h-full" aria-hidden="true">
      <rect x="18" y="14" width="84" height="62" rx="2" fill="#FAF9F5" stroke="#D8D5CB" strokeWidth="1" />
      <line x1="18" y1="35" x2="102" y2="35" stroke="#E7E5DE" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="18" y1="55" x2="102" y2="55" stroke="#E7E5DE" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="46" y1="14" x2="46" y2="76" stroke="#E7E5DE" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="74" y1="14" x2="74" y2="76" stroke="#E7E5DE" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="60" cy="45" r="14" stroke={accent} strokeWidth="1.4" fill="none" />
      <line x1="46" y1="45" x2="74" y2="45" stroke={accent} strokeWidth="1.4" />
      <line x1="60" y1="31" x2="60" y2="59" stroke={accent} strokeWidth="1.4" />
    </svg>
  );
}

interface PageFaceContentProps {
  page: PageData;
  isHighRes?: boolean;
  onSelect?: () => void;
}

export function PageFaceContent({ page, isHighRes = false, onSelect }: PageFaceContentProps) {
  // If user uploaded a custom page image/artwork or has a static default image, render the design directly
  const displayImage = page.customImageUrl || page.imageUrl;

  const getFullImageUrl = (pathStr: string) => {
    if (!pathStr) return "";
    if (pathStr.startsWith("data:") || pathStr.startsWith("blob:") || pathStr.startsWith("http")) {
      return pathStr;
    }
    const meta = import.meta as any;
    const base = meta.env?.BASE_URL || "/";
    const cleanPath = pathStr.startsWith("/") ? pathStr.slice(1) : pathStr;
    const cleanBase = base.endsWith("/") ? base : `${base}/`;
    return `${cleanBase}${cleanPath}`;
  };

  if (displayImage) {
    return (
      <div
        className="relative w-full h-full select-none overflow-hidden bg-[#EFEEE9] flex items-center justify-center"
        style={{
          boxShadow: isHighRes ? "none" : "inset 0 0 40px rgba(0,0,0,0.03)",
        }}
        onClick={onSelect}
      >
        <img
          src={getFullImageUrl(displayImage)}
          alt={page.title || page.code}
          className="w-full h-full object-cover pointer-events-none select-none"
          draggable={false}
        />

        {/* ANTI-THEFT PROTECTION WATERMARK SHIELD */}
        <div
          className="absolute inset-0 pointer-events-none z-40 overflow-hidden select-none opacity-[0.035] flex items-center justify-center rotate-[-25deg]"
          aria-hidden="true"
        >
          <div className="font-mono text-center text-[10px] md:text-xs tracking-widest text-[#15130F] leading-loose whitespace-nowrap">
            <div>FOLD STUDIO · 210×285CM · COPYRIGHT PROTECTED</div>
            <div>© ALL RIGHTS RESERVED · REPRODUCTION PROHIBITED</div>
            <div>REGISTERED SYSTEM · DO NOT DOWNLOAD OR COPY</div>
          </div>
        </div>

        {/* CLICK HINT FOR 3D MODEL */}
        {!isHighRes && (
          <div className="absolute bottom-2 right-2 bg-[#15130F]/70 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[8.5px] font-mono tracking-wider opacity-0 hover:opacity-100 transition-opacity">
            {page.code} ↗
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full flex flex-col justify-between select-none overflow-hidden bg-[#EFEEE9] text-[#15130F] ${
        isHighRes ? "p-8 md:p-12" : "p-5"
      }`}
      style={{
        boxShadow: isHighRes ? "none" : "inset 0 0 40px rgba(0,0,0,0.03)",
      }}
      onClick={onSelect}
    >
      {/* Precision crop marks on 4 corners */}
      <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 pointer-events-none opacity-40">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#5B584F]" />
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-[#5B584F]" />
      </div>
      <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 pointer-events-none opacity-40">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#5B584F]" />
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-[#5B584F]" />
      </div>
      <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 pointer-events-none opacity-40">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#5B584F]" />
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-[#5B584F]" />
      </div>
      <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 pointer-events-none opacity-40">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#5B584F]" />
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-[#5B584F]" />
      </div>

      {/* TOP HEADER */}
      <div>
        <div className="flex items-center justify-between border-b border-[#D8D5CB] pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-mono tracking-widest px-1.5 py-0.5 rounded font-bold uppercase"
              style={{ backgroundColor: page.accentBg, color: page.accentText }}
            >
              {page.code}
            </span>
            <span className="text-[9px] font-mono text-[#7A776E] tracking-wider uppercase">
              {page.side === "front" ? "RECTO" : "VERSO"} • P.0{page.panelIndex + 1}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: page.accent }} />
            <span className="text-[9px] font-mono text-[#5B584F] tracking-tight">
              {page.sector?.split("&")[0] || "STUDIO"}
            </span>
          </div>
        </div>

        {/* TITLE & SUBTITLE */}
        <h2
          className="font-serif font-semibold text-[#15130F] leading-[1.08] tracking-tight"
          style={{
            fontSize: isHighRes ? "clamp(28px, 4vw, 44px)" : "clamp(18px, 2.4vw, 24px)",
          }}
        >
          {page.title}
        </h2>
        <p
          className="text-[#5B584F] font-sans font-medium mt-1 leading-snug"
          style={{ fontSize: isHighRes ? "15px" : "11px" }}
        >
          {page.subtitle}
        </p>
      </div>

      {/* CENTER BODY: VISUAL MOCKUPS OR HIGHLIGHTS */}
      <div className="my-auto py-2">
        {page.id === "p-cover" ? (
          <div className="space-y-3 py-1">
            <div className="p-3 bg-[#FAF9F5] border border-[#D8D5CB] rounded">
              <div className="text-[9px] font-mono tracking-widest text-[#7A776E] mb-1">
                EXHIBIT 01 // PRINCIPLE
              </div>
              <p
                className="font-serif italic text-[#15130F] leading-snug"
                style={{ fontSize: isHighRes ? "18px" : "13px" }}
              >
                "Form responds to tactile substrate. Every mark is engineered for the fold."
              </p>
            </div>
            <div className="flex gap-2">
              {page.colors.map((c) => (
                <div key={c.name} className="flex-1 text-center">
                  <div
                    className="h-6 rounded border border-[#D8D5CB] mb-1"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[8px] font-mono text-[#5B584F] block truncate">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Visual preview icon */}
            <div className="h-16 md:h-20 w-full flex items-center justify-center p-1 bg-[#FAF9F5] border border-[#D8D5CB] rounded">
              <MockupIcon kind={page.mockupTypes[0] || "identity"} accent={page.accent} />
            </div>

            {/* Micro summary */}
            <p
              className="text-[#5B584F] line-clamp-3 leading-relaxed"
              style={{ fontSize: isHighRes ? "14px" : "10px" }}
            >
              {page.summary}
            </p>
          </div>
        )}
      </div>

      {/* ANTI-THEFT PROTECTION WATERMARK SHIELD */}
      <div
        className="absolute inset-0 pointer-events-none z-40 overflow-hidden select-none opacity-[0.035] flex items-center justify-center rotate-[-25deg]"
        aria-hidden="true"
      >
        <div className="font-mono text-center text-[10px] md:text-xs tracking-widest text-[#15130F] leading-loose whitespace-nowrap">
          <div>FOLD STUDIO · 210×285CM · COPYRIGHT PROTECTED</div>
          <div>© ALL RIGHTS RESERVED · REPRODUCTION PROHIBITED</div>
          <div>REGISTERED SYSTEM · DO NOT DOWNLOAD OR COPY</div>
        </div>
      </div>

      {/* STATS / METRICS ROW */}
      <div className="pt-2 border-t border-[#D8D5CB] relative z-10">
        {page.metrics && page.metrics.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 text-center">
            {page.metrics.map((m, idx) => (
              <div key={idx} className="bg-[#FAF9F5] p-1.5 rounded border border-[#E7E5DE]">
                <div
                  className="font-mono font-bold tracking-tight text-[#15130F]"
                  style={{ fontSize: isHighRes ? "16px" : "12px", color: page.accent }}
                >
                  {m.value}
                </div>
                <div className="text-[8px] font-mono text-[#7A776E] tracking-wider uppercase mt-0.5">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between text-[9px] font-mono text-[#7A776E]">
            <span>STOCK: 280GSM ARENA</span>
            <span style={{ color: page.accent }}>FOLD STUDIO © 2026</span>
          </div>
        )}

        {/* CLICK HINT FOR 3D MODEL */}
        {!isHighRes && (
          <div className="mt-2 text-center">
            <span className="inline-flex items-center gap-1 text-[8.5px] font-mono tracking-widest text-[#7A776E] hover:text-[#15130F] transition-colors">
              CLICK TO EXAMINE FACE &nbsp;↗
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
