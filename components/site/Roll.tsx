/** Teks yang "berguling" ke atas saat parent di-hover (lihat .roll di globals.css). */
export function Roll({ text }: { text: string }) {
  return (
    <span className="roll">
      <span className="roll-in" data-text={text}>
        {text}
      </span>
    </span>
  );
}
