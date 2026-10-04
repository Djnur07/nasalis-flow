"use client";

import { useEffect, useState } from "react";

const CHARS = "0123456789abcdef";
const INITIAL_HASH = "00000000";

function randomHex(length: number) {
  return Array.from({ length }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");
}

/** A small, live-scrambling hex string — a decorative nod to the hash that seeds every Nasalis Flow portrait. */
export function LiveSeed() {
  const [hash, setHash] = useState(INITIAL_HASH);

  useEffect(() => {
    setHash(randomHex(8));
    const id = setInterval(() => {
      setHash((prev) => {
        const chars = prev.split("");
        for (let i = 0; i < 2; i++) {
          chars[Math.floor(Math.random() * chars.length)] = CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        return chars.join("");
      });
    }, 450);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono text-[11px] tracking-[0.08em] text-ink/40">
      seed → 0x{hash}
    </span>
  );
}
