import React, { useRef } from "react";

interface JoinCodeInputProps {
  joinCodeParts: string[];
  onPartChange: (index: number, value: string) => void;
  isDisabled?: boolean;
}

const JoinCodeInput: React.FC<JoinCodeInputProps> = ({ joinCodeParts, onPartChange, isDisabled = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    if (isDisabled) return;

    const key = e.key.toUpperCase();
    if (/^[A-Z0-9]$/.test(key)) {
      onPartChange(index, key);
      const nextElement = containerRef.current?.querySelectorAll<HTMLDivElement>(".join-code-cell")[index + 1];
      nextElement?.focus();
    } else if (e.key === "Backspace") {
      onPartChange(index, "");
      const prevElement = containerRef.current?.querySelectorAll<HTMLDivElement>(".join-code-cell")[index - 1];
      prevElement?.focus();
    } else if (e.key === "ArrowLeft") {
      const prevElement = containerRef.current?.querySelectorAll<HTMLDivElement>(".join-code-cell")[index - 1];
      prevElement?.focus();
    } else if (e.key === "ArrowRight") {
      const nextElement = containerRef.current?.querySelectorAll<HTMLDivElement>(".join-code-cell")[index + 1];
      nextElement?.focus();
    }
  };

  const handleClick = (index: number) => {
    const element = containerRef.current?.querySelectorAll<HTMLDivElement>(".join-code-cell")[index];
    element?.focus();
  };

  return (
    <div ref={containerRef} className="flex justify-center items-center gap-2">
      {joinCodeParts.map((part, index) => (
        <React.Fragment key={index}>
          <div
            tabIndex={0}
            className={`join-code-cell w-10 h-10 text-center border border-gray-300 rounded text-highlight bg-transparent font-bold flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-highlight ${
              isDisabled ? "cursor-not-allowed" : "cursor-pointer"
            }`}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onClick={() => handleClick(index)}
          >
            {part}
          </div>
          {index === 2 && <span className="text-highlight font-bold">-</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

export default JoinCodeInput;
