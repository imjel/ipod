import { useRef, useEffect } from "react";

const EDGE_MARGIN = 20;
const SENSITIVITY = 0.4; // degrees dragged per pixel

export function useDragToRotate() {
  const dragging = useRef(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const rotation = useRef({ x: 0, y: 0 });
  const frame = useRef(0);

  const applyTransform = () => {
    const el = itemRef.current;
    if (!el) return;
    el.style.transform = `translateZ(-50px) rotateX(${rotation.current.x}deg) rotateY(${rotation.current.y}deg)`;
  };

  // entire ipod + 20px outside
  const cursorInDragArea = (x: number, y: number, rect: DOMRect) =>
    x >= rect.left - EDGE_MARGIN &&
    x <= rect.right + EDGE_MARGIN &&
    y >= rect.top - EDGE_MARGIN &&
    y <= rect.bottom + EDGE_MARGIN;

  // 20px inside of ipod edge
  const cursorInInterior = (x: number, y: number, rect: DOMRect) =>
    x > rect.left + EDGE_MARGIN &&
    x < rect.right - EDGE_MARGIN &&
    y > rect.top + EDGE_MARGIN &&
    y < rect.bottom - EDGE_MARGIN;

  const resetPosition = () => {
    const el = itemRef.current;
    if (!el) return;
    rotation.current = { x: 0, y: 0 };
    el.style.transform = "";
    el.style.transition = "";
  };

  useEffect(() => {
    const onMouseDown = (e: globalThis.MouseEvent) => {
      const el = itemRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();

      if ((e.target as HTMLElement).closest("button")) return;
      if (!cursorInDragArea(e.clientX, e.clientY, rect)) return;

      dragging.current = true;
      e.preventDefault();
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      document.body.style.cursor = "grabbing";
      itemRef.current!.style.transition = "none";
    };

    const onMouseMove = (e: globalThis.MouseEvent) => {
      const el = itemRef.current;
      if (!el) return;

      if (!dragging.current) {
        const rect = el.getBoundingClientRect();
        const isOnEdge =
          cursorInDragArea(e.clientX, e.clientY, rect) &&
          !cursorInInterior(e.clientX, e.clientY, rect);
        document.body.style.cursor = isOnEdge ? "pointer" : "";
        return;
      }

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
      document.body.style.cursor = "";
      if (itemRef.current) {
        itemRef.current.style.transition = "";
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  return {
    itemRef,
    resetPosition,
  };
}
