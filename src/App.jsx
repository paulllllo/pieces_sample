import React from "react";
import PuzzleGame from "./components/PuzzleGame.jsx";

function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-heart" aria-hidden="true">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="app-header-heart-icon"
          >
            <defs>
              <linearGradient
                id="app-heart-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
            <path
              d="M12 21s-5.05-3.31-8.06-6.32C1.7 12.44 1 11.09 1 9.6 1 7.18 2.9 5.3 5.3 5.3c1.4 0 2.75.64 3.7 1.68A4.98 4.98 0 0 1 12 6.3c1.2-1.37 2.46-2 3.7-2 2.4 0 4.3 1.88 4.3 4.3 0 1.49-.7 2.84-2.94 5.08C17.05 17.69 12 21 12 21z"
              fill="url(#app-heart-gradient)"
            />
          </svg>
        </div>
        <h1>Pieces</h1>
        <p>Drag the pieces into the left area to reconstruct the image.</p>
      </header>
      <main>
        <PuzzleGame rewardVideoUrl="/reward.mov"/>
      </main>
    </div>
  );
}

export default App;


