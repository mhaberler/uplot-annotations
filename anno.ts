import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { uplotAnnotations, type Annotation } from './uplotAnnotations';

// Data Setup
const now = Math.floor(Date.now() / 1000);
const timestamps = Array.from({ length: 100 }, (_, i) => now + i * 3600);
const values = Array.from({ length: 100 }, () => Math.floor(Math.random() * 80) + 10);
const data: uPlot.AlignedData = [timestamps, values];

const annotations: Annotation[] = [
    {
        x: timestamps[22],
        label: 'Maintenance',
        color: '#e74c3c',
        // dash: [5, 5],
        lineWidth: 1,
        // font: 'italic 11px Arial',

        textAlign: 'center',
//        rotation: Math.PI / 2,
    },
    {
        x: timestamps[45],
        label: 'v2.0 Deploy',
        color: '#27ae60',
        lineWidth: 3,
        font: 'bold 13px monospace',
                textAlign: 'right',
        rotation: -Math.PI / 2,
        labelOffsetX: -6,
        labelOffsetY: 20,
    },
    {
        x: timestamps[80],
        label: 'Traffic Spike',
        color: '#f39c12',
        dash: [8, 3],
        lineWidth: 2,
        textAlign: 'right',
        labelOffsetX: -5,
        labelOffsetY: 30,
    },
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
    plugins: [uplotAnnotations(annotations)],
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
