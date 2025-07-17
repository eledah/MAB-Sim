import Environment from './Environment.js';
import {
    RandomAgent,
    GreedyAgent,
    EpsilonGreedyAgent,
    DecayingEpsilonGreedyAgent,
    UCB1Agent,
    ThompsonSamplingAgent
} from './Agents.js';
import scenarioConfigs from './scenarios/scenario-config.js';
import { restlessFunctions } from './scenarios/restless-functions.js';

// --- STATE & CONFIGURATION ---
let environment = new Environment();
let agent = null;
let simulationRunning = false;
let simulationInterval = null;
let machineHistory = [];
const MONTE_CARLO_RUNS = 200; // Default, can be overridden by scenario config
let currentScenarioId = null; // Will store the ID of the current scenario

// --- DOM ELEMENTS ---
const moneyEl = document.getElementById('current-money');
const roundEl = document.getElementById('current-round');
const machineContainers = document.querySelectorAll('.machine-container');
console.log('Attempting to get elements...');
const agentSelect = document.getElementById('agent-select');
const environmentTypeSelect = document.getElementById('environment-type-select');
const startSimBtn = document.getElementById('start-sim-btn');
const restartBtn = document.getElementById('restart-btn');
const logList = document.getElementById('log-list');
const summaryTableContainer = document.getElementById('summary-table-container');
const summaryTableBody = document.querySelector("#summary-table tbody");
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const progressLabel = document.getElementById('progress-label');
const agentDescriptionEl = document.getElementById('agent-description');
// Removed scenarioTitleEl and scenarioDescriptionEl as they are no longer in index.html
const machineProbabilityEls = document.querySelectorAll('.machine-probability');
const scenarioNavigationEl = document.getElementById('scenario-navigation'); // This might be removed later


let chart;
const chartColors = {
    Random: 'rgba(255, 99, 132, 1)',
    Greedy: 'rgba(54, 162, 235, 1)',
    'Epsilon-Greedy': 'rgba(255, 206, 86, 1)',
    'Decaying ε-Greedy': 'rgba(255, 159, 64, 1)',
    'UCB1': 'rgba(75, 192, 192, 1)',
    'Thompson Sampling': 'rgba(153, 102, 255, 1)',
    'Manual': 'rgba(201, 203, 207, 1)'
};

const allAgentConstructors = [
    { name: 'Random', value: 'random', create: () => new RandomAgent(4) },
    { name: 'Greedy', value: 'greedy', create: () => new GreedyAgent(4) },
    { name: 'Epsilon-Greedy', value: 'epsilonGreedy', create: () => new EpsilonGreedyAgent(4, 0.1) },
    { name: 'Decaying ε-Greedy', value: 'decayingEpsilonGreedy', create: () => new DecayingEpsilonGreedyAgent(4) },
    { name: 'UCB1', value: 'ucb1', create: () => new UCB1Agent(4) },
    { name: 'Thompson Sampling', value: 'thompson', create: () => new ThompsonSamplingAgent(4) },
];

