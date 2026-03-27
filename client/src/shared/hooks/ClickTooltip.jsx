import { useState, useRef, useEffect } from "react";

function ClickTooltip({ children, content }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  // Close tooltip if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <span ref={ref} className="relative inline-block">
      {/* clickable/focusable trigger */}
      <button
        type="button"
        className="text-primary font-medium cursor-pointer"
        onClick={() => setVisible(!visible)}
        aria-label={content}
      >
        {children}
      </button>

      {/* tooltip */}
      {visible && (
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs bg-gray-700 text-white rounded shadow-md z-50 w-48 text-center wrap-break-word">
          {content}
        </span>
      )}
    </span>
  );
}

export default ClickTooltip;
