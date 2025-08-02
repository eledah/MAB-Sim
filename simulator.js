// simulator.js

import { Environment } from './Environment.js';
import * as Agents from './Agents.js';
import { AGENT_CONSTRUCTORS, AGENT_DESCRIPTIONS } from './constants.js';
import { UIManager } from './UIManager.js';
import { ChartManager } from './ChartManager.js';
import { runAnalysis } from './SimulationRunner.js';

export class Simulator {
    constructor(containerElement, config) {
        this.config = config;
        this.numMachines = 4;

        this.agent = null;
        this.simulationRunning = false;
        this.simulationInterval = null;
        this.machineHistory = [];

        this.ui = new UIManager(containerElement, config);
        this.chartManager = new ChartManager(this.ui.chartCanvas);
        this.environment = new Environment();

        this.ui.addEventListeners({
            onStart: this.start.bind(this),
            onReset: this.reset.bind(this),
            onMachineClick: this.handleMachineClick.bind(this),
        });

        this.reset();
    }

    reset() {
        if (this.simulationInterval) clearInterval(this.simulationInterval);
        this.simulationRunning = false;

        this.environment.setMaxRounds(this.config.maxRounds || 100);
        this.environment.setScenario(this.ui.getScenario());
        this.environment.setMachineConfig(
            this.config.machineConfig || this.ui.getCustomPayouts(),
            this.config.machineConfigAfterChange
        );
        
        this.environment.reset();
        if (this.agent) this.agent.reset();
        
        const initialState = this.environment.getState();
        this.machineHistory = Array(this.numMachines).fill(null).map(() => ({ wins: 0, pulls: 0 }));

        this.ui.reset(initialState, this.environment.getMachineProbabilities());
        this.chartManager.renderSingleRun('Manual', initialState);
        this.machineHistory.forEach((_, i) => this.ui.updateMachineInfo(i, this.machineHistory[i], this.environment.getMachineProbabilities()[i]));
    }

    async start() {
        if (this.simulationRunning) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
            this.simulationRunning = false;
            this.ui.setButtonState('paused');
            return;
        }

        const mode = this.ui.getMode();
        if (mode === 'manual') {
            this.reset();
            return;
        }

        const isAnalysis = mode === 'compare-all' || mode === 'monte-carlo';
        if (isAnalysis) {
            this.ui.setButtonState('analysis-running');
            this.ui.showProgress();
            this.ui.updateProgress(0, 'Preparing analysis...');
            
            const isMonteCarlo = mode === 'monte-carlo';
            const numRuns = isMonteCarlo ? (this.config.numMonteCarloRuns || 100) : 1;
            const maxRounds = this.config.maxRounds || 500;
            
            const results = await runAnalysis(AGENT_CONSTRUCTORS, this.environment, maxRounds, isMonteCarlo, numRuns, 
                (progress, text) => this.ui.updateProgress(progress, text)
            );

            this.chartManager.renderAnalysis(results, maxRounds, isMonteCarlo, numRuns);
            this.ui.displaySummaryTable(results, isMonteCarlo ? 'Avg. Final Score' : 'Final Score');
            this.ui.hideProgress();
            this.ui.setButtonState('finished');
        } else { // Single-agent run
            const agentKey = this.config.agentToRun || mode;
            const agentInfo = AGENT_CONSTRUCTORS.find(a => a.key === agentKey);
            if (!agentInfo) return;

            this.reset();
            this.agent = agentInfo.create(this.numMachines);
            this.chartManager.renderSingleRun(agentInfo.name, this.environment.getState());
            this.ui.hideViz(); // Hide all visualizations by default
            
            this.simulationRunning = true;
            this.ui.setButtonState('running');
            this.simulationInterval = setInterval(() => this.runSimulationStep(), 50);
        }
    }
    
    runSimulationStep() {
        if (!this.agent) return;
        const currentState = this.environment.getState();

        const action = this.agent.chooseAction(currentState);
        const { newState, win, done, reward } = this.environment.step(action);
        this.agent.update(action, reward);
        
        this._updateAfterStep(action, win, reward, newState);

        // Check which agent is running and call the appropriate viz function
        if (this.agent instanceof Agents.UCB1Agent) {
            this.ui.updateUCBViz(this.agent.getUCBComponents());
        } else if (this.agent instanceof Agents.ThompsonSamplingAgent) {
            this.ui.updateThompsonViz(this.agent.getBetaParameters());
        } else {
            // Hide viz for agents that don't have one (Greedy, Random, etc.)
            this.ui.hideViz();
        }

        if (done) {
            clearInterval(this.simulationInterval);
            this.simulationRunning = false;
            this.ui.setButtonState('finished');
            this.ui.clearHighlights();
        }
    }

    handleMachineClick(machineId) {
        const mode = this.ui.getMode();
        if (mode !== 'manual' || this.simulationRunning) return;
        
        const { newState, win, done, reward } = this.environment.step(machineId);
        this._updateAfterStep(machineId, win, reward, newState);
        
        if (done) {
            this.ui.setButtonState('finished');
        }
    }

    _updateAfterStep(action, win, reward, newState) {
        this.machineHistory[action].pulls++;
        if (win) this.machineHistory[action].wins++;
        
        const netChange = win ? `+${reward - this.environment.costPerPull} 💰` : `-${this.environment.costPerPull} 💸`;

        this.ui.updateStateDisplay(newState);
        this.ui.showFlair(action, win, netChange);
        this.ui.updateMachineInfo(action, this.machineHistory[action], this.environment.getMachineProbabilities()[action]);
        this.ui.highlightMachine(action);
        
        const agentName = this.agent ? AGENT_CONSTRUCTORS.find(a => a.key === this.ui.getMode())?.name : 'Manual';
        this.chartManager.updateLine(0, newState.round, newState.money, agentName);
    }
}