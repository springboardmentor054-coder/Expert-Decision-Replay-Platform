import { useEffect, useRef, useState } from 'react';
import './CustomSelect.css';

function CustomSelect({
  id,
  options,
  value,
  onChange,
  getOptionStyle,
  placeholder = 'Select...',
  error = false,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const selected = options.find((option) => option.value === value);

  return (
    <div className={`custom-select ${className}`} ref={wrapperRef}>
      <button
        id={id}
        type="button"
        className={`custom-select-trigger ${error ? 'custom-select-trigger-error' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        style={getOptionStyle && selected ? getOptionStyle(selected) : undefined}
      >
        <span className={selected ? '' : 'custom-select-placeholder'}>
          {selected?.label || placeholder}
        </span>
        <svg
          className={`custom-select-chevron ${open ? 'custom-select-chevron-open' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul className="custom-select-menu">
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className={`custom-select-option ${
                  option.value === value ? 'custom-select-option-active' : ''
                }`}
                style={getOptionStyle ? getOptionStyle(option) : undefined}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
                {option.value === value && (
                  <svg
                    className="custom-select-check"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CustomSelect;
