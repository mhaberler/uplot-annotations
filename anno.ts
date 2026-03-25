import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';

interface Annotation {
    x: number;
    label: string;
    color: string;
    dash?: number[];
}

function verticalLinesPlugin(annotations: Annotation[]): uPlot.Plugin {
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

// Data Setup
const now = Math.floor(Date.now() / 1000);
const timestamps = Array.from({ length: 100 }, (_, i) => now + i * 3600);
const values = Array.from({ length: 100 }, () => Math.floor(Math.random() * 80) + 10);
const data: uPlot.AlignedData = [timestamps, values];

const annotations: Annotation[] = [
    { x: timestamps[15], label: 'Maintenance', color: '#e74c3c', dash: [5, 5] },
    { x: timestamps[45], label: 'v2.0 Deploy', color: '#27ae60' },
    { x: timestamps[80], label: 'Traffic Spike', color: '#f39c12' },
];

// Build Legend
const legendEl = document.getElementById('legend')!;
annotations.forEach(a => {
    legendEl.innerHTML += `<div class="legend-item"><div class="dot" style="background:${a.color}"></div><span>${a.label}</span></div>`;
});

const opts: uPlot.Options = {
    title: 'Network Traffic',
    width: 800,
    height: 400,
    plugins: [verticalLinesPlugin(annotations)],
    scales: {
        x: { time: true, range: (_u, _min, _max) => [timestamps[0], timestamps[99]] },
        y: { range: [0, 100] },
    },
    series: [
        {},
        {
            label: 'CPU',
            stroke: '#3498db',
            fill: 'rgba(52, 152, 219, 0.15)',
            width: 2,
        },
    ],
};

new uPlot(opts, data, document.getElementById('chart')!);