const agentDescriptions = {
    manual: '<h3>Manual Play</h3><p>You control the machines directly. Try to find the best machine by trial and error!</p>',
    random: '<h3>ایده اصلی: انتخاب کاملاً تصادفی</h3><p>این ایجنت هیچ استراتژی خاصی ندارد و در هر دور، یک ماشین را به صورت کاملاً شانسی و تصادفی انتخاب می‌کند. این روش به عنوان یک معیار پایه برای مقایسه عملکرد سایر ایجنت‌ها استفاده می‌شود.</p>',
    greedy: '<h3>ایده اصلی: بهره‌برداری محض</h3><p>پس از یک دور امتحان کردن همه‌ی ماشین‌ها، فقط و فقط به بهترین ماشینی که تا آن لحظه دیده است می‌چسبد. این استراتژی در محیط‌های ثابت سریع است اما قادر به وفق پیدا کردن با تغییرات نیست و ممکن است در یک انتخاب بد اولیه گیر کند.</p>',
    epsilonGreedy: '<h3>ایده اصلی: تعادل بین بهره‌برداری و کشف</h3><p>در اکثر مواقع (با احتمال ۱ منهای اپسیلون) بهترین ماشین را انتخاب می‌کند، اما گاهی اوقات (با احتمال اپسیلون) یک ماشین تصادفی را برای «کشف» انتخاب می‌کند. این کار به آن اجازه می‌دهد تا از گیر افتادن در یک انتخاب بد اولیه جلوگیری کند.</p>',
    decayingEpsilonGreedy: '<h3>ایده اصلی: کشف هوشمند در طول زمان</h3><p>یک نسخه هوشمندتر از اپسیلون-حریص. در ابتدا زیاد کشف می‌کند (اپسیلون بالا) و به مرور زمان که اطلاعات بیشتری کسب می‌کند، کمتر کشف کرده و بیشتر بهره‌برداری می‌کند (اپسیلون به تدریج کاهش می‌یابد).</p>',
    ucb1: '<h3>ایده اصلی: خوش‌بینی در برابر عدم قطعیت</h3><p>این الگوریتم ماشینی را انتخاب می‌کند که هم پتانسیل بالایی برای برد دارد و هم کمتر امتحان شده است. این کار باعث می‌شود تا عدم قطعیت را به شکل مؤثری مدیریت کند و به صورت هوشمندانه به سمت ماشین‌های ناشناخته ولی امیدوارکننده برود.</p>',
    thompson: '<h3>ایده اصلی: تصمیم‌گیری بر اساس باور</h3><p>برای هر ماشین یک توزیع احتمال از نرخ برد واقعی آن نگهداری می‌کند. در هر دور، از «باور» خود یک نمونه می‌گیرد و بهترین نمونه را انتخاب می‌کند. این روش بسیار قدرتمند و کارآمد است و به سرعت با بهترین ماشین منطبق می‌شود.</p>',
    compare: '<h3>Comparative Analysis</h3><p>Runs all agents once and compares their performance on a single chart.</p>',
    monteCarlo: '<h3>Monte Carlo Analysis</h3><p>Runs all agents multiple times (Monte Carlo simulations) to get a more robust average performance comparison.</p>'
};

// --- CHARTING UTILITIES ---
function initChart(chartConfig) {
    const ctx = document.getElementById('performance-chart').getContext('2d');
    if (chart) chart.destroy();
    chart = new Chart(ctx, chartConfig);
}

function getBaseChartOptions(titleText = 'Performance Over Time') {
    return {
        scales: {
            x: { title: { display: true, text: 'Round', color: '#e2e2e2' }, ticks: { color: '#e2e2e2' }, grid: { color: '#444' } },
            y: { title: { display: true, text: 'Money', color: '#e2e2e2' }, ticks: { color: '#e2e2e2' }, grid: { color: '#444' } }
        },
        responsive: true, maintainAspectRatio: false, animation: { duration: 0 },
        plugins: {
            legend: { labels: { color: '#e2e2e2' } },
            title: { display: true, text: titleText, color: '#e2e2e2', font: { size: 16 } }
        }
    };
}

// --- UI & FEEDBACK HELPERS ---
function updateUI(state) {
    moneyEl.textContent = state.money;
    roundEl.textContent = state.round;
}

function showFlair(machineId, win) {
    const flairEl = machineContainers[machineId].querySelector('.machine-flair');
    const netChange = win ? `+${environment.rewardPerWin - environment.costPerPull} 💰` : `-${environment.costPerPull} 💸`;
    flairEl.textContent = netChange;
    flairEl.className = `machine-flair ${win ? 'win' : 'loss'}`;
    requestAnimationFrame(() => {
        flairEl.classList.add('show');
        setTimeout(() => flairEl.classList.remove('show'), 600);
    });
}

function updateMachineHistory(machineId, win) {
    const history = machineHistory[machineId];
    history.pulls++;
    if (win) history.wins++;
    const winRate = history.pulls > 0 ? ((history.wins / history.pulls) * 100).toFixed(0) : 0;
    const historyEl = machineContainers[machineId].querySelector('.machine-history');
    if (historyEl) {
        historyEl.textContent = `(${history.wins}/${history.pulls}) | ${winRate}%`;
    }
}

