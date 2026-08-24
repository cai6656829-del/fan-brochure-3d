import React, { useState, useRef, useEffect, useCallback } from "react";
import { PageData } from "./types";
import { FRONT_PAGES, BACK_PAGES, ALL_PAGES } from "./data/pages";
import { BrochureModel3D } from "./components/BrochureModel3D";
import { ViewportControls } from "./components/ViewportControls";
import { HighResDetailModal } from "./components/HighResDetailModal";
import { PageUploadManagerModal } from "./components/PageUploadManagerModal";
import { soundEngine } from "./utils/audio";
import {
  savePageImage,
  batchSavePageImages,
  loadAllPageImages,
  clearAllPageImages,
} from "./utils/storage";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export default function App() {
  // 3D Perspective Angles (Golden perspective angle)
  const BASE_ROT_X = 14; // Downward tilt angle for clear fold depth and floor perspective
  const BASE_ROT_Y = -12; // Slight angle showing deep perspective of all 4 zigzag folds
  
  const [rotX, setRotX] = useState<number>(BASE_ROT_X);
  const [rotY, setRotY] = useState<number>(BASE_ROT_Y);
  const [zoom, setZoom] = useState<number>(1.0);
  const [targetFoldAngle, setTargetFoldAngle] = useState<number>(55); // Accordion target angle (0° = flat, 115° = compact)
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAutoOrbit, setIsAutoOrbit] = useState<boolean>(false);
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");

  // Custom User Pages State (allows user to upload real artwork for any/all 8 pages)
  const [allPages, setAllPages] = useState<PageData[]>(() => ALL_PAGES);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  const frontPages = allPages.filter((p) => p.side === "front");
  const backPages = allPages.filter((p) => p.side === "back");

  // Interaction & Focus States
  const [focusedPanel, setFocusedPanel] = useState<{ index: number; side: "front" | "back" } | null>(null);
  const [detailModalPage, setDetailModalPage] = useState<PageData | null>(null);

  // Load custom page images from IndexedDB on initial mount
  useEffect(() => {
    let isMounted = true;
    loadAllPageImages().then((storedMap) => {
      if (!isMounted) return;
      const keys = Object.keys(storedMap);
      if (keys.length > 0) {
        setAllPages((prev) => {
          const updated = prev.map((p) => (storedMap[p.id] ? { ...p, customImageUrl: storedMap[p.id] } : p));
          
          // Intelligent Auto-Detection of Active Side
          const frontUploads = updated.filter((p) => p.side === "front" && p.customImageUrl).length;
          const backUploads = updated.filter((p) => p.side === "back" && p.customImageUrl).length;
          
          if (backUploads > frontUploads) {
            setActiveSide("back");
            setRotY(BASE_ROT_Y + 180);
          } else if (frontUploads > 0) {
            setActiveSide("front");
            setRotY(BASE_ROT_Y);
          }
          
          return updated;
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Synchronize modal page with current allPages state if updated
  useEffect(() => {
    if (detailModalPage) {
      const updated = allPages.find((p) => p.id === detailModalPage.id);
      if (updated && updated !== detailModalPage) {
        setDetailModalPage(updated);
      }
    }
  }, [allPages, detailModalPage]);

  // Handlers for Custom Image Uploads (Persistent across page reloads)
  const handleUpdatePageImage = (pageId: string, imageUrl: string | undefined) => {
    setAllPages((prev) =>
      prev.map((p) => (p.id === pageId ? { ...p, customImageUrl: imageUrl } : p))
    );
    savePageImage(pageId, imageUrl);
  };

  const handleBatchUpdateImages = (updates: { pageId: string; imageUrl: string }[]) => {
    setAllPages((prev) => {
      const updateMap = new Map(updates.map((u) => [u.pageId, u.imageUrl]));
      return prev.map((p) => {
        if (updateMap.has(p.id)) {
          return { ...p, customImageUrl: updateMap.get(p.id) };
        }
        return p;
      });
    });
    batchSavePageImages(updates);
  };

  const handleResetAllCustomImages = () => {
    setAllPages(ALL_PAGES);
    clearAllPageImages();
  };

  // Anti-Theft & Copyright Protection Toast state
  const [securityToast, setSecurityToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });
  const toastTimeoutRef = useRef<number | null>(null);

  const triggerSecurityNotice = useCallback((msg: string = "Artwork is copyright protected. Right-click, capture, and downloading are disabled.") => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setSecurityToast({ message: msg, visible: true });
    toastTimeoutRef.current = window.setTimeout(() => {
      setSecurityToast({ message: "", visible: false });
    }, 2800);
  }, []);

  // Global Anti-Theft Protection Event Listeners
  useEffect(() => {
    // 1. Prevent Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerSecurityNotice("© Original Design Copyright: Right-click disabled");
    };

    // 2. Prevent Dragging Images or Assets
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      triggerSecurityNotice("© Drag-and-drop export disabled");
    };

    // 3. Prevent Copying Content / Assets
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerSecurityNotice("© Artwork protected by copyright: Copying prohibited");
    };

    // 4. Prevent Print, Save, View-Source, and DevTools Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      // Prevent Ctrl+S / Cmd+S (Save)
      if (isCtrlOrMeta && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        triggerSecurityNotice("© Direct saving is protected");
      }
      // Prevent Ctrl+P / Cmd+P (Print)
      else if (isCtrlOrMeta && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        triggerSecurityNotice("© Printing and reproduction export restricted");
      }
      // Prevent Ctrl+U / Cmd+Option+U (View Source)
      else if (isCtrlOrMeta && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        triggerSecurityNotice("© Copyright protection active");
      }
      // Prevent F12, Ctrl+Shift+I / Cmd+Option+I (Inspect)
      else if (
        e.key === "F12" ||
        (isCtrlOrMeta && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c"))
      ) {
        e.preventDefault();
        triggerSecurityNotice("© Inspector restricted by copyright policy");
      }
    };

    window.addEventListener("contextmenu", handleContextMenu, { capture: true });
    window.addEventListener("dragstart", handleDragStart, { capture: true });
    window.addEventListener("copy", handleCopy, { capture: true });
    window.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      window.removeEventListener("dragstart", handleDragStart, { capture: true });
      window.removeEventListener("copy", handleCopy, { capture: true });
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [triggerSecurityNotice]);

  // Dynamic Spring Physics state for each of the 3 fold hinges
  const [hingeAngles, setHingeAngles] = useState<[number, number, number]>([55, 55, 55]);
  const hingePhysRef = useRef<[
    { pos: number; vel: number },
    { pos: number; vel: number },
    { pos: number; vel: number }
  ]>([
    { pos: 55, vel: 0 },
    { pos: 55, vel: 0 },
    { pos: 55, vel: 0 },
  ]);

  // Dragging State: "left" | "right" for accordion handles, "canvas" for 360° orbit rotation
  const [isDragging, setIsDragging] = useState<"left" | "right" | "canvas" | null>(null);
  const dragStartRef = useRef<{
    type: "left" | "right" | "canvas";
    x: number;
    y: number;
    startAngle: number;
    startRotX: number;
    startRotY: number;
  }>({
    type: "canvas",
    x: 0,
    y: 0,
    startAngle: 55,
    startRotX: BASE_ROT_X,
    startRotY: BASE_ROT_Y,
  });

  const lastDragTime = useRef<number>(0);
  const orbitVelocity = useRef<number>(0);

  // Trigger Spring Pluck / Accordion Bounce with Traveling Wave
  const handleSpringPluck = useCallback(() => {
    soundEngine.playSpringPluck();
    // Inject asymmetric impulse velocities across hinges to create a lively traveling wave
    hingePhysRef.current[0].vel += 130;
    hingePhysRef.current[1].vel -= 100;
    hingePhysRef.current[2].vel += 75;
  }, []);

  // Handle panel click: open high-res view and ensure 3D model faces the selected side
  const handlePanelClick = useCallback(
    (panelIndex: number, side: "front" | "back") => {
      setFocusedPanel({ index: panelIndex, side });
      setActiveSide(side);

      // If current camera view is opposite to requested side, smoothly adjust rotation
      const cosY = Math.cos((rotY * Math.PI) / 180);
      const isFacingFront = cosY >= 0;
      if (side === "back" && isFacingFront) {
        setRotY((prev) => prev + 180);
      } else if (side === "front" && !isFacingFront) {
        setRotY((prev) => prev + 180);
      }

      // Trigger gentle spring bounce
      hingePhysRef.current[0].vel += (Math.random() - 0.5) * 35;
      hingePhysRef.current[1].vel += (Math.random() - 0.5) * 35;
      hingePhysRef.current[2].vel += (Math.random() - 0.5) * 35;
      soundEngine.playFoldTick(0.8);

      const pages = side === "front" ? frontPages : backPages;
      const page = pages[panelIndex] || pages[0];
      setDetailModalPage(page);
    },
    [rotY, frontPages, backPages]
  );

  // Start dragging from Left Edge or Right Edge handles (for accordion stretch/compress)
  const handleEdgeDragStart = useCallback(
    (edge: "left" | "right", e: React.PointerEvent) => {
      e.stopPropagation();
      setIsDragging(edge);
      dragStartRef.current = {
        type: edge,
        x: e.clientX,
        y: e.clientY,
        startAngle: targetFoldAngle,
        startRotX: rotX,
        startRotY: rotY,
      };
      soundEngine.playFoldTick(1.2);
    },
    [targetFoldAngle, rotX, rotY]
  );

  // Pointer Down on background / canvas: 360° free orbit rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    if (detailModalPage) return;

    // Check if target is interactive button or handle
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input") || target.closest("#handle-left-edge") || target.closest("#handle-right-edge")) {
      return;
    }

    setIsDragging("canvas");
    dragStartRef.current = {
      type: "canvas",
      x: e.clientX,
      y: e.clientY,
      startAngle: targetFoldAngle,
      startRotX: rotX,
      startRotY: rotY,
    };
  };

  // Pointer Move:
  // - If dragging edge: adjusts accordion fold angle with spring feedback
  // - If dragging canvas: smoothly rotates the 3D model in 360° orbit (X & Y)
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    // Determine if the current viewing orientation is looking at the front or back side
    const cosY = Math.cos((dragStartRef.current.startRotY * Math.PI) / 180);
    const isLookingAtFront = cosY >= 0;

    if (isDragging === "left") {
      // On front view: Left handle is on the screen's left (pulling left dx < 0 opens).
      // On back view: Left handle (Panel 0) is on the screen's right (pulling right dx > 0 opens).
      const pullOutwardDelta = isLookingAtFront ? -dx : dx;
      let newAngle = dragStartRef.current.startAngle - pullOutwardDelta * 0.35;
      newAngle = Math.max(0, Math.min(150, newAngle));
      setTargetFoldAngle(newAngle);

      const now = performance.now();
      if (now - lastDragTime.current > 85) {
        soundEngine.playFoldTick(0.6);
        lastDragTime.current = now;
      }
    } else if (isDragging === "right") {
      // On front view: Right handle is on the screen's right (pulling right dx > 0 opens).
      // On back view: Right handle (Panel 3) is on the screen's left (pulling left dx < 0 opens).
      const pullOutwardDelta = isLookingAtFront ? dx : -dx;
      let newAngle = dragStartRef.current.startAngle - pullOutwardDelta * 0.35;
      newAngle = Math.max(0, Math.min(150, newAngle));
      setTargetFoldAngle(newAngle);

      const now = performance.now();
      if (now - lastDragTime.current > 85) {
        soundEngine.playFoldTick(0.6);
        lastDragTime.current = now;
      }
    } else if (isDragging === "canvas") {
      // 360° Orbit Rotation with Perspective
      const nextRotY = dragStartRef.current.startRotY + dx * 0.5;
      const nextRotX = Math.max(-65, Math.min(65, dragStartRef.current.startRotX - dy * 0.4));

      setRotY(nextRotY);
      setRotX(nextRotX);

      // Auto update active side indicator based on current camera view
      const currentCos = Math.cos((nextRotY * Math.PI) / 180);
      setActiveSide(currentCos >= 0 ? "front" : "back");

      // Track rotation velocity for subtle release inertia
      orbitVelocity.current = dx * 0.08;
    }
  };

  // Pointer Up: Release with elastic spring oscillation or inertia
  const handlePointerUp = () => {
    if (isDragging === "left" || isDragging === "right") {
      setIsDragging(null);
      handleSpringPluck();
    } else if (isDragging === "canvas") {
      setIsDragging(null);
    }
  };

  // Auto 360° Orbit loop
  useEffect(() => {
    if (!isAutoOrbit) return;

    let animId: number;
    const orbitLoop = () => {
      if (!isDragging) {
        setRotY((prev) => {
          const next = (prev + 0.4) % 360;
          const currentCos = Math.cos((next * Math.PI) / 180);
          setActiveSide(currentCos >= 0 ? "front" : "back");
          return next;
        });
      }
      animId = requestAnimationFrame(orbitLoop);
    };

    animId = requestAnimationFrame(orbitLoop);
    return () => cancelAnimationFrame(animId);
  }, [isAutoOrbit, isDragging]);

  // Fold angle change from slider or preset with spring impulse
  const handleFoldChange = (angle: number) => {
    setTargetFoldAngle(angle);
    soundEngine.playFoldTick(1.0);
    const diff = angle - hingePhysRef.current[0].pos;
    hingePhysRef.current[0].vel += diff * 1.5;
    hingePhysRef.current[1].vel += diff * 1.1;
    hingePhysRef.current[2].vel += diff * 0.8;
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.06 : 0.06;
    setZoom((prev) => Math.max(0.6, Math.min(1.7, prev + delta)));
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  // Real-time Elastic Multi-Hinge Physics Simulation (Hooke's Law with wave propagation)
  useEffect(() => {
    let lastTime = performance.now();
    let animFrameId: number;

    const physicsLoop = (now: number) => {
      const dt = Math.min(0.033, (now - lastTime) / 1000);
      lastTime = now;

      // Spring Parameters
      const k = 135; // stiffness
      const c = 11.5; // damping
      const coupling = 32; // mechanical accordion coupling

      const p0 = hingePhysRef.current[0];
      const p1 = hingePhysRef.current[1];
      const p2 = hingePhysRef.current[2];

      // Joint 0
      const force0 = (targetFoldAngle - p0.pos) * k - p0.vel * c + (p1.pos - p0.pos) * coupling;
      p0.vel += force0 * dt;
      p0.pos += p0.vel * dt;

      // Joint 1
      const force1 = (targetFoldAngle - p1.pos) * k - p1.vel * c + (p0.pos - p1.pos) * coupling + (p2.pos - p1.pos) * coupling;
      p1.vel += force1 * dt;
      p1.pos += p1.vel * dt;

      // Joint 2
      const force2 = (targetFoldAngle - p2.pos) * k - p2.vel * c + (p1.pos - p2.pos) * coupling;
      p2.vel += force2 * dt;
      p2.pos += p2.vel * dt;

      // Clamp limits to prevent physical folding inversion
      p0.pos = Math.max(-5, Math.min(160, p0.pos));
      p1.pos = Math.max(-5, Math.min(160, p1.pos));
      p2.pos = Math.max(-5, Math.min(160, p2.pos));

      // Update state for rendering
      setHingeAngles([p0.pos, p1.pos, p2.pos]);

      animFrameId = requestAnimationFrame(physicsLoop);
    };

    animFrameId = requestAnimationFrame(physicsLoop);
    return () => cancelAnimationFrame(animFrameId);
  }, [targetFoldAngle]);

  // Flip Front / Back (Rotates 180 degrees)
  const handleFlipSide = () => {
    const nextSide = activeSide === "front" ? "back" : "front";
    setActiveSide(nextSide);
    setRotY((prev) => prev + 180);
    handleSpringPluck();
  };

  // Reset View to Studio default
  const handleResetView = () => {
    setFocusedPanel(null);
    setTargetFoldAngle(55);
    setIsAutoOrbit(false);
    handleSpringPluck();
    setRotX(BASE_ROT_X);
    setRotY(BASE_ROT_Y);
    setZoom(1.0);
  };

  return (
    <div
      id="fold-studio-app"
      className={`relative w-screen h-screen bg-dark-gradient overflow-hidden select-none font-sans text-[#F0F4F8] ${
        isDragging === "left" || isDragging === "right"
          ? "cursor-ew-resize"
          : isDragging === "canvas"
          ? "cursor-grab active:cursor-grabbing"
          : "cursor-default"
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* Background Volumetric Studio Light & Ambient Vignette */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[25%] w-[50vw] h-[45vh] rounded-full bg-white/[0.035] blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[15%] w-[40vw] h-[40vh] rounded-full bg-black/40 blur-[100px]" />
        <div className="absolute top-[35%] left-[50%] -translate-x-1/2 w-[60vw] h-[50vh] rounded-full bg-[#353942]/15 blur-[150px]" />
      </div>
      {/* 3D VIEWPORT HUD & TOOLBARS */}
      <ViewportControls
        rotX={rotX}
        rotY={rotY}
        zoom={zoom}
        foldAngle={targetFoldAngle}
        hingeAngles={hingeAngles}
        showGrid={showGrid}
        isMuted={isMuted}
        isAutoOrbit={isAutoOrbit}
        activeSide={activeSide}
        focusedPanel={focusedPanel}
        onFoldChange={handleFoldChange}
        onToggleAutoOrbit={() => setIsAutoOrbit((prev) => !prev)}
        onSpringPluck={handleSpringPluck}
        onToggleGrid={() => setShowGrid((prev) => !prev)}
        onToggleMute={handleToggleMute}
        onFlipSide={handleFlipSide}
        onResetView={handleResetView}
        onZoomIn={() => setZoom((prev) => Math.min(1.7, prev + 0.12))}
        onZoomOut={() => setZoom((prev) => Math.max(0.6, prev - 0.12))}
        onSelectPanel={handlePanelClick}
        frontPages={frontPages}
        backPages={backPages}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      {/* 3D PERSPECTIVE ACCORDION BROCHURE MODEL */}
      <BrochureModel3D
        rotX={rotX}
        rotY={rotY}
        zoom={zoom}
        hingeAngles={hingeAngles}
        focusedPanel={focusedPanel}
        onPanelClick={handlePanelClick}
        onEdgeDragStart={handleEdgeDragStart}
        isDraggingEdge={isDragging}
        showGrid={showGrid}
        frontPages={frontPages}
        backPages={backPages}
      />

      {/* HIGH RES DESIGN ARTWORK DETAIL MODAL */}
      {detailModalPage && (
        <HighResDetailModal
          page={detailModalPage}
          allPages={allPages}
          onSelectPage={(p) => setDetailModalPage(p)}
          onClose={() => setDetailModalPage(null)}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
        />
      )}

      {/* PAGE ARTWORK UPLOAD & MANAGER MODAL */}
      <PageUploadManagerModal
        isOpen={isUploadModalOpen}
        pages={allPages}
        onClose={() => setIsUploadModalOpen(false)}
        onUpdatePageImage={handleUpdatePageImage}
        onBatchUpdateImages={handleBatchUpdateImages}
        onResetAllCustomImages={handleResetAllCustomImages}
      />

      {/* COPYRIGHT & ANTI-THEFT FLOATING TOAST NOTIFICATION */}
      {securityToast.visible && (
        <div
          id="anti-theft-toast"
          className="fixed top-18 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex items-center gap-2.5 px-4 py-2.5 rounded-full glass-panel text-[#F0F6FC] animate-fadeIn transition-all"
        >
          <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={13} className="text-gray-300" />
          </div>
          <div className="text-xs font-mono tracking-tight flex items-center gap-2">
            <span className="font-semibold text-white">{securityToast.message}</span>
            <span className="text-gray-400 border-l border-white/15 pl-2 hidden sm:inline">FOLD STUDIO COPYRIGHT</span>
          </div>
        </div>
      )}
    </div>
  );
}
