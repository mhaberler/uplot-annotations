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

export interface PointAnnotation {
    /** Data array index (into data[0] and data[seriesIdx]). */
    x: number;
    /** Series index (1-based, matching uPlot series array). */
    seriesIdx: number;
    /** Text displayed inside the chip. */
    label: string;
    /** Chip background, arrow, and dot color. */
    color: string;
    /** Label text color. Default: '#fff'. */
    textColor?: string;
    /** Canvas font string. Default: 'bold 60px Arial'. */
    font?: string;
    /** Padding inside chip in canvas pixels. Default: 6. */
    padding?: number;
    /** Arrow length in canvas pixels. Default: 100. */
    arrowLen?: number;
    /** Chip border radius in canvas pixels. Default: 20. */
    borderRadius?: number;
}

function drawRoundRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number,
): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
}

export function uplotPointAnnotations(annotations: PointAnnotation[]): uPlot.Plugin {
    return {
        hooks: {
            draw: (u: uPlot) => {
                const { ctx, bbox, data } = u;
                if (!bbox || !data) return;

                const px = uPlot.pxRatio;

                ctx.save();
                ctx.beginPath();
                ctx.rect(bbox.left, bbox.top, bbox.width, bbox.height);
                ctx.clip();

                annotations.forEach(anno => {
                    const xVal = (data[0] as number[])[anno.x];
                    const yVal = (data[anno.seriesIdx] as number[])[anno.x];
                    if (xVal == null || yVal == null) return;

                    const cx = u.valToPos(xVal, 'x', true);
                    const cy = u.valToPos(yVal, 'y', true);
                    if (cx < bbox.left || cx > bbox.left + bbox.width) return;

                    const rawFont  = anno.font ?? 'bold 60px Arial';
                    const font     = rawFont.replace(/(\d+(?:\.\d+)?)px/, (_, n) => `${parseFloat(n) * px}px`);
                    const fontPx   = parseFloat(rawFont.match(/(\d+(?:\.\d+)?)px/)?.[1] ?? '60');

                    const dotR     = fontPx / 3  * px;
                    const padding  = (anno.padding  ?? fontPx / 2)   * px;
                    const arrowLen = (anno.arrowLen ?? fontPx * 5/3) * px;

                    ctx.save();
                    ctx.font = font;
                    const metrics = ctx.measureText(anno.label);
                    const textW = metrics.width;
                    const textH = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
                    const chipW = textW + 2 * padding;
                    const chipH = textH + 2 * padding;

                    // Determine layout
                    const topOverflow = (cy - dotR - arrowLen - chipH) < bbox.top;
                    let chipX: number, chipY: number;
                    let tailX: number, tailY: number;  // arrow origin (chip edge)
                    let headX: number, headY: number;  // arrow tip (near data point)

                    if (topOverflow) {
                        const nearRight = (cx + dotR + arrowLen + chipW) > (bbox.left + bbox.width);
                        if (nearRight) {
                            chipX = cx - dotR - arrowLen - chipW;
                            chipY = cy - chipH / 2;
                            tailX = chipX + chipW; tailY = cy;
                            headX = cx - dotR;     headY = cy;
                        } else {
                            chipX = cx + dotR + arrowLen;
                            chipY = cy - chipH / 2;
                            tailX = chipX;     tailY = cy;
                            headX = cx + dotR; headY = cy;
                        }
                    } else {
                        const rawChipX = cx - chipW / 2;
                        chipX = Math.max(bbox.left, Math.min(rawChipX, bbox.left + bbox.width - chipW));
                        chipY = cy - dotR - arrowLen - chipH;
                        tailX = chipX + chipW / 2; tailY = chipY + chipH;
                        headX = cx;                headY = cy - dotR;
                    }

                    ctx.fillStyle   = anno.color;
                    ctx.strokeStyle = anno.color;

                    // Dot
                    ctx.beginPath();
                    ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
                    ctx.fill();

                    // Arrow shaft
                    ctx.lineWidth = fontPx / 8 * px;
                    ctx.beginPath();
                    ctx.moveTo(tailX, tailY);
                    ctx.lineTo(headX, headY);
                    ctx.stroke();

                    // Arrowhead
                    const angle = Math.atan2(headY - tailY, headX - tailX);
                    const hl = fontPx * 2/3 * px;
                    ctx.beginPath();
                    ctx.moveTo(headX, headY);
                    ctx.lineTo(
                        headX - hl * Math.cos(angle - Math.PI / 7),
                        headY - hl * Math.sin(angle - Math.PI / 7),
                    );
                    ctx.lineTo(
                        headX - hl * Math.cos(angle + Math.PI / 7),
                        headY - hl * Math.sin(angle + Math.PI / 7),
                    );
                    ctx.closePath();
                    ctx.fill();

                    // Chip background
                    drawRoundRect(ctx, chipX, chipY, chipW, chipH, (anno.borderRadius ?? fontPx / 3) * px);
                    ctx.fill();

                    // Label
                    ctx.fillStyle  = anno.textColor ?? '#fff';
                    ctx.textAlign  = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(anno.label, chipX + chipW / 2, chipY + chipH / 2);

                    ctx.restore();
                });

                ctx.restore();
            }
        }
    };
}

export function uplotAnnotations(annotations: Annotation[]): uPlot.Plugin {
    return {
        hooks: {
            drawSeries: (u: uPlot, seriesIdx: number) => {
                if (seriesIdx !== u.series.length - 1) return;
                const { ctx, bbox, valToPos } = u;
                if (!bbox) return;

                const px = uPlot.pxRatio;

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
                        ctx.lineWidth = (anno.lineWidth ?? 2) * px;
                        if (anno.dash) ctx.setLineDash(anno.dash.map(v => v * px));
                        ctx.moveTo(x, bbox.top);
                        ctx.lineTo(x, bbox.top + bbox.height);
                        ctx.stroke();
                        ctx.setLineDash([]);

                        // Label
                        ctx.fillStyle = anno.color;
                        const rawFont = anno.font ?? 'bold 24px Arial';
                        ctx.font = rawFont.replace(/(\d+(?:\.\d+)?)px/, (_, n) => `${parseFloat(n) * px}px`);
                        ctx.textAlign = anno.textAlign ?? 'right';

                        ctx.save();
                        ctx.translate(x + (anno.labelOffsetX ?? -5) * px, bbox.top + (anno.labelOffsetY ?? 20) * px);
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
