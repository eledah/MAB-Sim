// scenario-config.js

export const scenarios = {
    // --- SCENARIO 1: Manual Play ---
    'scenario-1': {
        name: 'Manual Play Playground',
        mode: 'manual',
        description: 'Try to find the best machine by clicking on them yourself. Keep an eye on the history below each one!'
    },

    // --- SCENARIO 2: Random Agent ---
    'scenario-2': {
        name: 'Random Agent (True Payout Displayed)',
        mode: 'single-agent',
        agentToRun: 'random',
        showProbabilities: true,
        description: 'The Random Agent selects machines with no strategy. Notice how its performance compares to the true probabilities, now visible to you.'
    },

    // --- SCENARIO 3: Greedy Agent ---
    'scenario-3': {
        name: 'The Greedy Agent',
        mode: 'single-agent',
        agentToRun: 'greedy',
        showProbabilities: true,
        environmentScenario: 'A',
        description: 'The Greedy Agent explores each machine once, then locks onto the best one it found. Run it a few times. Does it always find the *truly* best machine (75%)?'
    },

    // --- SCENARIOS 4-7: Other Single Agents ---
    'scenario-4': {
        name: 'Epsilon-Greedy Agent',
        mode: 'single-agent',
        agentToRun: 'epsilonGreedy',
        showProbabilities: false,
        environmentScenario: 'A',
        description: 'This agent mostly exploits, but sometimes takes a random action to explore. This helps it avoid getting stuck on a suboptimal choice.'
    },
    'scenario-5': {
        name: 'Decaying Epsilon-Greedy Agent',
        mode: 'single-agent',
        agentToRun: 'decayingEpsilonGreedy',
        showProbabilities: false,
        environmentScenario: 'A',
        description: 'This agent explores a lot at first, then gradually reduces exploration as it becomes more confident. This is often more efficient than fixed exploration.'
    },
    'scenario-6': {
        name: 'UCB1 Agent',
        mode: 'single-agent',
        agentToRun: 'ucb1',
        showProbabilities: false,
        environmentScenario: 'A',
        description: 'UCB1 intelligently explores by preferring machines that are both promising and have not been tried many times (high uncertainty).'
    },
    'scenario-7': {
        name: 'Thompson Sampling Agent',
        mode: 'single-agent',
        agentToRun: 'thompson',
        showProbabilities: false,
        environmentScenario: 'A',
        description: 'A sophisticated Bayesian agent that maintains a probability distribution of what the true win rate might be for each machine and samples from it to choose an action.'
    },

    // --- SCENARIO 8: Comparison ---
    'scenario-8': {
        name: 'Comparing All Agents (Stable Environment)',
        mode: 'compare-all',
        maxRounds: 500,
        environmentScenario: 'A',
        description: 'See all agents compete on the same playing field. Which strategy wins when the machine probabilities are stable?'
    },
    
    // --- SCENARIO 9: Monte Carlo (Stable) ---
    'scenario-9': {
        name: 'Monte Carlo Analysis (Stable Environment)',
        mode: 'monte-carlo',
        maxRounds: 500,
        numMonteCarloRuns: 100,
        environmentScenario: 'A',
        description: 'This runs the simulation 100 times and averages the results to show each agent\'s true long-term performance. Note how the advanced agents clearly separate from the pack.'
    },

    // --- SCENARIO 10: Monte Carlo (Non-Stationary) ---
    'scenario-10': {
        name: 'Monte Carlo Analysis (Non-Stationary)',
        mode: 'monte-carlo',
        maxRounds: 500,
        numMonteCarloRuns: 100,
        environmentScenario: 'B',
        description: 'The environment is unstable: the best machine becomes the worst halfway through. Notice the Greedy agent\'s failure to adapt, while agents that keep exploring perform much better.'
    },

    // --- SCENARIO 11: Monte Carlo (Restless) ---
    'scenario-11': {
        name: 'Monte Carlo Analysis (Restless Bandits)',
        mode: 'monte-carlo',
        maxRounds: 500,
        numMonteCarloRuns: 100,
        environmentScenario: 'C',
        description: 'In this scenario, the win rates of machines you *don\'t* play drift randomly. This requires constant re-evaluation. Which agents excel when the world is always shifting?'
    },

    // --- NEW PHILOSOPHICAL SCENARIOS ---
    'scenario-12': {
        name: 'The Treasure Hunter (High Risk, High Reward)',
        mode: 'monte-carlo',
        maxRounds: 500,
        numMonteCarloRuns: 100,
        showProbabilities: true,
        description: 'Three machines have small, reliable payouts, but one is a "treasure chest" with a low chance of a massive reward. Which strategy is brave enough to find it?',
        machineConfig: [
            { prob: 0.5, reward: 2 },
            { prob: 0.6, reward: 2 },
            { prob: 0.05, reward: 50 },
            { prob: 0.4, reward: 2 }
        ]
    },

    'scenario-13': {
        name: '"The Cataclysm" (Sudden, Drastic Change)',
        mode: 'monte-carlo',
        maxRounds: 500,
        numMonteCarloRuns: 100,
        environmentScenario: 'D',
        description: 'A stable world with a clear winner is turned upside down halfway through the simulation. This is a brutal test of an agent\'s ability to adapt to unforeseen, radical change.'
    },

    'scenario-14': {
        name: '"The Fading Garden" (Gradual Obsolescence)',
        mode: 'monte-carlo',
        maxRounds: 1000,
        numMonteCarloRuns: 100,
        environmentScenario: 'E',
        description: 'The best machine slowly becomes less effective over time, while the second-best improves. This tests an agent\'s ability to notice and adapt to gradual, subtle changes rather than sudden shocks.'
    },

    // --- FINAL SCENARIO: The Playground ---
    'playground': {
        name: 'The Ultimate Playground',
        mode: 'playground',
        showControls: true,
        showProbabilities: true,
        showPayoutInputs: true,
        maxRounds: 500,
        environmentScenario: 'A',
        description: 'Configure everything! Set custom payout rates, change the scenario, and run any agent or analysis mode you want to test your own hypotheses.'
    }
};