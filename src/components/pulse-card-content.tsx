/** biome-ignore-all lint/suspicious/noArrayIndexKey: not-needed */
/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: not-needed */
"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { CardContent } from "@/components/ui/card";

export type LineData = {
  value: number;
  message?: string;
};

type PCardContentProps = {
  arrayOfLines?: LineData[];
  status?: "up" | "down" | "timeout" | "error";
  uptime?: number;
  responseTime?: number;
};

export const PulseCardContent = ({
  arrayOfLines,
  status,
  uptime,
}: PCardContentProps) => {
  const defaultLines = Array.from({ length: 50 }).map((_, i) => ({
    value: 100,
    message: `Line ${i + 1}`,
  }));

  const lines = arrayOfLines || defaultLines;
  const [message, setMessage] = useState<string | undefined>();
  const closeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleMouseEnter = (msg?: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = undefined;
    }
    setMessage(msg);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setMessage(undefined);
      closeTimeoutRef.current = undefined;
    }, 150);
  };

  return (
    <CardContent className="relative">
      <div className="flex h-16 flex-col items-stretch gap-0.5 sm:h-8 sm:flex-row">
        <ul className="flex h-8 w-full items-stretch gap-0.5">
          {lines.slice(0, 25).map((item, i) => (
            <li
              className="w-full cursor-pointer rounded-sm bg-primary transition-opacity hover:opacity-80"
              key={`l-${i}`}
              onMouseEnter={() => handleMouseEnter(item.message)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        </ul>
        <ul className="flex h-8 w-full items-stretch gap-0.5">
          {lines.slice(25).map((item, i) => (
            <li
              className="w-full cursor-pointer rounded-sm bg-primary transition-opacity hover:opacity-80"
              key={`l-${i}-25`}
              onMouseEnter={() => handleMouseEnter(item.message)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        </ul>
      </div>
      <div className="mt-2 flex min-h-[1.5em] items-center justify-between font-bold text-muted-foreground text-xs">
        <AnimatePresence mode="wait">
          {message ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full items-center justify-between text-primary"
              exit={{ opacity: 0, y: -3 }}
              initial={{ opacity: 0, y: 3 }}
              key="message"
              transition={{ duration: 0.15 }}
            >
              <span>{message}</span>
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full items-center justify-between"
              exit={{ opacity: 0, y: -3 }}
              initial={{ opacity: 0, y: 3 }}
              key="default"
              transition={{ duration: 0.15 }}
            >
              <span>
                {status === "up" ? "Operational" : status || "Unknown"}
              </span>
              <span>
                Uptime {uptime !== undefined ? `${uptime.toFixed(1)}%` : "N/A"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CardContent>
  );
};

export const PulseLineCardContent = ({
  arrayOfLines,
  // status,
  uptime,
  // responseTime,
}: PCardContentProps) => {
  const defaultLines = Array.from({ length: 50 }).map((_, i) => ({
    value: 100,
    message: `Line ${i + 1}`,
  }));

  const lines = arrayOfLines || defaultLines;
  const [message, setMessage] = useState<string | undefined>();
  const closeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleMouseEnter = (msg?: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = undefined;
    }
    setMessage(msg);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setMessage(undefined);
      closeTimeoutRef.current = undefined;
    }, 150);
  };

  return (
    <CardContent className="relative">
      <div className="flex h-16 flex-col items-stretch gap-0.5 sm:h-8 sm:flex-row">
        <ul className="flex h-8 w-full items-stretch gap-0.5">
          {lines.slice(0, 25).map((item, i) => (
            <li
              className="w-full cursor-pointer rounded-sm bg-primary transition-opacity hover:opacity-80"
              key={`l-${i}`}
              onMouseEnter={() => handleMouseEnter(item.message)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        </ul>
        <ul className="flex h-8 w-full items-stretch gap-0.5">
          {lines.slice(25).map((item, i) => (
            <li
              className="w-full cursor-pointer rounded-sm bg-primary transition-opacity hover:opacity-80"
              key={`l-${i}-25`}
              onMouseEnter={() => handleMouseEnter(item.message)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        </ul>
      </div>
      <div className="mt-2 flex min-h-[1.5em] items-center justify-between font-bold text-muted-foreground text-xs">
        <AnimatePresence mode="wait">
          {message ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full items-center justify-between text-primary"
              exit={{ opacity: 0, y: -3 }}
              initial={{ opacity: 0, y: 3 }}
              key="message"
              transition={{ duration: 0.15 }}
            >
              <span>{message}</span>
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full items-center justify-between"
              exit={{ opacity: 0, y: -3 }}
              initial={{ opacity: 0, y: 3 }}
              key="default"
              transition={{ duration: 0.15 }}
            >
              <span />
              <span>
                Uptime {uptime !== undefined ? `${uptime.toFixed(1)}%` : "N/A"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CardContent>
  );
};
