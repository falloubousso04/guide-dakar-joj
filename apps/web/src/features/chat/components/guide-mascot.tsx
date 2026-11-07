import { useEffect, useState } from 'react';

/**
 * Image facultative, présente seulement sur la machine qui fait la démo (ignorée par git) :
 * la mascotte officielle des Jeux est une marque protégée, elle n'est pas publiée dans le dépôt.
 */
const LOCAL_MASCOT = '/mascotte/ayo.png';

/** La mascotte locale si son image existe sur cette machine, sinon le personnage guide original. */
export function GuideMascot({ className }: { className?: string }) {
  const [hasLocalMascot, setHasLocalMascot] = useState(false);

  useEffect(() => {
    const image = new Image();
    image.onload = () => setHasLocalMascot(true);
    image.src = LOCAL_MASCOT;
    return () => {
      image.onload = null;
    };
  }, []);

  if (hasLocalMascot) {
    return (
      <img
        src={LOCAL_MASCOT}
        alt=""
        className={`${className ?? ''} object-contain drop-shadow-lg motion-safe:animate-float`}
      />
    );
  }
  return <OriginalGuide className={className} />;
}

/** Le personnage guide original : une bulle de dialogue qui salue. Purement décoratif. */
function OriginalGuide({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="origin-center motion-safe:animate-float">
        {/* Le corps : une bulle à coin coupé, comme celles du chat. */}
        <path d="M18 22 H90 L104 36 V82 H44 L28 98 V82 H18 Z" fill="#ffffff" />
        {/* La casquette aux couleurs olympiques. */}
        <path d="M30 22 Q61 2 92 22 Z" fill="#0081c8" />
        <rect x="30" y="20" width="62" height="5" fill="#fcb131" />
        {/* Les yeux et le sourire. */}
        <circle cx="48" cy="48" r="5" fill="#000000" />
        <circle cx="74" cy="48" r="5" fill="#000000" />
        <circle cx="50" cy="46" r="1.6" fill="#ffffff" />
        <circle cx="76" cy="46" r="1.6" fill="#ffffff" />
        <path
          d="M48 62 Q61 72 74 62"
          stroke="#000000"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="40" cy="62" r="4" fill="#ee334e" opacity="0.55" />
        <circle cx="82" cy="62" r="4" fill="#ee334e" opacity="0.55" />
        {/* Le bras qui salue. */}
        <g style={{ transformOrigin: '104px 60px' }} className="motion-safe:animate-wave">
          <path d="M104 60 L114 44" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" />
          <circle cx="115" cy="41" r="5.5" fill="#b5e61d" />
        </g>
      </g>
    </svg>
  );
}
