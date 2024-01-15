import axios from "axios";
import { utils } from "../utils/index.js";

/* -------------------------------------------------------------------------- */
/*                            Airtable / Get bases                            */
/* -------------------------------------------------------------------------- */
/**
 * Retrieves a list of Airtable bases accessible with the provided API token.
 *
 * @param {string|object} syncConfig - The configuration for synchronization.
 *    Can be a string (API token directly) or an object containing the API token
 *    under `airtable.apiToken`.
 * @param {boolean} returnFullData - If true, returns full data from the API.
 *    If false, returns a simplified list of bases with names and IDs.
 * @returns {Promise<Array>} A promise that resolves to an array of bases.
 *    Each base is represented as an object with `name` and `id` properties.
 *
 * @throws {Error} Throws an error if the API request fails.
 *
 * Note: The function uses axios for HTTP requests and assumes `utils.filterByPropertyPath`
 * is a utility function available for filtering objects based on a property path.
 */
export async function getBases(syncConfig, returnFullData = false) {
    let apiToken;
    // Sometimes this is called with the entire syncConfig object available
    // but sometimes it needs to be called before syncConfig exists
    if (typeof syncConfig === "string") {
        // if apiKey is a string, it's the apiToken
        apiToken = syncConfig;
    } else if (typeof syncConfig === "object" && syncConfig.airtable) {
        // if apiKey type is object, extract apiKey from syncConfig
        apiToken = syncConfig.airtable.apiToken || syncConfig;
    }
    try {
        // Docs: https://airtable.com/developers/web/api/list-bases
        const url = "https://api.airtable.com/v0/meta/bases";
        const options = {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        };
        // Gets all bases
        const response = await axios.get(url, options);

        // Sometimes we only want bases with create permissions
        // Other times we want the full data.
        if (returnFullData) {
            // Return full data from the API
            return response.data;
        } else {
            // Filter out bases without create permissions
            const filteredBases = utils.filterByPropertyPath(response.data.bases, "permissionLevel", "create");

            // Refomats the bases array to only include the name
            // and ID for user selection
            const bases = filteredBases.map((base) => {
                return {
                    name: base.name,
                    id: base.id,
                };
            });
            // Sort alphabetically by name
            bases.sort((a, b) => a.name.localeCompare(b.name));

            return bases;
        }
    } catch (error) {
        // TODO: ERROR HANDLE
        // throw error;
    }
}