function updateMachineProbabilities(probabilities) {
    machineProbabilityEls.forEach((el, index) => {
        if (probabilities && probabilities[index] !== undefined) {
            el.textContent = `True Payout: ${(probabilities[index] * 100).toFixed(1)}%`;
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    });
}

function addLog(message) {
    const li = document.createElement('li');
    li.textContent = message;
    logList.prepend(li);
}

function highlightMachine(machineId, active = true) {
    machineContainers.forEach((container, index) => {
        container.querySelector('.machine').classList.toggle('highlight', active && index === machineId);
    });
}

function toggleControls(enable, isPaused = false) {
    startSimBtn.disabled = !enable;
    restartBtn.disabled = !enable;
    // agentSelect.disabled = !enable; // Keep agentSelect disabled as it's scenario-driven
    // scenarioSelect.disabled = !enable; // Keep scenarioSelect disabled as it's page-driven
    if(isPaused) {
         startSimBtn.disabled = false;
    }
}

function toggleGameBoard(enable) {
    machineContainers.forEach(c => c.querySelector('.machine').style.pointerEvents = enable ? 'auto' : 'none');
}

function updateSummaryTable(results, valueColumnName = 'Final Money') {
    summaryTableBody.innerHTML = '';
    document.querySelector('#summary-table th:last-child').textContent = valueColumnName;
    results.sort((a, b) => parseFloat(b.finalMoney) - parseFloat(a.finalMoney)).forEach(res => {
        const row = summaryTableBody.insertRow();
        row.insertCell(0).textContent = res.name;
        row.insertCell(1).textContent = res.finalMoney;
    });
    summaryTableContainer.style.display = 'block';
}

// --- CORE STATE MANAGEMENT ---
function resetUI(scenarioConfig) {
    if (simulationInterval) clearInterval(simulationInterval);
    simulationRunning = false;

    const initialState = environment.getState();
    updateUI(initialState);
    
    const labels = Array.from({ length: initialState.maxRounds + 1 }, (_, i) => i);
    const chartConfig = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: scenarioConfig.agentType === 'manual' ? 'Manual Player' : allAgentConstructors.find(a => a.value === scenarioConfig.agentType)?.name || 'Agent',
                data: [initialState.money],
                borderColor: chartColors[scenarioConfig.agentType === 'manual' ? 'Manual' : allAgentConstructors.find(a => a.value === scenarioConfig.agentType)?.name || 'Manual'],
                borderWidth: 2,
                pointRadius: 0
            }]
        },
        options: getBaseChartOptions()
    };
    initChart(chartConfig);
    
    logList.innerHTML = '';
    summaryTableContainer.style.display = 'none';
    progressContainer.style.display = 'none';
    progressBar.style.width = '0%';
    agentDescriptionEl.style.display = 'none';

    machineHistory = Array(4).fill(null).map(() => ({ wins: 0, pulls: 0 }));
    machineContainers.forEach((container, index) => {
        container.querySelector('.machine').classList.remove('highlight');
        const history = machineHistory[index];
        const historyEl = container.querySelector('.machine-history');
        if (historyEl) {
            historyEl.textContent = `(${history.wins}/${history.pulls}) | 0%`;
        }
    });

    toggleControls(true);
    toggleGameBoard(true);
    startSimBtn.textContent = 'Start Simulation';

    // Update scenario title and description
    scenarioTitleEl.textContent = scenarioConfig.name;
    scenarioDescriptionEl.textContent = scenarioConfig.description;

    // Show/hide probabilities based on scenario config
    if (scenarioConfig.showProbabilities) {
        try {
            const probabilities = environment.getTrueProbabilities();
            updateMachineProbabilities(probabilities);
        } catch (error) {
            console.error('Error getting true probabilities:', error);
            updateMachineProbabilities(null); // Hide probabilities on error
        }
    } else {
        updateMachineProbabilities(null); // Hide probabilities
    }
}

function reset(scenarioConfig) {
    environment.setMaxRounds(scenarioConfig.maxRounds);
    environment.setScenario(scenarioConfig.environmentScenario, scenarioConfig.restlessFunction, scenarioConfig.initialProbabilities);
    if (agent) agent.reset();
    resetUI(scenarioConfig);
}

