/**
 * uplotAnnotations — uPlot plugin for rendering vertical annotation lines.
 *
 * Draws labeled vertical lines over a uPlot chart at specified x-axis positions.
 * Lines are clipped to the plot area and rendered on top of series fills.
 *
 * @example
 * ```ts
 * import uPlot from 'uplot';
 * import { uplotAnnotations } from './uplotAnnotations';
 *
 * const annotations = [
 *     {
 *         x: 1700000000,
 *         label: 'Deploy',
 *         color: '#27ae60',
 *         lineWidth: 2,
 *         font: 'bold 14px monospace',
 *         textAlign: 'left',
 *         rotation: -Math.PI / 2,
 *         labelOffsetX: 6,
 *         labelOffsetY: 15,
 *     },
 *     {
 *         x: 1700003600,
 *         label: 'Rollback',
 *         color: '#e74c3c',
 *         dash: [5, 5],
 *         lineWidth: 1,
 *     },
 * ];
 *
 * new uPlot(
 *     {
 *         width: 800,
 *         height: 400,
 *         plugins: [uplotAnnotations(annotations)],
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
    /** Dash pattern passed to CanvasRenderingContext2D.setLineDash(). Default: solid. */
    dash?: number[];
    /** Stroke width of the line in canvas pixels. Default: 2. */
    lineWidth?: number;
    /** Canvas font string for the label. Default: 'bold 24px Arial'. */
    font?: string;
    /** Text alignment for the label. Default: 'right'. */
    textAlign?: CanvasTextAlign;
    /** Label rotation in radians. Default: -Math.PI / 2 (vertical, bottom-to-top). */
    rotation?: number;
    /** Horizontal offset of the label from the line in canvas pixels. Default: -5. */
    labelOffsetX?: number;
    /** Vertical offset of the label from the top of the plot area in canvas pixels. Default: 20. */
    labelOffsetY?: number;
}

export function uplotAnnotations(annotations: Annotation[]): uPlot.Plugin {
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
                        ctx.lineWidth = anno.lineWidth ?? 2;
                        if (anno.dash) ctx.setLineDash(anno.dash);
                        ctx.moveTo(x, bbox.top);
                        ctx.lineTo(x, bbox.top + bbox.height);
                        ctx.stroke();
                        ctx.setLineDash([]);

                        // Label
                        ctx.fillStyle = anno.color;
                        ctx.font = anno.font ?? 'bold 24px Arial';
                        ctx.textAlign = anno.textAlign ?? 'right';

                        ctx.save();
                        ctx.translate(x + (anno.labelOffsetX ?? -5), bbox.top + (anno.labelOffsetY ?? 20));
                        ctx.rotate(anno.rotation ?? -Math.PI / 2);
                        ctx.fillText(anno.label.toUpperCase(), 0, 0);
                        ctx.restore();
                    }
                });

                ctx.restore();
            }
        }
    };
}
