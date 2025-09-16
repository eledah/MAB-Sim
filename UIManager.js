// UIManager.js

import { AGENT_CONSTRUCTORS } from './constants.js';

export class UIManager {
    constructor(containerElement, config) {
        this.container = containerElement;
        this.config = config;
        this.numMachines = 4;

        this._createHTML();
        this._queryDOMElements();
        this.updateVisibility();
    }

    _createHTML() {
        const showControls = this.config.showControls;
        const showPayoutInputs = this.config.showPayoutInputs;

        let controlsHTML = `
            <div class="control-group">
                <label>Scenario:</label>
                <select class="scenario-select">
                    <option value="A">Stationary</option>
                    <option value="B">Non-Stationary</option>
                    <option value="C">Restless</option>
                    <option value="D">Cataclysm</option>
                    <option value="E">Fading Garden</option>
                </select>
            </div>
            <div class="control-group">
                <label>Mode:</label>
                <select class="agent-select">
                    <option value="manual">Manual Play</option>
                    <optgroup label="Single Agent Runs">
                        ${AGENT_CONSTRUCTORS.map(a => `<option value="${a.key}">${a.name}</option>`).join('')}
                    </optgroup>
                    <optgroup label="Analysis Modes">
                        <option value="compare-all">Compare All</option>
                        <option value="monte-carlo">Monte Carlo</option>
                    </optgroup>
                </select>
            </div>
        `;

        // Add agent selection checkboxes for analysis modes
        if (showControls) {
            controlsHTML += `
                <div class="agent-selection" style="display: none;">
                    <label>Select Agents:</label>
                    <div class="agent-checkboxes">
                        ${AGENT_CONSTRUCTORS.map(a => `
                            <label><input type="checkbox" value="${a.key}" checked> ${a.name}</label>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        this.container.innerHTML = `
            <div class="simulator-wrapper">
                <div class="sim-header">
                    <h2>${this.config.name}</h2>
                </div>
                ${showControls ? `<div class="controls">${controlsHTML}</div>` : ''}
                <div class="sim-actions">
                    <button class="start-sim-btn">Start</button>
                    <button class="restart-btn">Restart</button>
                </div>
                <div class="progress-container"><div class="progress-bar"></div><div class="progress-label"></div></div>
                <div class="game-board">
                    ${[...Array(this.numMachines)].map((_, i) => `
                        <div class="machine-container" data-machine-id="${i}">
                            <div class="machine-flair"></div>
                            <div class="machine">🎰</div>
                            <div class="machine-info"></div>

                            <div class="viz-container">
                                <div class="ucb-viz">
                                    <div class="viz-bar-wrapper">
                                        <div class="viz-bar ucb-value-bar"></div>
                                        <div class="viz-bar ucb-bonus-bar"></div>
                                    </div>
                                </div>
                                <div class="thompson-viz">
                                    <svg class="thompson-viz-svg" preserveAspectRatio="none" viewBox="0 0 100 40">
                                        <path class="thompson-viz-path" d="M 0 40 L 100 40 Z" />
                                    </svg>
                                </div>
                            </div>

                            ${showPayoutInputs ? `
                                <div class="payout-controls">
                                    <label>Payout %</label>
                                    <input type="number" class="payout-input" min="0" max="100" value="0">
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
                <div class="ui-feedback">
                    <p>Money: <span class="current-money">100</span></p>
                    <p>Round: <span class="current-round">0</span></p>
                </div>
                <div class="chart-container"><canvas></canvas></div>
                <div class="summary-table-container">
                    <table>
                        <thead><tr><th>Agent</th><th>Final Score</th></tr></thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        `;
    }

    _queryDOMElements() {
        this.wrapper = this.container.querySelector('.simulator-wrapper');
        this.moneyEl = this.wrapper.querySelector('.current-money');
        this.roundEl = this.wrapper.querySelector('.current-round');
        this.machineContainers = this.wrapper.querySelectorAll('.machine-container');
        this.summaryTableContainer = this.wrapper.querySelector('.summary-table-container');
        this.summaryTableBody = this.wrapper.querySelector('.summary-table-container tbody');
        this.progressContainer = this.wrapper.querySelector('.progress-container');
        this.progressBar = this.wrapper.querySelector('.progress-bar');
        this.progressLabel = this.wrapper.querySelector('.progress-label');
        this.startBtn = this.wrapper.querySelector('.start-sim-btn');
        this.restartBtn = this.wrapper.querySelector('.restart-btn');
        this.agentSelect = this.wrapper.querySelector('.agent-select');
        this.scenarioSelect = this.wrapper.querySelector('.scenario-select');
        this.payoutInputs = this.wrapper.querySelectorAll('.payout-input');
        this.chartCanvas = this.wrapper.querySelector('.chart-container canvas');
        this.vizContainers = this.wrapper.querySelectorAll('.viz-container');
        this.uiFeedback = this.wrapper.querySelector('.ui-feedback');
        this.gameBoard = this.wrapper.querySelector('.game-board');
    }

    updateVisibility() {
        const mode = this.getMode();
        const isMonteCarlo = mode === 'monte-carlo';
        const isAnalysis = mode === 'compare-all' || mode === 'monte-carlo';

        if (this.gameBoard) {
            this.gameBoard.style.display = isMonteCarlo ? 'none' : 'block';
        }
        if (this.uiFeedback) {
            this.uiFeedback.style.display = isMonteCarlo ? 'none' : 'block';
        }
        if (this.agentSelection) {
            this.agentSelection.style.display = isAnalysis ? 'block' : 'none';
        }
    }

    addEventListeners(handlers) {
        this.startBtn.addEventListener('click', handlers.onStart);
        this.restartBtn.addEventListener('click', handlers.onReset);
        
        if (this.config.showControls) {
            this.agentSelect.addEventListener('change', handlers.onReset);
            this.scenarioSelect.addEventListener('change', handlers.onReset);
        }

        if (this.config.showPayoutInputs) {
            this.payoutInputs.forEach(input => {
                input.addEventListener('change', handlers.onReset);
            });
        }

        if (this.config.showControls && this.agentSelect) {
            this.agentSelect.addEventListener('change', () => this.updateVisibility());
        }
        
        if (this.machineContainers.length > 0) {
            this.machineContainers.forEach(mc => {
                mc.addEventListener('click', (e) => {
                    const machineId = parseInt(e.currentTarget.dataset.machineId);
                    handlers.onMachineClick(machineId);
                });
            });
        }
    }

    reset(initialState, machineProbs) {
        this.updateStateDisplay(initialState);
        this.summaryTableContainer.style.display = 'none';
        this.progressContainer.style.display = 'none';
        this.progressBar.style.width = '0%';
        this.startBtn.textContent = 'Start';
        this.startBtn.disabled = false;
        this.hideViz();
        
        if (this.machineContainers.length > 0) {
            this.machineContainers.forEach((container, index) => {
                container.querySelector('.machine').classList.remove('highlight');
                if (this.config.showPayoutInputs) {
                     container.querySelector('.payout-input').value = (machineProbs[index] * 100).toFixed(0);
                }
            });
        }
    }
    
    getMode() {
        if (this.config.showControls && this.agentSelect) return this.agentSelect.value;
        return this.config.mode || 'manual';
    }

    getScenario() {
        if (this.config.showControls && this.scenarioSelect) return this.scenarioSelect.value;
        return this.config.environmentScenario;
    }

    getCustomPayouts() {
        if (!this.config.showPayoutInputs) return null;
        const customProbs = Array.from(this.payoutInputs).map(input => parseFloat(input.value) / 100);
        return customProbs.map(p => ({ prob: p }));
    }

    getSelectedAgents() {
        if (!this.agentCheckboxes) return AGENT_CONSTRUCTORS;
        const selectedKeys = Array.from(this.agentCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        return AGENT_CONSTRUCTORS.filter(agent => selectedKeys.includes(agent.key));
    }
    
    updateStateDisplay(state) {
        this.moneyEl.textContent = state.money;
        this.roundEl.textContent = state.round;
    }
    
    updateMachineInfo(machineId, history, trueProb) {
        const infoEl = this.machineContainers[machineId].querySelector('.machine-info');
        if (!infoEl) return;

        const { wins, pulls } = history;
        const losses = pulls - wins;
        const winRate = pulls > 0 ? `${((wins / pulls) * 100).toFixed(0)}%` : `0%`;
        let html = `<span class="wins">${wins}</span> | <span class="losses">${losses}</span><br><span class="estimate">${winRate}</span>`;

        if (this.config.showProbabilities) {
            html = `<span class="wins">${wins}</span> | <span class="losses">${losses}</span><br><span class="estimate">True: ${(trueProb * 100).toFixed(0)}% | Est: ${winRate}</span>`;
        }
        infoEl.innerHTML = html;
    }
    
    showFlair(machineId, win, flairText) {
        if (this.machineContainers.length === 0) return;
        const flairEl = this.machineContainers[machineId].querySelector('.machine-flair');
        flairEl.textContent = flairText;
        flairEl.className = `machine-flair ${win ? 'win' : 'loss'}`;
        requestAnimationFrame(() => {
            flairEl.classList.add('show');
            setTimeout(() => flairEl.classList.remove('show'), 600);
        });
    }

    highlightMachine(machineId) {
        this.machineContainers.forEach((container, index) => {
            container.querySelector('.machine').classList.toggle('highlight', index === machineId);
        });
    }

    clearHighlights() {
        if (this.machineContainers.length === 0) return;
         this.machineContainers.forEach(container => {
            container.querySelector('.machine').classList.remove('highlight');
        });
    }

    setButtonState(state) {
        switch(state) {
            case 'running':
                this.startBtn.textContent = 'Pause';
                this.startBtn.disabled = false;
                break;
            case 'paused':
                this.startBtn.textContent = 'Resume';
                this.startBtn.disabled = false;
                break;
            case 'finished':
                this.startBtn.textContent = 'Finished';
                this.startBtn.disabled = true;
                break;
            case 'analysis-running':
                this.startBtn.textContent = 'Running...';
                this.startBtn.disabled = true;
                break;
            case 'initial':
            default:
                this.startBtn.textContent = 'Start';
                this.startBtn.disabled = false;
        }
    }

    showProgress() { this.progressContainer.style.display = 'block'; }
    updateProgress(percent, text) { this.progressBar.style.width = `${percent}%`; this.progressLabel.textContent = text; }
    hideProgress() { this.progressContainer.style.display = 'none'; }
    
    displaySummaryTable(results, valueColumnName) {
        this.summaryTableContainer.querySelector('thead th:last-child').textContent = valueColumnName;
        this.summaryTableBody.innerHTML = '';
        results.sort((a, b) => parseFloat(b.finalScore) - parseFloat(a.finalScore)).forEach(res => {
            const row = this.summaryTableBody.insertRow();
            row.insertCell(0).textContent = res.name;
            row.insertCell(1).textContent = res.finalScore;
        });
        this.summaryTableContainer.style.display = 'block';
    }

    updateUCBViz(ucbComponents) {
        this.vizContainers.forEach((container, i) => {
            container.className = 'viz-container visible ucb-visible';
            const valueBar = container.querySelector('.ucb-value-bar');
            const bonusBar = container.querySelector('.ucb-bonus-bar');
            if (!valueBar || !bonusBar) return;
            const components = ucbComponents[i];
            const maxValue = 5.0; // Normalize for visualization.
            const valueWidth = Math.min(100, ((components.mean * 0.5) / maxValue) * 100);
            const bonusWidth = Math.min(100 - valueWidth, (components.bonus / maxValue) * 100);
            valueBar.style.width = `${valueWidth}%`;
            bonusBar.style.width = `${bonusWidth}%`;
        });
    }

    updateThompsonViz(betaParams) {
        if (this.vizContainers.length === 0) return;
        const { alphas, betas } = betaParams;
        const numPoints = 30;
        const svgWidth = 100;
        const svgHeight = 40;

        this.vizContainers.forEach((container, i) => {
            container.className = 'viz-container visible thompson-visible';
            const path = container.querySelector('.thompson-viz-path');
            if (!path) return;

            const alpha = alphas[i];
            const beta = betas[i];
            const points = [];
            let maxY = 0;

            for (let j = 0; j <= numPoints; j++) {
                const x = j / numPoints;
                let y = 0;
                if (x > 0 && x < 1) {
                    y = Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1);
                } else if (x === 0 && alpha === 1) y = 1;
                else if (x === 1 && beta === 1) y = 1;
                
                if (!isFinite(y)) y = 0;
                points.push({ x, y });
                if (y > maxY) maxY = y;
            }

            if (maxY === 0) maxY = 1;

            let pathData = `M 0,${svgHeight}`;
            points.forEach(p => {
                const px = p.x * svgWidth;
                const py = svgHeight - (p.y / maxY) * svgHeight;
                pathData += ` L ${px.toFixed(2)},${py.toFixed(2)}`;
            });
            pathData += ` L ${svgWidth},${svgHeight} Z`;

            path.setAttribute('d', pathData);
        });
    }

    hideViz() {
        this.vizContainers.forEach(container => container.className = 'viz-container');
    }
}