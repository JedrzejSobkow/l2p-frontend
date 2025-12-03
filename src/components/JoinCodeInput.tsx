import React, { useRef } from "react";

interface JoinCodeInputProps {
  joinCodeParts: string[];
  onPartChange: (index: number, value: string | string[]) => void;
  isDisabled?: boolean;
}

const JoinCodeInput: React.FC<JoinCodeInputProps> = ({
  joinCodeParts,
  onPartChange,
  isDisabled = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const getCells = () =>
    containerRef.current?.querySelectorAll<HTMLDivElement>(".join-code-cell") || [];

  const focusCell = (index: number) => {
    const cells = getCells();
    const el = cells[index];
    if (el) {
      el.focus();
      placeCaretAtEnd(el);
    }
  };

  const placeCaretAtEnd = (el: HTMLElement) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>, index: number) => {
    if (isDisabled) return;

    const target = e.currentTarget;
    const text = target.textContent || "";
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (cleaned.length > 0) {
      const char = cleaned[cleaned.length - 1];
      onPartChange(index, char);
      target.textContent = char;
      focusCell(index + 1);
    } else {
      target.textContent = "";
    }

    e.preventDefault();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    if (isDisabled) return;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
      return;
    }

    const key = e.key.toUpperCase();
    
    if (/^[A-Z0-9]$/.test(key)) {
      e.preventDefault();
      onPartChange(index, key);
      const target = e.currentTarget;
      target.textContent = key;
      focusCell(index + 1);
    }
    else if (e.key === "Backspace") {
      e.preventDefault();
      const target = e.currentTarget;
      const currentValue = joinCodeParts[index];
      
      if (currentValue) {
        // If cell has value, clear it and stay in the same cell
        onPartChange(index, "");
        target.textContent = "";
      } else {
        // If cell is empty, move focus to previous cell
        if (index > 0) {
          focusCell(index - 1);
        }
      }
    }
    else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusCell(index - 1);
    }
    else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusCell(index + 1);
    }
    else if (!/^(Shift|Control|Alt|Meta|CapsLock|Tab|Enter)$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>, index: number) => {
    if (isDisabled) return;

    const pasteData = e.clipboardData
      .getData("Text")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    if (!pasteData) return;

    e.preventDefault();

    const updatedParts = [...joinCodeParts];

    pasteData.split("").forEach((char, i) => {
      if (index + i < updatedParts.length) {
        updatedParts[index + i] = char;
      }
    });

    onPartChange(-1, updatedParts);

    const nextEmptyIndex = updatedParts.findIndex(
      (part, i) => i > index && part === ""
    );

    const focusIndex =
      nextEmptyIndex !== -1
        ? nextEmptyIndex
        : Math.min(index + pasteData.length, updatedParts.length - 1);

    focusCell(focusIndex);
  };

  const handleClick = (index: number) => {
    if (isDisabled) return;
    focusCell(index);
  };

  return (
    <div
      ref={containerRef}
      className="flex justify-center items-center gap-2"
    >
      {joinCodeParts.map((part, index) => (
        <React.Fragment key={index}>
          <div
            contentEditable={!isDisabled}
            suppressContentEditableWarning
            className={`join-code-cell w-10 h-10 border border-gray-300 rounded text-highlight bg-transparent font-bold flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-highlight caret-transparent ${
              isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
            onInput={(e) => handleInput(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={(e) => handlePaste(e, index)}
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
