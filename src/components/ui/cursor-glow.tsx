"use client";

import { useEffect, useRef, useState } from "react";

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!supportsHover) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount capability detection
    setIsEnabled(true);

    let rafId = 0;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    function onMove(event: PointerEvent) {
      targetX = event.clientX;
      targetY = event.clientY;

      const target = event.target as HTMLElement | null;
      const interactive = target?.closest(
        'a, button, [role="button"], summary, [data-cursor-interactive="true"], input[type="checkbox"], input[type="radio"], label',
      );

      const glow = glowRef.current;
      if (!glow) return;

      if (interactive) {
        glow.dataset.active = "true";
      } else {
        glow.dataset.active = "false";
      }
    }

    function tick() {
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;
      const glow = glowRef.current;
      if (glow) {
        glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      }
      rafId = window.requestAnimationFrame(tick);
    }

    function onLeave() {
      const glow = glowRef.current;
      if (glow) {
        glow.dataset.visible = "false";
      }
    }

    function onEnter() {
      const glow = glowRef.current;
      if (glow) {
        glow.dataset.visible = "true";
      }
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  if (!isEnabled) return null;

  return <div ref={glowRef} className="cursor-glow" data-visible="true" data-active="false" aria-hidden />;
}
