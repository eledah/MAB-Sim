// This file will contain configuration objects for each scenario.
// Each object will define properties like:
// - agentType: 'manual', 'random', 'greedy', etc.
// - maxRounds: number of rounds for the scenario
// - showProbabilities: boolean to indicate if true probabilities should be displayed
// - environmentScenario: 'A' (stationary), 'B' (non-stationary), or 'restless'
// - restlessFunction: (optional) name of the function to use for restless bandits
// - initialProbabilities: (optional) array of initial probabilities for restless bandits

const scenarioConfigs = {
    'scenario1': {
        name: 'Manual Play (100 Rounds)',
        agentType: 'manual',
        maxRounds: 100,
        showProbabilities: false,
        environmentScenario: 'A',
        description: 'Play manually for 100 rounds. Try to discover which slot machine has the best payout rate through experimentation. Your goal is to maximize your earnings without knowing the true probabilities.'
    },
    'scenario2': {
        name: 'Random Agent (True Payout Displayed)',
        agentType: 'random',
        maxRounds: 500,
        showProbabilities: true,
        environmentScenario: 'A',
        description: 'Observe a Random Agent that selects machines completely at random. The true payout percentages are displayed below each machine. Notice how random selection performs poorly compared to strategic approaches.'
    },
    'scenario3': {
        name: 'Greedy Agent (True Payout Displayed)',
        agentType: 'greedy',
        maxRounds: 500,
        showProbabilities: true,
        environmentScenario: 'A',
        description: 'Watch a Greedy Agent that always chooses the machine with the highest observed payout rate. True payout percentages are shown. See how this strategy can get stuck on suboptimal choices due to early lucky streaks.'
    },
    'scenario4': {
        name: 'Epsilon Greedy Agent (True Payout Displayed)',
        agentType: 'epsilonGreedy',
        maxRounds: 500,
        showProbabilities: true,
        environmentScenario: 'A',
        description: 'Observe an Epsilon-Greedy Agent (ε=0.1) that balances exploitation and exploration. True payout percentages are displayed. It chooses the best known option 90% of the time and explores randomly 10% of the time.'
    },
    'scenario5': {
        name: 'Decaying Epsilon Greedy Agent (True Payout Displayed)',
        agentType: 'decayingEpsilonGreedy',
        maxRounds: 500,
        showProbabilities: true,
        environmentScenario: 'A',
        description: 'Watch a Decaying Epsilon-Greedy Agent where exploration decreases over time. True payout percentages are shown. Early rounds focus on exploration, later rounds on exploitation of learned knowledge.'
    },
    'scenario6': {
        name: 'UCB1 Agent (True Payout Displayed)',
        agentType: 'ucb1',
        maxRounds: 500,
        showProbabilities: true,
        environmentScenario: 'A',
        description: 'Observe a UCB1 (Upper Confidence Bound) Agent that uses statistical confidence intervals to balance exploration and exploitation. True payout percentages are displayed. Notice how it systematically explores less-tried options.'
    },
    'scenario7': {
        name: 'Thompson Sampling Agent (True Payout Displayed)',
        agentType: 'thompson',
        maxRounds: 500,
        showProbabilities: true,
        environmentScenario: 'A',
        description: 'Watch a Thompson Sampling Agent that uses Bayesian inference to make decisions. True payout percentages are shown. It maintains probability distributions for each machine and samples from them to make choices.'
    },
    'scenario8': {
        name: 'All Agents Comparison (True Payout Displayed)',
        agentType: 'compare',
        maxRounds: 500,
        showProbabilities: true,
        environmentScenario: 'A',
        description: 'Compare all agent strategies in a single run over 500 rounds. True payout percentages are displayed. Observe how different algorithms perform against each other in the same environment.'
    },
    'scenario9': {
        name: 'Monte Carlo Analysis (True Payout Displayed)',
        agentType: 'monteCarlo',
        maxRounds: 500,
        showProbabilities: true,
        environmentScenario: 'A',
        description: 'Run a Monte Carlo simulation testing all agents over multiple iterations. True payout percentages are shown. This provides statistical significance to compare average performance across strategies.'
    },
    'scenario10': {
        name: 'Non-Stationary Environment (True Payout Displayed)',
        agentType: 'compare',
        maxRounds: 500,
        showProbabilities: true,
        environmentScenario: 'B',
        description: 'Compare all agents in a non-stationary environment where machine probabilities change over time. True payout percentages are displayed. See how different strategies adapt to changing conditions.'
    },
    'scenario11': {
        name: 'Restless Bandits with Mathematical Functions (True Payout Displayed)',
        agentType: 'compare',
        maxRounds: 500,
        showProbabilities: true,
        environmentScenario: 'restless',
        restlessFunction: 'sinusoidal',
        initialProbabilities: [0.25, 0.5, 0.75, 0.6],
        description: 'Observe agents in a restless bandit environment where probabilities change according to mathematical functions (sinusoidal patterns). True payout percentages are displayed. This represents the most challenging scenario with continuously evolving reward structures.'
    }
};

export default scenarioConfigs;