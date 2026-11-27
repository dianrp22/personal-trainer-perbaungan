"use client";

import { useEffect, type RefObject } from "react";
import { onIntroDone } from "@/lib/motion";

const sleep = (ms: number, signal: { off: boolean }) =>
  new Promise<void>((res) => setTimeout(() => !signal.off && res(), ms));

/**
 * Percakapan bergantian: kalimat tiap anggota diketik huruf per huruf ke balon katanya.
 * `onTalk(i, on)` dipanggil saat anggota ke-i mulai/selesai "bicara".
 */
export function useTalkLoop(
  lines: string[][],
  bubbles: RefObject<(HTMLElement | null)[]>,
  texts: RefObject<(HTMLElement | null)[]>,
  onTalk?: (i: number, on: boolean) => void
) {
  useEffect(() => {
    const signal = { off: false };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const queue: [number, string][] = [];
    const max = Math.max(0, ...lines.map((l) => l.length));
    for (let k = 0; k < max; k++) lines.forEach((l, i) => l[k] && queue.push([i, l[k]]));
    const show = (i: number, on: boolean) => bubbles.current?.[i]?.classList.toggle("is-on", on);

    const run = async () => {
      if (!queue.length) return;
      if (reduced) {
        lines.forEach((l, i) => {
          const out = texts.current?.[i];
          if (out) out.textContent = l[0] ?? "";
          show(i, true);
        });
        return;
      }
      await sleep(900, signal);
      for (let n = 0; !signal.off; n = (n + 1) % queue.length) {
        const [i, line] = queue[n]!;
        const out = texts.current?.[i];
        if (!out) return;
        out.textContent = "";
        show(i, true);
        onTalk?.(i, true);
        for (let c = 1; c <= line.length && !signal.off; c++) {
          out.textContent = line.slice(0, c);
          await sleep(line[c - 1] === " " ? 30 : 42, signal);
        }
        onTalk?.(i, false);
        await sleep(2000, signal);
        show(i, false);
        await sleep(650, signal);
      }
    };
    const cancel = onIntroDone(() => void run());
    return () => {
      signal.off = true;
      cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines]);
}
