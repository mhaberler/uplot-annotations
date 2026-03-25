/**
 * verticalLinesPlugin — uPlot plugin for rendering vertical annotation lines.
 *
 * Draws labeled vertical lines over a uPlot chart at specified x-axis positions.
 * Lines are clipped to the plot area and rendered on top of series fills.
 *
 * @example
 * ```ts
 * import uPlot from 'uplot';
 * import { verticalLinesPlugin } from './verticalLinesPlugin';
 *
 * const annotations = [
 *     { x: 1700000000, label: 'Deploy',  color: '#27ae60' },
 *     { x: 1700003600, label: 'Rollback', color: '#e74c3c', dash: [5, 5] },
 * ];
 *
 * new uPlot(
 *     {
 *         width: 800,
 *         height: 400,
 *         plugins: [verticalLinesPlugin(annotations)],
 *         series: [{}, { label: 'CPU', stroke: '#3498db' }],
 *     },
 *     [timestamps, values],
 *     document.getElementById('chart')!,
 * );
 * ```
 */

import uPlot from 'uplot';

export interface Annotation {
    /** Unix timestamp (seconds) at which to draw the line. */
    x: number;
    /** Text label rendered along the line. */
    label: string;
    /** CSS color string for both the line and label. */
    color: string;
    /** Optional dash pattern passed to CanvasRenderingContext2D.setLineDash(). */
    dash?: number[];
}

export function verticalLinesPlugin(annotations: Annotation[]): uPlot.Plugin {
    return {
        hooks: {
            drawSeries: (u: uPlot) => {
                const { ctx, bbox, valToPos } = u;
                if (!bbox) return;

                ctx.save();
                ctx.beginPath();
                ctx.rect(bbox.left, bbox.top, bbox.width, bbox.height);
                ctx.clip();

                annotations.forEach(anno => {
                    const x = valToPos(anno.x, 'x', true);

                    if (x >= bbox.left && x <= bbox.left + bbox.width) {
                        ctx.globalCompositeOperation = 'source-over';

                        // Line
                        ctx.beginPath();
                        ctx.strokeStyle = anno.color;
                        ctx.lineWidth = 2;
                        if (anno.dash) ctx.setLineDash(anno.dash);
                        ctx.moveTo(x, bbox.top);
                        ctx.lineTo(x, bbox.top + bbox.height);
                        ctx.stroke();
                        ctx.setLineDash([]);

                        // Label
                        ctx.fillStyle = anno.color;
                        ctx.font = 'bold 24px Arial';
                        ctx.textAlign = 'right';

                        ctx.save();
                        ctx.translate(x - 5, bbox.top + 20);
                        ctx.rotate(-Math.PI / 2);
                        ctx.fillText(anno.label.toUpperCase(), 0, 0);
                        ctx.restore();
                    }
                });

                ctx.restore();
            }
        }
    };
}
