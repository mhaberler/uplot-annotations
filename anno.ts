import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { uplotAnnotations, uplotPointAnnotations, type Annotation, type PointAnnotation } from './uplotAnnotations';

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

const pointAnnotations: PointAnnotation[] = [
    { x: 30, seriesIdx: 1, label: 'Peak', color: '#8e44ad', font: 'bold 16px Arial' },
    { x: 60, seriesIdx: 1, label: 'Anomaly', color: '#c0392b', font: 'bold 16px Arial' },
    { x: 97, seriesIdx: 1, label: 'End', color: '#16a085', font: 'bold 16px Arial' },
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
    plugins: [uplotAnnotations(annotations), uplotPointAnnotations(pointAnnotations)],
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

const u = new uPlot(opts, data, document.getElementById('chart')!);

const fontSlider    = document.getElementById('font-size-slider') as HTMLInputElement;
const arrowSlider   = document.getElementById('arrow-len-slider') as HTMLInputElement;
const paddingSlider = document.getElementById('padding-slider')   as HTMLInputElement;
const fontLabel    = document.getElementById('font-size-label')!;
const arrowLabel   = document.getElementById('arrow-len-label')!;
const paddingLabel = document.getElementById('padding-label')!;

fontSlider.addEventListener('input', () => {
    const px = fontSlider.value;
    fontLabel.textContent = `${px}px`;
    pointAnnotations.forEach(a => { a.font = `bold ${px}px Arial`; });
    u.redraw(false);
});

arrowSlider.addEventListener('input', () => {
    const len = Number(arrowSlider.value);
    arrowLabel.textContent = `${len}px`;
    pointAnnotations.forEach(a => { a.arrowLen = len; });
    u.redraw(false);
});

paddingSlider.addEventListener('input', () => {
    const pad = Number(paddingSlider.value);
    paddingLabel.textContent = `${pad}px`;
    pointAnnotations.forEach(a => { a.padding = pad; });
    u.redraw(false);
});
