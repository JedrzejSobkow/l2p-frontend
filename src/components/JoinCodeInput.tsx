import React from "react";

interface JoinCodeInputProps {
  joinCodeParts: string[];
  onPartChange: (index: number, value: string, inputs: NodeListOf<HTMLInputElement>) => void;
  isDisabled?: boolean;
}

const JoinCodeInput: React.FC<JoinCodeInputProps> = ({ joinCodeParts, onPartChange, isDisabled = false }) => {
  return (
    <div className="flex justify-center items-center gap-2">
      {joinCodeParts.map((part, index) => (
        <React.Fragment key={index}>
          <input
            type="text"
            value={part}
            onChange={(e) =>
              onPartChange(index, e.target.value, e.currentTarget.parentElement!.querySelectorAll("input"))
            }
            onFocus={(e) => e.target.select()}
            className="w-10 h-10 text-center border border-gray-300 rounded text-highlight bg-transparent font-bold"
            maxLength={1}
            disabled={isDisabled}
          />
          {index === 2 && <span className="text-highlight font-bold">-</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

export default JoinCodeInput;
