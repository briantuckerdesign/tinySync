/* -------------------------------------------------------------------------- */
/*                            Webflow / Create item                           */
/* -------------------------------------------------------------------------- */
/**
 * Creates an item in a Webflow collection.
 * @param {Object} parsedData - The parsed data to be added to the item.
 * @param {Object} syncConfig - The sync configuration object.
 * @returns {Promise<Object>} - A promise that resolves to the created item data.
 */

import axios from "axios";

export async function createItem(parsedData, syncConfig) {
    try {
        const wId = syncConfig.webflow.collection.id;
        const url = `https://api.webflow.com/v2/collections/${wId}/items`;
        const apiKey = syncConfig.webflow.apiKey;
        const body = {
            isArchived: false,
            isDraft: false,
            fieldData: { ...parsedData },
        };
        const options = {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
        };

        const response = await axios.post(url, body, options);

        if (response && response.status === 202) {
            return response.data;
        }
    } catch (error) {
        console.log("Error creating item.");
        throw error;
    }
}
