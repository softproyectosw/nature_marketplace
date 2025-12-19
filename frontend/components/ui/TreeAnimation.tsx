'use client';

/**
 * Tree Animation component for login/register
 * Shows tree growth based on password strength
 * Matches the Eco-Luxury design from frontend-base/
 */

interface TreeAnimationProps {
  passwordLength: number;
}

export function TreeAnimation({ passwordLength }: TreeAnimationProps) {
  const len = passwordLength;

  // Stage messages
  const getMessage = () => {
    if (len === 0) return 'Plant a seed';
    if (len <= 3) return "It's sprouting...";
    if (len <= 7) return 'Growing strong!';
    if (len <= 11) return 'Lush & Green';
    return 'In full bloom!';
  };

  return (
    <div className="h-48 flex justify-center items-end mb-6 relative border-b border-white/10 pb-4">
      {/* The SVG Tree */}
      <svg
        width="200"
        height="180"
        viewBox="0 0 200 180"
        className="drop-shadow-[0_0_10px_rgba(48,232,122,0.4)] transition-all duration-500"
      >
        {/* Soil */}
        <ellipse cx="100" cy="170" rx="60" ry="10" fill="#3E2723" opacity="0.8" />

        {/* Seed (Stage 0) */}
        <circle
          cx="100"
          cy="170"
          r="6"
          fill="#8D6E63"
          className={`transition-all duration-500 ${
            len > 0 ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
          }`}
        />

        {/* Stem (Stage 1+) */}
        <path
          d="M100,170 Q100,140 100,110"
          fill="none"
          stroke="#5D4037"
          strokeWidth={len > 0 ? '4' : '0'}
          strokeLinecap="round"
          className={`transition-all duration-700 ease-out origin-bottom ${
            len > 0 ? 'scale-y-100' : 'scale-y-0'
          }`}
        />

        {/* Branches & Top (Stage 2+) */}
        <g
          className={`transition-all duration-700 ease-out delay-100 origin-bottom ${
            len > 3 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
          style={{ transformOrigin: '100px 110px' }}
        >
          {/* Main trunk continuation */}
          <path
            d="M100,110 Q90,70 100,40"
            fill="none"
            stroke="#5D4037"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Left branch */}
          <path
            d="M100,90 Q80,80 70,70"
            fill="none"
            stroke="#5D4037"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Right branch */}
          <path
            d="M100,80 Q120,70 130,60"
            fill="none"
            stroke="#5D4037"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Leaves (Stage 3+) */}
        <g
          className={`transition-all duration-500 delay-300 ${
            len > 7 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <circle cx="100" cy="40" r="20" fill="#30e87a" />
          <circle cx="70" cy="70" r="10" fill="#2ebf68" />
          <circle cx="130" cy="60" r="12" fill="#2ebf68" />
          <circle cx="90" cy="60" r="15" fill="#30e87a" />
          <circle cx="110" cy="50" r="15" fill="#2ebf68" />
        </g>

        {/* Flowers (Stage 4+) */}
        <g
          className={`transition-all duration-500 delay-500 ${
            len > 11 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <circle cx="90" cy="40" r="4" fill="#FFEB3B" />
          <circle cx="110" cy="30" r="3" fill="#FFEB3B" />
          <circle cx="75" cy="65" r="3" fill="#FFEB3B" />
        </g>
      </svg>

      <div className="absolute top-0 w-full text-center">
        <p className="text-primary font-bold tracking-wider uppercase text-sm animate-pulse">
          {getMessage()}
        </p>
      </div>
    </div>
  );
}
