import { useEffect, useState } from 'react';

/**
 * L'image de la mascotte des Jeux, fournie par les organisateurs : elle se dépose sur la machine
 * qui fait la démo (dossier ignoré par git). Sans elle, le personnage guide original s'affiche.
 */
const LOCAL_MASCOT = '/mascotte/ayo.png';

/** Vrai quand l'image de la mascotte est présente sur cette machine. */
function useLocalMascot(): boolean {
  const [present, setPresent] = useState(false);
  useEffect(() => {
    const image = new Image();
    image.onload = () => setPresent(true);
    image.src = LOCAL_MASCOT;
    return () => {
      image.onload = null;
    };
  }, []);
  return present;
}

/** Le petit portrait du guide, à côté de ses messages. */
export function GuideAvatar() {
  const hasLocalMascot = useLocalMascot();
  return (
    <span
      aria-hidden="true"
      className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-joj-green-deep ring-2 ring-joj-lime"
    >
      {hasLocalMascot ? (
        <img src={LOCAL_MASCOT} alt="" className="size-full bg-white object-cover object-top" />
      ) : (
        <OriginalGuide still className="size-8" />
      )}
    </span>
  );
}

/** La mascotte locale si son image existe sur cette machine, sinon le personnage guide original. */
export function GuideMascot({ className }: { className?: string }) {
  const hasLocalMascot = useLocalMascot();

  if (hasLocalMascot) {
    return (
      <img
        src={LOCAL_MASCOT}
        alt=""
        className={`${className ?? ''} rounded-2xl object-contain drop-shadow-lg motion-safe:animate-float`}
      />
    );
  }
  return <OriginalGuide className={className} />;
}

/** Le personnage guide original : une bulle de dialogue qui salue. Purement décoratif. */
function OriginalGuide({ className, still = false }: { className?: string; still?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className={still ? undefined : 'origin-center motion-safe:animate-float'}>
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
        <g
          style={{ transformOrigin: '104px 60px' }}
          className={still ? undefined : 'motion-safe:animate-wave'}
        >
          <path d="M104 60 L114 44" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" />
          <circle cx="115" cy="41" r="5.5" fill="#b5e61d" />
        </g>
      </g>
    </svg>
  );
}
