"use client";

import { useNotificationsStore } from "@/store";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles = {
  success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200",
  error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200",
  info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200",
};

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotificationsStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => {
          const Icon = icons[notification.type];
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-4 shadow-lg",
                styles[notification.type]
              )}
            >
              <Icon className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{notification.title}</p>
                {notification.message && (
                  <p className="text-sm opacity-80 mt-1">{notification.message}</p>
                )}
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="shrink-0 rounded-md p-1 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
