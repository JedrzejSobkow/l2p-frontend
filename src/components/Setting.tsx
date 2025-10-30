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
        <span className="text-gray-400 h-8">{selectedValue}</span>
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
        className="w-20 h-8 bg-background-tertiary text-white text-sm font-bold rounded-lg text-center focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {availableValues.map((value, index) => (
          <option key={index} value={value} disabled={disabledValues.includes(value)}>
            {value}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GameSetting;
