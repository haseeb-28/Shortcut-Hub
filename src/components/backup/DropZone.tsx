"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileUp, UploadCloud } from "lucide-react";

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED = ".json,.csv,.xlsx,.xls";

export function DropZone({ onFile, disabled }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  }

  return (
    <motion.div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={disabled ? undefined : handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      animate={{
        borderColor: isDragging ? "#F2B705" : "#223052",
        backgroundColor: isDragging ? "rgba(242,183,5,0.06)" : "rgba(23,33,58,0.3)",
        scale: isDragging ? 1.01 : 1,
      }}
      transition={{ duration: 0.15 }}
      className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-opacity"
      role="button"
      tabIndex={0}
      aria-label="Upload a backup file"
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) inputRef.current?.click();
      }}
      style={disabled ? { opacity: 0.5, pointerEvents: "none" } : undefined}
    >
      <motion.div
        animate={{ y: isDragging ? -3 : 0 }}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-amber/15 text-amber"
      >
        {isDragging ? <FileUp className="h-6 w-6" /> : <UploadCloud className="h-6 w-6" />}
      </motion.div>
      <div>
        <p className="font-display text-sm font-semibold text-mist">
          {isDragging ? "Drop it here" : "Drag & drop a backup file"}
        </p>
        <p className="mt-1 font-mono text-[11px] text-ink2">or click to browse — .json, .csv, .xlsx</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </motion.div>
  );
}
