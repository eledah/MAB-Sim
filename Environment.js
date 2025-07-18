export class Environment {
    constructor() {
        this.defaultMaxRounds = 100;
        this.initialState = {
            money: 100,
            round: 0,
            maxRounds: this.defaultMaxRounds
        };
        this.costPerPull = 1;
        this.defaultRewardPerWin = 2; // Fallback reward
        this.scenario = 'A';
        this.machineConfig = null; // To hold custom machine data from scenario config
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

        // 1. If a full custom config is provided, use it. This is the highest priority.
        if (this.machineConfig) {
            this.machines = this.machineConfig.map(config => ({
                true_probability: config.prob,
                reward: config.reward || this.defaultRewardPerWin
            }));
            return;
        }

        // 2. Handle pre-defined, letter-coded scenarios
        switch (this.scenario) {
            case 'B': // Non-Stationary (Sudden Shift)
                if (this.state.round >= changePoint) {
                    this.machines = [
                        { true_probability: 0.75, reward: this.defaultRewardPerWin },
                        { true_probability: 0.60, reward: this.defaultRewardPerWin },
                        { true_probability: 0.25, reward: this.defaultRewardPerWin },
                        { true_probability: 0.50, reward: this.defaultRewardPerWin }
                    ];
                } else {
                    this.machines = [
                        { true_probability: 0.25, reward: this.defaultRewardPerWin },
                        { true_probability: 0.50, reward: this.defaultRewardPerWin },
                        { true_probability: 0.75, reward: this.defaultRewardPerWin },
                        { true_probability: 0.60, reward: this.defaultRewardPerWin }
                    ];
                }
                break;
            
            case 'D': // Cataclysm (Random Reshuffle)
                if (this.state.round >= changePoint) {
                    // On the first step after the change point, generate and store new probs
                    if (!this.cataclysmProbs) {
                        this.cataclysmProbs = Array.from({length: 4}, () => Math.random() * 0.8 + 0.1); // Random probs between 10% and 90%
                    }
                    this.machines = this.cataclysmProbs.map(p => ({ true_probability: p, reward: this.defaultRewardPerWin }));
                } else {
                    this.cataclysmProbs = null; // Ensure we regenerate on next full run
                    this.machines = [
                        { true_probability: 0.1, reward: this.defaultRewardPerWin },
                        { true_probability: 0.2, reward: this.defaultRewardPerWin },
                        { true_probability: 0.9, reward: this.defaultRewardPerWin }, // One clear winner initially
                        { true_probability: 0.3, reward: this.defaultRewardPerWin }
                    ];
                }
                break;

            case 'A': // Default Stationary
            case 'C': // Restless (starts as stationary)
            case 'E': // Fading Garden (starts as stationary)
            default:
                this.machines = [
                    { true_probability: 0.25, reward: this.defaultRewardPerWin },
                    { true_probability: 0.50, reward: this.defaultRewardPerWin },
                    { true_probability: 0.75, reward: this.defaultRewardPerWin },
                    { true_probability: 0.60, reward: this.defaultRewardPerWin }
                ];
                break;
        }
    }
    
    // --- Public API for the Simulator ---

    /**
     * THE FIX: This method was added to resolve the analysis mode bug.
     * The SimulationRunner needs this to know how many arms the agents should have.
     * @returns {number} The number of machines in the current environment.
     */
    getNumMachines() {
        return this.machines ? this.machines.length : 0;
    }
    
    setMachineConfig(config) {
        this.machineConfig = config;
    }

    setScenario(scenario) {
        this.scenario = scenario;
        this.reset();
    }

    setMaxRounds(newMax) {
        this.initialState.maxRounds = newMax;
        this.state.maxRounds = newMax;
    }

    getMachineProbabilities() {
        return this.machines.map(m => m.true_probability);
    }

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
        // Event triggers that happen ONCE per simulation
        if (this.state.round === changePoint) {
            if (this.scenario === 'B' || this.scenario === 'D') {
                this._createMachines(); // The world changes!
            }
        }
        
        // Events that happen on EVERY step for specific scenarios
        if (this.scenario === 'C') { // Restless Bandits
            this.machines.forEach((machine, index) => {
                // Only non-pulled arms drift
                if (index !== action) {
                    const noise = (Math.random() - 0.5) * 0.02; // Smaller, more frequent drift
                    machine.true_probability = Math.max(0.05, Math.min(0.95, machine.true_probability + noise));
                }
            });
        } else if (this.scenario === 'E') { // Fading Garden
            // Find the current best and second-best arms
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

            // If the best arm was pulled, it fades and the second-best improves
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

        const machine = this.machines[action];
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
        this.state.maxRounds = this.initialState.maxRounds; // Ensure maxRounds is reset
        this.cataclysmProbs = null; // Clear stored probabilities for scenario 'D'
        this._createMachines(); // Initialize machines based on the starting conditions
    }
}