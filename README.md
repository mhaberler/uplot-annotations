# uplot-annotations

Two [uPlot](https://github.com/leeoniya/uPlot) annotation plugins shipped in a single module:

- **Line annotations** — full-height vertical lines with rotated labels, useful for marking events or time ranges (deploys, incidents, maintenance windows).
- **Point annotations** — labeled chips with arrows pointing at specific data points, useful for calling out individual values (peaks, anomalies, thresholds).

![image.png](/assets/image-1.png)

## Usage

Copy `uplotAnnotations.ts` into your project and import it alongside uPlot.

## Line annotations

Vertical lines spanning the full plot height with a rotated text label. Position is specified as a Unix timestamp on the x-axis.

```ts
import uPlot from 'uplot';
import { uplotAnnotations, type Annotation } from './uplotAnnotations';

const annotations: Annotation[] = [
    { x: 1700000000, label: 'Deploy',   color: '#27ae60' },
    { x: 1700003600, label: 'Rollback', color: '#e74c3c', dash: [5, 5], lineWidth: 1 },
];

new uPlot(
    {
        width: 800,
        height: 400,
        plugins: [uplotAnnotations(annotations)],
        series: [{}, { label: 'CPU', stroke: '#3498db' }],
    },
    [timestamps, values],
    document.getElementById('chart')!,
);
```

## Point annotations

Labeled chips with an arrow and dot pointing at a specific data point. Position is specified as a data array index and series index. The chip auto-repositions when it would overflow the top or right edge of the plot.

```ts
import { uplotPointAnnotations, type PointAnnotation } from './uplotAnnotations';

const pointAnnotations: PointAnnotation[] = [
    { x: 30, seriesIdx: 1, label: 'Peak',    color: '#8e44ad' },
    { x: 60, seriesIdx: 1, label: 'Anomaly', color: '#c0392b', font: 'bold 16px Arial' },
];

new uPlot(
    {
        plugins: [
            uplotAnnotations(annotations),
            uplotPointAnnotations(pointAnnotations),
        ],
        // ...
    },
    data,
    target,
);
```

Both plugins can be used independently or together. Annotation arrays are mutable — update values and call `u.redraw(false)` to reflect changes live.

## Line annotation options

| Property       | Type              | Default             | Description                                                    |
| -------------- | ----------------- | ------------------- | -------------------------------------------------------------- |
| `x`            | `number`          | required            | Unix timestamp (seconds) for the line position                 |
| `label`        | `string`          | required            | Text rendered along the line                                   |
| `color`        | `string`          | required            | CSS color for both line and label                              |
| `dash`         | `number[]`        | solid               | Passed to `setLineDash()`                                      |
| `lineWidth`    | `number`          | `2`                 | Stroke width in canvas pixels                                  |
| `font`         | `string`          | `'bold 24px Arial'` | Canvas font string                                             |
| `textAlign`    | `CanvasTextAlign` | `'right'`           | Text alignment                                                 |
| `rotation`     | `number`          | `-Math.PI / 2`      | Label rotation in radians                                      |
| `labelOffsetX` | `number`          | `-5`                | Horizontal offset from the line in canvas pixels               |
| `labelOffsetY` | `number`          | `20`                | Vertical offset from the top of the plot area in canvas pixels |

## Point annotation options

| Property       | Type     | Default              | Description                                       |
| -------------- | -------- | -------------------- | ------------------------------------------------- |
| `x`            | `number` | required             | Data array index into `data[0]` / `data[seriesIdx]` |
| `seriesIdx`    | `number` | required             | Series index (1-based, matching uPlot series)     |
| `label`        | `string` | required             | Text displayed inside the chip                    |
| `color`        | `string` | required             | Chip background, arrow, and dot color             |
| `textColor`    | `string` | `'#fff'`             | Label text color                                  |
| `font`         | `string` | `'bold 60px Arial'`  | Canvas font string                                |
| `padding`      | `number` | `fontSize / 2`       | Padding inside chip in canvas pixels              |
| `arrowLen`     | `number` | `fontSize * 5/3`     | Arrow length in canvas pixels                     |
| `borderRadius` | `number` | `fontSize / 3`       | Chip corner radius in canvas pixels               |

## Demo

```bash
npm install
npm run dev
```

Opens `anno.html` with a synthetic time-series chart, three vertical annotations, three point annotations, and interactive sliders.