// --- SIMULATION RUNNERS ---
function handleMachineClick(event) {
    // Only allow manual clicks if the current scenario is manual
    if (currentScenarioId !== 'scenario1' || simulationRunning) return;
    const machineId = parseInt(event.currentTarget.dataset.machineId);
    const { newState, win, done } = environment.step(machineId);
    
    updateUI(newState);
    showFlair(machineId, win);
    updateMachineHistory(machineId, win);
    // Update probabilities if they change (e.g., restless)
    try {
        const probabilities = environment.getTrueProbabilities();
        updateMachineProbabilities(probabilities);
    } catch (error) {
        console.error('Error getting true probabilities in handleMachineClick:', error);
    }

    chart.data.datasets[0].data[newState.round] = newState.money;
    chart.update();
    addLog(`Round ${newState.round}: You chose Machine ${machineId + 1}. Result: ${win ? 'Win' : 'Loss'}. Money: ${newState.money}`);
    
    if (done) {
        toggleGameBoard(false);
        addLog('Game Over! You ran out of money or rounds.');
    }
}

function runSingleAgentSimulation(scenarioConfig) {
    if (simulationRunning) {
        clearInterval(simulationInterval);
        simulationInterval = null;
        simulationRunning = false;
        startSimBtn.textContent = 'Resume Simulation';
        toggleControls(true, true);
    } else {
        simulationRunning = true;
        startSimBtn.textContent = 'Pause Simulation';
        toggleControls(false, true);
        simulationInterval = setInterval(() => runSimulationStep(scenarioConfig), 80);
    }
}

function runSimulationStep(scenarioConfig) {
    const action = agent.chooseAction(environment.getState());
    const { newState, win, done } = environment.step(action);

    agent.update(action, win ? 1 : -1);

    updateUI(newState);
    showFlair(action, win);
    updateMachineHistory(action, win);
    // Update probabilities if they change (e.g., restless)
    try {
        const probabilities = environment.getTrueProbabilities();
        updateMachineProbabilities(probabilities);
    } catch (error) {
        console.error('Error getting true probabilities in runSimulationStep:', error);
    }
    highlightMachine(action);
    chart.data.datasets[0].data[newState.round] = newState.money;
    chart.update('none');
    addLog(`Round ${newState.round}: Agent chose Machine ${action + 1}. Result: ${win ? 'Win' : 'Loss'}. Money: ${newState.money}`);

    if (done) {
        clearInterval(simulationInterval);
        simulationRunning = false;
        startSimBtn.textContent = 'Start Simulation';
        toggleControls(true);
        highlightMachine(action, false);
        addLog('Simulation Finished!');
    }
}

async function runComparativeSimulation(scenarioConfig) {
    reset(scenarioConfig);
    agentDescriptionEl.style.display = 'none';
    // environment.setMaxRounds(scenarioConfig.maxRounds); // Already set in reset
    addLog(`Starting comparative simulation (${scenarioConfig.maxRounds} rounds)...`);
    toggleControls(false);
    
    const datasets = [];
    const results = [];
    const labels = Array.from({ length: environment.getState().maxRounds + 1 }, (_, i) => i);

    // Filter agents based on scenario (e.g., for restless, maybe only show learning agents)
    const agentsToCompare = allAgentConstructors; // For now, compare all. Can be filtered later.

    for (const agentInfo of agentsToCompare) {
        environment.reset(); // Reset environment for each agent run
        const currentAgent = agentInfo.create();
        addLog(`Running ${agentInfo.name} agent...`);

            const moneyHistory = [environment.getState().money];
            let done = false;
            while (!done) {
                const action = currentAgent.chooseAction(environment.getState());
                const { newState, win, done: stepDone } = environment.step(action);
                currentAgent.update(action, win ? 1 : -1);
                moneyHistory.push(newState.money);
                done = stepDone;
            }

            const finalMoney = moneyHistory[moneyHistory.length - 1];
            while (moneyHistory.length <= environment.getState().maxRounds) {
                moneyHistory.push(finalMoney);
            }

            results.push({ name: agentInfo.name, finalMoney: finalMoney });
            datasets.push({ 
                label: agentInfo.name, data: moneyHistory, borderColor: chartColors[agentInfo.name], 
                borderWidth: 2, tension: 0.1, pointRadius: 0
            });
            
            initChart({ type: 'line', data: { labels: labels, datasets }, options: getBaseChartOptions('Comparative Performance (1 Run, 500 Rounds)') });
            await new Promise(r => setTimeout(r, 50));
        }
        
        updateSummaryTable(results);
        toggleControls(true);
        addLog('Comparative simulation finished.');
}

