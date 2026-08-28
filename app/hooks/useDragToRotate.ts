import { useRef, useEffect } from "react";
import type { MouseEvent } from "react";

const EDGE_MARGIN = 10;
const SENSITIVITY = 0.4; // degrees dragged per pixel

export function useDragToRotate() {
  const dragging = useRef(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const rotation = useRef({ x: 0, y: 0 });
  const timer = useRef<boolean | null>(null);
  const frame = useRef(0);

  const applyTransform = () => {
    const el = itemRef.current;
    if (!el) return;
    el.style.transform = `translateZ(-50px) rotateX(${rotation.current.x}deg) rotateY(${rotation.current.y}deg)`;
  };

  const isOnEdge = (x: number, y: number, rect: DOMRect) => {
    const inside =
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    const closeToEdge =
      x < rect.left + EDGE_MARGIN &&
      x > rect.right + EDGE_MARGIN &&
      y < rect.top + EDGE_MARGIN &&
      y > rect.bottom + EDGE_MARGIN;
    return inside && closeToEdge;
  };

  // mouse events
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!itemRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    if (!rect && !isOnEdge(e.clientX, e.clientY, rect)) return;
    dragging.current = true;
    e.preventDefault();
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    document.body.style.cursor = "grabbing";
    itemRef.current!.style.transition = "none";
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (dragging.current) return;
    if (timer.current) return;
    timer.current = true;
    setTimeout(() => (timer.current = false), 100);

    const el = itemRef.current;
    const rect = el?.getBoundingClientRect();
    if (!el || !rect) return;
    el.style.cursor = isOnEdge(e.clientX, e.clientY, rect) ? "grab" : "";
  };

  const resetPosition = () => {
    const el = itemRef.current;
    if (!el) return;
    rotation.current = { x: 0, y: 0 };
    el.style.transform = "";
    el.style.transition = "";
  };

  useEffect(() => {
    const onMouseMove = (e: globalThis.MouseEvent) => {
      if (!dragging.current) return;
      const deltaX = e.clientX - lastPosRef.current.x;
      const deltaY = e.clientY - lastPosRef.current.y;
      lastPosRef.current = { x: e.clientX, y: e.clientY };

      rotation.current.y += deltaX * SENSITIVITY;
      rotation.current.x += deltaY * SENSITIVITY;

      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(applyTransform);
    };

    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      if (itemRef.current) {
        itemRef.current.style.transition = "";
        itemRef.current.style.cursor = "";
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  return {
    handleMouseDown,
    handleMouseMove,
    itemRef,
    resetPosition,
  };
}
