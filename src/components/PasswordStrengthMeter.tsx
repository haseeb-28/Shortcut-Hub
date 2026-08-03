"use client";

import { motion } from "framer-motion";
import { passwordStrength } from "@/domain/entities/password";

const SEGMENT_COLORS = ["#F2555A", "#F2555A", "#F2B705", "#4FD1C5", "#4FD1C5"];

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const { score, label } = passwordStrength(password);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-ink-600">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: SEGMENT_COLORS[score] }}
              initial={{ width: 0 }}
              animate={{ width: i < score ? "100%" : "0%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
          </div>
        ))}
      </div>
      <p className="font-mono text-[10px] text-ink2" style={{ color: score >= 3 ? "#4FD1C5" : undefined }}>
        {label}
      </p>
    </div>
  );
}