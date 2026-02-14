import { Plus, Minus } from 'lucide-react';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  disabled?: boolean;
}

export const NumberInput = ({ 
  value, 
  onChange, 
  min = 0, 
  max = 99, 
  label,
  disabled = false 
}: NumberInputProps) => {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    const clampedValue = Math.max(min, Math.min(max, newValue));
    onChange(clampedValue);
  };

  return (
    <div className="number-input-group">
      {label && <label className="number-label">{label}</label>}
      <div className="number-input">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className="btn-number"
          aria-label="Decrease"
        >
          <Minus size={16} />
        </button>
        <input
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          disabled={disabled}
          className="number-display"
          aria-label={label}
        />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className="btn-number"
          aria-label="Increase"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};
