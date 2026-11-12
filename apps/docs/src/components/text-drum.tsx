import { useEffect, useState, type CSSProperties } from "react";

export interface ScrollWheelProps {
  /** The sequence of phrases, in the exact order they should cycle. */
  phrases: string[];
  /** ms each phrase stays before advancing */
  interval?: number;
  /** row height in px */
  itemHeight?: number;
  /** number of rows visible at once (use an odd number so one is centered) */
  visibleCount?: number;
  /** which phrase index sits in the center on mount */
  startIndex?: number;
  /** scroll direction */
  direction?: "up" | "down";
  color?: string;
  style?: CSSProperties;
}

export function ScrollWheel({
  phrases,
  interval = 2000,
  itemHeight = 44,
  visibleCount = 5,
  startIndex = 0,
  direction = "up",
  color = "#5c5c5c",
  style,
}: ScrollWheelProps) {
  const n = phrases.length;
  const [i, setI] = useState(startIndex);
  const [animate, setAnimate] = useState(true);

  // advance on a timer
  useEffect(() => {
    const step = direction === "up" ? 1 : -1;
    const id = setInterval(() => setI((v) => v + step), interval);
    return () => clearInterval(id);
  }, [interval, direction]);

  // seamless wrap: snap by ±n (no animation) once a full cycle completes
  useEffect(() => {
    if (i >= n || i < 0) {
      const t = setTimeout(() => {
        setAnimate(false);
        setI((v) => (v >= n ? v - n : v + n));
      }, 600); // must exceed the transform transition duration
      return () => clearTimeout(t);
    }
    if (!animate) {
      const r = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(r);
    }
  }, [i, n, animate]);

  // three copies give headroom above and below for the loop
  const copies = [...phrases, ...phrases, ...phrases];
  const base = n; // center copy
  const active = base + i;

  const viewport = itemHeight * visibleCount;
  const centerY = (viewport - itemHeight) / 2;
  const translateY = -(active * itemHeight) + centerY;
  const half = Math.floor(visibleCount / 2);

  return (
    <div
      style={{
        height: viewport,
        overflow: "hidden",
        position: "relative",
        // fades the top and bottom rows out, matching the image
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, #000 25%, #000 75%, transparent)",
        maskImage:
          "linear-gradient(to bottom, transparent, #000 25%, #000 75%, transparent)",
        ...style,
      }}
    >
      <div
        style={{
          transform: `translateY(${translateY}px)`,
          transition: animate ? "transform 500ms cubic-bezier(.22,.61,.36,1)" : "none",
        }}
      >
        {copies.map((phrase, idx) => {
          const dist = Math.abs(idx - active);
          const opacity = Math.max(0, 1 - dist / (half + 1));
          return (
            <div
              key={idx}
              style={{
                height: itemHeight,
                lineHeight: `${itemHeight}px`,
                color,
                opacity,
                transition: "opacity 500ms ease",
                whiteSpace: "nowrap",
              }}
            >
              {phrase}
            </div>
          );
        })}
      </div>
    </div>
  );
}


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

export function MultiplexerHeadline() {
  return (
    <div
      style={{
        background: "#000",
        color: "#c9c9c9",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "0 8vw",
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 34,
        fontWeight: 500,
        letterSpacing: "-0.02em",
      }}
    >
      <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
        <span>We are building the multiplexer for&nbsp;</span>
        <span style={{ color: "#c98a5e" }}>all work.</span>

        {/* wheel overlaps to the right, behind the orange text */}
        <div
          style={{
            position: "absolute",
            left: "100%",
            marginLeft: "-3.5em", // pull it back so it tucks behind "all work."
            zIndex: -1,
          }}
        >
          <ScrollWheel
            phrases={PHRASES}
            startIndex={4}      // "production applications." centered on mount
            interval={1800}
            itemHeight={46}
            visibleCount={7}
            color="#4a4a4a"
          />
        </div>
      </div>
    </div>
  );
}
