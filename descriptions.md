# Scenario Descriptions

## Manual Play Playground (scenario-1)

Try to find the best machine by clicking on them yourself. Keep an eye on the history below each one!

## Random Agent (True Payout Displayed) (scenario-2)

The Random Agent selects machines with no strategy. Notice how its performance compares to the true probabilities, now visible to you.

## The Greedy Agent (scenario-3)

The Greedy Agent explores each machine once, then locks onto the best one it found. Run it a few times. Does it always find the *truly* best machine (75%)?

## Epsilon-Greedy Agent (scenario-4)

This agent mostly exploits, but sometimes takes a random action to explore. This helps it avoid getting stuck on a suboptimal choice.

## Decaying Epsilon-Greedy Agent (scenario-5)

This agent explores a lot at first, then gradually reduces exploration as it becomes more confident. This is often more efficient than fixed exploration.

## UCB1 Agent (scenario-6)

UCB1 intelligently explores by preferring machines that are both promising and have not been tried many times (high uncertainty).

## Thompson Sampling Agent (scenario-7)

A sophisticated Bayesian agent that maintains a probability distribution of what the true win rate might be for each machine and samples from it to choose an action.

## Comparing All Agents (Stable Environment) (scenario-8)

See all agents compete on the same playing field. Which strategy wins when the machine probabilities are stable?

## Monte Carlo Analysis (Stable Environment) (scenario-9)

This runs the simulation 100 times and averages the results to show each agent's true long-term performance. Note how the advanced agents clearly separate from the pack.

## Monte Carlo Analysis (Non-Stationary) (scenario-10)

The environment is unstable: the best machine becomes the worst halfway through. Notice the Greedy agent's failure to adapt, while agents that keep exploring perform much better.

## Monte Carlo Analysis (Restless Bandits) (scenario-11)

In this scenario, the win rates of machines you don't play drift randomly. This requires constant re-evaluation. Which agents excel when the world is always shifting?

## The Treasure Hunter (High Risk, High Reward) (scenario-12)

Three machines have small, reliable payouts, but one is a "treasure chest" with a low chance of a massive reward. Which strategy is brave enough to find it?

## "The Cataclysm" (Sudden, Drastic Change) (scenario-13)

A stable world with a clear winner is turned upside down halfway through the simulation. This is a brutal test of an agent's ability to adapt to unforeseen, radical change.

## "The Fading Garden" (Gradual Obsolescence) (scenario-14)

The best machine slowly becomes less effective over time, while the second-best improves. This tests an agent's ability to notice and adapt to gradual, subtle changes rather than sudden shocks.

## The Ultimate Playground (playground)

Configure everything! Set custom payout rates, change the scenario, and run any agent or analysis mode you want to test your own hypotheses.