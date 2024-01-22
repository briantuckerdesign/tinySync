/* -------------------------------------------------------------------------- */
/*                             Webflow / Get sites                            */
/* -------------------------------------------------------------------------- */
import axios from "axios";

export async function getSites(syncConfig, state) {
    let apiKey;
    // if apiKey is a string, return apiKey
    if (typeof syncConfig === "string") {
        apiKey = syncConfig;
    } else if (typeof syncConfig === "object") {
        // if apiKey type is object, extract apiKey from object
        // by accessing apiKey.webflow.apiKey
        apiKey = syncConfig.webflow.apiKey || syncConfig;
    }
    const url = `https://api.webflow.com/v2/sites`;
    const options = {
        headers: {
            accept: "application/json",
            authorization: `Bearer ${apiKey}`,
        },
    };
    try {
        const response = await axios.get(url, options);

        const sites = response.data.sites;

        // Sets name to displayName for consistency
        sites.forEach((site) => {
            site.name = site.displayName;
        });

        return sites;
    } catch (error) {
        // TODO: Handle error
    }
}
