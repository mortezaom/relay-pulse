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
};

export const PulseCardContent = ({ arrayOfLines }: PCardContentProps) => {
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
			<div className="flex sm:flex-row flex-col items-stretch gap-0.5 h-16 sm:h-8">
				<ul className="flex items-stretch gap-0.5 w-full h-8">
					{lines.slice(0, 25).map((item, i) => (
						<li
							key={`l-${i}`}
							onMouseEnter={() =>
								handleMouseEnter(item.message)
							}
							onMouseLeave={handleMouseLeave}
							className="bg-green-500 hover:opacity-80 rounded-sm w-full transition-opacity cursor-pointer"
						/>
					))}
				</ul>
				<ul className="flex items-stretch gap-0.5 w-full h-8">
					{lines.slice(25).map((item, i) => (
						<li
							key={`l-${i}-25`}
							onMouseEnter={() =>
								handleMouseEnter(item.message)
							}
							onMouseLeave={handleMouseLeave}
							className="bg-green-500 hover:opacity-80 rounded-sm w-full transition-opacity cursor-pointer"
						/>
					))}
				</ul>
			</div>
			<div className="flex justify-between items-center mt-2 min-h-[1.5em] font-bold text-muted-foreground text-xs">
				<AnimatePresence mode="wait">
					{message ? (
						<motion.div
							key="message"
							initial={{ opacity: 0, y: 3 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -3 }}
							transition={{ duration: 0.15 }}
							className="flex justify-between items-center w-full text-green-500"
						>
							<span>{message}</span>
						</motion.div>
					) : (
						<motion.div
							key="default"
							initial={{ opacity: 0, y: 3 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -3 }}
							transition={{ duration: 0.15 }}
							className="flex justify-between items-center w-full"
						>
							<span>Operational</span>
							<span>Uptime 99%</span>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</CardContent>
	);
};

export const PulseLineCardContent = ({
	arrayOfLines,
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
			<div className="flex sm:flex-row flex-col items-stretch gap-0.5 h-16 sm:h-8">
				<ul className="flex items-stretch gap-0.5 w-full h-8">
					{lines.slice(0, 25).map((item, i) => (
						<li
							key={`l-${i}`}
							onMouseEnter={() =>
								handleMouseEnter(item.message)
							}
							onMouseLeave={handleMouseLeave}
							className="bg-green-500 hover:opacity-80 rounded-sm w-full transition-opacity cursor-pointer"
						/>
					))}
				</ul>
				<ul className="flex items-stretch gap-0.5 w-full h-8">
					{lines.slice(25).map((item, i) => (
						<li
							key={`l-${i}-25`}
							onMouseEnter={() =>
								handleMouseEnter(item.message)
							}
							onMouseLeave={handleMouseLeave}
							className="bg-green-500 hover:opacity-80 rounded-sm w-full transition-opacity cursor-pointer"
						/>
					))}
				</ul>
			</div>
			<div className="flex justify-between items-center mt-2 min-h-[1.5em] font-bold text-muted-foreground text-xs">
				<AnimatePresence mode="wait">
					{message ? (
						<motion.div
							key="message"
							initial={{ opacity: 0, y: 3 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -3 }}
							transition={{ duration: 0.15 }}
							className="flex justify-between items-center w-full text-green-500"
						>
							<span>{message}</span>
						</motion.div>
					) : (
						<motion.div
							key="default"
							initial={{ opacity: 0, y: 3 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -3 }}
							transition={{ duration: 0.15 }}
							className="flex justify-between items-center w-full"
						>
							<span />
							<span>Uptime 99%</span>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</CardContent>
	);
};
