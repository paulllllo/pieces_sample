import React from "react";
import PuzzleGame from "./components/PuzzleGame.jsx";

function App() {
  const url = "https://youtu.be/4ykTi2jB4NY?si=3FHJWOyMT0ToI2lV";

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-heart" aria-hidden="true">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
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
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              fill="url(#app-heart-gradient)"
              stroke="url(#app-heart-gradient)"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1>Pieces</h1>
        <p>Drag the pieces into the left area to reconstruct the image.</p>
      </header>
      <main>
        <PuzzleGame rewardVideoUrl={url}/>
      </main>
    </div>
  );
}

export default App;


