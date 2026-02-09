/**
 * NotificationBadge component
 * Displays a colored dot indicator based on status
 */

import React from "react";
import { motion } from "framer-motion";

export type BadgeColor = "red" | "yellow" | "green" | "none";

interface NotificationBadgeProps {
  status: BadgeColor;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  size?: "sm" | "md" | "lg";
}

export default function NotificationBadge({
  status,
  position = "top-right",
  size = "sm",
}: NotificationBadgeProps) {
  if (status === "none") return null;

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  const colorClasses = {
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    green: "bg-green-500",
  };

  const positionClasses = {
    "top-right": "top-0 right-0",
    "top-left": "top-0 left-0",
    "bottom-right": "bottom-0 right-0",
    "bottom-left": "bottom-0 left-0",
  };

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`
        absolute ${positionClasses[position]} 
        ${sizeClasses[size]} 
        ${colorClasses[status]}
        rounded-full border-2 border-white
        shadow-lg
      `}
      style={{
        transform: "translate(25%, -25%)",
      }}
    >
      {/* Pulse animation */}
      <motion.span
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`
          absolute inset-0 rounded-full
          ${colorClasses[status]}
        `}
      />
    </motion.span>
  );
}
