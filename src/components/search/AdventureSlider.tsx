import { adventureLevels } from '../../data/adventureLevels.ts';

interface AdventureSliderProps {
  value: number;
  onChange: (level: number) => void;
}

export function AdventureSlider({ value, onChange }: AdventureSliderProps) {
  const current = adventureLevels.find((l) => l.level === value) || adventureLevels[2];

  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-3">
        How adventurous are you feeling?
      </label>

      <div className="glass rounded-xl p-4">
        {/* Current level display */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{current.icon}</span>
            <span className="font-semibold text-text-primary">{current.label}</span>
          </div>
          <span className="text-sm text-primary font-bold">{value}/5</span>
        </div>

        {/* Slider */}
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="adventure-slider w-full mb-2"
        />

        {/* Labels */}
        <div className="flex justify-between text-[10px] text-text-muted px-1">
          <span>Safe</span>
          <span>Curious</span>
          <span>Open</span>
          <span>Bold</span>
          <span>Chaos</span>
        </div>

        {/* Description */}
        <p className="text-xs text-text-secondary mt-3">{current.description}</p>
      </div>
    </div>
  );
}
