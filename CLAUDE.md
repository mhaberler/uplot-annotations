# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server (opens anno.html)
npm run build     # production build to dist/
npm run preview   # preview the production build
```

## Architecture

This project is a reusable uPlot plugin module with two annotation styles, plus a demo that exercises both.

**`uplotAnnotations.ts`** — the standalone, importable plugin module. Exports:
- `Annotation` / `uplotAnnotations(annotations: Annotation[]): uPlot.Plugin` — full-height vertical lines with rotated labels, positioned by Unix timestamp. Uses the `drawSeries` hook to render on top of series fills.
- `PointAnnotation` / `uplotPointAnnotations(annotations: PointAnnotation[]): uPlot.Plugin` — labeled chips with arrows pointing at specific data points, positioned by data array index and series index. Uses the `draw` hook. Auto-repositions chips that would overflow the top or right edge.

Both plugins accept mutable arrays — update values and call `u.redraw(false)` to reflect changes live.

**`anno.ts`** — the demo entry point. Imports both plugins, generates synthetic time-series data, and wires up interactive sliders for font size, arrow length, and padding.

**`anno.html`** — the single HTML page. Contains layout/styles, slider controls, and `<script type="module" src="./anno.ts">`. Vite transpiles the TypeScript directly.

## uPlot types

uPlot ships its own declaration file at `node_modules/uplot/dist/uPlot.d.ts` but does not declare a `types` field in its `package.json`. The path is wired up via `tsconfig.json`'s `paths` option:

```json
"paths": { "uplot": ["./node_modules/uplot/dist/uPlot.d.ts"] }
```

The `drawSeries` hook receives `(u: uPlot, seriesIdx: number)` and fires once per series. The `draw` hook receives `(u: uPlot)` and fires once after all series are drawn. `u.bbox` uses `left / top / width / height` — there is no `right` or `bottom` property; compute them as `bbox.left + bbox.width` and `bbox.top + bbox.height`.

Canvas coordinates are in device pixels. Use `uPlot.pxRatio` to convert CSS pixels to canvas pixels for HiDPI support (as done in `uplotPointAnnotations`).
