"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

  // 阻止背景滚动
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // 下滑关闭
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 80) onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />
      {/* 面板 */}
      <div
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-slide-up",
          "max-h-[85vh] overflow-y-auto"
        )}
      >
        {/* 拖拽指示条 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-surface-300" />
        </div>
        {/* 标题栏 */}
        {title && (
          <div className="flex items-center justify-between px-5 py-2">
            <h3 className="text-base font-semibold text-surface-900">{title}</h3>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-surface-400 hover:bg-surface-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {/* 内容 */}
        <div className="px-5 pb-8 pt-2">{children}</div>
      </div>
    </div>
  );
}
