// This file will contain mathematical functions for restless bandit probabilities.

export const restlessFunctions = {
    // Linear drift: P(t) = P_initial + rate * t
    linear: (initialProb, round, maxRounds, rate = 0.0005) => {
        return Math.max(0.01, Math.min(0.99, initialProb + rate * round));
    },

    // Sinusoidal drift: P(t) = P_initial + amplitude * sin(frequency * t + phase)
    sinusoidal: (initialProb, round, maxRounds, amplitude = 0.2, frequency = 0.05, phase = 0) => {
        // Normalize round to a 0-2PI range for a full cycle over maxRounds
        const normalizedRound = (round / maxRounds) * 2 * Math.PI;
        return Math.max(0.01, Math.min(0.99, initialProb + amplitude * Math.sin(frequency * normalizedRound + phase)));
    },

    // Logarithmic drift: P(t) = P_initial + factor * log(t + 1)
    logarithmic: (initialProb, round, maxRounds, factor = 0.05) => {
        return Math.max(0.01, Math.min(0.99, initialProb + factor * Math.log(round + 1)));
    },

    // Exponential decay: P(t) = P_initial * e^(-lambda * t)
    exponentialDecay: (initialProb, round, maxRounds, lambda = 0.005) => {
        return Math.max(0.01, Math.min(0.99, initialProb * Math.exp(-lambda * round)));
    },

    // Example: A more complex, multi-stage function
    complex: (initialProb, round, maxRounds) => {
        if (round < maxRounds / 3) {
            // Linear increase
            return Math.max(0.01, Math.min(0.99, initialProb + 0.0005 * round));
        } else if (round < 2 * maxRounds / 3) {
            // Sinusoidal oscillation
            const adjustedRound = round - maxRounds / 3;
            return Math.max(0.01, Math.min(0.99, initialProb + 0.1 * Math.sin(0.1 * adjustedRound)));
        } else {
            // Exponential decay
            const adjustedRound = round - 2 * maxRounds / 3;
            return Math.max(0.01, Math.min(0.99, initialProb * Math.exp(-0.005 * adjustedRound)));
        }
    }
};