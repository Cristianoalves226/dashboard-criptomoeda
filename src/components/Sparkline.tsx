interface SparklineProps {
  data: number[];
  positive: boolean;
  width?: number;
  height?: number;
}

export default function Sparkline({ data, positive, width = 100, height = 32 }: SparklineProps) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i * width) / (data.length - 1);
    const y = height - ((v - min) / range) * height;
    return `${x} ${y}`;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="overflow-visible">
      <path
        d={`M ${points.join(' L ')}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={positive ? 'text-emerald-300' : 'text-red-300'}
      />
    </svg>
  );
}