async function runMonteCarloSimulation(scenarioConfig = null) {
        // Use current scenario if no config provided
        if (!scenarioConfig && currentScenarioId) {
            scenarioConfig = scenarioConfigs[currentScenarioId];
        }
        
        if (!scenarioConfig) {
            console.error('No scenario configuration available for Monte Carlo simulation');
            return;
        }
        
        reset(scenarioConfig);
        agentDescriptionEl.style.display = 'none';
        environment.setMaxRounds(500);
        addLog(`Starting Monte Carlo analysis (${MONTE_CARLO_RUNS} runs)...`);
        toggleControls(false);
        progressContainer.style.display = 'block';
        
        const agentsToAnalyze = allAgentConstructors;

        const allRunHistories = {};
        agentsToAnalyze.forEach(a => allRunHistories[a.name] = []);
        const totalSimulations = MONTE_CARLO_RUNS * agentsToAnalyze.length;
        let simulationsDone = 0;

        for (let i = 0; i < MONTE_CARLO_RUNS; i++) {
            for (const agentInfo of agentsToAnalyze) {
                environment.reset();
                const currentAgent = agentInfo.create();
                
                const moneyHistory = [environment.getState().money];
                let done = false;
                while (!done) {
                    const action = currentAgent.chooseAction(environment.getState());
                    const { newState, win, done: stepDone } = environment.step(action);
                    currentAgent.update(action, win ? 1 : -1);
                    moneyHistory.push(newState.money);
                    done = stepDone;
                }

                const finalMoney = moneyHistory[moneyHistory.length - 1];
                while (moneyHistory.length <= environment.getState().maxRounds) {
                    moneyHistory.push(finalMoney);
                }

                allRunHistories[agentInfo.name].push(moneyHistory);
                simulationsDone++;
            }
            const progress = (simulationsDone / totalSimulations) * 100;
            progressBar.style.width = `${progress}%`;
            progressLabel.textContent = `Calculating... (${i + 1}/${MONTE_CARLO_RUNS} runs)`;
            await new Promise(r => setTimeout(r, 0));
        }

        const finalResults = [];
        const chartDatasets = [];
        const labels = Array.from({ length: environment.getState().maxRounds + 1 }, (_, i) => i);
        
        for (const agentInfo of agentsToAnalyze) {
            const histories = allRunHistories[agentInfo.name];
            const meanHistory = [];
            const stdErrorHistory = [];
            const numRounds = histories[0].length;

            for (let round = 0; round < numRounds; round++) {
                const roundValues = histories.map(h => h[round] || 0);
                const mean = roundValues.reduce((a, b) => a + b, 0) / roundValues.length;
                const stdDev = Math.sqrt(roundValues.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / roundValues.length);
                meanHistory.push(mean);
                stdErrorHistory.push(stdDev / Math.sqrt(roundValues.length));
            }
            
            const upperBand = meanHistory.map((m, i) => m + 1.96 * stdErrorHistory[i]);
            const lowerBand = meanHistory.map((m, i) => m - 1.96 * stdErrorHistory[i]);
            
            const baseColor = chartColors[agentInfo.name];
            const transparentColor = baseColor.replace(', 1)', ', 0.2)');

            chartDatasets.push({
                label: agentInfo.name, data: meanHistory, borderColor: baseColor,
                borderWidth: 2.5, tension: 0.1, pointRadius: 0
            });
            chartDatasets.push({
                label: '_hidden_', data: upperBand, fill: '+1', backgroundColor: transparentColor,
                borderColor: 'transparent', pointRadius: 0,
            });
            chartDatasets.push({
                label: '_hidden_', data: lowerBand, fill: false,
                borderColor: 'transparent', pointRadius: 0,
            });
            
            finalResults.push({ name: agentInfo.name, finalMoney: meanHistory[meanHistory.length - 1].toFixed(2) });
        }
        
        const chartOptions = getBaseChartOptions(`Mean Performance (${MONTE_CARLO_RUNS} Runs)`);
        chartOptions.plugins.legend.labels.filter = item => !item.text.includes('_hidden_');

        initChart({ type: 'line', data: { labels: labels, datasets: chartDatasets }, options: chartOptions });
        updateSummaryTable(finalResults, 'Avg. Final Money');
        toggleControls(true);
        progressContainer.style.display = 'none';
        addLog('Monte Carlo analysis finished.');
    }

