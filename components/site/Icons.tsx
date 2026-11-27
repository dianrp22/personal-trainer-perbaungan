export function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" className="icon">
      <path
        d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="10" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function ArrowIcon({ dir = "right" }: { dir?: "right" | "down" | "up" | "left" }) {
  const rot = { right: 0, down: 90, left: 180, up: -90 }[dir];
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="icon" style={{ transform: `rotate(${rot}deg)` }}>
      <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}
