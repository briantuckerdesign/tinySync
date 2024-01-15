import { configTools } from "./index.js";
/* -------------------------------------------------------------------------- */
/*                             Config tools / init                            */
/* -------------------------------------------------------------------------- */
/**
 * Initializes the application configuration with default settings.
 *
 * @param {object} state - The state object where the configuration will be stored.
 *    This object is expected to be mutable and will be directly modified by the function.
 * @returns {Promise<void>} A promise that resolves once the configuration
 *    has been initialized and saved.
 *
 * Note: This function sets up a default configuration structure within the provided
 * `state` object. It includes default empty arrays for syncs, Airtable keys, Webflow keys,
 * and an empty object for additional settings. After setting up the default configuration,
 * it uses `configTools.save` (assumed to be a utility for saving configurations) to
 * persist the changes. The function does not return any value upon completion.
 */
export async function initConfig(state) {
    const defaultConfig = {
        syncs: [],
        airtableKeys: [],
        webflowKeys: [],
        settings: {},
    };

    state.config = defaultConfig;

    await configTools.save(state);

    return;
}
