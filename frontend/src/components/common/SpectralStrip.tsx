import "./SpectralStrip.css";

/**
 * The one signature moment: an infrared-absorption-spectrum gradient
 * (ozone → neutral → amber → infrared) that draws once on load. It's
 * also the literal legend for the cool→hot per-capita scale used later
 * on the world map, so it isn't decorative — it previews the encoding.
 * Respects prefers-reduced-motion (see index.css's global override and
 * the animation-none fallback below).
 */
export function SpectralStrip() {
  return (
    <div className="spectral-strip" role="presentation" aria-hidden="true">
      <span className="spectral-strip__fill" />
    </div>
  );
}
