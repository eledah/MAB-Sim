// scenario-config.js

const stationaryConfig = [
    { prob: 0.25, reward: 2 }, { prob: 0.50, reward: 2 },
    { prob: 0.75, reward: 2 }, { prob: 0.60, reward: 2 }
];

const nonStationaryBefore = [
    { prob: 0.25, reward: 2 }, { prob: 0.50, reward: 2 },
    { prob: 0.75, reward: 2 }, { prob: 0.60, reward: 2 }
];
const nonStationaryAfter = [
    { prob: 0.75, reward: 2 }, { prob: 0.60, reward: 2 },
    { prob: 0.25, reward: 2 }, { prob: 0.50, reward: 2 }
];

const cataclysmBefore = [
    { prob: 0.1, reward: 2 }, { prob: 0.2, reward: 2 },
    { prob: 0.9, reward: 2 }, { prob: 0.3, reward: 2 }
];

export const scenarios = {
    'scenario-1': {
        name: 'Manual Play Playground', mode: 'manual',
        description: 'Try to find the best machine by clicking on them yourself. Keep an eye on the history below each one!',
        machineConfig: stationaryConfig
    },
    'scenario-2': {
        name: 'Random Agent (True Payout Displayed)', mode: 'single-agent', agentToRun: 'random', showProbabilities: true,
        description: 'The Random Agent selects machines with no strategy. Notice how its performance compares to the true probabilities, now visible to you.',
        machineConfig: stationaryConfig
    },
    'scenario-3': {
        name: 'The Greedy Agent', mode: 'single-agent', agentToRun: 'greedy', showProbabilities: true,
        description: 'The Greedy Agent explores each machine once, then locks onto the best one it found. Run it a few times. Does it always find the *truly* best machine (75%)?',
        environmentScenario: 'A', machineConfig: stationaryConfig
    },
    'scenario-4': {
        name: 'Epsilon-Greedy Agent', mode: 'single-agent', agentToRun: 'epsilonGreedy',
        description: 'This agent mostly exploits, but sometimes takes a random action to explore. This helps it avoid getting stuck on a suboptimal choice.',
        environmentScenario: 'A', machineConfig: stationaryConfig
    },
    'scenario-5': {
        name: 'Decaying Epsilon-Greedy Agent', mode: 'single-agent', agentToRun: 'decayingEpsilonGreedy',
        description: 'This agent explores a lot at first, then gradually reduces exploration as it becomes more confident. This is often more efficient than fixed exploration.',
        environmentScenario: 'A', machineConfig: stationaryConfig
    },
    'scenario-6': {
        name: 'UCB1 Agent', mode: 'single-agent', agentToRun: 'ucb1',
        description: 'UCB1 intelligently explores by preferring machines that are both promising and have not been tried many times (high uncertainty).',
        environmentScenario: 'A', machineConfig: stationaryConfig
    },
    'scenario-7': {
        name: 'Thompson Sampling Agent', mode: 'single-agent', agentToRun: 'thompson',
        description: 'A sophisticated Bayesian agent that maintains a probability distribution of what the true win rate might be for each machine and samples from it to choose an action.',
        environmentScenario: 'A', machineConfig: stationaryConfig
    },
    'scenario-8': {
        name: 'Comparing All Agents (Stable Environment)', mode: 'compare-all', maxRounds: 500,
        description: 'See all agents compete on the same playing field. Which strategy wins when the machine probabilities are stable?',
        environmentScenario: 'A', machineConfig: stationaryConfig
    },
    'scenario-9': {
        name: 'Monte Carlo Analysis (Stable Environment)', mode: 'monte-carlo', maxRounds: 500, numMonteCarloRuns: 100,
        description: 'This runs the simulation 100 times and averages the results to show each agent\'s true long-term performance. Note how the advanced agents clearly separate from the pack.',
        environmentScenario: 'A', machineConfig: stationaryConfig
    },
    'scenario-10': {
        name: 'Monte Carlo Analysis (Non-Stationary)', mode: 'monte-carlo', maxRounds: 500, numMonteCarloRuns: 100,
        description: 'The environment is unstable: the best machine becomes the worst halfway through. Notice the Greedy agent\'s failure to adapt, while agents that keep exploring perform much better.',
        environmentScenario: 'B', machineConfig: nonStationaryBefore, machineConfigAfterChange: nonStationaryAfter
    },
    'scenario-11': {
        name: 'Monte Carlo Analysis (Restless Bandits)', mode: 'monte-carlo', maxRounds: 500, numMonteCarloRuns: 100,
        description: 'In this scenario, the win rates of machines you don\'t play drift randomly. This requires constant re-evaluation. Which agents excel when the world is always shifting?',
        environmentScenario: 'C', machineConfig: stationaryConfig // Restless starts stationary
    },
    'scenario-12': {
        name: 'The Treasure Hunter (High Risk, High Reward)', mode: 'monte-carlo', maxRounds: 500, numMonteCarloRuns: 100, showProbabilities: true,
        description: 'Three machines have small, reliable payouts, but one is a "treasure chest" with a low chance of a massive reward. Which strategy is brave enough to find it?',
        machineConfig: [ { prob: 0.5, reward: 2 }, { prob: 0.6, reward: 2 }, { prob: 0.05, reward: 50 }, { prob: 0.4, reward: 2 } ]
    },
    'scenario-13': {
        name: '"The Cataclysm" (Sudden, Drastic Change)', mode: 'monte-carlo', maxRounds: 500, numMonteCarloRuns: 100,
        description: 'A stable world with a clear winner is turned upside down halfway through the simulation. This is a brutal test of an agent\'s ability to adapt to unforeseen, radical change.',
        environmentScenario: 'D', machineConfig: cataclysmBefore // After-change is handled dynamically in Environment.js
    },
    'scenario-14': {
        name: '"The Fading Garden" (Gradual Obsolescence)', mode: 'monte-carlo', maxRounds: 1000, numMonteCarloRuns: 100,
        description: 'The best machine slowly becomes less effective over time, while the second-best improves. This tests an agent\'s ability to notice and adapt to gradual, subtle changes rather than sudden shocks.',
        environmentScenario: 'E', machineConfig: stationaryConfig // Fading Garden starts stationary
    },
    'playground': {
        name: 'The Ultimate Playground', mode: 'playground', showControls: true, showProbabilities: true, showPayoutInputs: true, maxRounds: 500,
        description: 'Configure everything! Set custom payout rates, change the scenario, and run any agent or analysis mode you want to test your own hypotheses.',
        environmentScenario: 'A', machineConfig: stationaryConfig
    }
};