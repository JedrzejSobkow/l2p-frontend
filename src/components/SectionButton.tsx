import React from 'react';

interface SectionButtonProps {
  options: string[];
  selectedOption: string;
  onSelect: (option: string) => void;
}

const SectionButton: React.FC<SectionButtonProps> = ({ options, selectedOption, onSelect }) => {
  return (
    <div className="flex w-full border border-highlight rounded-lg overflow-hidden">
      {options.map((option, index) => (
        <button
          key={option}
          className={`flex-1 px-6 py-1 text-lg font-bold ${
            selectedOption === option ? 'bg-highlight text-background' : 'bg-background text-highlight'
          } ${index === 0 ? 'rounded-l-lg' : ''} ${index === options.length - 1 ? 'rounded-r-lg' : ''}`}
          onClick={() => onSelect(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default SectionButton;
