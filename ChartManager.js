// ChartManager.js
import { CHART_COLORS } from './constants.js';

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export class ChartManager {
    constructor(canvas) {
        this.ctx = canvas.getContext('2d');
        this.chart = null;
    }

    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
    
    _getBaseChartOptions(titleText) {
        return {
            scales: { x: { title: { display: true, text: 'Round', color: '#e2e2e2' }, ticks: { color: '#e2e2e2' }, grid: { color: '#444' } }, y: { title: { display: true, text: 'Money', color: '#e2e2e2' }, ticks: { color: '#e2e2e2' }, grid: { color: '#444' } } },
            responsive: true, maintainAspectRatio: false, animation: { duration: 0 },
            plugins: {
                legend: { labels: { color: '#e2e2e2' } },
                title: { display: true, text: titleText, color: '#e2e2e2', font: { size: 16 } }
            }
        };
    }

    init(config) {
        this.destroy();
        this.chart = new Chart(this.ctx, config);
    }
    
    updateLine(datasetIndex, round, value) {
        if (!this.chart) return;
        this.chart.data.datasets[datasetIndex].data[round] = value;
        this.chart.update('none');
    }
    
    renderSingleRun(agentName, initialState) {
        const labels = Array.from({ length: initialState.maxRounds + 1 }, (_, i) => i);
        this.init({
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: agentName,
                    data: [initialState.money],
                    borderColor: CHART_COLORS[agentName] || CHART_COLORS.Manual,
                    borderWidth: 2.5,
                    pointRadius: 0
                }]
            },
            options: this._getBaseChartOptions(`${agentName} Performance`)
        });
    }

    renderAnalysis(results, maxRounds, isMonteCarlo, numRuns) {
        const datasets = [];
        for (const res of results) {
            const color = CHART_COLORS[res.name];
            datasets.push({
                label: res.name,
                data: res.meanHistory,
                borderColor: color,
                borderWidth: 2.5,
                pointRadius: 0
            });
            if (isMonteCarlo) {
                const transparentColor = hexToRgba(color, 0.2);
                datasets.push({ label: '_hidden_', data: res.upperBand, fill: '+1', backgroundColor: transparentColor, borderColor: 'transparent', pointRadius: 0 });
                datasets.push({ label: '_hidden_', data: res.lowerBand, fill: false, borderColor: 'transparent', pointRadius: 0 });
            }
        }
        
        const title = isMonteCarlo ? `Mean Performance (${numRuns} Runs)` : `Comparative Performance (1 Run)`;
        const options = this._getBaseChartOptions(title);
        options.plugins.legend.labels.filter = item => !item.text.includes('_hidden_');
        
        const labels = Array.from({ length: maxRounds + 1 }, (_, i) => i);
        this.init({ type: 'line', data: { labels, datasets }, options });
    }
}