# Animation Implementation Plan

Add fluid animations, fade-in effects on scroll, and smooth transitions to all clickable elements.

## Proposed Changes

### Dependencies
- Install `framer-motion` (already done).

### Global Transitions
- Add global transition rules to `src/styles.css` for interactive elements (buttons, links).

### Components

#### `src/routes/index.tsx`
- Wrap sections in `framer-motion` components (`motion.section`, `motion.div`).
- Implement `whileInView` fade-in and slide-up animations for:
    - Hero content.
    - Ticket cards (staggered entry).
    - Schedule items.
    - Map section.
    - Footer social icons.
- Add hover scales and transitions to:
    - Buy buttons.
    - Social icons.
    - Map pin image.

## Technical Details
- Use `framer-motion` for declarative, high-performance React animations.
- Set `viewport={{ once: true }}` to trigger scroll animations only once.
- Ensure transitions use consistent easing (e.g., `easeInOut`).
- Maintain existing glassmorphism and backgrounds during transitions.
