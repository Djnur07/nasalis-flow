"use client";

import { Fragment, useEffect, useId, useRef, useState } from "react";
import { createEngine, generateHash, type Features } from "@/lib/liveRenderer";
import { SOCIAL } from "@/lib/master-data";

type LiveRendererProps = {
  /** Hash to render on mount. Omit to start from a freshly generated one. */
  initialHash?: string;
  /** Backing canvas resolution in pixels; scales down to fit its container. */
  size?: number;
  /** Shows the Randomize / manual-hash / traits panel alongside the canvas. */
  showControls?: boolean;
  className?: string;
};

const TRAIT_ROWS: [label: string, get: (f: Features) => string][] = [
  ["Palette", (f) => f.palet.key],
  ["Flow Style", (f) => f.alur.key],
  ["Density", (f) => f.kepadatan.key],
  ["Nose Class", (f) => f.nose],
  ["Background", (f) => f.latar],
];

/**
 * Reusable client-side port of reference/nasalis-flow-live.html: an animated
 * canvas whose artwork and traits are fully determined by a hash, via the
 * same hash → PRNG → traits → artwork pipeline as the original file.
 */
export function LiveRenderer({ initialHash, size = 900, showControls = true, className = "" }: LiveRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Only ever set by the Randomize/Apply-hash handlers below — null means
  // "no explicit request yet, generate one on mount" (client-only, so it
  // never has to run during server rendering).
  const [requestedHash, setRequestedHash] = useState<string | null>(initialHash ?? null);
  // Bumped on every explicit Randomize/Apply-hash click so the render effect
  // below always reruns, even when the requested hash is unchanged from the
  // one already on screen (React would otherwise bail out of the state
  // update, since setState with an equal string is a no-op).
  const [renderNonce, setRenderNonce] = useState(0);
  const [features, setFeatures] = useState<Features | null>(null);
  // The hash actually on screen right now — resynced after every render, but
  // independent of the input field below so typing doesn't affect it.
  const [renderedHash, setRenderedHash] = useState(initialHash ?? "");
  const [hashInput, setHashInput] = useState(initialHash ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputId = useId();
  const errorId = useId();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const activeHash = requestedHash ?? generateHash();
    const engine = createEngine(canvas, activeHash, { size });
    setFeatures(engine.features);
    setRenderedHash(activeHash);
    setHashInput(activeHash);
    return () => engine.stop();
  }, [requestedHash, renderNonce, size]);

  // Auto-dismiss the "Copied" acknowledgment — a timer-driven external sync,
  // not a mirror of `copied` back into itself.
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  function handleRandomize() {
    setValidationError(null);
    setRequestedHash(generateHash());
    setRenderNonce((n) => n + 1);
  }

  function handleSubmitHash(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = hashInput.trim();
    if (trimmed.length === 0) {
      setValidationError("Enter a hash to render.");
      return;
    }
    if (trimmed.length <= 10) {
      setValidationError("Hash is too short — paste the full hash.");
      return;
    }
    setValidationError(null);
    setRequestedHash(trimmed);
    setRenderNonce((n) => n + 1);
  }

  async function handleCopy() {
    if (!renderedHash) return;
    try {
      await navigator.clipboard.writeText(renderedHash);
      setCopied(true);
    } catch {
      // Clipboard access can be denied/unavailable — fail silently, the hash
      // text remains selectable by hand as a fallback.
    }
  }

  return (
    <div className={`flex flex-col gap-6 sm:flex-row sm:items-start ${className}`}>
      {/* Presentation-only frame: a distinct border + lift shadow so the canvas reads as
          a clear, separated object regardless of page background, plus a subtle ring right
          at the canvas edge so the boundary stays crisp even when a dark palette's own
          background is nearly the same color as the frame padding. Purely CSS — never
          touches the canvas's drawn pixels. Capped max-width keeps it from stretching to
          an unreasonable size on wide desktop viewports while staying fluid below that. */}
      <div className="w-full rounded-sm border border-ink/15 bg-charcoal p-3 shadow-[0_16px_40px_-16px_rgba(23,20,15,0.55)] sm:max-w-[480px]">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={
            features
              ? `Generative Nasalis Flow artwork — ${features.palet.key} palette, ${features.alur.key} flow style, ${features.kepadatan.key} density, ${features.nose} nose, ${features.latar} background`
              : "Generative Nasalis Flow artwork, generating…"
          }
          className="block aspect-square w-full bg-black ring-1 ring-cream/15"
        />
      </div>

      {showControls && (
        <div className="flex w-full flex-col gap-5 sm:w-[280px]">
          <button
            type="button"
            onClick={handleRandomize}
            className="self-start rounded-full border border-gold px-5 py-2 text-xs uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-ink"
          >
            Randomize
          </button>

          <form onSubmit={handleSubmitHash} className="flex flex-col gap-2" noValidate>
            <label htmlFor={inputId} className="text-xs uppercase tracking-[0.2em] text-ink/50">
              Test a specific hash
            </label>
            <input
              id={inputId}
              value={hashInput}
              onChange={(event) => {
                setHashInput(event.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="Paste a 51-character hash…"
              aria-invalid={validationError ? true : undefined}
              aria-describedby={validationError ? errorId : undefined}
              className="w-full rounded-sm border border-ink/15 bg-transparent px-3 py-2 font-mono text-xs text-ink placeholder:font-sans placeholder:text-ink/40"
            />
            {validationError && (
              <p id={errorId} role="alert" className="text-[11px] text-red-600">
                {validationError}
              </p>
            )}
            <button
              type="submit"
              className="self-start rounded-full border border-ink/20 px-5 py-2 text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:border-ink"
            >
              Render this hash
            </button>
          </form>

          <div aria-live="polite">
            {features ? (
              <>
                <div>
                  <h3 className="mb-2 text-xs uppercase tracking-[0.2em] text-ink/50">Traits</h3>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                    {TRAIT_ROWS.map(([label, get]) => (
                      <Fragment key={label}>
                        <dt className="text-ink/50">{label}</dt>
                        <dd className="text-right text-ink">{get(features)}</dd>
                      </Fragment>
                    ))}
                  </dl>
                </div>

                <div className="mt-3 flex items-start justify-between gap-3 border-t border-ink/10 pt-3">
                  <p className="break-all font-mono text-[11px] text-ink/50">{renderedHash}</p>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="shrink-0 text-[11px] uppercase tracking-[0.15em] text-ink/50 transition-colors hover:text-ink"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                <p className="mt-2 text-xs uppercase tracking-[0.15em] text-gold">
                  Open source —{" "}
                  <a
                    href={SOCIAL.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline underline-offset-2 transition-colors hover:text-ink"
                  >
                    View on GitHub
                  </a>
                </p>
              </>
            ) : (
              <p className="text-xs uppercase tracking-[0.2em] text-ink/40">Generating first render…</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
