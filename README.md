# uplot-annotations

A [uPlot](https://github.com/leeoniya/uPlot) plugin that draws labeled vertical annotation lines over a chart.



![image.png](/assets/image.png)

## Usage

Copy `uplotAnnotations.ts` into your project and import it alongside uPlot.

```ts
import uPlot from 'uplot';
import { uplotAnnotations, type Annotation } from './uplotAnnotations';

const annotations: Annotation[] = [
    { x: 1700000000, label: 'Deploy',   color: '#27ae60' },
    { x: 1700003600, label: 'Rollback', color: '#e74c3c', dash: [5, 5] },
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

## Annotation options

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

## Demo

```bash
npm install
npm run dev
```

Opens `index.html` with a synthetic time-series chart and three annotated events.