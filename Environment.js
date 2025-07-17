class Environment {
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
        this.reset();
    }

    _createMachines() {
        // ENHANCEMENT: Make the non-stationary change point dynamic (halfway through the game)
        const changePoint = Math.floor(this.state.maxRounds / 2);

        if (this.scenario === 'B' && this.state.round >= changePoint) {
             // Non-stationary: Probabilities have flipped
            this.machines = [
                { true_probability: 0.75 }, // Was 0.25
                { true_probability: 0.6 },  // Was 0.5
                { true_probability: 0.25 }, // Was 0.75
                { true_probability: 0.5 }   // Was 0.6
            ];
        } else {
            // Default stationary probabilities
            this.machines = [
                { true_probability: 0.25 },
                { true_probability: 0.5 },
                { true_probability: 0.75 },
                { true_probability: 0.6 }
            ];
        }
    }

    setScenario(scenario, restlessFunction = null, initialProbabilities = null) {
        this.scenario = scenario;
        this.restlessFunction = restlessFunction;
        this.initialProbabilities = initialProbabilities;
        this.reset();
    }

    setMaxRounds(newMax) {
        this.initialState.maxRounds = newMax;
        this.state.maxRounds = newMax;
    }

    getState() {
        return { ...this.state };
    }

    step(action) {
        // ENHANCEMENT: Check for the change at the dynamic halfway point
        const changePoint = Math.floor(this.state.maxRounds / 2);
        if (this.scenario === 'B' && this.state.round === changePoint) {
            this._createMachines(); // The world changes!
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

    getTrueProbabilities() {
        return this.machines.map(machine => machine.true_probability);
    }
}

export default Environment;