import React, { useRef, useMemo } from "react";
import { PageData } from "../types";
import { FRONT_PAGES, BACK_PAGES } from "../data/pages";
import { PageFaceContent } from "./PageFaceContent";
import { MoveHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

interface BrochureModel3DProps {
  rotX: number;
  rotY: number;
  zoom: number;
  hingeAngles: [number, number, number]; // individual dynamic spring angles for hinges 0-1, 1-2, 2-3
  focusedPanel: { index: number; side: "front" | "back" } | null;
  onPanelClick: (panelIndex: number, side: "front" | "back") => void;
  onEdgeDragStart: (edge: "left" | "right", e: React.PointerEvent) => void;
  isDraggingEdge: "left" | "right" | "canvas" | null;
  showGrid?: boolean;
  frontPages?: PageData[];
  backPages?: PageData[];
}

const PANEL_WIDTH = 252; // width of each fold panel in px (210cm scaled @ 1.2px/cm)
const PANEL_HEIGHT = 342; // height of each fold panel in px (285cm scaled @ 1.2px/cm, exact 210:285 ratio)

export function BrochureModel3D({
  rotX,
  rotY,
  zoom,
  hingeAngles,
  focusedPanel,
  onPanelClick,
  onEdgeDragStart,
  isDraggingEdge,
  showGrid = true,
  frontPages = FRONT_PAGES,
  backPages = BACK_PAGES,
}: BrochureModel3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [ang1, ang2, ang3] = hingeAngles;

  // Compute accordion X span and Z depth with dynamic individual angles
  const rad1 = (ang1 * Math.PI) / 180;
  const rad2 = (ang2 * Math.PI) / 180;
  const rad3 = (ang3 * Math.PI) / 180;

  // Approximate total center
  const avgRad = (rad1 + rad2 + rad3) / 3;
  const totalXSpan = useMemo(() => {
    return (
      PANEL_WIDTH * (1 + Math.cos(rad1) + Math.cos(Math.abs(rad2 - rad1)) + Math.cos(rad3))
    );
  }, [rad1, rad2, rad3]);

  const centerXOffset = totalXSpan / 2;
  const centerZOffset = (PANEL_WIDTH * Math.sin(avgRad)) / 2;

  // Dynamic crease shadows based on average fold angle
  const avgFoldAngle = (ang1 + ang2 + ang3) / 3;
  const shadowOpacity = Math.min(0.72, Math.max(0.04, (160 - avgFoldAngle) / 160));

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center select-none overflow-hidden"
      style={{
        perspective: "1400px",
        perspectiveOrigin: "50% 48%",
      }}
    >
      {/* 3D WORLD CONTAINER (Fixed high-fidelity perspective angle) */}
      <div
        className="relative transform-gpu transition-transform ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: `scale(${zoom}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transitionDuration: "40ms",
        }}
      >
        {/* 3D GROUND FLOOR & PERSPECTIVE BASE */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: "1600px",
            height: "1600px",
            left: "-800px",
            top: "-800px",
            transform: `translateY(${PANEL_HEIGHT / 2 + 32}px) rotateX(90deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Optional Grid Lines & Axes (controlled by showGrid) */}
          {showGrid && (
            <>
              <div
                className="w-full h-full opacity-25"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
                  `,
                  backgroundSize: "45px 45px",
                  backgroundPosition: "center center",
                  maskImage: "radial-gradient(circle at center, black 30%, transparent 72%)",
                  WebkitMaskImage: "radial-gradient(circle at center, black 30%, transparent 72%)",
                }}
              />
              <div className="absolute left-1/2 top-1/2 w-44 h-[1.5px] bg-white/40 opacity-40 origin-left shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
              <div className="absolute left-1/2 top-1/2 w-[1.5px] h-44 bg-white/20 opacity-40 origin-top shadow-[0_0_8px_rgba(255,255,255,0.15)]" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-mono text-[#9EA3AC] opacity-50">
                ACCORDION_PERSPECTIVE_AXIS
              </div>
            </>
          )}

          {/* Floor Dynamic Contact Shadow (Always present for realistic 3D depth) */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 blur-2xl rounded-full transition-all duration-75"
            style={{
              width: `${totalXSpan + 180}px`,
              height: `${PANEL_WIDTH * Math.sin(avgRad) + 160}px`,
              transform: "translateZ(-1px)",
            }}
          />
        </div>

        {/* BROCHURE MODEL ROOT (Centered at 3D origin) */}
        <div
          className="relative"
          style={{
            transformStyle: "preserve-3d",
            transform: `translateX(-${centerXOffset}px) translateZ(-${centerZOffset}px) translateY(-${PANEL_HEIGHT / 2}px)`,
          }}
        >
          {/* ========================================================
              LEFT EDGE GRIP / PULL INDICATOR (Double-Sided 3D Pill)
             ======================================================== */}
          <div
            id="handle-left-edge"
            className={`absolute -left-11 top-1/2 -translate-y-1/2 z-50 cursor-ew-resize group pointer-events-auto transition-transform select-none ${
              isDraggingEdge === "left" ? "scale-110" : "hover:scale-105"
            }`}
            style={{
              transformStyle: "preserve-3d",
            }}
            onPointerDown={(e) => onEdgeDragStart("left", e)}
            title="Drag to unfold / fold accordion brochure"
          >
            {/* Front Facing Pill */}
            <div
              className="flex items-center gap-1.5 glass-crystal-btn text-white px-3 py-1.5 rounded-full shadow-2xl transition-all"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "translateZ(8px)",
              }}
            >
              <ChevronLeft size={14} className="text-gray-200" />
              <div className="flex flex-col items-start leading-none pr-0.5">
                <span className="text-[9px] font-mono font-bold tracking-tight text-white">PULL</span>
                <span className="text-[7.5px] font-mono text-gray-400">LEFT</span>
              </div>
            </div>

            {/* Back Facing Pill (Visible when looking from reverse side) */}
            <div
              className="absolute inset-0 flex items-center gap-1.5 glass-crystal-btn text-white px-3 py-1.5 rounded-full shadow-2xl transition-all"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg) translateZ(8px)",
              }}
            >
              <ChevronRight size={14} className="text-gray-200" />
              <div className="flex flex-col items-start leading-none pr-0.5">
                <span className="text-[9px] font-mono font-bold tracking-tight text-white">PULL</span>
                <span className="text-[7.5px] font-mono text-gray-400">EDGE</span>
              </div>
            </div>

            {/* Extended Grab Zone */}
            <div className="absolute -inset-x-4 -inset-y-12 cursor-ew-resize" />
          </div>

          {/* ========================================================
              PANEL 0 (Root panel - Leftmost)
             ======================================================== */}
          <div
            className="absolute left-0 top-0 transition-shadow duration-100"
            style={{
              width: `${PANEL_WIDTH}px`,
              height: `${PANEL_HEIGHT}px`,
              transformStyle: "preserve-3d",
              transformOrigin: "left center",
            }}
          >
            {/* Panel 0 Paper Faces */}
            <BrochurePanel
              panelIndex={0}
              frontData={frontPages[0]}
              backData={backPages[0]}
              isFocused={focusedPanel?.index === 0}
              onPanelClick={onPanelClick}
              shadowOpacity={shadowOpacity}
              foldSide="left"
            />

            {/* ========================================================
                PANEL 1 (Hinged to right of Panel 0, rotated -ang1)
               ======================================================== */}
            <div
              className="absolute top-0"
              style={{
                left: `${PANEL_WIDTH}px`,
                width: `${PANEL_WIDTH}px`,
                height: `${PANEL_HEIGHT}px`,
                transformStyle: "preserve-3d",
                transformOrigin: "left center",
                transform: `rotateY(-${ang1}deg)`,
                willChange: "transform",
              }}
            >
              <BrochurePanel
                panelIndex={1}
                frontData={frontPages[1]}
                backData={backPages[1]}
                isFocused={focusedPanel?.index === 1}
                onPanelClick={onPanelClick}
                shadowOpacity={shadowOpacity}
                foldSide="inner"
              />

              {/* ========================================================
                  PANEL 2 (Hinged to right of Panel 1, rotated +ang2)
                 ======================================================== */}
              <div
                className="absolute top-0"
                style={{
                  left: `${PANEL_WIDTH}px`,
                  width: `${PANEL_WIDTH}px`,
                  height: `${PANEL_HEIGHT}px`,
                  transformStyle: "preserve-3d",
                  transformOrigin: "left center",
                  transform: `rotateY(${ang2}deg)`,
                  willChange: "transform",
                }}
              >
                <BrochurePanel
                  panelIndex={2}
                  frontData={frontPages[2]}
                  backData={backPages[2]}
                  isFocused={focusedPanel?.index === 2}
                  onPanelClick={onPanelClick}
                  shadowOpacity={shadowOpacity}
                  foldSide="inner"
                />

                {/* ========================================================
                    PANEL 3 (Hinged to right of Panel 2, rotated -ang3)
                   ======================================================== */}
                <div
                  className="absolute top-0"
                  style={{
                    left: `${PANEL_WIDTH}px`,
                    width: `${PANEL_WIDTH}px`,
                    height: `${PANEL_HEIGHT}px`,
                    transformStyle: "preserve-3d",
                    transformOrigin: "left center",
                    transform: `rotateY(-${ang3}deg)`,
                    willChange: "transform",
                  }}
                >
                  <BrochurePanel
                    panelIndex={3}
                    frontData={frontPages[3]}
                    backData={backPages[3]}
                    isFocused={focusedPanel?.index === 3}
                    onPanelClick={onPanelClick}
                    shadowOpacity={shadowOpacity}
                    foldSide="right"
                  />

                  {/* ========================================================
                      RIGHT EDGE GRIP / PULL INDICATOR (Double-Sided 3D Pill)
                     ======================================================== */}
                  <div
                    id="handle-right-edge"
                    className={`absolute -right-11 top-1/2 -translate-y-1/2 z-50 cursor-ew-resize group pointer-events-auto transition-transform select-none ${
                      isDraggingEdge === "right" ? "scale-110" : "hover:scale-105"
                    }`}
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                    onPointerDown={(e) => onEdgeDragStart("right", e)}
                    title="Drag to unfold / fold accordion brochure"
                  >
                    {/* Front Facing Pill */}
                    <div
                      className="flex items-center gap-1.5 glass-crystal-btn text-white px-3 py-1.5 rounded-full shadow-2xl transition-all"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "translateZ(8px)",
                      }}
                    >
                      <div className="flex flex-col items-end leading-none pl-0.5">
                        <span className="text-[9px] font-mono font-bold tracking-tight text-white">PULL</span>
                        <span className="text-[7.5px] font-mono text-gray-400">RIGHT</span>
                      </div>
                      <ChevronRight size={14} className="text-gray-200" />
                    </div>

                    {/* Back Facing Pill (Visible when looking from reverse side) */}
                    <div
                      className="absolute inset-0 flex items-center gap-1.5 glass-crystal-btn text-white px-3 py-1.5 rounded-full shadow-2xl transition-all"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg) translateZ(8px)",
                      }}
                    >
                      <ChevronLeft size={14} className="text-gray-200" />
                      <div className="flex flex-col items-start leading-none pr-0.5">
                        <span className="text-[9px] font-mono font-bold tracking-tight text-white">PULL</span>
                        <span className="text-[7.5px] font-mono text-gray-400">EDGE</span>
                      </div>
                    </div>

                    {/* Extended Grab Zone */}
                    <div className="absolute -inset-x-4 -inset-y-12 cursor-ew-resize" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   SINGLE DUAL-SIDED PAPER PANEL (Recto & Verso)
