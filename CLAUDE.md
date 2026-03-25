# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server (opens anno.html)
npm run build     # production build to dist/
npm run preview   # preview the production build
```

## Architecture

This project is a reusable uPlot plugin for vertical annotation lines, plus a demo that exercises it.

**`uplotAnnotations.ts`** — the standalone, importable plugin. Exports `Annotation` (interface) and `uplotAnnotations(annotations: Annotation[]): uPlot.Plugin`. This is the module intended for use in other projects; it has no side effects and no dependency on the demo.

**`anno.ts`** — the demo entry point. Imports `uplotAnnotations` and `Annotation` from the plugin module, generates synthetic time-series data, and mounts a `uPlot` instance into `anno.html`.

**`anno.html`** — the single HTML page. Contains only layout/styles and `<script type="module" src="./anno.ts">`. Vite transpiles the TypeScript directly.

## uPlot types

uPlot ships its own declaration file at `node_modules/uplot/dist/uPlot.d.ts` but does not declare a `types` field in its `package.json`. The path is wired up via `tsconfig.json`'s `paths` option:

```json
"paths": { "uplot": ["./node_modules/uplot/dist/uPlot.d.ts"] }
```

The `drawSeries` hook receives `(u: uPlot, seriesIdx: number)` and fires once per series. `u.bbox` uses `left / top / width / height` — there is no `right` or `bottom` property; compute them as `bbox.left + bbox.width` and `bbox.top + bbox.height`.
