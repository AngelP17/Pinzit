/*
 * Slimmed editorial spacer with a quiet quote band.
 * Intentionally tiny — bento + showcase already carry the visual weight.
 */
export function SealedSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
      <figure className="grid grid-cols-12 gap-x-10 gap-y-6">
        <div className="col-span-12 md:col-span-2">
          <span className="eyebrow">Field note</span>
        </div>
        <blockquote className="col-span-12 md:col-span-10">
          <p className="display display-lg text-white">
            Telemetry tells you <span className="text-ink-2">what happened.</span>
            Runbooks tell you <span className="text-ink-2">what to do.</span>
            <span className="ml-1 text-white">Pinzit tells you whether the system behaved correctly</span>
            <span className="text-signal">— and why it didn't.</span>
          </p>
          <figcaption className="mt-8 font-mono text-[12px] tracking-[0.18em] text-ink-2">
            — operating premise · v0.1.0
          </figcaption>
        </blockquote>
      </figure>
    </section>
  );
}
