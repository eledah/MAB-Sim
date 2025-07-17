# Interactive Multi-Armed Bandit Simulator

This project is a self-contained, interactive JavaScript simulation designed to teach the core concepts of the Multi-Armed Bandit problem. It provides a hands-on learning experience for understanding the trade-off between Exploration and Exploitation in decision-making under uncertainty.

The simulation is built with Vanilla JavaScript for performance and embeddability, and it uses Chart.js for real-time data visualization.

## Features

*   **Manual Play Mode:** Directly interact with the slot machines to get a feel for the problem.
*   **Agent-Driven Simulation:** Select from different AI agents (Random, Greedy, Epsilon-Greedy) and watch them solve the problem automatically.
*   **Comparative Analysis:** Run multiple agents in the same environment and compare their performance head-to-head on a single chart.
*   **Scenario Builder:** Switch between a standard (stationary) environment and a non-stationary one where probabilities change, demonstrating the need for continuous exploration.
*   **Real-time Feedback:** An animated chart plots the agent's performance, a log details every action, and each machine displays its own performance history.

## How to Run Locally

Because this project uses JavaScript Modules, you cannot run it by opening the `index.html` file directly in your browser due to security policies (CORS). You must serve the files using a simple local web server.

**The Easiest Way (with Python):**

1.  Open a terminal or command prompt.
2.  Navigate to the project's root directory (the folder containing `index.html`).
    ```bash
    cd path/to/interactive-bandit-simulator
    ```
3.  Run the following command.
    ```bash
    # If you have Python 3
    python -m http.server

    # If you have Python 2
    python -m SimpleHTTPServer
    ```
4.  Open your web browser and go to `http://localhost:8000`.

## Project Roadmap

This section outlines potential future enhancements for the simulator.

### V2: Advanced Agents & Deeper Analysis

*   **[FEATURE] More Sophisticated Agents:**
    *   Implement the **Upper Confidence Bound (UCB1)** agent to demonstrate a more advanced exploration strategy.
    *   Implement **Thompson Sampling**, a Bayesian approach to the problem.
*   **[FEATURE] In-depth Agent Knowledge:**
    *   Add a new chart view that visualizes an agent's internal estimates of each machine's win rate over time. This would provide a powerful look into *how* the agent is "learning."
*   **[IMPROVEMENT] Granular Epsilon Control:**
    *   Change the fixed Epsilon value to a slider, allowing users to see how different levels of exploration affect the Epsilon-Greedy agent's performance.

### V3: Customization & Scenarios

*   **[FEATURE] Custom Scenario Builder:**
    *   Allow users to define their own environments: set the number of machines, their true probabilities, costs, and rewards.
*   **[FEATURE] Saved Scenarios:**
    *   Implement a system to save and load custom scenarios, perhaps by encoding the state in the URL for easy sharing.
*   **[IMPROVEMENT] More Non-Stationary Environments:**
    *   Add more complex non-stationary scenarios, such as probabilities that drift randomly over time instead of changing abruptly.

### General Improvements

*   **[UX] Onboarding/Tutorial:**
    *   Add a simple, guided tour for first-time users explaining the UI and the core concepts.
*   **[DATA] Export Results:**
    *   Allow users to export simulation data (like the performance history of each agent) as a CSV file for further analysis.