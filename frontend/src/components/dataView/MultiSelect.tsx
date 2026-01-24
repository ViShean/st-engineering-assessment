import React, { useState, useRef, useEffect } from "react";

interface MultiSelectProps {
  options: string[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

const useClickOutside = <T extends HTMLElement>(
  ref: React.RefObject<T> | React.RefObject<T | null>,
  handler: () => void,
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedOptions,
  onChange,
  placeholder = "Select columns...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(dropdownRef, () => setIsOpen(false));

  const handleSelectAll = () => onChange(options);
  const handleDeselectAll = () => onChange([]);

  const handleOptionToggle = (option: string) => {
    if (selectedOptions.includes(option)) {
      onChange(selectedOptions.filter((item) => item !== option));
    } else {
      onChange([...selectedOptions, option]);
    }
  };

  const getButtonLabel = () => {
    if (selectedOptions.length === 0) return placeholder;
    if (selectedOptions.length === options.length) return "All Columns";
    if (selectedOptions.length === 1) return selectedOptions[0];
    return `${selectedOptions.length} Columns Selected`;
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-left bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
      >
        <span>{getButtonLabel()}</span>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl">
          <div className="p-2">
            <div className="flex justify-between mb-2">
              <button
                onClick={handleSelectAll}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="text-xs font-bold text-slate-500 hover:underline"
              >
                Deselect All
              </button>
            </div>
            <ul className="space-y-1">
              {options.map((option) => (
                <li
                  key={option}
                  onClick={() => handleOptionToggle(option)}
                  className="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option)}
                    readOnly
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-sm font-medium text-slate-800 capitalize">
                    {option}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
