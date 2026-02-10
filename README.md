## GSAP Picture Puzzle

An interactive picture puzzle built with React and GSAP, following the spec in `PLAN.md`.

### Running the project

1. Install dependencies:

```bash
npm install
```

2. Add a square puzzle image:

- Place a file named `puzzle.jpg` in the `public` folder (recommended: 400×400px).

3. Start the dev server:

```bash
npm run dev
```

Then open the printed `localhost` URL in your browser.

### Gameplay

- Drag pieces from the right panel into the left grid.
- Use **Show hint** to fade in a reference image behind the grid.
- Click **Finish** to validate:
  - Incorrect layout: the board shakes.
  - Correct layout: borders disappear, the board scales up slightly, and a GSAP confetti burst plays.


