import { useEffect, useState } from "react";
const messages = [
  "Warming up the kettle...",
  "Whisking the matcha just right...",
  "Grinding fresh ideas...",
  "Brewing something special...",
  "Plating your experience...",
  "Pouring smooth operations...",
  "Adding the final garnish...",
  "Almost ready to serve 🍵",
];
export function LoadingScreen() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 5000); // change every 5 seconds

    return () => clearInterval(interval);
  }, []);
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex flex-col items-center text-center px-6">
        {/* Icon */}
        <img
          src="/serveflow.png"
          alt="App Logo"
          className="w-36 h-36 mb-6 animate-bounce"
        />{" "}
        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Getting things ready...
        </h1>
        {/* Subtitle */}
        <p className="text-sm text-gray-500 mb-6 max-w-xs">
          We’re preparing your workspace. This will only take a moment.
        </p>
        {/* Progress bar */}
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-gray-800 animate-[loading_1.5s_infinite]" />
        </div>
        {/* Subtle status */}
        <p className="text-xs text-gray-400 transition-opacity duration-500">
          {messages[index]}
        </p>{" "}
      </div>

      {/* Custom animation */}
      <style>
        {`
          @keyframes loading {
            0% { transform: translateX(-100%); width: 40%; }
            50% { transform: translateX(0%); width: 60%; }
            100% { transform: translateX(100%); width: 40%; }
          }
        `}
      </style>
    </div>
  );
}
