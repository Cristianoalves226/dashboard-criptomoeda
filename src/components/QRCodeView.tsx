import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeViewProps {
  value: string;
  size?: number;
}

export default function QRCodeView({ value, size = 200 }: QRCodeViewProps) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toString(value, { type: 'svg', margin: 1, width: size, color: { dark: '#0b0f16', light: '#ffffff' } })
      .then(result => { if (!cancelled) setSvg(result); })
      .catch(() => { if (!cancelled) setSvg(null); });
    return () => { cancelled = true; };
  }, [value, size]);

  return (
    <div className="flex items-center justify-center rounded-2xl bg-white p-4" style={{ width: size + 32, height: size + 32 }}>
      {svg ? (
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="h-full w-full animate-pulse rounded-lg bg-black/10" />
      )}
    </div>
  );
}
