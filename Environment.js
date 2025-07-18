// Environment.js

export class Environment {
    constructor() {
        this.defaultMaxRounds = 100;
        this.initialState = {
            money: 100,
            round: 0,
            maxRounds: this.defaultMaxRounds
        };
        this.costPerPull = 1;
        this.defaultRewardPerWin = 2;
        this.scenario = 'A';
        
        // Config placeholders
        this.machineConfig = null;
        this.machineConfigAfterChange = null;
        
        this.cataclysmProbs = null; // Used to store shuffled probabilities in scenario D
        this.reset();
    }

    /**
     * Creates or updates the machine probabilities based on the current scenario and round.
     * This is the core logic for all the different environmental challenges.
     * @private
     */
    _createMachines() {
        const changePoint = Math.floor(this.state.maxRounds / 2);

        // Scenario 'D' is a special case that dynamically creates its after-change state
        if (this.scenario === 'D' && this.state.round >= changePoint) {
            if (!this.cataclysmProbs) {
                this.cataclysmProbs = Array.from({length: 4}, () => Math.random() * 0.8 + 0.1); // Random probs between 10% and 90%
            }
            this.machines = this.cataclysmProbs.map(p => ({ true_probability: p, reward: this.defaultRewardPerWin }));
        } 
        // All other scenarios are handled by the provided configs
        else if (this.state.round >= changePoint && this.machineConfigAfterChange) {
            this.machines = this.machineConfigAfterChange.map(config => ({
                true_probability: config.prob,
                reward: config.reward || this.defaultRewardPerWin
            }));
        } else if (this.machineConfig) {
            this.machines = this.machineConfig.map(config => ({
                true_probability: config.prob,
                reward: config.reward || this.defaultRewardPerWin
            }));
        } else {
            // Safety fallback in case no config is provided
            this.machines = Array(4).fill(null).map(() => ({ true_probability: 0.5, reward: 2 }));
        }
    }
    
    // --- Public API for the Simulator ---

    /**
     * The SimulationRunner needs this to know how many arms the agents should have.
     * @returns {number} The number of machines in the current environment.
     */
    getNumMachines() {
        return this.machines ? this.machines.length : 0;
    }
    
    /**
     * Receives the machine configurations from the main Simulator class.
     * @param {Array<object>} primaryConfig - The initial configuration for the machines.
     * @param {Array<object>|null} afterChangeConfig - The configuration after a non-stationary change.
     */
    setMachineConfig(primaryConfig, afterChangeConfig = null) {
        this.machineConfig = primaryConfig;
        this.machineConfigAfterChange = afterChangeConfig;
    }

    /**
     * Sets the identifier for the current scenario (e.g., 'C' for Restless).
     * This is used to trigger dynamic, per-step environmental changes.
     * @param {string} scenario - The scenario identifier.
     */
    setScenario(scenario) {
        this.scenario = scenario;
    }
    
    /**
     * Sets the maximum number of rounds for the simulation.
     * @param {number} newMax - The new maximum round count.
     */
    setMaxRounds(newMax) {
        this.initialState.maxRounds = newMax;
    }

    /**
     * @returns {Array<number>} An array of the true probabilities for each machine.
     */
    getMachineProbabilities() {
        return this.machines.map(m => m.true_probability);
    }

    /**
     * @returns {object} A copy of the current environment state.
     */
    getState() {
        return { ...this.state };
    }

    /**
     * The core interaction logic. An agent performs an action, and the environment returns the result.
     * @param {number} action - The index of the machine to pull.
     * @returns {{reward: number, newState: object, win: boolean, done: boolean}} The outcome of the action.
     */
    step(action) {
        // --- Handle Environmental Shifts ---

        const changePoint = Math.floor(this.state.maxRounds / 2);
        // Event triggers that happen ONCE per simulation for sudden changes
        if (this.state.round === changePoint && (this.scenario === 'B' || this.scenario === 'D')) {
            this._createMachines(); // The world changes!
        }
        
        // Events that happen on EVERY step for gradual changes
        if (this.scenario === 'C') { // Restless Bandits
            this.machines.forEach((machine, index) => {
                if (index !== action) { // Only non-pulled arms drift
                    const noise = (Math.random() - 0.5) * 0.02;
                    machine.true_probability = Math.max(0.05, Math.min(0.95, machine.true_probability + noise));
                }
            });
        } else if (this.scenario === 'E') { // Fading Garden
            let bestIndex = -1, secondBestIndex = -1;
            let maxProb = -1, secondMaxProb = -1;
            this.machines.forEach((m, i) => {
                if (m.true_probability > maxProb) {
                    secondMaxProb = maxProb; secondBestIndex = bestIndex;
                    maxProb = m.true_probability; bestIndex = i;
                } else if (m.true_probability > secondMaxProb) {
                    secondMaxProb = m.true_probability; secondBestIndex = i;
                }
            });

            if (action === bestIndex && bestIndex !== -1 && secondBestIndex !== -1) {
                this.machines[bestIndex].true_probability -= 0.001;
                this.machines[secondBestIndex].true_probability += 0.0005;
            }
        }

        // --- Execute the Action and Calculate Reward ---

        if (this.state.money <= 0 || this.state.round >= this.state.maxRounds) {
            return { reward: 0, newState: this.state, win: false, done: true };
        }

        this.state.round++;
        this.state.money -= this.costPerPull;

        // Ensure action is valid to prevent crashes from faulty agents
        const machine = this.machines[action] || { true_probability: 0, reward: 0 };
        
        let reward = 0;
        let win = false;

        if (Math.random() < machine.true_probability) {
            reward = machine.reward;
            this.state.money += reward;
            win = true;
        }
        
        const done = this.state.money <= 0 || this.state.round >= this.state.maxRounds;
        return { reward, newState: this.state, win, done };
    }

    /**
     * Resets the environment to its initial state for a new simulation run.
     */
    reset() {
        this.state = { ...this.initialState };
        this.state.maxRounds = this.initialState.maxRounds;
        this.cataclysmProbs = null;
        this._createMachines();
    }
}