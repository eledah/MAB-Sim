// SimulationRunner.js

function _calculateMeanHistory(histories, maxRounds) {
    const meanHistory = [];
    for (let round = 0; round <= maxRounds; round++) {
        const roundValues = histories.map(h => h[round] || 0);
        meanHistory.push(roundValues.reduce((a, b) => a + b, 0) / histories.length);
    }
    return meanHistory;
}

function _calculateErrorBands(histories, meanHistory, maxRounds) {
    const stdErrorHistory = [];
    for (let round = 0; round <= maxRounds; round++) {
        const roundValues = histories.map(h => h[round] || 0);
        const mean = meanHistory[round];
        const stdDev = Math.sqrt(roundValues.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / roundValues.length);
        stdErrorHistory.push(stdDev / Math.sqrt(roundValues.length));
    }
    // 95% Confidence Interval
    const upperBand = meanHistory.map((m, i) => m + 1.96 * stdErrorHistory[i]);
    const lowerBand = meanHistory.map((m, i) => m - 1.96 * stdErrorHistory[i]);
    return { upperBand, lowerBand };
}

export async function runAnalysis(agentConstructors, environment, maxRounds, isMonteCarlo, numRuns, onProgress) {
    environment.setMaxRounds(maxRounds);

    const allRunHistories = {};
    agentConstructors.forEach(a => allRunHistories[a.name] = []);

    for (let i = 0; i < numRuns; i++) {
        for (const agentInfo of agentConstructors) {
            environment.reset();
            // Important: create a new agent instance for each run
            const currentAgent = agentInfo.create(environment.getNumMachines()); 
            
            const moneyHistory = [environment.getState().money];
            let done = false;
            while (!done) {
                const action = currentAgent.chooseAction(environment.getState());
                const { newState, reward, done: stepDone } = environment.step(action);
                currentAgent.update(action, reward); // Pass the actual reward
                moneyHistory.push(newState.money);
                done = stepDone;
            }
            allRunHistories[agentInfo.name].push(moneyHistory);
        }
        if (isMonteCarlo) {
             const progress = ((i + 1) / numRuns) * 100;
             onProgress(progress, `Calculating... (${i + 1}/${numRuns} runs)`);
             // Yield to the event loop to allow UI updates
             await new Promise(r => setTimeout(r, 0));
        }
    }

    const finalResults = [];
    for (const agentInfo of agentConstructors) {
         const histories = allRunHistories[agentInfo.name];
         const meanHistory = _calculateMeanHistory(histories, maxRounds);
         const result = { name: agentInfo.name, meanHistory, finalScore: meanHistory[maxRounds].toFixed(2) };
         if (isMonteCarlo) {
             const { upperBand, lowerBand } = _calculateErrorBands(histories, meanHistory, maxRounds);
             result.upperBand = upperBand;
             result.lowerBand = lowerBand;
         }
         finalResults.push(result);
    }
    return finalResults;
}