// --- MAIN CONTROLLER & EVENT LISTENERS ---
function start() {
        const mode = agentSelect.value;
        const scenarioConfig = scenarioConfigs[currentScenarioId];
        
        if (!scenarioConfig) {
            console.error('No current scenario configuration');
            return;
        }
        
        toggleGameBoard(false);
        
        if (agentDescriptions[mode]) {
            agentDescriptionEl.innerHTML = agentDescriptions[mode];
            agentDescriptionEl.style.display = 'block';
        } else {
            agentDescriptionEl.style.display = 'none';
        }

        switch (mode) {
            case 'manual':
                reset(scenarioConfig);
                toggleGameBoard(true);
                return;
            case 'compare':
                runComparativeSimulation(scenarioConfig);
                return;
            case 'monteCarlo':
                runMonteCarloSimulation();
                return;
            default: // All single-agent modes
                if (!simulationRunning) {
                    reset(scenarioConfig);
                    if (agentDescriptions[mode]) {
                        agentDescriptionEl.innerHTML = agentDescriptions[mode];
                        agentDescriptionEl.style.display = 'block';
                    }
                    const agentMap = {
                        random: { create: () => new RandomAgent(4), name: 'Random' },
                        greedy: { create: () => new GreedyAgent(4), name: 'Greedy' },
                        epsilonGreedy: { create: () => new EpsilonGreedyAgent(4, 0.1), name: 'Epsilon-Greedy' },
                        decayingEpsilonGreedy: { create: () => new DecayingEpsilonGreedyAgent(4), name: 'Decaying ε-Greedy' },
                        ucb1: { create: () => new UCB1Agent(4), name: 'UCB1' },
                        thompson: { create: () => new ThompsonSamplingAgent(4), name: 'Thompson Sampling' },
                    };
                    const agentInfo = agentMap[mode];
                    agent = agentInfo.create();
                    
                    const labels = Array.from({ length: environment.getState().maxRounds + 1 }, (_, i) => i);
                    const config = {
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [{ 
                                label: agentInfo.name, 
                                data: [environment.initialState.money], 
                                borderColor: chartColors[agentInfo.name],
                                borderWidth: 2,
                                pointRadius: 0
                            }]
                        },
                        options: getBaseChartOptions()
                    };
                    initChart(config);
                }
                toggleGameBoard(false);
                runSingleAgentSimulation(scenarioConfig);
        }
}

startSimBtn.addEventListener('click', start);
restartBtn.addEventListener('click', () => {
    if (currentScenarioId && scenarioConfigs[currentScenarioId]) {
        reset(scenarioConfigs[currentScenarioId]);
    } else {
        console.error('No current scenario to restart');
    }
});

// --- SCENARIO INITIALIZATION ---
function populateScenarioAndAgentSelects() {
    // Populate Environment Type Select
    environmentTypeSelect.innerHTML = `
        <option value="A" selected>Stationary</option>
        <option value="B">Non-Stationary</option>
        <option value="restless">Restless (Mathematical Functions)</option>
    `;

    // Populate Agent Select (remains the same)
    agentSelect.innerHTML = ''; // Clear existing options
    const manualOption = document.createElement('option');
    manualOption.value = 'manual';
    manualOption.textContent = 'Manual Play';
    agentSelect.appendChild(manualOption);

    const singleAgentOptGroup = document.createElement('optgroup');
    singleAgentOptGroup.label = 'Single Agent Runs';
    allAgentConstructors.forEach(agentInfo => {
        const option = document.createElement('option');
        option.value = agentInfo.value;
        option.textContent = agentInfo.name;
        singleAgentOptGroup.appendChild(option);
    });
    agentSelect.appendChild(singleAgentOptGroup);

    const analysisModesOptGroup = document.createElement('optgroup');
    analysisModesOptGroup.label = 'Analysis Modes';
    const compareOption = document.createElement('option');
    compareOption.value = 'compare';
    compareOption.textContent = 'Compare All Agents (1 Run)';
    analysisModesOptGroup.appendChild(compareOption);
    const monteCarloOption = document.createElement('option');
    monteCarloOption.value = 'monteCarlo';
    monteCarloOption.textContent = 'Monte Carlo (All Agents)';
    analysisModesOptGroup.appendChild(monteCarloOption);
    agentSelect.appendChild(analysisModesOptGroup);
}

