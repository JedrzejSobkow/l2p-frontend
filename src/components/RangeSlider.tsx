import React from 'react';

interface RangeSliderProps {
    min: number;
    max: number;
    value: number;
    onChange: (value: number) => void;
    icon: React.ReactNode;
}

const RangeSlider: React.FC<RangeSliderProps> = ({ min, max, value = min, onChange, icon }) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(Number(event.target.value));
    };

    return (
        <div className="w-full flex flex-col items-center justify-center max-w-[200px] mx-auto p-4">
            <span className="text-base text-gray-700 text-headline flex items-center">
                <span className="text-lg">{icon}</span>
                <span className="ml-1 text-lg">{value}</span>
            </span>
            <div className="w-full flex items-center">
                <span className="text-sm text-paragraph mr-2">{min}</span>
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={handleChange}
                    className="w-full h-2 bg-background-tertiary rounded-lg appearance-none cursor-pointer accent-highlight"
                    style={{
                        WebkitAppearance: 'none',
                        appearance: 'none',
                    }}
                />
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{max}</span>
            </div>

        </div>
    );
};

export default RangeSlider;
