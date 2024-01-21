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
import { utils } from "../../utils/index.js";
import { webflow } from "../../webflow/index.js";

export async function webflowSetup(state) {
    try {
        {
            state.p.log.info(state.f.bold("Webflow"));

            // Ask user for API key and return sites
            let webflowSettings = await getApiKeyAndReturnSites(state);

            let sitesToSelect = utils.encapsulateObjectForSelect(webflowSettings.sites);

            // Ask user to select a site
            webflowSettings.site = await state.p.select({
                message: "Webflow site:",
                options: sitesToSelect,
            });

            if (state.p.isCancel(webflowSettings.site)) {
                await flows.viewSyncs(state);
            }

            state.s.start("Getting sites...");
            // Return collections for selected site
            webflowSettings.collections = await webflow.getCollections(webflowSettings, state);
            state.s.stop(`✅ ${state.f.dim("Sites retrieved.")}`);

            let collectionsToSelect = utils.encapsulateObjectForSelect(webflowSettings.collections);

            // Ask user to select a collection
            webflowSettings.collection = await state.p.select({
                message: "Webflow collection:",
                options: collectionsToSelect,
            });

            if (state.p.isCancel(webflowSettings.collection)) {
                await flows.viewSyncs(state);
            }

            state.s.start("Getting fields...");
            // Return fields from selected collection
            webflowSettings.collection.fields = await webflow.getFields(webflowSettings, state);
            state.s.stop(`✅ ${state.f.dim("Fields retrieved.")}`);

            return webflowSettings;
        }
    } catch (error) {
        throw error;
    }
}

async function getApiKeyAndReturnSites(state) {
    try {
        const webflowSettings = {};

        // Ask user for API token
        const apiKey = await state.p.password({
            message: "Webflow API key:",
        });
        if (state.p.isCancel(apiKey)) {
            await flows.viewSyncs(state);
            return;
        }
        state.s.start("Checking API key...");
        // Check if API token is valid by trying to get bases
        let sites = await webflow.getSites(apiKey, state);
        state.s.stop(`✅ ${state.f.dim("Webflow key validated.")}`);

        // If API token is invalid, ask user to try again
        if (!sites) {
            state.p.log.error("Something went wrong.");
            state.p.log.message("Either your key is invalid, or it doesn't have proper permissions.");
            state.p.log.message("Please try again.");
            return getApiKeyAndReturnSites(state); // Recursively call the function again
        }

        webflowSettings.apiKey = apiKey;
        webflowSettings.sites = sites;

        return webflowSettings;
    } catch (error) {
        throw error;
    }
}
