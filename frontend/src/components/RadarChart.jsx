export default function RadarChart({ a, b, labels }) {
  const size = 220;
  const cx = size / 2, cy = size / 2;
  const r = 80;
  const n = labels.length;

  function point(angle, radius) {
    const rad = (angle - 90) * (Math.PI / 180);
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  const angles = labels.map((_, i) => (360 / n) * i);

  function polygon(values, maxVal = 100) {
    return angles.map((a, i) => {
      const p = point(a, (values[i] / maxVal) * r);
      return `${p.x},${p.y}`;
    }).join(' ');
  }

  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      {/* Grid rings */}
      {gridLevels.map(lvl => (
        <polygon
          key={lvl}
          points={angles.map(a => { const p = point(a, (lvl / 100) * r); return `${p.x},${p.y}`; }).join(' ')}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {angles.map((a, i) => {
        const p = point(a, r);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth="1" />;
      })}

      {/* Person B polygon */}
      <polygon
        points={polygon(b.values)}
        fill="rgba(219,39,119,0.12)"
        stroke="#db2777"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Person A polygon */}
      <polygon
        points={polygon(a.values)}
        fill="rgba(124,58,237,0.15)"
        stroke="#7c3aed"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Dots A */}
      {angles.map((ang, i) => {
        const p = point(ang, (a.values[i] / 100) * r);
        return <circle key={`a${i}`} cx={p.x} cy={p.y} r="4" fill="#7c3aed" />;
      })}

      {/* Dots B */}
      {angles.map((ang, i) => {
        const p = point(ang, (b.values[i] / 100) * r);
        return <circle key={`b${i}`} cx={p.x} cy={p.y} r="4" fill="#db2777" />;
      })}

      {/* Labels */}
      {angles.map((ang, i) => {
        const p = point(ang, r + 22);
        const anchor = p.x < cx - 5 ? 'end' : p.x > cx + 5 ? 'start' : 'middle';
        return (
          <text key={`lbl${i}`} x={p.x} y={p.y} textAnchor={anchor} dominantBaseline="middle"
            fontSize="9" fontWeight="600" fill="#4b5563" fontFamily="Inter, sans-serif">
            {labels[i]}
          </text>
        );
      })}
    </svg>
  );
}
