import type { ReactNode } from "react";
import { useRef } from "react";

type Point = { x: number; y: number };

export function WorkoutGestureLayer({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
}: {
  children: ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
}) {
  const start = useRef<Point | null>(null);

  return (
    <div
      className="touch-pan-y"
      onPointerDown={(event) => {
        start.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={(event) => {
        if (!start.current) return;
        const deltaX = event.clientX - start.current.x;
        const deltaY = event.clientY - start.current.y;
        start.current = null;
        if (Math.abs(deltaX) < 58 && Math.abs(deltaY) < 58) return;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 0) onSwipeRight();
          else onSwipeLeft();
          return;
        }
        if (deltaY < 0) onSwipeUp();
      }}
    >
      {children}
    </div>
  );
}
