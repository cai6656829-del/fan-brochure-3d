import React from "react";
import { PageData } from "../types";
import {
  Grid3X3,
  RotateCcw,
  FlipHorizontal,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Volume2,
  VolumeX,
  Activity,
  Rotate3d,
  Sliders,
  Play,
  Pause,
  ShieldCheck,
} from "lucide-react";

interface ViewportControlsProps {
  rotX: number;
  rotY: number;
  zoom: number;
  foldAngle: number;
  hingeAngles: [number, number, number];
  showGrid: boolean;
  isMuted: boolean;
  isAutoOrbit: boolean;
  activeSide: "front" | "back";
  focusedPanel: { index: number; side: "front" | "back" } | null;
  onFoldChange: (angle: number) => void;
  onToggleAutoOrbit: () => void;
  onSpringPluck: () => void;
  onToggleGrid: () => void;
  onToggleMute: () => void;
  onFlipSide: () => void;
  onResetView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSelectPanel: (panelIndex: number, side: "front" | "back") => void;
  frontPages: PageData[];
  backPages: PageData[];
  onOpenUploadModal?: () => void;
}

export function ViewportControls({
  rotX,
  rotY,
  zoom,
  foldAngle,
  hingeAngles,
  showGrid,
  isMuted,
  isAutoOrbit,
  activeSide,
  focusedPanel,
  onFoldChange,
  onToggleAutoOrbit,
  onSpringPluck,
  onToggleGrid,
  onToggleMute,
  onFlipSide,
  onResetView,
  onZoomIn,
  onZoomOut,
  onSelectPanel,
  frontPages,
  backPages,
  onOpenUploadModal,
}: ViewportControlsProps) {
  const currentPages = activeSide === "front" ? frontPages : backPages;

  // Normalized rotation angles for display
  const normRotY = Math.round(((rotY % 360) + 360) % 360);
  const normRotX = Math.round(rotX);

  return (
    <>
      {/* TOP FLOATING PANELS */}
      <div className="absolute top-6 left-6 right-6 z-40 pointer-events-none flex justify-between items-start">
        {/* Brand / Info Badge */}
        <div className="pointer-events-auto glass-panel px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-lg border border-white/10">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <div className="text-xs font-bold tracking-wider text-white">NEXTFAN 3D 折页设计终端</div>
            <div className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">Fold Studio Professional</div>
          </div>
        </div>
      </div>

      {/* BOTTOM CONTROLLER BAR */}
      <footer className="absolute bottom-6 left-0 right-0 z-40 pointer-events-none flex justify-center px-4">
        {/* Central HUD Panel: Flip + 360° Rotate + Fold Angle + Tools */}
        <div className="pointer-events-auto flex items-center flex-wrap gap-2.5 glass-panel px-4 py-2.5 rounded-full shadow-2xl">
          {/* Flip Side */}
          <div className="flex items-center gap-1.5 pr-2.5 border-r border-white/15">
            <button
              id="btn-bottom-flip"
              onClick={onFlipSide}
              className="glass-crystal-btn flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-full cursor-pointer"
              title="Flip between Recto (Front) and Verso (Back)"
            >
              <FlipHorizontal size={13} className="text-gray-300 group-hover:text-white" />
              <span className="text-xs font-medium text-gray-200 hidden sm:inline">
                {activeSide === "front" ? "Verso" : "Recto"}
              </span>
            </button>
          </div>

          {/* 360° Orbit Rotation & Spring Controls */}
          <div className="flex items-center gap-1.5 pr-2.5 border-r border-white/15">
            <button
              id="btn-bottom-360-rotate"
              onClick={onToggleAutoOrbit}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-full transition-all cursor-pointer ${
                isAutoOrbit
                  ? "glass-crystal-primary text-white"
                  : "glass-crystal-btn text-gray-200"
              }`}
              title="Toggle 360° continuous orbit rotation"
            >
              <Rotate3d
                size={14}
                className={isAutoOrbit ? "text-white animate-spin" : "text-gray-300"}
              />
              <span className="font-semibold text-xs text-white">360° Orbit</span>
              {isAutoOrbit ? (
                <Pause size={10} className="text-gray-200" />
              ) : (
                <Play size={10} className="text-gray-400" />
              )}
            </button>

            <button
              id="btn-bottom-spring"
              onClick={onSpringPluck}
              className="glass-crystal-btn flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-full group hidden sm:flex cursor-pointer"
              title="Trigger elastic accordion spring wave"
            >
              <Sparkles size={12} className="text-gray-300 group-hover:text-white" />
              <span className="text-xs font-medium text-gray-200">Bounce</span>
            </button>
          </div>

          {/* Accordion Fold Angle Slider */}
          <div className="flex items-center gap-2">
            <Sliders size={13} className="text-gray-300" />
            <span className="text-xs text-gray-300 font-medium tracking-tight">
              Fold:
            </span>
            <input
              id="slider-fold-angle"
              type="range"
              min="0"
              max="150"
              value={foldAngle}
              onChange={(e) => onFoldChange(Number(e.target.value))}
              className="w-18 sm:w-24 md:w-28 accent-gray-300 cursor-pointer"
            />
            <span className="text-xs font-mono text-white w-7 font-bold text-right">
              {foldAngle}°
            </span>
          </div>

          {/* Quick Fold Presets */}
          <div className="flex items-center gap-1 border-l border-white/15 pl-2">
            {[
              { val: 20, label: "20°" },
              { val: 55, label: "55°" },
              { val: 90, label: "90°" },
              { val: 150, label: "150°" },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => onFoldChange(val)}
                className={`px-2.5 py-1 text-[11px] font-mono rounded-full transition-all cursor-pointer ${
                  foldAngle === val
                    ? "glass-crystal-primary text-white font-bold"
                    : "glass-crystal-btn text-gray-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Auxiliary Tools: Audio, Zoom, Reset */}
          <div className="flex items-center gap-1 border-l border-white/15 pl-2">
            <button
              id="btn-toggle-sound"
              onClick={onToggleMute}
              className={`p-2 rounded-full text-xs transition-all cursor-pointer ${
                !isMuted
                  ? "glass-crystal-btn text-gray-300 hover:text-white"
                  : "glass-crystal-btn text-amber-300 border-amber-500/40"
              }`}
              title={isMuted ? "Unmute Sound" : "Mute Folding Sound Effects"}
            >
              {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
            <button
              id="btn-zoom-in"
              onClick={onZoomIn}
              className="glass-crystal-btn p-2 rounded-full text-gray-300 hover:text-white hidden sm:inline-block cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
            <button
              id="btn-zoom-out"
              onClick={onZoomOut}
              className="glass-crystal-btn p-2 rounded-full text-gray-300 hover:text-white hidden sm:inline-block cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
            <button
              onClick={onResetView}
              className="glass-crystal-btn p-2 rounded-full text-gray-300 hover:text-white cursor-pointer"
              title="Reset View"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
