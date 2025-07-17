// Base class for all agents
class Agent {
    constructor(numMachines) {
        this.numMachines = numMachines;
    }

    chooseAction(state) {
        throw new Error("ChooseAction method must be implemented by subclass");
    }

    update(action, reward) {}

    reset() {}
}

// --- STANDARD AGENTS ---

export class RandomAgent extends Agent {
    chooseAction() {
        return Math.floor(Math.random() * this.numMachines);
    }
}

export class GreedyAgent extends Agent {
    constructor(numMachines) {
        super(numMachines);
        this.reset();
    }

    reset() {
        this.q_values = Array(this.numMachines).fill(0);
        this.action_counts = Array(this.numMachines).fill(0);
        this.exploration_phase = true;
        this.next_action = 0;
    }

    chooseAction() {
        if (this.exploration_phase) {
            const action = this.next_action;
            this.next_action++;
            if (this.next_action >= this.numMachines) {
                this.exploration_phase = false;
            }
            return action;
        } else {
            const maxQ = Math.max(...this.q_values);
            const bestActions = this.q_values
                .map((q, i) => (q === maxQ ? i : -1))
                .filter(i => i !== -1);
            return bestActions[Math.floor(Math.random() * bestActions.length)];
        }
    }

    update(action, reward) {
        this.action_counts[action]++;
        this.q_values[action] += (reward - this.q_values[action]) / this.action_counts[action];
    }
}

export class EpsilonGreedyAgent extends Agent {
    constructor(numMachines, epsilon = 0.1) {
        super(numMachines);
        this.epsilon = epsilon;
        this.reset();
    }

    reset() {
        this.q_values = Array(this.numMachines).fill(0);
        this.action_counts = Array(this.numMachines).fill(0);
    }

    chooseAction() {
        if (Math.random() < this.epsilon) {
            return Math.floor(Math.random() * this.numMachines);
        } else {
            const maxQ = Math.max(...this.q_values);
            const bestActions = this.q_values
                .map((q, i) => (q === maxQ ? i : -1))
                .filter(i => i !== -1);
            return bestActions[Math.floor(Math.random() * bestActions.length)];
        }
    }

    update(action, reward) {
        this.action_counts[action]++;
        this.q_values[action] += (reward - this.q_values[action]) / this.action_counts[action];
    }
}


// --- ADVANCED AGENTS ---

export class DecayingEpsilonGreedyAgent extends EpsilonGreedyAgent {
    constructor(numMachines, decayRate = 0.01) {
        super(numMachines, 1.0);
        this.initialEpsilon = 1.0;
        this.decayRate = decayRate;
    }
    
    reset() {
        super.reset();
        this.epsilon = this.initialEpsilon;
    }

    chooseAction(state) {
        this.epsilon = this.initialEpsilon / (1.0 + this.decayRate * state.round);
        return super.chooseAction();
    }
}

export class UCB1Agent extends Agent {
    constructor(numMachines) {
        super(numMachines);
        this.reset();
    }

    reset() {
        this.q_values = Array(this.numMachines).fill(0);
        this.action_counts = Array(this.numMachines).fill(0);
    }

    chooseAction(state) {
        const total_pulls = state.round + 1;

        for (let i = 0; i < this.numMachines; i++) {
            if (this.action_counts[i] === 0) {
                return i;
            }
        }

        const ucb_scores = this.q_values.map((sum_reward, i) => {
            const mean_reward = sum_reward / this.action_counts[i];
            const exploration_bonus = Math.sqrt((2 * Math.log(total_pulls)) / this.action_counts[i]);
            return mean_reward + exploration_bonus;
        });
        
        const maxScore = Math.max(...ucb_scores);
        return ucb_scores.indexOf(maxScore);
    }

    update(action, reward) {
        this.action_counts[action]++;
        this.q_values[action] += (reward > 0 ? 1 : 0);
    }
}

export class ThompsonSamplingAgent extends Agent {
    constructor(numMachines) {
        super(numMachines);
        this.reset();
    }

    reset() {
        this.alphas = Array(this.numMachines).fill(1);
        this.betas = Array(this.numMachines).fill(1);
    }

    _sampleGamma(shape) {
        let sum = 0;
        for (let i = 0; i < shape; i++) {
            sum += -Math.log(1.0 - Math.random());
        }
        return sum;
    }

    _sampleBeta(alpha, beta) {
        const sample_gamma_alpha = this._sampleGamma(alpha);
        const sample_gamma_beta = this._sampleGamma(beta);
        return sample_gamma_alpha / (sample_gamma_alpha + sample_gamma_beta);
    }
    
    chooseAction() {
        const samples = this.alphas.map((alpha, i) => this._sampleBeta(alpha, this.betas[i]));
        const maxSample = Math.max(...samples);
        return samples.indexOf(maxSample);
    }
    
    update(action, reward) {
        if (reward > 0) {
            this.alphas[action]++;
        } else {
            this.betas[action]++;
        }
    }
}