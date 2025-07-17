// scenario-loader.js
import { scenarios } from './scenario-config.js';
import { Simulator } from './simulator.js';

document.addEventListener('DOMContentLoaded', () => {
    // Find all elements with an ID that starts with "scenario-" or is "playground"
    const scenarioElements = document.querySelectorAll('[id^="scenario-"], [id="playground"]');

    if (scenarioElements.length === 0) {
        console.warn("No simulator placeholder elements found on this page. Ensure you have divs with IDs like 'scenario-1'.");
        return;
    }

    scenarioElements.forEach(element => {
        const scenarioId = element.id;
        const scenarioConfig = scenarios[scenarioId];

        if (scenarioConfig) {
            // For each valid placeholder, create a new Simulator instance,
            // passing the placeholder element and its specific configuration.
            new Simulator(element, scenarioConfig);
        } else {
            console.error(`Configuration for scenario ID "${scenarioId}" not found in scenario-config.js.`);
        }
    });
});