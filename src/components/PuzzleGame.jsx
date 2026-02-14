import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import PuzzlePiece from "./PuzzlePiece.jsx";

gsap.registerPlugin(Draggable);

const COLUMNS = 4;
const ROWS = 4;
const TOTAL_PIECES = COLUMNS * ROWS;
const BASE_SIZE = 400; // should match PuzzlePiece

// Path to your puzzle image. Place a 400x400 image at /public/puzzle.jpg
const IMAGE_URL = "/puzzle.jpg";

function createPieces() {
  const pieces = [];
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLUMNS; col += 1) {
      const id = row * COLUMNS + col;
      pieces.push({ id, row, col });
    }
  }
  return pieces;
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Detects if a URL is a YouTube URL and extracts the video ID
 * @param {string} url - The video URL
 * @returns {string|null} - YouTube embed URL if it's a YouTube link, null otherwise
 */
function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;

  // YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    /youtube\.com\/.*[?&]v=([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      const videoId = match[1].split('?')[0].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }

  return null;
}

function PuzzleGame({ rewardVideoUrl }) {
  const pieces = useMemo(() => createPieces(), []);
  const [shuffledIds, setShuffledIds] = useState(() =>
    shuffle(pieces.map((p) => p.id))
  );
  const [assignments, setAssignments] = useState(
    () => Array(TOTAL_PIECES).fill(null)
  ); // slotIndex -> pieceId
  const [isHintVisible, setIsHintVisible] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isRewardVisible, setIsRewardVisible] = useState(false);
  const [videoAspectRatio, setVideoAspectRatio] = useState(16 / 9); // Default to landscape
  
  // Image dimensions state - dynamically calculated to maintain aspect ratio
  const [imageDimensions, setImageDimensions] = useState({
    naturalWidth: BASE_SIZE,
    naturalHeight: BASE_SIZE,
    displayWidth: BASE_SIZE,
    displayHeight: BASE_SIZE
  });

  const gameAreaRef = useRef(null);
  const boardRef = useRef(null);
  const slotRefs = useRef([]);
  const pieceRefs = useRef([]);
  const draggablesRef = useRef([]);
  const imageRef = useRef(null);

  // Load image and calculate dimensions to maintain aspect ratio
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      
      // Calculate display dimensions that fit within BASE_SIZE while maintaining aspect ratio
      const aspectRatio = naturalWidth / naturalHeight;
      let displayWidth = BASE_SIZE;
      let displayHeight = BASE_SIZE;
      
      if (aspectRatio > 1) {
        // Wider than tall - constrain by width
        displayHeight = BASE_SIZE / aspectRatio;
      } else if (aspectRatio < 1) {
        // Taller than wide - constrain by height
        displayWidth = BASE_SIZE * aspectRatio;
      }
      
      setImageDimensions({
        naturalWidth,
        naturalHeight,
        displayWidth,
        displayHeight
      });
    };
    img.src = IMAGE_URL;
  }, []);

  // Hint image fade
  useEffect(() => {
    gsap.to(".hint-image", {
      autoAlpha: isHintVisible ? 0.5 : 0,
      duration: 0.4,
      ease: "power2.out"
    });
  }, [isHintVisible]);

  // Completion modal entrance animation
  useEffect(() => {
    if (!isComplete) return;

    const tl = gsap.timeline();

    tl.fromTo(
      ".completion-modal-backdrop",
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 0.3,
        ease: "power2.out"
      }
    ).fromTo(
      ".completion-modal",
      { y: 32, scale: 0.9, autoAlpha: 0 },
      {
        y: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 0.45,
        ease: "back.out(1.6)"
      },
      "<0.05"
    );

    return () => {
      tl.kill();
    };
  }, [isComplete]);

  // Initialize Draggable instances
  useLayoutEffect(() => {
    if (!gameAreaRef.current) return;

    const ctx = gsap.context(() => {
      draggablesRef.current.forEach((d) => d && d.kill());
      draggablesRef.current = [];

      const container = gameAreaRef.current;

      shuffledIds.forEach((pieceId) => {
        const el = pieceRefs.current[pieceId];
        if (!el) return;

        const draggable = Draggable.create(el, {
          type: "x,y",
          bounds: container,
          onPress() {
            gsap.to(el, {
              scale: 1.06,
              boxShadow: "0px 14px 28px rgba(0,0,0,0.35)",
              duration: 0.15
            });
            // bring to front
            el.style.zIndex = 20;
          },
          onRelease() {
            gsap.to(el, {
              scale: 1,
              boxShadow: "0px 4px 12px rgba(0,0,0,0.18)",
              duration: 0.2
            });
            el.style.zIndex = "";
          },
          onDragEnd() {
            handleSnapOrReturn(el, pieceId);
          }
        })[0];

        draggablesRef.current.push(draggable);
      });
    }, gameAreaRef);

    return () => {
      ctx.revert();
      draggablesRef.current.forEach((d) => d && d.kill());
      draggablesRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shuffledIds]);

  const handleSnapOrReturn = (el, pieceId) => {
    if (!gameAreaRef.current || !boardRef.current) {
      return;
    }

    let hitIndex = -1;
    for (let i = 0; i < TOTAL_PIECES; i += 1) {
      const slotEl = slotRefs.current[i];
      if (!slotEl) continue;
      if (Draggable.hitTest(el, slotEl, "50%")) {
        hitIndex = i;
        break;
      }
    }

    if (hitIndex >= 0) {
      const slotEl = slotRefs.current[hitIndex];
      const slotRect = slotEl.getBoundingClientRect();
      const pieceRect = el.getBoundingClientRect();

      // Calculate how far we need to move the piece *from its current position*
      // so that it lines up exactly with the target slot in the viewport.
      const deltaX = slotRect.left - pieceRect.left;
      const deltaY = slotRect.top - pieceRect.top;

      const currentX = gsap.getProperty(el, "x") || 0;
      const currentY = gsap.getProperty(el, "y") || 0;

      gsap.to(el, {
        x: currentX + deltaX,
        y: currentY + deltaY,
        duration: 0.25,
        ease: "power2.out",
        onComplete: () => {
          setAssignments((prev) => {
            const next = [...prev];

            // clear previous slot of this piece
            const previousSlotIndex = next.indexOf(pieceId);
            if (previousSlotIndex !== -1) {
              next[previousSlotIndex] = null;
            }

            // if another piece was in this slot, send it back to origin
            const occupyingPiece = next[hitIndex];
            if (
              occupyingPiece !== null &&
              occupyingPiece !== undefined &&
              occupyingPiece !== pieceId
            ) {
              const otherEl = pieceRefs.current[occupyingPiece];
              if (otherEl) {
                gsap.to(otherEl, {
                  x: 0,
                  y: 0,
                  duration: 0.25,
                  ease: "power2.inOut"
                });
              }
              const cleared = next.indexOf(occupyingPiece);
              if (cleared !== -1) {
                next[cleared] = null;
              }
            }

            next[hitIndex] = pieceId;
            return next;
          });
        }
      });
    } else {
      // animate back to original source position
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: "power2.inOut"
      });

      setAssignments((prev) => {
        const next = [...prev];
        const previousSlotIndex = next.indexOf(pieceId);
        if (previousSlotIndex !== -1) {
          next[previousSlotIndex] = null;
        }
        return next;
      });
    }
  };

  const handleReset = () => {
    setAssignments(Array(TOTAL_PIECES).fill(null));
    setIsComplete(false);
    setIsRewardVisible(false);
    setShuffledIds((prev) => shuffle(prev));

    pieceRefs.current.forEach((el) => {
      if (!el) return;
      gsap.set(el, { x: 0, y: 0 });
    });
  };

  const checkResult = () => {
    // Debug: log current assignments and validation result
    console.log("[PuzzleGame] Checking result. Assignments:", assignments);

    const allFilled = assignments.every((p) => p !== null && p !== undefined);
    const correct = assignments.every((pieceId, slotIndex) => {
      if (pieceId === null || pieceId === undefined) return false;
      return pieceId === slotIndex;
    });

    console.log(
      "[PuzzleGame] All filled:",
      allFilled,
      "Correct arrangement:",
      correct
    );

    if (allFilled && correct) {
      handleVictory();
    } else {
      handleIncorrect();
    }
  };

  const handleIncorrect = () => {
    console.log("[PuzzleGame] Incorrect puzzle arrangement.");

    if (!gameAreaRef.current) return;

    gsap.fromTo(
      gameAreaRef.current,
      { x: -10 },
      {
        x: 10,
        duration: 0.06,
        repeat: 7,
        yoyo: true,
        ease: "power1.inOut",
        onComplete: () => {
          gsap.to(gameAreaRef.current, { x: 0, duration: 0.1 });
        }
      }
    );
  };

  const handleVictory = () => {
    console.log("[PuzzleGame] Victory! Triggering completion animations and confetti.");

    setIsComplete(true);

    if (!boardRef.current) return;

    const tl = gsap.timeline();

    tl.to(".puzzle-piece", {
      borderColor: "rgba(255,255,255,0)",
      boxShadow: "0px 0px 0px rgba(0,0,0,0)",
      duration: 0.3,
      ease: "power2.out"
    })
      .to(
        boardRef.current,
        {
          scale: 1.05,
          duration: 0.4,
          ease: "back.out(1.7)"
        },
        "<"
      )
      .add(() => triggerConfetti(), "<0.1");
  };

  const triggerConfetti = () => {
    if (typeof window === "undefined") return;

    const confettiCount = 80;

    // Use viewport center so the burst aligns with the modal / main focus area.
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight / 2;

    console.log(
      "[PuzzleGame] Triggering confetti at:",
      { x: originX, y: originY },
      "count:",
      confettiCount
    );

    for (let i = 0; i < confettiCount; i += 1) {
      const frag = document.createElement("div");
      frag.className = "confetti-frag";

      // Place at board center
      frag.style.left = `${originX}px`;
      frag.style.top = `${originY}px`;

      // Use simple Math.random-based ranges to avoid any issues with utility helpers.
      const angle = -110 + Math.random() * 40; // between -110 and -70 degrees
      const distance = 160 + Math.random() * 160; // between 160 and 320
      const duration = 0.8 + Math.random() * 0.6; // between 0.8 and 1.4s
      const delay = Math.random() * 0.15; // between 0 and 0.15s
      const rotation = -260 + Math.random() * 520; // between -260 and 260deg
      const colors = ["#f97316", "#22c55e", "#3b82f6", "#eab308", "#ec4899"];
      const color = colors[Math.floor(Math.random() * colors.length)];

      const rad = (angle * Math.PI) / 180;
      const targetX = Math.cos(rad) * distance;
      const targetY = Math.sin(rad) * distance;

      frag.style.setProperty("--confetti-x", `${targetX}px`);
      frag.style.setProperty("--confetti-y", `${targetY}px`);
      frag.style.setProperty("--confetti-rotation", `${rotation}deg`);
      frag.style.backgroundColor = color;
      frag.style.animation = `confetti-shoot ${duration}s ease-out forwards`;
      frag.style.animationDelay = `${delay}s`;

      document.body.appendChild(frag);

      const totalLifetime = (duration + delay + 0.1) * 1000;
      window.setTimeout(() => {
        frag.remove();
      }, totalLifetime);
    }
  };

  const toggleHint = () => setIsHintVisible((prev) => !prev);

  // Detect video aspect ratio when reward modal opens
  useEffect(() => {
    if (!isRewardVisible || !rewardVideoUrl) return;
    
    // For YouTube videos, we can't easily detect aspect ratio, so use default
    if (getYouTubeEmbedUrl(rewardVideoUrl)) {
      setVideoAspectRatio(16 / 9); // YouTube defaults, but will adapt
      return;
    }

    // For regular video files, detect dimensions
    const video = document.createElement('video');
    video.src = rewardVideoUrl;
    video.onloadedmetadata = () => {
      const aspectRatio = video.videoWidth / video.videoHeight;
      setVideoAspectRatio(aspectRatio);
    };
    video.onerror = () => {
      // Fallback to landscape if detection fails
      setVideoAspectRatio(16 / 9);
    };
  }, [isRewardVisible, rewardVideoUrl]);

  return (
    <section className="game-shell">
      <div className="controls-bar">
        <button type="button" onClick={handleReset} className="btn-secondary">
          Shuffle
        </button>
        <button type="button" onClick={toggleHint} className="btn-ghost">
          {isHintVisible ? "Hide hint" : "Show hint"}
        </button>
        <button type="button" onClick={checkResult} className="btn-primary">
          Finish
        </button>
        {isComplete && (
          <span className="status-pill status-pill--success">
            Completed! 🎉
          </span>
        )}
      </div>

      <div ref={gameAreaRef} className="game-area">
        {/* Left: collection / drop zone */}
        <div className="panel panel--board">
          <div className="panel-header">
            <h2>Target</h2>
            <p>Drop pieces here to solve.</p>
          </div>
          <div
            ref={boardRef}
            className="board-wrapper"
            style={{ 
              width: `${imageDimensions.displayWidth}px`, 
              height: `${imageDimensions.displayHeight}px` 
            }}
          >
            <img
              ref={imageRef}
              src={IMAGE_URL}
              alt="Puzzle hint"
              className="hint-image"
              draggable="false"
            />
            <div
              className="board-grid"
              style={{
                gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`,
                gridTemplateRows: `repeat(${ROWS}, 1fr)`
              }}
            >
              {Array.from({ length: TOTAL_PIECES }).map((_, index) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  ref={(el) => {
                    slotRefs.current[index] = el;
                  }}
                  className="board-slot"
                  data-slot-index={index}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: source area */}
        <div className="panel panel--source">
          <div className="panel-header">
            <h2>Pieces</h2>
            <p>Drag from here into the target grid.</p>
          </div>
          <div className="pieces-container">
            {shuffledIds.map((id) => {
              const piece = pieces.find((p) => p.id === id);
              return (
                <PuzzlePiece
                  key={id}
                  id={id}
                  col={piece.col}
                  row={piece.row}
                  columns={COLUMNS}
                  rows={ROWS}
                  imageUrl={IMAGE_URL}
                  isCompleted={isComplete}
                  imageDimensions={imageDimensions}
                  ref={(el) => {
                    pieceRefs.current[id] = el;
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {isComplete && (
        <div className="completion-modal-backdrop">
          <div className="completion-modal">
            <div className="completion-badge">
              <span className="completion-badge-icon">🎉</span>
            </div>
            <h2 className="completion-title">Puzzle completed!</h2>
            <p className="completion-subtitle">
              Beautifully done. Want to spin up a fresh shuffle and go again?
            </p>
            <div className="completion-actions">
              {rewardVideoUrl && (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setIsRewardVisible(true)}
                >
                  Reveal reward
                </button>
              )}
              <button
                type="button"
                className="btn-primary"
                onClick={handleReset}
              >
                Play again
              </button>
            </div>
          </div>
        </div>
      )}
      {rewardVideoUrl && isRewardVisible && (
        <div className="reward-modal-backdrop">
          <div className="reward-modal">
            <header className="reward-modal-header">
              <span className="reward-modal-label">Reward unlocked</span>
              <button
                type="button"
                className="reward-modal-close"
                onClick={() => setIsRewardVisible(false)}
              >
                ✕
              </button>
            </header>
            <div className="reward-modal-body">
              <div 
                className="reward-video-frame"
                style={{ 
                  aspectRatio: videoAspectRatio > 1 ? `${videoAspectRatio} / 1` : `1 / ${1 / videoAspectRatio}`
                }}
              >
                {getYouTubeEmbedUrl(rewardVideoUrl) ? (
                  <iframe
                    className="reward-video reward-video--youtube"
                    src={getYouTubeEmbedUrl(rewardVideoUrl)}
                    title="Reward video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    className="reward-video"
                    src={rewardVideoUrl}
                    controls
                    playsInline
                    onLoadedMetadata={(e) => {
                      const video = e.target;
                      const aspectRatio = video.videoWidth / video.videoHeight;
                      setVideoAspectRatio(aspectRatio);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default PuzzleGame;


