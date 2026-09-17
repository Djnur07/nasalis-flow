const PALETTE = ["#c9b48a", "#74b8ae", "#4f7080", "#b98f57", "#f7f2e7"];

type GenerativePortraitProps = {
  /** Deterministic seed so the same id always renders the same placeholder. */
  seed?: number;
  label?: string;
  className?: string;
  /** 0–1, echoes the collection's nose-size rarity trait in the placeholder art. */
  noseSize?: number;
  /** Marks the artwork as purely decorative for assistive tech. */
  decorative?: boolean;
};

function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A tasteful, code-generated stand-in for the real artwork: flowing noise-field
 * lines around a central "nose" motif, sized by `noseSize` to echo the
 * collection's core rarity trait. Not part of the actual NFT art.
 */
export function GenerativePortrait({
  seed = 1,
  label = "Generative placeholder portrait",
  className = "",
  noseSize,
  decorative = false,
}: GenerativePortraitProps) {
  const random = mulberry32(seed * 9973 + 17);
  const size = noseSize ?? random();

  const lines = Array.from({ length: 16 }, (_, i) => {
    const y0 = 30 + random() * 340;
    const y1 = 30 + random() * 340;
    const cx1 = 40 + random() * 100;
    const cx2 = 260 + random() * 100;
    return {
      key: i,
      d: `M -20 ${y0} C ${cx1} ${y0 - 40 + random() * 80}, ${cx2} ${y1 - 40 + random() * 80}, 420 ${y1}`,
      color: PALETTE[Math.floor(random() * PALETTE.length)],
      width: 1 + random() * 1.8,
      opacity: 0.16 + random() * 0.46,
    };
  });

  const noseRx = 24 + size * 48;
  const noseRy = noseRx * 1.15;

  const accessibleProps = decorative
    ? { "aria-hidden": true as const }
    : { role: "img" as const, "aria-label": label };

  return (
    <svg
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      {...accessibleProps}
    >
      {!decorative && <title>{label}</title>}
      <rect width="400" height="400" fill="#211d17" />
      {lines.map((line) => (
        <path
          key={line.key}
          d={line.d}
          stroke={line.color}
          strokeWidth={line.width}
          strokeLinecap="round"
          fill="none"
          opacity={line.opacity}
        />
      ))}
      <ellipse
        cx="200"
        cy="220"
        rx={noseRx}
        ry={noseRy}
        fill="#b98f57"
        opacity="0.14"
        stroke="#b98f57"
        strokeWidth="1.2"
      />
    </svg>
  );
}
