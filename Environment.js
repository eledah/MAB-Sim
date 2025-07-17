export class Environment {
    constructor() {
        this.defaultMaxRounds = 100;
        this.initialState = {
            money: 100,
            round: 0,
            maxRounds: this.defaultMaxRounds
        };
        this.costPerPull = 1;
        this.rewardPerWin = 2;
        this.scenario = 'A';
        this.customProbabilities = null; // For Playground mode
        this.reset();
    }

    _createMachines() {
        // If custom probabilities are set (from Playground), use them.
        if (this.customProbabilities && this.customProbabilities.length === 4) {
            this.machines = this.customProbabilities.map(p => ({ true_probability: p }));
            return;
        }

        const changePoint = Math.floor(this.state.maxRounds / 2);

        if (this.scenario === 'B' && this.state.round >= changePoint) {
            this.machines = [
                { true_probability: 0.75 }, { true_probability: 0.6 },
                { true_probability: 0.25 }, { true_probability: 0.5 }
            ];
        } else {
            // Default stationary probabilities for Scenarios A, C (initially)
            this.machines = [
                { true_probability: 0.25 }, { true_probability: 0.5 },
                { true_probability: 0.75 }, { true_probability: 0.6 }
            ];
        }
    }
    
    // New method for the Playground
    setCustomProbabilities(probs) {
        this.customProbabilities = probs;
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

    step(action) {
        const changePoint = Math.floor(this.state.maxRounds / 2);
        if (this.scenario === 'B' && this.state.round === changePoint) {
            this._createMachines();
        }
        
        // Logic for Restless Bandits (Scenario C)
        if (this.scenario === 'C') {
            this.machines.forEach((machine, index) => {
                if (index !== action) {
                    const noise = (Math.random() - 0.5) * 0.02; // Smaller, more frequent drift
                    machine.true_probability = Math.max(0.05, Math.min(0.95, machine.true_probability + noise));
                }
            });
        }

        if (this.state.money <= 0 || this.state.round >= this.state.maxRounds) {
            return { reward: 0, newState: this.state, win: false, done: true };
        }

        this.state.round++;
        this.state.money -= this.costPerPull;

        const machine = this.machines[action];
        let reward = 0;
        let win = false;

        if (Math.random() < machine.true_probability) {
            reward = this.rewardPerWin;
            this.state.money += reward;
            win = true;
        }
        
        const done = this.state.money <= 0 || this.state.round >= this.state.maxRounds;
        return { reward, newState: this.state, win, done };
    }

    reset() {
        this.state = { ...this.initialState };
        this.state.maxRounds = this.initialState.maxRounds;
        this._createMachines();
    }
}