// This function will now dynamically create a scenario config
function createDynamicScenarioConfig(agentType, environmentType) {
    let scenarioName = '';
    let description = '';
    let showProbabilities = true; // Default to true for agent-based scenarios

    // Determine name and description based on agent and environment
    const agentName = allAgentConstructors.find(a => a.value === agentType)?.name || (agentType === 'manual' ? 'Manual Play' : agentType);
    
    if (agentType === 'manual') {
        scenarioName = `Manual Play (${environmentType === 'A' ? 'Stationary' : environmentType === 'B' ? 'Non-Stationary' : 'Restless'})`;
        description = `Play manually in a ${environmentType === 'A' ? 'stationary' : environmentType === 'B' ? 'non-stationary' : 'restless'} environment. Try to discover the best machine by trial and error.`;
        showProbabilities = false; // Manual play hides probabilities
    } else if (agentType === 'compare') {
        scenarioName = `Comparative Analysis (${environmentType === 'A' ? 'Stationary' : environmentType === 'B' ? 'Non-Stationary' : 'Restless'})`;
        description = `Compare all agents in a ${environmentType === 'A' ? 'stationary' : environmentType === 'B' ? 'non-stationary' : 'restless'} environment.`;
    } else if (agentType === 'monteCarlo') {
        scenarioName = `Monte Carlo Analysis (${environmentType === 'A' ? 'Stationary' : environmentType === 'B' ? 'Non-Stationary' : 'Restless'})`;
        description = `Run Monte Carlo simulations for all agents in a ${environmentType === 'A' ? 'stationary' : environmentType === 'B' ? 'non-stationary' : 'restless'} environment.`;
    } else {
        scenarioName = `${agentName} Agent (${environmentType === 'A' ? 'Stationary' : environmentType === 'B' ? 'Non-Stationary' : 'Restless'})`;
        description = `Observe a ${agentName} Agent playing in a ${environmentType === 'A' ? 'stationary' : environmentType === 'B' ? 'non-stationary' : 'restless'} environment.`;
    }

    // Add specific descriptions for agent types
    if (agentDescriptions[agentType]) {
        description += ` ${agentDescriptions[agentType].replace(/<\/?h3>|<p>|<\/p>/g, '')}`; // Append agent description without HTML tags
    }

    return {
        name: scenarioName,
        agentType: agentType,
        maxRounds: 500, // Default max rounds
        showProbabilities: showProbabilities,
        environmentScenario: environmentType,
        description: description,
        restlessFunction: environmentType === 'restless' ? 'sinusoidal' : undefined, // Example restless function
        initialProbabilities: environmentType === 'restless' ? [0.25, 0.5, 0.75, 0.6] : undefined // Example initial probabilities
    };
}

export function initializeScenario(agentType, environmentType) {
    // Create a dynamic scenario config based on selections
    const scenarioConfig = createDynamicScenarioConfig(agentType, environmentType);
    
    // Update UI elements based on the selected scenario
    // scenarioTitleEl.textContent = scenarioConfig.name; // Removed
    // scenarioDescriptionEl.textContent = scenarioConfig.description; // Removed
    agentDescriptionEl.innerHTML = `<h3>${scenarioConfig.name}</h3><p>${scenarioConfig.description}</p>`;
    agentDescriptionEl.style.display = 'block';

    // Reset the simulation with the new scenario config
    reset(scenarioConfig);

    // Handle machine click handlers for manual play
    if (scenarioConfig.agentType === 'manual') {
        machineContainers.forEach(container => {
            container.addEventListener('click', handleMachineClick);
        });
        startSimBtn.style.display = 'none'; // Hide start button for manual play
    } else {
        machineContainers.forEach(container => {
            container.removeEventListener('click', handleMachineClick); // Remove if not manual
        });
        startSimBtn.style.display = 'block';
    }

    console.log(`Initialized scenario: ${scenarioConfig.name}`);
}

// Initial setup on page load
document.addEventListener('DOMContentLoaded', () => {
    populateScenarioAndAgentSelects();
    
    // Attach event listeners after elements are populated
    agentSelect.addEventListener('change', () => {
        initializeScenario(agentSelect.value, environmentTypeSelect.value);
    });
    environmentTypeSelect.addEventListener('change', () => {
        initializeScenario(agentSelect.value, environmentTypeSelect.value);
    });
    
    // Initialize with current selections
    initializeScenario(agentSelect.value, environmentTypeSelect.value);
});