--------------------------------------------------------- */

interface BrochurePanelProps {
  panelIndex: number;
  frontData: PageData;
  backData: PageData;
  isFocused: boolean;
  onPanelClick: (panelIndex: number, side: "front" | "back") => void;
  shadowOpacity: number;
  foldSide: "left" | "inner" | "right";
}

function BrochurePanel({
  panelIndex,
  frontData,
  backData,
  isFocused,
  onPanelClick,
  shadowOpacity,
}: BrochurePanelProps) {
  // Fold Crease Profiles:
  // - Panel 0: Right edge is a fold seam (Valley on front, Mountain on back)
  // - Panel 1: Left edge is a fold seam, Right edge is a fold seam (Mountain on front, Valley on back)
  // - Panel 2: Left edge is a fold seam, Right edge is a fold seam (Valley on front, Mountain on back)
  // - Panel 3: Left edge is a fold seam
  const hasLeftFold = panelIndex > 0;
  const hasRightFold = panelIndex < 3;

  // Front Fold Joint Types:
  // Joint 0-1 (Right of 0, Left of 1): Valley fold on Front, Mountain on Back
  // Joint 1-2 (Right of 1, Left of 2): Mountain fold on Front, Valley on Back
  // Joint 2-3 (Right of 2, Left of 3): Valley fold on Front, Mountain on Back
  const isLeftFoldValleyOnFront = panelIndex === 1 || panelIndex === 3;
  const isRightFoldValleyOnFront = panelIndex === 0 || panelIndex === 2;

  return (
    <div
      className="relative w-full h-full group cursor-pointer select-none"
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* FRONT SIDE (Recto) */}
      <div
        className="absolute inset-0 overflow-hidden select-none"
        style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(0deg) translateZ(0.6px)",
          boxShadow: isFocused
            ? "0 22px 45px rgba(0,0,0,0.45)"
            : "0 10px 30px rgba(0,0,0,0.22)",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onPanelClick(panelIndex, "front");
        }}
      >
        <PageFaceContent page={frontData} />

        {/* --- REALISTIC PHYSICAL PAPER CREASE & FOLD SHADING (FRONT) --- */}
        {/* Left Hinge Crease & Shadow */}
        {hasLeftFold && (
          <>
            {isLeftFoldValleyOnFront ? (
              // Valley fold on left: deep ambient occlusion gradient + scored deboss crease line
              <>
                <div
                  className="absolute left-0 top-0 bottom-0 w-8 pointer-events-none transition-opacity duration-150"
                  style={{
                    background: "linear-gradient(90deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.12) 40%, transparent 100%)",
                    opacity: Math.min(1, shadowOpacity * 1.3),
                  }}
                />
                <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-black/25 pointer-events-none" />
                <div className="absolute left-[1px] top-0 bottom-0 w-[1px] bg-white/20 pointer-events-none" />
              </>
            ) : (
              // Mountain fold on left: crisp ridge specular highlight
              <>
                <div
                  className="absolute left-0 top-0 bottom-0 w-5 pointer-events-none transition-opacity duration-150"
                  style={{
                    background: "linear-gradient(90deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 45%, transparent 100%)",
                    opacity: Math.min(1, shadowOpacity * 0.9 + 0.3),
                  }}
                />
                <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-white/60 pointer-events-none" />
              </>
            )}
          </>
        )}

        {/* Right Hinge Crease & Shadow */}
        {hasRightFold && (
          <>
            {isRightFoldValleyOnFront ? (
              // Valley fold on right: deep ambient occlusion gradient + scored deboss crease line
              <>
                <div
                  className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none transition-opacity duration-150"
                  style={{
                    background: "linear-gradient(270deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.12) 40%, transparent 100%)",
                    opacity: Math.min(1, shadowOpacity * 1.3),
                  }}
                />
                <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-black/25 pointer-events-none" />
                <div className="absolute right-[1px] top-0 bottom-0 w-[1px] bg-white/20 pointer-events-none" />
              </>
            ) : (
              // Mountain fold on right: crisp ridge specular highlight
              <>
                <div
                  className="absolute right-0 top-0 bottom-0 w-5 pointer-events-none transition-opacity duration-150"
                  style={{
                    background: "linear-gradient(270deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 45%, transparent 100%)",
                    opacity: Math.min(1, shadowOpacity * 0.9 + 0.3),
                  }}
                />
                <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/60 pointer-events-none" />
              </>
            )}
          </>
        )}

        {/* General Surface Light Roll-off */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-150"
          style={{
            background:
              panelIndex % 2 === 0
                ? "linear-gradient(90deg, transparent 40%, rgba(0,0,0,0.08) 100%)"
                : "linear-gradient(270deg, transparent 40%, rgba(0,0,0,0.08) 100%)",
            opacity: shadowOpacity * 0.7,
          }}
        />

        {/* Focus Highlight Indicator */}
        {isFocused && (
          <div className="absolute inset-0 ring-2 ring-white/70 pointer-events-none" />
        )}

        {/* Hover Highlight Overlay */}
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none" />
      </div>

      {/* BACK SIDE (Verso) - Rotated 180deg */}
      <div
        className="absolute inset-0 overflow-hidden select-none"
        style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg) translateZ(0.6px)",
          boxShadow: isFocused
            ? "0 22px 45px rgba(0,0,0,0.45)"
            : "0 10px 30px rgba(0,0,0,0.22)",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onPanelClick(panelIndex, "back");
        }}
      >
        <PageFaceContent page={backData} />

        {/* --- REALISTIC PHYSICAL PAPER CREASE & FOLD SHADING (BACK / VERSO) --- */}
        {/* Left Hinge Crease on Back (Corresponds to Mountain on Front -> Valley on Back, etc.) */}
        {hasLeftFold && (
          <>
            {!isLeftFoldValleyOnFront ? (
              // Valley fold on back
              <>
                <div
                  className="absolute left-0 top-0 bottom-0 w-8 pointer-events-none transition-opacity duration-150"
                  style={{
                    background: "linear-gradient(90deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.12) 40%, transparent 100%)",
                    opacity: Math.min(1, shadowOpacity * 1.3),
                  }}
                />
                <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-black/25 pointer-events-none" />
                <div className="absolute left-[1px] top-0 bottom-0 w-[1px] bg-white/20 pointer-events-none" />
              </>
            ) : (
              // Mountain fold on back
              <>
                <div
                  className="absolute left-0 top-0 bottom-0 w-5 pointer-events-none transition-opacity duration-150"
                  style={{
                    background: "linear-gradient(90deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 45%, transparent 100%)",
                    opacity: Math.min(1, shadowOpacity * 0.9 + 0.3),
                  }}
                />
                <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-white/60 pointer-events-none" />
              </>
            )}
          </>
        )}

        {/* Right Hinge Crease on Back */}
        {hasRightFold && (
          <>
            {!isRightFoldValleyOnFront ? (
              // Valley fold on back
              <>
                <div
                  className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none transition-opacity duration-150"
                  style={{
                    background: "linear-gradient(270deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.12) 40%, transparent 100%)",
                    opacity: Math.min(1, shadowOpacity * 1.3),
                  }}
                />
                <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-black/25 pointer-events-none" />
                <div className="absolute right-[1px] top-0 bottom-0 w-[1px] bg-white/20 pointer-events-none" />
              </>
            ) : (
              // Mountain fold on back
              <>
                <div
                  className="absolute right-0 top-0 bottom-0 w-5 pointer-events-none transition-opacity duration-150"
                  style={{
                    background: "linear-gradient(270deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 45%, transparent 100%)",
                    opacity: Math.min(1, shadowOpacity * 0.9 + 0.3),
                  }}
                />
                <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/60 pointer-events-none" />
              </>
            )}
          </>
        )}

        {/* General Surface Light Roll-off */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-150"
          style={{
            background:
              panelIndex % 2 === 0
                ? "linear-gradient(270deg, transparent 40%, rgba(0,0,0,0.08) 100%)"
                : "linear-gradient(90deg, transparent 40%, rgba(0,0,0,0.08) 100%)",
            opacity: shadowOpacity * 0.7,
          }}
        />

        {/* Focus Highlight Indicator */}
        {isFocused && (
          <div className="absolute inset-0 ring-2 ring-white/70 pointer-events-none" />
        )}

        {/* Hover Highlight Overlay */}
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none" />
      </div>
    </div>
  );
}
