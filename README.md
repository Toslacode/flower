# Vervain, Floral Atelier

A high-end, single-page website for a fictional floral atelier. Static, dependency-free, no build step: open `index.html` in a browser, or serve the folder with any static server.

```
python3 -m http.server 8000
```

## Design

Built following the [taste-skill](https://github.com/Leonxlnx/taste-skill) frontend design skill (installed in this repo at `.claude/skills/design-taste-frontend/`).

- **Design read:** premium-consumer landing for a floral atelier, aimed at design-conscious clients, restrained botanical-luxury language.
- **Dials:** `DESIGN_VARIANCE: 7`, `MOTION_INTENSITY: 6`, `VISUAL_DENSITY: 3`.
- **Palette:** Forest family. Deep green near-black, bone text, one amber accent, locked across the page. Light and dark modes via `prefers-color-scheme`.
- **Type:** Geist and Geist Mono, self-hosted variable fonts (SIL OFL, license in `assets/fonts/`).
- **Shape system:** radius 0 everywhere.
- **Motion:** load-in cascade on the hero, IntersectionObserver scroll reveals, one CSS marquee. Everything honors `prefers-reduced-motion`. No scroll listeners.

## Images

The hero is a full-bleed background video (muted, looping, masked into the page background with a theme-aware gradient; held on its poster frame under reduced motion). Sources: `assets/flower-vid.webm` (VP9, served first, smaller) with `assets/flower-vid.mp4` (H.264) as fallback, and `assets/flower-poster.jpg` as the poster frame.

Other photography currently uses seeded `picsum.photos` placeholder URLs with a duotone CSS treatment so any photo sits inside the palette. Each `<img>` is preceded by a `TODO` comment describing the real shot needed. Replace these with real photography:

1. Work grid: hotel lobby installation (1400x1000), hellebore table piece (900x1200), single-stem study (900x1200), ceremony arch detail (1200x900), weekly residence piece (1200x900).
2. Closing: atelier workbench, wide, 1920x1080.

## Structure

```
index.html        Page markup
css/main.css      All styling, design tokens at the top
js/main.js        Scroll reveals (IntersectionObserver)
assets/fonts/     Geist variable fonts + OFL license
```
