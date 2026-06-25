'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { useRef, useEffect, useCallback } from 'react';

type WWavePathProps = React.ComponentProps<'div'>;

export function WavePath({ className, ...props }: WWavePathProps) {
	const path = useRef<SVGPathElement>(null);
	// Mutable animation state lives on a ref so render stays pure.
	const anim = useRef({ progress: 0, x: 0.2, time: Math.PI / 2, reqId: null as number | null });

	const setPath = useCallback((progress: number) => {
		const width = window.innerWidth * 0.7;
		if (path.current) {
			path.current.setAttributeNS(
				null,
				'd',
				`M0 100 Q${width * anim.current.x} ${100 + progress * 0.6}, ${width} 100`,
			);
		}
	}, []);

	useEffect(() => {
		setPath(0);
	}, [setPath]);

	const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;

	const resetAnimation = () => {
		anim.current.time = Math.PI / 2;
		anim.current.progress = 0;
	};

	const manageMouseEnter = () => {
		if (anim.current.reqId) {
			cancelAnimationFrame(anim.current.reqId);
			resetAnimation();
		}
	};

	const manageMouseMove = (e: React.MouseEvent) => {
		const { movementY, clientX } = e;
		if (path.current) {
			const pathBound = path.current.getBoundingClientRect();
			anim.current.x = (clientX - pathBound.left) / pathBound.width;
			anim.current.progress += movementY;
			setPath(anim.current.progress);
		}
	};

	const animateOut = () => {
		const newProgress = anim.current.progress * Math.sin(anim.current.time);
		anim.current.progress = lerp(anim.current.progress, 0, 0.025);
		anim.current.time += 0.2;
		setPath(newProgress);
		if (Math.abs(anim.current.progress) > 0.75) {
			anim.current.reqId = requestAnimationFrame(animateOut);
		} else {
			resetAnimation();
		}
	};

	const manageMouseLeave = () => {
		animateOut();
	};

	return (
		<div className={cn('relative h-px w-[70vw]', className)} {...props}>
			<div
				onMouseEnter={manageMouseEnter}
				onMouseMove={manageMouseMove}
				onMouseLeave={manageMouseLeave}
				className="relative -top-5 z-10 h-10 w-full hover:-top-37.5 hover:h-75"
			/>
			<svg className="absolute -top-25 h-75 w-full">
				<path ref={path} className="fill-none stroke-current" strokeWidth={2} />
			</svg>
		</div>
	);
}

export default function WaveDivider() {
	return (
		<div
			aria-hidden="true"
			className="relative w-full flex justify-center bg-canvas-base text-primary-border/40 overflow-hidden py-10"
		>
			<WavePath />
		</div>
	);
}
