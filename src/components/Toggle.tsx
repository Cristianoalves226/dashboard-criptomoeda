interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}

export default function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="mt-0.5 text-xs text-white/40">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-white' : 'bg-white/15'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full transition-transform ${
            checked ? 'translate-x-5 bg-black' : 'translate-x-0.5 bg-white/70'
          }`}
        />
      </button>
    </div>
  );
}
