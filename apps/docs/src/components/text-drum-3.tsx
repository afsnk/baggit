"use client";

/**
 * 3D text drum built on embla-carousel (vertical axis + loop).
 *
 * Rows sit on the front of a drum: each face is tilted and pushed back by its
 * distance from the viewport's center line, so the drum foreshortens toward
 * the top and bottom edges. Each row is also nudged right along a vertical
 * half-circle whose arc passes through the left edge of the centered row, and
 * the centered row is drawn slightly larger — together the drum reads like a
 * sphere cut vertically in half. Mouse wheel, pointer drag (embla) and taps
 * all drive the drum; the centered row is the selected value.
 */
import useEmblaCarousel from "embla-carousel-react";
import {
	type CSSProperties,
	type KeyboardEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

const clamp = (v: number, lo: number, hi: number) =>
	Math.max(lo, Math.min(hi, v));

export interface ScrollWheelProps {
	/** The sequence of phrases, in the exact order they should cycle. */
	phrases: string[];
	/** Controlled selected index. */
	value?: number;
	/** Uncontrolled initial index. */
	defaultValue?: number;
	/** Fires whenever the centered row changes. */
	onChange?: (index: number) => void;
	/** Row height in px. */
	itemHeight?: number;
	/** Rows visible at once (odd numbers center one row). */
	visibleCount?: number;
	/** Max rotateX per row of distance — the drum curvature. */
	tiltDeg?: number;
	/** How far each row recedes per row of distance, as a fraction of itemHeight. */
	recede?: number;
	/** Radius (px) of the vertical half-circle rounding the drum's left edge; larger = flatter. */
	curveRadius?: number;
	/** Scale of the centered row, easing back to 1 one row away. */
	activeScale?: number;
	/** Seamless wrap-around. Needs enough rows to fill the viewport ~2x. */
	loop?: boolean;
	/** Wheel delta (px) needed to advance one row — a mouse notch is ~120. */
	wheelStep?: number;
	/** Scroll animation length in embla units (lower = snappier). */
	duration?: number;
	/** Non-centered rows. */
	color?: string;
	/** Centered row. */
	activeColor?: string;
	className?: string;
	style?: CSSProperties;
}

export function ScrollWheel({
	phrases,
	value,
	defaultValue = 0,
	onChange,
	itemHeight = 46,
	visibleCount = 9,
	tiltDeg = 20,
	recede = 0.45,
	curveRadius = 600,
	activeScale = 1.06,
	loop = true,
	wheelStep = 100,
	duration = 18,
	color = "#4a4a4a",
	activeColor = "#d8d8d8",
	className,
	style,
}: ScrollWheelProps) {
	const n = phrases.length;
	// Embla's loop needs enough slide content to cover the viewport several
	// times over, or it drops snaps at the seam; repeat the list until it does.
	const reps = Math.max(1, Math.ceil((visibleCount * 3) / Math.max(n, 1)));
	const startIndex = n > 0 ? ((defaultValue % n) + n) % n : 0;
	const [emblaRef, emblaApi] = useEmblaCarousel({
		axis: "y",
		align: "center",
		loop,
		startIndex,
		duration,
		watchDrag: true,
	});
	const [active, setActive] = useState(() => {
		const v = value ?? defaultValue;
		return n > 0 ? ((v % n) + n) % n : 0;
	});
	const faceRefs = useRef<(HTMLDivElement | null)[]>([]);
	const wheelAcc = useRef(0);
	const lastEmit = useRef(-1);
	const dragMoved = useRef(false);
	const downY = useRef(0);
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;

	/* ----------------------------- 3D drum paint ---------------------------- */

	const paint = useCallback(() => {
		const api = emblaApi;
		const view = api?.rootNode();
		if (!api || !view) return;
		const viewRect = view.getBoundingClientRect();
		const midY = viewRect.top + viewRect.height / 2;
		api.slideNodes().forEach((slide, i) => {
			const face = faceRefs.current[i];
			if (!face) return;
			const rect = slide.getBoundingClientRect();
			const d = (rect.top + rect.height / 2 - midY) / itemHeight; // row units from center
			const tilt = clamp(-d * tiltDeg, -84, 84);
			const z = -Math.min(Math.abs(d), visibleCount) * recede * itemHeight;
			// rows slide right along a vertical half-circle through the centered
			// row's left edge — the drum reads like a sphere cut vertically in half
			const dy = Math.min(Math.abs(d * itemHeight), curveRadius);
			const indent =
				curveRadius - Math.sqrt(curveRadius * curveRadius - dy * dy);
			// the centered row is drawn slightly larger, easing out over one row
			const scale = 1 + (activeScale - 1) * Math.max(0, 1 - Math.abs(d));
			face.style.transform = `translateX(${indent.toFixed(2)}px) translateZ(${z.toFixed(2)}px) rotateX(${tilt.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
		});
	}, [
		emblaApi,
		itemHeight,
		tiltDeg,
		recede,
		visibleCount,
		curveRadius,
		activeScale,
	]);

	useEffect(() => {
		if (!emblaApi) return;
		let raf = 0;
		const repaint = () => {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(paint);
		};
		paint();
		emblaApi.on("scroll", repaint);
		emblaApi.on("resize", repaint);
		emblaApi.on("reInit", repaint);
		return () => {
			cancelAnimationFrame(raf);
			emblaApi.off("scroll", repaint);
			emblaApi.off("resize", repaint);
			emblaApi.off("reInit", repaint);
		};
	}, [emblaApi, paint]);

	/* ------------------------------ value wiring ----------------------------- */

	// snap index (0..reps*n-1) → phrase index (0..n-1)
	const phraseIndexOf = useCallback(
		(snap: number) => (n > 0 ? ((snap % n) + n) % n : 0),
		[n],
	);
	// phrase index → snap index nearest the current position (shortest wrap path)
	const nearestSnap = useCallback(
		(v: number) => {
			if (!emblaApi || n === 0) return v;
			const cur = emblaApi.selectedScrollSnap();
			const k = Math.round((cur - v) / n);
			return v + k * n;
		},
		[emblaApi, n],
	);

	useEffect(() => {
		if (!emblaApi || n === 0) return;
		const onSelect = () => {
			const v = phraseIndexOf(emblaApi.selectedScrollSnap());
			setActive(v);
			if (v !== lastEmit.current) {
				lastEmit.current = v;
				onChangeRef.current?.(v);
			}
		};
		emblaApi.on("select", onSelect);
		return () => {
			emblaApi.off("select", onSelect);
		};
	}, [emblaApi, n, phraseIndexOf]);

	// keep the emit guard aligned with the engine's starting snap
	useEffect(() => {
		if (!emblaApi || n === 0) return;
		lastEmit.current = phraseIndexOf(emblaApi.selectedScrollSnap());
	}, [emblaApi, n, phraseIndexOf]);

	// controlled: follow `value`
	useEffect(() => {
		if (!emblaApi || n === 0 || value == null) return;
		const target = nearestSnap(((value % n) + n) % n);
		if (emblaApi.selectedScrollSnap() !== target) emblaApi.scrollTo(target);
	}, [emblaApi, value, n, nearestSnap]);

	/* --------------------------------- wheel --------------------------------- */

	useEffect(() => {
		const view = emblaApi?.rootNode();
		if (!view || !emblaApi || n === 0) return;
		const scrollBySteps = (steps: number) => {
			for (let s = 0; s < Math.abs(steps); s++) {
				if (steps > 0) emblaApi.scrollNext();
				else emblaApi.scrollPrev();
			}
		};
		const onWheel = (e: WheelEvent) => {
			e.preventDefault();
			const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
			if (Math.abs(dy) >= wheelStep / 2) {
				// discrete notches (mouse wheel): one notch = one row, no drift
				scrollBySteps(Math.round(dy / wheelStep));
				wheelAcc.current = 0;
			} else {
				// continuous deltas (trackpad): accumulate, keep the remainder
				wheelAcc.current += dy;
				const steps = Math.trunc(wheelAcc.current / wheelStep);
				if (steps !== 0) {
					scrollBySteps(steps);
					wheelAcc.current -= steps * wheelStep;
				}
			}
		};
		view.addEventListener("wheel", onWheel, { passive: false });
		return () => view.removeEventListener("wheel", onWheel);
	}, [emblaApi, wheelStep, n]);

	/* --------------------- tap-to-select vs drag disambiguation --------------- */

	useEffect(() => {
		const view = emblaApi?.rootNode();
		if (!view) return;
		const onPointerDown = (e: PointerEvent) => {
			downY.current = e.clientY;
			dragMoved.current = false;
			// a drag must never select the phrase text
			view.style.userSelect = "none";
			view.style.webkitUserSelect = "none";
		};
		const release = () => {
			view.style.userSelect = "";
			view.style.webkitUserSelect = "";
		};
		const onPointerMove = (e: PointerEvent) => {
			if (Math.abs(e.clientY - downY.current) > 8) dragMoved.current = true;
		};
		// a drag release must not double as a tap selection
		const onClickCapture = (e: MouseEvent) => {
			if (dragMoved.current) {
				e.preventDefault();
				e.stopPropagation();
				dragMoved.current = false;
			}
		};
		view.addEventListener("pointerdown", onPointerDown, true);
		view.addEventListener("pointermove", onPointerMove, true);
		view.addEventListener("click", onClickCapture, true);
		window.addEventListener("pointerup", release);
		window.addEventListener("pointercancel", release);
		return () => {
			release();
			view.removeEventListener("pointerdown", onPointerDown, true);
			view.removeEventListener("pointermove", onPointerMove, true);
			view.removeEventListener("click", onClickCapture, true);
			window.removeEventListener("pointerup", release);
			window.removeEventListener("pointercancel", release);
		};
	}, [emblaApi]);

	/* -------------------------------- keyboard ------------------------------- */

	const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if (!emblaApi || n === 0) return;
		if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
			e.preventDefault();
			emblaApi.scrollPrev();
		} else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
			e.preventDefault();
			emblaApi.scrollNext();
		}
	};

	/* --------------------------------- render -------------------------------- */

	const mask =
		"linear-gradient(to bottom, transparent, #000 28%, #000 72%, transparent)";

	return (
		<div
			ref={emblaRef}
			className={className}
			style={{
				height: itemHeight * visibleCount,
				overflow: "hidden",
				perspective: 1100,
				touchAction: "pan-x", // vertical gestures belong to the drum
				cursor: "grab",
				WebkitMaskImage: mask,
				maskImage: mask,
				...style,
			}}
			tabIndex={0}
			role="listbox"
			aria-label="Phrase selector"
			onKeyDown={onKeyDown}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					transformStyle: "preserve-3d",
					height: "100%",
				}}
			>
				{Array.from({ length: reps * n }, (_, i) => {
					const phrase = phrases[i % n];
					return (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: repeated list, order is static
							key={`${phrase}-${i}`}
							style={{
								flex: `0 0 ${itemHeight}px`,
								minWidth: 0,
								height: itemHeight,
								transformStyle: "preserve-3d",
							}}
							role="option"
							aria-selected={active === phraseIndexOf(i)}
							tabIndex={-1}
							onClick={() => {
								if (!dragMoved.current) emblaApi?.scrollTo(nearestSnap(i % n));
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									emblaApi?.scrollTo(nearestSnap(i % n));
								}
							}}
						>
							<div
								ref={(el) => {
									faceRefs.current[i] = el;
								}}
								style={{
									width: "100%",
									height: itemHeight,
									lineHeight: `${itemHeight}px`,
									fontSize: Math.round(itemHeight * 0.72),
									fontWeight: 500,
									letterSpacing: "-0.03em",
									whiteSpace: "nowrap",
									textAlign: "left",
									// rows pivot around the left rim, arcing like the edge of a
									// horizontal drum as it turns
									transformOrigin: "left center",
									willChange: "transform",
									color: active === phraseIndexOf(i) ? activeColor : color,
									transition: "color 200ms ease",
								}}
							>
								{phrase}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/*                                   demo                                     */
/* -------------------------------------------------------------------------- */

export const PHRASES = [
	"local development.",
	"remote access.",
	"coding agents.",
	"background jobs.",
	"production applications.",
	"sandboxes.",
	"shared terminals.",
	"incident response.",
	"humans and machines.",
	"operational history.",
];

/**
 * The drum acting as a value selector: the centered phrase auto-completes
 * the headline, mirroring the superlogical.com layout.
 */
export function MultiplexerHeadline() {
	const [value, setValue] = useState(4);

	return (
		<div className="max-h-fit h-auto border border-red-400 relative">
			<h1
				style={{
					margin: 0,
					fontSize: "clamp(12px, 3.2vw, 32px)",
					fontWeight: 500,
					letterSpacing: "-0.02em",
					color: "#e6e6e6",
					maxWidth: "28ch",
					lineHeight: 1.35,
				}}
				className="absolute top-1/2 -translate-y-1/2 inset-bs-1/2 -left-3/2 bg-black px-3 shadow-2xl"
			>
				We are building the multiplexer for{" "}
				<span style={{ color: "#e8956a" }}>{PHRASES[value]}</span>
			</h1>
			<ScrollWheel
				phrases={PHRASES}
				value={value}
				onChange={setValue}
				itemHeight={35}
				visibleCount={7}
				style={{ width: 420 }}
				className="border border-green-500 p-8"
			/>
		</div>
	);
}
