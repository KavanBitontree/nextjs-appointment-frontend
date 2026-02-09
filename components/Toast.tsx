"use client";

import React, { useState, useCallback, useRef } from "react";
import { AlertCircle, CheckCircle, Info, X, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export type ToastType =
  | "error"
  | "success"
  | "info"
  | "warning"
  | "appointment";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  clickable?: boolean;
  onClick?: () => void;
  appointmentType?: "red" | "yellow" | "green"; // For appointment-specific styling
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type: ToastType, duration?: number) => void;
  showAppointmentToast: (
    message: string,
    appointmentType: "red" | "yellow" | "green",
    appointmentPath: string,
    duration?: number,
  ) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined,
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const router = useRouter();

  const removeToast = useCallback((id: string) => {
    if (timeoutRefs.current[id]) {
      clearTimeout(timeoutRefs.current[id]);
      delete timeoutRefs.current[id];
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration: number = 4000) => {
      const id = `${Date.now()}-${Math.random()}`;
      const toast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        timeoutRefs.current[id] = setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  const showAppointmentToast = useCallback(
    (
      message: string,
      appointmentType: "red" | "yellow" | "green",
      appointmentPath: string,
      duration: number = 8000, // Longer duration for appointment toasts
    ) => {
      const id = `appointment-${Date.now()}-${Math.random()}`;

      const handleClick = () => {
        router.push(appointmentPath);
        removeToast(id);
      };

      const toast: Toast = {
        id,
        message,
        type: "appointment",
        duration,
        clickable: true,
        onClick: handleClick,
        appointmentType,
      };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        timeoutRefs.current[id] = setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast, router],
  );

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, showAppointmentToast, removeToast }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  const getToastStyles = (
    type: ToastType,
    appointmentType?: "red" | "yellow" | "green",
  ) => {
    if (type === "appointment" && appointmentType) {
      switch (appointmentType) {
        case "red":
          return {
            bg: "bg-red-50",
            border: "border-red-300",
            text: "text-red-900",
            icon: "text-red-600",
            hover: "hover:bg-red-100",
          };
        case "yellow":
          return {
            bg: "bg-yellow-50",
            border: "border-yellow-300",
            text: "text-yellow-900",
            icon: "text-yellow-600",
            hover: "hover:bg-yellow-100",
          };
        case "green":
          return {
            bg: "bg-green-50",
            border: "border-green-300",
            text: "text-green-900",
            icon: "text-green-600",
            hover: "hover:bg-green-100",
          };
      }
    }

    switch (type) {
      case "error":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-800",
          icon: "text-red-600",
          hover: "",
        };
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-800",
          icon: "text-green-600",
          hover: "",
        };
      case "warning":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-800",
          icon: "text-yellow-600",
          hover: "",
        };
      default:
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-800",
          icon: "text-blue-600",
          hover: "",
        };
    }
  };

  const getIcon = (type: ToastType) => {
    if (type === "appointment") {
      return <Calendar className="w-5 h-5" />;
    }

    switch (type) {
      case "error":
        return <AlertCircle className="w-5 h-5" />;
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "warning":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type, toast.appointmentType);
          const isClickable = toast.clickable && toast.onClick;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20, x: 20 }}
              className={`
                ${styles.bg} ${styles.border} ${styles.text} 
                px-4 py-3 rounded-lg border-2 mb-3 shadow-lg 
                flex items-center gap-3 pointer-events-auto max-w-sm
                ${isClickable ? `cursor-pointer ${styles.hover} transition-all duration-200` : ""}
              `}
              onClick={isClickable ? toast.onClick : undefined}
              whileHover={isClickable ? { scale: 1.02 } : undefined}
              whileTap={isClickable ? { scale: 0.98 } : undefined}
            >
              {/* Icon with pulsing animation for appointment toasts */}
              <div className={`${styles.icon} relative flex-shrink-0`}>
                {getIcon(toast.type)}
                {toast.type === "appointment" && (
                  <motion.div
                    className={`absolute inset-0 rounded-full ${
                      toast.appointmentType === "red"
                        ? "bg-red-400"
                        : toast.appointmentType === "yellow"
                          ? "bg-yellow-400"
                          : "bg-green-400"
                    }`}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </div>

              <div className="flex-1">
                <span className="text-sm font-semibold block">
                  {toast.message}
                </span>
                {isClickable && (
                  <span className="text-xs opacity-75 mt-0.5 block">
                    Click to view appointments →
                  </span>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(toast.id);
                }}
                className="ml-2 text-current hover:opacity-70 transition-opacity flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
