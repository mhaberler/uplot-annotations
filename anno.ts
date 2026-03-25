import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { verticalLinesPlugin, type Annotation } from './verticalLinesPlugin';

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
