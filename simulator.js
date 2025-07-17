import { Environment } from './Environment.js';
import * as Agents from './Agents.js';

export class Simulator {
    constructor(containerElement, config) {
        this.container = containerElement;
        this.config = config;
        
        // --- State Initialization ---
        this.environment = new Environment();
        this.agent = null;
        this.simulationRunning = false;
        this.simulationInterval = null;
        this.machineHistory = [];
        this.chart = null;

        // --- Agent Definitions ---
        this.allAgentConstructors = [
            { key: 'random', name: 'Random', create: () => new Agents.RandomAgent(4) },
            { key: 'greedy', name: 'Greedy', create: () => new Agents.GreedyAgent(4) },
            { key: 'epsilonGreedy', name: 'Epsilon-Greedy', create: () => new Agents.EpsilonGreedyAgent(4, 0.1) },
            { key: 'decayingEpsilonGreedy', name: 'Decaying ε-Greedy', create: () => new Agents.DecayingEpsilonGreedyAgent(4) },
            { key: 'ucb1', name: 'UCB1', create: () => new Agents.UCB1Agent(4) },
            { key: 'thompson', name: 'Thompson Sampling', create: () => new Agents.ThompsonSamplingAgent(4) },
        ];

        // --- Color Palette ---
        this.chartColors = {
            Random: 'rgba(255, 99, 132, 1)', Greedy: 'rgba(54, 162, 235, 1)',
            'Epsilon-Greedy': 'rgba(255, 206, 86, 1)', 'Decaying ε-Greedy': 'rgba(255, 159, 64, 1)',
            'UCB1': 'rgba(75, 192, 192, 1)', 'Thompson Sampling': 'rgba(153, 102, 255, 1)',
            'Manual': 'rgba(201, 203, 207, 1)'
        };
        
        // --- Persian Agent Descriptions ---
        this.agentDescriptions = {
            random: '<h3>ایده اصلی: انتخاب کاملاً تصادفی</h3><p>این عامل هیچ استراتژی خاصی ندارد و در هر مرحله، یک ماشین را به صورت کاملاً شانسی انتخاب می‌کند. این روش به عنوان یک معیار پایه (Baseline) برای سنجش عملکرد سایر استراتژی‌ها استفاده می‌شود.</p>',
            greedy: '<h3>ایده اصلی: بهره‌برداری محض (Pure Exploitation)</h3><p>این عامل پس از یک دور امتحان کردن همه‌ی ماشین‌ها، فقط و فقط به ماشینی که تا آن لحظه بهترین بازدهی را داشته «می‌چسبد». این استراتژی در محیط‌های ثابت سریع است اما قادر به وفق پیدا کردن با تغییرات نیست و ممکن است در یک انتخاب بد اولیه گیر کند.</p>',
            epsilonGreedy: '<h3>ایده اصلی: تعادل ساده بین کشف و بهره‌برداری</h3><p>در اکثر مواقع (با احتمال ۱ منهای اپسیلون ε) بهترین ماشین فعلی را انتخاب می‌کند (بهره‌برداری)، اما گاهی اوقات (با احتمال اپسیلون) یک ماشین تصادفی را برای «کشف» (Exploration) انتخاب می‌کند. این کار به آن اجازه می‌دهد تا از گیر افتادن در یک انتخاب بد اولیه جلوگیری کند.</p>',
            decayingEpsilonGreedy: '<h3>ایده اصلی: کشف هوشمند در طول زمان</h3><p>یک نسخه هوشمندتر از اپسیلون-حریص. این عامل در ابتدا زیاد کشف می‌کند (اپسیلون نزدیک به ۱) و به مرور زمان که اطلاعات بیشتری کسب می‌کند و به تخمین‌های خود مطمئن‌تر می‌شود، کمتر کشف کرده و بیشتر بهره‌برداری می‌کند (اپسیلون به تدریج به سمت صفر کاهش می‌یابد).</p>',
            ucb1: '<h3>ایده اصلی: خوش‌بینی در برابر عدم قطعیت</h3><p>این الگوریتم به صورت هوشمندانه کشف می‌کند. معیاری به نام «کران بالای اطمینان» (Upper Confidence Bound) را برای هر ماشین محاسبه می‌کند که ترکیبی از بازدهی میانگین و یک «امتیاز عدم قطعیت» است. این امتیاز برای ماشین‌هایی که کمتر امتحان شده‌اند بالاتر است و عامل را به سمت کشف گزینه‌های ناشناخته ولی امیدوارکننده سوق می‌دهد.</p>',
            thompson: '<h3>ایده اصلی: نمونه‌برداری بر اساس باور (Belief)</h3><p>یک روش بیزی (Bayesian) و بسیار قدرتمند. به جای یک تخمین واحد، یک توزیع احتمال کامل از نرخ برد احتمالی هر ماشین را نگهداری می‌کند. در هر مرحله، از این توزیع‌ها نمونه‌گیری کرده و بهترین نمونه را انتخاب می‌کند. این روش به طور طبیعی بین کشف و بهره‌برداری تعادل برقرار می‌کند و عملکرد فوق‌العاده‌ای دارد.</p>'
        };

        this._createHTML();
        this._queryDOMElements();
        this._addEventListeners();
        this.reset();
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
                </select>
            </div>
            <div class="control-group">
                <label>Mode:</label>
                <select class="agent-select">
                    <option value="manual">Manual Play</option>
                    <optgroup label="Single Agent Runs">
                        ${this.allAgentConstructors.map(a => `<option value="${a.key}">${a.name}</option>`).join('')}
                    </optgroup>
                    <optgroup label="Analysis Modes">
                        <option value="compare-all">Compare All</option>
                        <option value="monte-carlo">Monte Carlo</option>
                    </optgroup>
                </select>
            </div>
        `;

        this.container.innerHTML = `
            <div class="simulator-wrapper">
                <div class="sim-header">
                    <h2>${this.config.name}</h2>
                    <p>${this.config.description}</p>
                </div>

                ${showControls ? `<div class="controls">${controlsHTML}</div>` : ''}

                <div class="sim-actions">
                    <button class="start-sim-btn">Start</button>
                    <button class="restart-btn">Restart</button>
                </div>

                <div class="progress-container">
                    <div class="progress-bar"></div>
                    <div class="progress-label"></div>
                </div>

                <div class="game-board">
                    ${[...Array(4)].map((_, i) => `
                        <div class="machine-container" data-machine-id="${i}">
                            <div class="machine-flair"></div>
                            <div class="machine">🎰</div>
                            <div class="machine-info"></div>
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
                <div class="agent-description"></div>
                <div class="log-area"><ul></ul></div>
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
        this.logList = this.wrapper.querySelector('.log-area ul');
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
        this.agentDescriptionEl = this.wrapper.querySelector('.agent-description');
    }

    _addEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.restartBtn.addEventListener('click', () => this.reset());
        
        if (this.config.showControls) {
            this.agentSelect.addEventListener('change', () => this.reset());
            this.scenarioSelect.addEventListener('change', () => this.reset());
        }

        if (this.config.showPayoutInputs) {
            this.payoutInputs.forEach(input => {
                input.addEventListener('change', () => this.reset());
            });
        }
        
        this.machineContainers.forEach(mc => {
            mc.addEventListener('click', (e) => {
                const mode = this.config.showControls ? this.agentSelect.value : (this.config.mode || 'manual');
                if (mode === 'manual' && !this.simulationRunning) {
                    this.handleMachineClick(e);
                }
            });
        });
    }

    reset() {
        if (this.simulationInterval) clearInterval(this.simulationInterval);
        this.simulationRunning = false;

        const maxRounds = this.config.maxRounds || 100;
        this.environment.setMaxRounds(maxRounds);

        const envScenario = this.config.showControls ? this.scenarioSelect.value : this.config.environmentScenario;
        this.environment.setScenario(envScenario);
        
        if (this.config.machineConfig) {
            this.environment.setMachineConfig(this.config.machineConfig);
        } else if (this.config.showPayoutInputs) {
            const customProbs = Array.from(this.payoutInputs).map(input => parseFloat(input.value) / 100);
            const customConfig = customProbs.map(p => ({ prob: p }));
            this.environment.setMachineConfig(customConfig);
        } else {
             this.environment.setMachineConfig(null);
        }

        this.environment.reset();
        if (this.agent) this.agent.reset();

        const initialState = this.environment.getState();
        this.updateUI(initialState);
        this.logList.innerHTML = '';
        this.summaryTableContainer.style.display = 'none';
        this.progressContainer.style.display = 'none';
        this.progressBar.style.width = '0%';
        this.startBtn.textContent = 'Start';
        this.startBtn.disabled = false;
        
        this.machineHistory = Array(4).fill(null).map(() => ({ wins: 0, pulls: 0 }));
        this.machineContainers.forEach((container, index) => {
            container.querySelector('.machine').classList.remove('highlight');
            if (this.config.showPayoutInputs) {
                 container.querySelector('.payout-input').value = (this.environment.getMachineProbabilities()[index] * 100).toFixed(0);
            }
            this.updateMachineInfo(index);
        });

        const labels = Array.from({ length: maxRounds + 1 }, (_, i) => i);
        this.initChart({
            type: 'line', data: { labels,
                datasets: [{ label: 'Player Money', data: [initialState.money], borderColor: this.chartColors.Manual, borderWidth: 2, pointRadius: 0 }]
            }, options: this._getBaseChartOptions()
        });
        
        this.agentDescriptionEl.style.display = 'none';
    }

    start() {
        if (this.simulationRunning) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
            this.simulationRunning = false;
            this.startBtn.textContent = 'Resume';
            return;
        }

        const mode = this.config.showControls ? this.agentSelect.value : this.config.mode;

        if (mode === 'manual') {
            this.reset();
            return;
        }
        
        this.logList.innerHTML = '';
        this.machineHistory = Array(4).fill(null).map(() => ({ wins: 0, pulls: 0 }));
        this.environment.reset();
        const initialState = this.environment.getState();
        this.updateUI(initialState);
        this.machineContainers.forEach((c, i) => this.updateMachineInfo(i));

        const agentKey = this.config.showControls ? this.agentSelect.value : (this.config.agentToRun || mode);
        if (this.agentDescriptions[agentKey]) {
            this.agentDescriptionEl.innerHTML = this.agentDescriptions[agentKey];
            this.agentDescriptionEl.style.display = 'block';
        } else {
            this.agentDescriptionEl.style.display = 'none';
        }

        if (mode === 'compare-all') {
            this.runAnalysis('compare-all');
        } else if (mode === 'monte-carlo') {
            this.runAnalysis('monte-carlo');
        } else {
            const agentInfo = this.allAgentConstructors.find(a => a.key === agentKey);
            
            if (agentInfo) {
                this.agent = agentInfo.create();
                const chartConfig = this._getSingleAgentChartConfig(agentInfo.name);
                this.initChart(chartConfig);
                
                this.simulationRunning = true;
                this.startBtn.textContent = 'Pause';
                this.startBtn.disabled = false;
                this.simulationInterval = setInterval(() => this.runSimulationStep(), 50);
            }
        }
    }

    runSimulationStep() {
        if(!this.agent) return;
        const action = this.agent.chooseAction(this.environment.getState());
        const { newState, win, done } = this.environment.step(action);

        this.agent.update(action, win ? 1 : -1);
        this.updateUI(newState);
        this.showFlair(action, win);
        this.updateMachineInfo(action, win, true);
        this.highlightMachine(action);

        this.chart.data.datasets[0].data[newState.round] = newState.money;
        this.chart.update('none');

        if (done) {
            clearInterval(this.simulationInterval);
            this.simulationRunning = false;
            this.startBtn.textContent = 'Finished';
            this.startBtn.disabled = true;
            this.highlightMachine(action, false);
        }
    }

    async runAnalysis(mode) {
        this.startBtn.disabled = true;
        this.restartBtn.disabled = false;
        const isMonteCarlo = mode === 'monte-carlo';
        const numRuns = isMonteCarlo ? (this.config.numMonteCarloRuns || 100) : 1;
        
        const maxRounds = this.config.maxRounds || 500;
        this.environment.setMaxRounds(maxRounds);

        if(isMonteCarlo) this.progressContainer.style.display = 'block';

        const allRunHistories = {};
        this.allAgentConstructors.forEach(a => allRunHistories[a.name] = []);

        for (let i = 0; i < numRuns; i++) {
            for (const agentInfo of this.allAgentConstructors) {
                this.environment.reset();
                const currentAgent = agentInfo.create();
                
                const moneyHistory = [this.environment.getState().money];
                let done = false;
                while (!done) {
                    const action = currentAgent.chooseAction(this.environment.getState());
                    const { newState, win, done: stepDone } = this.environment.step(action);
                    currentAgent.update(action, win ? 1 : -1);
                    moneyHistory.push(newState.money);
                    done = stepDone;
                }

                const finalMoney = moneyHistory[moneyHistory.length - 1];
                while (moneyHistory.length <= maxRounds) {
                    moneyHistory.push(finalMoney > 0 ? finalMoney : 0);
                }
                allRunHistories[agentInfo.name].push(moneyHistory);
            }
            if(isMonteCarlo) {
                 const progress = ((i + 1) / numRuns) * 100;
                 this.progressBar.style.width = `${progress}%`;
                 this.progressLabel.textContent = `Calculating... (${i + 1}/${numRuns} runs)`;
                 await new Promise(r => setTimeout(r, 0));
            }
        }

        const finalResults = [];
        const chartDatasets = [];
        const labels = Array.from({ length: maxRounds + 1 }, (_, i) => i);
        
        for (const agentInfo of this.allAgentConstructors) {
             const histories = allRunHistories[agentInfo.name];
             const meanHistory = this._calculateMeanHistory(histories, maxRounds);
             
             if(isMonteCarlo) {
                 const { upperBand, lowerBand } = this._calculateErrorBands(histories, meanHistory, maxRounds);
                 const baseColor = this.chartColors[agentInfo.name];
                 const transparentColor = baseColor.replace(', 1)', ', 0.2)');
                 chartDatasets.push({ label: agentInfo.name, data: meanHistory, borderColor: baseColor, borderWidth: 2.5, pointRadius: 0 });
                 chartDatasets.push({ label: '_hidden_', data: upperBand, fill: '+1', backgroundColor: transparentColor, borderColor: 'transparent', pointRadius: 0 });
                 chartDatasets.push({ label: '_hidden_', data: lowerBand, fill: false, borderColor: 'transparent', pointRadius: 0 });
             } else {
                 chartDatasets.push({ label: agentInfo.name, data: meanHistory, borderColor: this.chartColors[agentInfo.name], borderWidth: 2, pointRadius: 0 });
             }
             finalResults.push({ name: agentInfo.name, finalMoney: meanHistory[maxRounds].toFixed(2) });
        }
        
        const title = isMonteCarlo ? `Mean Performance (${numRuns} Runs)` : `Comparative Performance (1 Run)`;
        const chartOptions = this._getBaseChartOptions(title);
        if (isMonteCarlo) chartOptions.plugins.legend.labels.filter = item => !item.text.includes('_hidden_');

        this.initChart({ type: 'line', data: { labels, datasets: chartDatasets }, options: chartOptions });
        this.updateSummaryTable(finalResults, isMonteCarlo ? 'Avg. Final Score' : 'Final Score');
        if(isMonteCarlo) this.progressContainer.style.display = 'none';
        this.startBtn.disabled = true;
        this.startBtn.textContent = 'Finished';
    }

    _calculateMeanHistory(histories, maxRounds) {
        const meanHistory = [];
        for (let round = 0; round <= maxRounds; round++) {
            const roundValues = histories.map(h => h[round] || 0);
            meanHistory.push(roundValues.reduce((a, b) => a + b, 0) / histories.length);
        }
        return meanHistory;
    }

    _calculateErrorBands(histories, meanHistory, maxRounds) {
        const stdErrorHistory = [];
        for (let round = 0; round <= maxRounds; round++) {
            const roundValues = histories.map(h => h[round] || 0);
            const mean = meanHistory[round];
            const stdDev = Math.sqrt(roundValues.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / roundValues.length);
            stdErrorHistory.push(stdDev / Math.sqrt(roundValues.length));
        }
        const upperBand = meanHistory.map((m, i) => m + 1.96 * stdErrorHistory[i]);
        const lowerBand = meanHistory.map((m, i) => m - 1.96 * stdErrorHistory[i]);
        return { upperBand, lowerBand };
    }

    updateMachineInfo(machineId, wasWin = false, pullOccurred = false) {
        const infoEl = this.machineContainers[machineId].querySelector('.machine-info');
        if (!infoEl) return;

        if (pullOccurred) {
            this.machineHistory[machineId].pulls++;
            if (wasWin) this.machineHistory[machineId].wins++;
        }
        
        const { wins, pulls } = this.machineHistory[machineId];
        const winRate = pulls > 0 ? `${((wins / pulls) * 100).toFixed(0)}%` : `0%`;
        let historyText = `(${wins}/${pulls}) | Est: ${winRate}`;

        if (this.config.showProbabilities) {
            const trueProb = (this.environment.getMachineProbabilities()[machineId] * 100).toFixed(0);
            historyText = `True: ${trueProb}% | Est: ${winRate}`;
        }
        infoEl.textContent = historyText;
    }
    
    handleMachineClick(event) {
        if(this.simulationRunning) return;
        const machineId = parseInt(event.currentTarget.dataset.machineId);
        const { newState, win, done } = this.environment.step(machineId);
        
        this.updateUI(newState);
        this.showFlair(machineId, win);
        this.updateMachineInfo(machineId, win, true);

        this.chart.data.datasets[0].data[newState.round] = newState.money;
        this.chart.update('none');
        
        if (done) {
            this.startBtn.disabled = true;
            this.startBtn.textContent = "Finished";
        }
    }
    
    initChart(chartConfig) {
        if (this.chart) this.chart.destroy();
        this.chart = new Chart(this.chartCanvas.getContext('2d'), chartConfig);
    }

    _getBaseChartOptions(titleText = 'Performance Over Time') {
        return {
            scales: { 
                x: { 
                    title: { display: true, text: 'Round', color: '#e2e2e2' }, 
                    ticks: { color: '#e2e2e2' }, 
                    grid: { color: '#444' } 
                }, 
                y: { 
                    title: { display: true, text: 'Money', color: '#e2e2e2' }, 
                    ticks: { color: '#e2e2e2' }, 
                    grid: { color: '#444' } 
                } 
            },
            responsive: true, maintainAspectRatio: false, animation: { duration: 0 },
            plugins: {
                legend: { labels: { color: '#e2e2e2' } },
                title: { display: true, text: titleText, color: '#e2e2e2', font: { size: 16 } }
            }
        };
    }
    
     _getSingleAgentChartConfig(agentName) {
        const maxRounds = this.environment.getState().maxRounds;
        return {
            type: 'line',
            data: {
                labels: Array.from({ length: maxRounds + 1 }, (_, i) => i),
                datasets: [{
                    label: agentName,
                    data: [this.environment.getState().money],
                    borderColor: this.chartColors[agentName],
                    borderWidth: 2,
                    pointRadius: 0
                }]
            },
            options: this._getBaseChartOptions()
        };
    }
    
    updateUI(state) {
        this.moneyEl.textContent = state.money;
        this.roundEl.textContent = state.round;
    }

    showFlair(machineId, win) {
        const flairEl = this.machineContainers[machineId].querySelector('.machine-flair');
        const netChange = win ? `+${this.environment.rewardPerWin - this.environment.costPerPull} 💰` : `-${this.environment.costPerPull} 💸`;
        flairEl.textContent = netChange;
        flairEl.className = `machine-flair ${win ? 'win' : 'loss'}`;
        requestAnimationFrame(() => {
            flairEl.classList.add('show');
            setTimeout(() => flairEl.classList.remove('show'), 600);
        });
    }

    highlightMachine(machineId, active = true) {
        this.machineContainers.forEach((container, index) => {
            container.querySelector('.machine').classList.toggle('highlight', active && index === machineId);
        });
    }

    updateSummaryTable(results, valueColumnName) {
        const tableBody = this.summaryTableContainer.querySelector('tbody');
        this.summaryTableContainer.querySelector('thead th:last-child').textContent = valueColumnName;
        tableBody.innerHTML = '';
        results.sort((a, b) => parseFloat(b.finalMoney) - parseFloat(a.finalMoney)).forEach(res => {
            const row = tableBody.insertRow();
            row.insertCell(0).textContent = res.name;
            row.insertCell(1).textContent = res.finalMoney;
        });
        this.summaryTableContainer.style.display = 'block';
    }
}