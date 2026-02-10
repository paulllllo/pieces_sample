# 🧩 Technical Specification: Interactive GSAP Puzzle Game

This document outlines the architecture, logic, and animation flow for a professional-grade React and GSAP interactive puzzle application.

---

## 🏗️ 1. Architecture & Tech Stack

* **UI Framework:** React (Functional components with Hooks).
* **Animation Engine:** GSAP (GreenSock Animation Platform).
* **Essential Plugins:** * `Draggable`: For the core interaction.
    * `InertiaPlugin` (Optional): For smooth "flicking" motions.
* **State Management:** React `useState` for tracking piece locations and game status.

---

## 📐 2. Image Slicing Logic
To avoid managing dozens of image files, we use a single high-resolution image and manipulate the CSS `background-position`.

### Mathematical Formulas:
For a grid of $Columns \times Rows$:

* **Piece Width:** `TotalWidth / Columns`
* **Piece Height:** `TotalHeight / Rows`
* **Background Position X:** `-(CurrentColumn * PieceWidth)`
* **Background Position Y:** `-(CurrentRow * PieceHeight)`

> **Example:** In a 4x4 grid on a 400px image, the piece at column 2, row 1 would have a width of 100px and a background-position of `-200px -100px`.

---

## 🎨 3. UI Layout Design

### Left Rectangle: The Collection Area (Drop Zone)
* **Container:** A relative-positioned `div` with a CSS Grid layout.
* **Slots:** Transparent "placeholder" divs that act as hit targets for GSAP.
* **Hint Layer:** An absolute-positioned image with `opacity: 0` sitting behind the grid.

### Right Rectangle: The Source Area
* **Container:** A flex-wrap box where scrambled pieces are initially rendered.
* **Shuffling:** On component mount, the array of pieces is randomized using a Fisher-Yates shuffle algorithm.

---

## 🕹️ 4. Core Interaction (GSAP Logic)

### Drag & Drop Workflow
Using GSAP's `Draggable.create()`, we implement the following:

1.  **Visual Feedback:** On `onPress`, use `gsap.to(target, { scale: 1.1, boxShadow: "0px 10px 20px rgba(0,0,0,0.3)" })`.
2.  **Hit Detection:** In the `onDragEnd` callback, use the `this.hitTest()` method to check collision with slots in the left rectangle.
3.  **Snapping Mechanism:**
    * **If Hit:** Calculate the global coordinates of the slot and animate the piece to that exact `x` and `y`.
    * **If Miss:** Animate the piece back to its original starting position in the right rectangle.

---

## 💡 5. Game Features

### The Hint Button
A simple toggle that controls the reference image.
* **Action:** `gsap.to(".hint-image", { autoAlpha: 0.2, duration: 0.5 })` while the button is held or toggled.

### Win/Loss Validation
A `checkResult` function runs every time a piece is snapped into a slot:
* **Data Structure:** Map each slot ID to a "Correct Piece ID."
* **Incorrect State:** If the user clicks "Finish" and the positions are wrong, trigger a "Shake" animation:
    `gsap.to(".game-area", { x: 10, repeat: 5, yoyo: true, duration: 0.05 })`.
* **Victory State:** If all pieces match their `correctSlot`:
    1.  Remove piece borders.
    2.  Scale the entire left container by $1.05$.
    3.  Trigger a confetti particle explosion using a GSAP timeline.

---

## 🛠️ 6. Implementation Roadmap
1.  **Phase 1:** Setup React project and basic CSS layout for the two rectangles.
2.  **Phase 2:** Create the "Piece" component that calculates its own background position based on props.
3.  **Phase 3:** Integrate `GSAP Draggable` and establish the "Snap to Slot" logic.
4.  **Phase 4:** Build the validation engine and the "Hint" functionality.
5.  **Phase 5:** Polish with celebration animations and responsive adjustments.