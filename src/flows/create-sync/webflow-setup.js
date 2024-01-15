/* -------------------------------------------------------------------------- */
/*                         Create sync / Webflow setup                        */
/* -------------------------------------------------------------------------- */
/**
 *
 * 1. Ask user for API key and return sites from Webflow
 * 2. Ask user to select a site
 * 3. Get collections for selected site from Webflow
 * 4. Ask user to select a collection
 * 5. Get fields for selected collection from Webflow
 * 6. Return Webflow settings
 *
 */
import { ui } from "../../ui/index.js";
import { webflow } from "../../webflow/index.js";

export async function webflowSetup(state) {
    try {
        {
            await ui.pretty.dashedLine();
            await ui.pretty.spacer();
            await ui.pretty.logHeading("Webflow");
            await ui.pretty.logBold("Now let's get your Webflow information.");
            await ui.pretty.spacer();

            // Ask user for API key and return sites
            let webflowSettings = await getApiKeyAndReturnSites(state);

            // Ask user to select a site
            webflowSettings.site = await ui.selectAndReturn(webflowSettings.sites, "Webflow site:", "site");

            // Return collections for selected site
            webflowSettings.collections = await webflow.getCollections(webflowSettings, state);

            // Ask user to select a collection
            webflowSettings.collection = await ui.selectAndReturn(webflowSettings.collections, "Webflow collection:", "collection");

            // Return fields from selected collection
            webflowSettings.collection.fields = await webflow.getFields(webflowSettings, state);
            return webflowSettings;
        }
    } catch (error) {
        throw error;
    }
}

async function getApiKeyAndReturnSites(state) {
    const webflowSettings = {};

    // Ask user for API token
    const apiKey = await ui.input.prompt({
        name: "webflowApiToken",
        type: "password",
        message: "Webflow API key:",
    });
    // Check if API token is valid by trying to get bases
    let sites = await webflow.getSites(apiKey.webflowApiToken, state);

    // If API token is invalid, ask user to try again
    if (!sites) {
        console.log("Something went wrong! \nPlease try again.");
        return getApiKeyAndReturnSites(state); // Recursively call the function again
    }

    webflowSettings.apiKey = apiKey.webflowApiToken;
    webflowSettings.sites = sites;
    return webflowSettings;
}
