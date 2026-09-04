# taste-skill: The Anti-Slop Frontend Skill for AI Agents
Repository: https://github.com/leonxlnx/taste-skill

## Overview & Core Philosophy
`taste-skill` is an anti-slop design system and frontend engineering standard designed to eliminate generic, low-effort AI aesthetics (such as harsh gradients, repetitive 3-card layouts, emoji spam, em-dashes, and centered zero-hierarchy forms).

---

## 🎨 1. Taste Principles (UI/UX)
- **High Visual Contrast & Readability**: WCAG AA min contrast across light & dark themes.
- **Asymmetric Grids & Bento Layouts**: Avoid uniform 3-card grids that look like template AI slop. Mix featured items, hero spans, and sidebar modules.
- **Micro-Interactions & Spring Physics**: Smooth transitions (`stiffness: 100, damping: 20`), clear hover feedback (`transform: translateY(-2px)`).
- **Curated Vector Iconography**: Pure inline SVG icons with consistent `stroke-width="1.8"` or `2.0`. **ZERO EMOJIS**.
- **No Em-Dashes (`—`)**: Use standard hyphens or clean typographic separation.
- **Typography Scaling**: Headings in Plus Jakarta Sans bold with balanced line-heights.

---

## 💻 2. Desktop & Mobile Architecture
- **Desktop Grid System**:
  - Full-width hero banner with search bar & filter chips.
  - Multi-column bento catalog grid with badges (`BEST SELLER`, `SIGNATURE`, `POPULAR`).
  - Active sticky Order Sidebar with quick-add actions, item breakdown, and checkout summary.
- **Mobile Viewport System**:
  - Compact touch-optimized list/cards with sticky bottom cart bar.
  - Seamless viewport switcher (`Desktop` vs `Mobile Simulator`).
