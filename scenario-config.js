// scenario-config.js

export const scenarios = {
    // --- SCENARIO 1: Manual Play ---
    'scenario-1': {
        name: 'Manual Play Playground',
        mode: 'manual',
        maxRounds: 100,
        showControls: false, // Hides mode/scenario selectors
        showHistory: true,
        showProbabilities: false,
        environmentScenario: 'A',
        description: 'This is your playground. Try to find the best machine by clicking on them yourself. Keep an eye on the history below each one!'
    },

    // --- SCENARIO 2: Random Agent ---
    'scenario-2': {
        name: 'Random Agent (True Payout Displayed)',
        mode: 'single-agent',
        agentToRun: 'random',
        showControls: false,
        showProbabilities: true, // Key feature for this scenario
        environmentScenario: 'A',
        description: 'Observe a Random Agent. The true payout percentages are displayed below. Notice how random selection performs poorly.'
    },

    // --- SCENARIO 3: Greedy Agent ---
    'scenario-3': {
        name: 'The Greedy Agent',
        mode: 'single-agent',
        agentToRun: 'greedy',
        showControls: false,
        showProbabilities: true,
        environmentScenario: 'A',
        description: 'The Greedy Agent explores each machine once, then locks onto the best one it found. Run it a few times. Does it always find the *truly* best machine (75%)?'
    },

    // --- SCENARIOS 4-7: Other Single Agents ---
    'scenario-4': {
        name: 'Epsilon-Greedy Agent',
        mode: 'single-agent',
        agentToRun: 'epsilonGreedy',
        showControls: false,
        showProbabilities: false,
        environmentScenario: 'A',
        description: 'This agent mostly exploits, but sometimes takes a random action to explore. This helps it avoid getting stuck on a suboptimal choice.'
    },
    'scenario-5': {
        name: 'Decaying Epsilon-Greedy Agent',
        mode: 'single-agent',
        agentToRun: 'decayingEpsilonGreedy',
        showControls: false,
        showProbabilities: false,
        environmentScenario: 'A',
        description: 'This agent explores a lot at first, then gradually reduces exploration as it becomes more confident. This is often more efficient than fixed exploration.'
    },
    'scenario-6': {
        name: 'UCB1 Agent',
        mode: 'single-agent',
        agentToRun: 'ucb1',
        showControls: false,
        showProbabilities: false,
        environmentScenario: 'A',
        description: 'UCB1 intelligently explores by preferring machines that are both promising and have not been tried many times (high uncertainty).'
    },
    'scenario-7': {
        name: 'Thompson Sampling Agent',
        mode: 'single-agent',
        agentToRun: 'thompson',
        showControls: false,
        showProbabilities: false,
        environmentScenario: 'A',
        description: 'A sophisticated Bayesian agent that maintains a probability distribution of what the true win rate might be for each machine and samples from it to choose an action.'
    },

    // --- SCENARIO 8: Comparison ---
    'scenario-8': {
        name: 'Comparing All Agents (Stable Environment)',
        mode: 'compare-all',
        maxRounds: 500,
        showControls: false,
        environmentScenario: 'A',
        description: 'See all agents compete on the same playing field. Which strategy wins when the machine probabilities are stable?'
    },
    
    // --- SCENARIO 9: Monte Carlo (Stable) ---
    'scenario-9': {
        name: 'Monte Carlo Analysis (Stable Environment)',
        mode: 'monte-carlo',
        maxRounds: 500,
        numMonteCarloRuns: 100, // Reduced for faster web performance
        showControls: false,
        environmentScenario: 'A',
        description: 'This runs the simulation 100 times and averages the results to show each agent\'s true long-term performance. Note how the advanced agents clearly separate from the pack.'
    },

    // --- SCENARIO 10: Monte Carlo (Non-Stationary) ---
    'scenario-10': {
        name: 'Monte Carlo Analysis (Non-Stationary)',
        mode: 'monte-carlo',
        maxRounds: 500,
        numMonteCarloRuns: 100,
        showControls: false,
        environmentScenario: 'B', // The world changes halfway through!
        description: 'The environment is unstable: the best machine becomes the worst halfway through. Notice the Greedy agent\'s failure to adapt, while agents that keep exploring perform much better.'
    },

    // --- SCENARIO 11: Monte Carlo (Restless) ---
    'scenario-11': {
        name: 'Monte Carlo Analysis (Restless Bandits)',
        mode: 'monte-carlo',
        maxRounds: 500,
        numMonteCarloRuns: 100,
        showControls: false,
        environmentScenario: 'C', // New Restless scenario
        description: 'In this scenario, the win rates of machines you *don\'t* play drift randomly. This requires constant re-evaluation. Which agents excel when the world is always shifting?'
    },

    // --- FINAL SCENARIO: The Playground ---
    'playground': {
        name: 'The Ultimate Playground',
        mode: 'playground',
        showControls: true, // Show all dropdowns
        showProbabilities: true,
        showPayoutInputs: true, // Show inputs to set probabilities
        maxRounds: 500,
        environmentScenario: 'A',
        description: 'Configure everything! Set custom payout rates, change the scenario, and run any agent or analysis mode you want to test your own hypotheses.'
    }
};