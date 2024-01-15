/* -------------------------------------------------------------------------- */
/*                          Webflow / Get collections                         */
/* -------------------------------------------------------------------------- */
import axios from "axios";

export async function getCollections(
    webflowSettings,
    loader = { text: "", color: "", start: () => {}, stop: () => {} }
) {
    const siteId = webflowSettings.site.id;
    const apiKey = webflowSettings.apiKey;
    const url = `https://api.webflow.com/v2/sites/${siteId}/collections`;
    const options = {
        headers: {
            accept: "application/json",
            authorization: `Bearer ${apiKey}`,
        },
    };
    try {
        const response = await axios.get(url, options);
        const collections = response.data.collections;

        // Sets name to displayName for consistency
        collections.forEach((collection) => {
            collection.name = collection.displayName;
        });

        return collections;
    } catch (error) {
        console.log("Error getting collections.");
        throw error;
    }
}
