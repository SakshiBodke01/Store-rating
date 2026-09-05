import { useState } from 'react';

// Clean standard SVG Star Icon without heavy outlines or glossy gradients
function StandardStarIcon({
  fillPercent = 100,
  size = 18,
  isInteractive = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  const uniqueId = `star-grad-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        cursor: isInteractive ? 'pointer' : 'default',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        transition: isInteractive ? 'transform 0.1s ease' : 'none',
      }}
    >
      {fillPercent > 0 && fillPercent < 100 && (
        <defs>
          <linearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset={`${fillPercent}%`} stopColor="#E9A23B" />
            <stop offset={`${fillPercent}%`} stopColor="#E2E8F0" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        fill={
          fillPercent === 100
            ? '#E9A23B'
            : fillPercent === 0
            ? '#E2E8F0'
            : `url(#${uniqueId})`
        }
      />
    </svg>
  );
}

export function StarRating({
  rating,
  value,
  onChange,
  readOnly = false,
  size = 18,
  showScore = true,
  className = '',
}) {
  const currentRating = value !== undefined ? value : rating || 0;
  const numScore = Number(currentRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (val) => {
    if (!readOnly && onChange) {
      onChange(val);
    }
  };

  const handleMouseEnter = (val) => {
    if (!readOnly) {
      setHoverRating(val);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const activeDisplay = hoverRating || currentRating;

  // Rating feedback labels for modal forms
  const ratingLabels = {
    1: '1.0 - Poor',
    2: '2.0 - Fair',
    3: '3.0 - Good',
    4: '4.0 - Very Good',
    5: '5.0 - Excellent',
  };

  // Helper to calculate exact fill percentage for each star index (1 to 5)
  const getStarFillPercent = (starIndex, scoreValue) => {
    const diff = scoreValue - (starIndex - 1);
    if (diff >= 1) return 100;
    if (diff <= 0) return 0;
    return Math.round(diff * 100);
  };

  // ReadOnly View (Tables & Dashboards) - Clean rating score display
  if (readOnly) {
    return (
      <div className={`rating-display-clean ${className}`.trim()}>
        <div className="rating-stars-inline">
          {[1, 2, 3, 4, 5].map((starIndex) => {
            const fillPct = getStarFillPercent(starIndex, numScore);
            return (
              <StandardStarIcon key={starIndex} fillPercent={fillPct} size={size} />
            );
          })}
        </div>
        {showScore && (
          <span className="rating-score-text">{numScore.toFixed(1)}</span>
        )}
      </div>
    );
  }

  // Interactive View (Modal Forms)
  return (
    <div className={`interactive-rating-wrapper ${className}`.trim()}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((starVal) => {
          const isFilled = starVal <= activeDisplay;
          return (
            <StandardStarIcon
              key={starVal}
              fillPercent={isFilled ? 100 : 0}
              size={size || 24}
              isInteractive={true}
              onClick={() => handleClick(starVal)}
              onMouseEnter={() => handleMouseEnter(starVal)}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}
      </div>
      {showScore && (
        <span className="interactive-rating-label">
          {ratingLabels[activeDisplay] || `${activeDisplay.toFixed(1)} / 5.0`}
        </span>
      )}
    </div>
  );
}

