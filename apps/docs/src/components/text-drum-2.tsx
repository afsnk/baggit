import {
  useEffect, useRef, useState, type CSSProperties, type PointerEvent,
} from "react";

export interface ScrollWheelProps {
  phrases: string[];
  value?: number;                 // controlled selected index
  defaultValue?: number;
  onChange?: (index: number) => void;
  itemHeight?: number;
  visibleCount?: number;          // viewport height in rows
  color?: string;                 // non-selected rows
  activeColor?: string;           // centered row
  style?: CSSProperties;
}

export function ScrollWheel({
  phrases, value, defaultValue = 0, onChange,
  itemHeight = 46, visibleCount = 7,
  color = "#4a4a4a", activeColor = "#e6e6e6", style,
}: ScrollWheelProps) {
  const n = phrases.length;
  const itemAngle = 360 / n;                                   // full cylinder → seamless loop
  const R = itemHeight / 2 / Math.tan((itemAngle / 2) * Math.PI / 180);

  const isControlled = value != null;
  const [internal, setInternal] = useState(defaultValue);
  const selected = isControlled ? (value as number) : internal;

  const [pos, setPos] = useState(defaultValue);               // continuous position (float)
  const dragging = useRef(false);
  const startY = useRef(0);
  const startPos = useRef(0);
  const lastT = useRef(0);
  const velocity = useRef(0);                                  // index units / ms
  const lastEmit = useRef(defaultValue);

  // keep pos in sync with external value, choosing the nearest equivalent (no full spins)
  useEffect(() => {
    if (dragging.current) return;
    setPos((p) => selected + Math.round((p - selected) / n) * n);
  }, [selected, n]);

  const emit = (p: number) => {
    const norm = ((Math.round(p) % n) + n) % n;
    if (norm !== lastEmit.current) {
      lastEmit.current = norm;
      if (!isControlled) setInternal(norm);
      onChange?.(norm);
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    dragging.current = true;
    startY.current = e.clientY;
    startPos.current = pos;
    lastT.current = performance.now();
    velocity.current = 0;
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging.current) return;
    const now = performance.now();
    const dy = e.clientY - startY.current;
    const next = startPos.current - dy / itemHeight;          // drag down → previous words roll in
    const dt = now - lastT.current;
    if (dt > 0) velocity.current = (next - pos) / dt;
    lastT.current = now;
    setPos(next);
    emit(next);                                               // live selection update
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const throwBy = Math.max(-n, Math.min(n, velocity.current * 140)); // clamp the flick
    const snapped = Math.round(pos + throwBy);
    setPos(snapped);
    emit(snapped);
    velocity.current = 0;
  };

  const rotate = pos * itemAngle;

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{
        height: itemHeight * visibleCount,
        perspective: 1100,
        position: "relative",
        overflow: "hidden",
        cursor: "grab",
        touchAction: "none",                                  // let us own vertical drags
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, #000 22%, #000 78%, transparent)",
        maskImage:
          "linear-gradient(to bottom, transparent, #000 22%, #000 78%, transparent)",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: 0,
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotate}deg)`,
          transition: dragging.current
            ? "none"
            : "transform 420ms cubic-bezier(.22,.61,.36,1)",
        }}
      >
        {phrases.map((phrase, i) => {
          const a = (pos - i) * itemAngle;                    // net angle from front
          const rel = (((a + 180) % 360) + 360) % 360 - 180;  // normalize to [-180,180]
          const hidden = Math.abs(rel) > 92;
          const opacity = hidden ? 0 : Math.pow(Math.cos((rel * Math.PI) / 180), 1.1);
          const isActive = (((Math.round(pos) % n) + n) % n) === i;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                height: itemHeight,
                marginTop: -itemHeight / 2,
                lineHeight: `${itemHeight}px`,
                textAlign: "center",
                whiteSpace: "nowrap",
                transform: `rotateX(${-i * itemAngle}deg) translateZ(${R}px)`,
                backfaceVisibility: "hidden",
                opacity,
                color: isActive ? activeColor : color,
                transition: "color 200ms ease, opacity 200ms ease",
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


const PHRASES = [
  "local development.", "remote access.", "coding agents.",
  "background jobs.", "production applications.", "sandboxes.",
  "shared terminals.", "incident response.",
  "humans and machines.", "operational history.",
];

// each editable slot holds the wheel index it currently displays
type SlotId = "target" | "domain";

export function EditableHeadline() {
  const [values, setValues] = useState<Record<SlotId, number>>({ target: 4, domain: 0 });
  const [active, setActive] = useState<SlotId>("target");

  const Slot = ({ id }: { id: SlotId }) => (
    <span
      onClick={() => setActive(id)}
      style={{
        cursor: "pointer",
        color: active === id ? "#c98a5e" : "#c9c9c9",
        textDecoration: active === id ? "none" : "underline",
        textDecorationColor: "#3a3a3a",
        textUnderlineOffset: 6,
        transition: "color 200ms ease",
      }}
    >
      {PHRASES[values[id]]}
    </span>
  );

  return (
    <div
      style={{
        background: "#000",
        minHeight: "100vh",
        color: "#c9c9c9",
        display: "flex",
        alignItems: "center",
        gap: "6vw",
        padding: "0 8vw",
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 32,
        fontWeight: 500,
        letterSpacing: "-0.02em",
      }}
    >
      <div style={{ maxWidth: "22ch", lineHeight: 1.4 }}>
        We are building the multiplexer for <Slot id="target" />
        <br />
        starting with <Slot id="domain" />
      </div>

      <ScrollWheel
        phrases={PHRASES}
        value={values[active]}                             // drum reflects the active slot
        onChange={(i) => setValues((v) => ({ ...v, [active]: i }))} // edits only the active slot
        itemHeight={46}
        visibleCount={7}
      />
    </div>
  );
}
