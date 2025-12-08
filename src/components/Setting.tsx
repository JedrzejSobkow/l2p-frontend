import React, { useState } from 'react';

interface SettingProps {
  label: string;
  icon: React.ReactNode;
  availableValues: string[];
  defaultValue: string;
  disabled?: boolean;
  disabledValues?: string[];
  onChange?: (value: string) => void;
}

const GameSetting: React.FC<SettingProps> = ({ label, icon, availableValues, defaultValue, disabled = false, disabledValues = [], onChange }) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue);

  const formatDisplayValue = (value: string) => value.replace(/_/g, ' ');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    if (!disabledValues.includes(newValue)) {
      setSelectedValue(newValue);
      onChange?.(newValue);
    }
  };

  if (disabled) {
    return (
      <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg shadow-md">
        <div className="flex items-center gap-2">
          <div className="text-highlight">{icon}</div>
          <span className="text-sm font-medium text-gray-300">{label}</span>
        </div>
        <span className="text-gray-400 h-8">{formatDisplayValue(selectedValue)}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg shadow-md">
      {/* Left Side: Icon and Label */}
      <div className="flex items-center gap-2">
        <div className="text-highlight">{icon}</div>
        <span className="text-sm font-medium text-gray-300">{label}</span>
      </div>

      {/* Right Side: Dropdown */}
      <select
        value={selectedValue}
        onChange={handleChange}
        disabled={disabled}
        className="w-30 h-8 bg-background-tertiary text-white text-sm font-bold rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer overflow-hidden text-ellipsis"
        style={{
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          textAlign: 'center',
          textAlignLast: 'center',
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.5rem center',
          backgroundSize: '1em',
          paddingLeft: '0.5rem',
          paddingRight: '2rem',
          whiteSpace: 'nowrap',
        }}
      >
        {availableValues.map((value, index) => (
          <option key={index} value={value} disabled={disabledValues.includes(value)}>
            {formatDisplayValue(value)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GameSetting;
