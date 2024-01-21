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
import { v4 as uuidv4 } from "uuid";

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
        // Get Airtable keys from config
        const webflowKeys = state.config.keys.filter((key) => key.platform === "webflow");
        console.log("🚀 ~ getApiKeyAndReturnSites ~ webflowKeys:", webflowKeys);

        let apiKey, createdThisSession, saveKey;
        const webflowSettings = {};

        // If there are keys, ask user to select one
        if (webflowKeys.length > 0) {
            let newKey = { label: "Create new key", value: "createNewKey" };
            webflowKeys.unshift(newKey);

            apiKey = await state.p.select({
                message: "Webflow API key:",
                options: webflowKeys,
            });
            // Handle cancel
            if (state.p.isCancel(apiKey)) {
                await flows.viewSyncs(state);
                return;
            }
        }

        // If user selects "Create new key", ask for new key
        if (apiKey === "createNewKey" || webflowKeys.length === 0) {
            createdThisSession = true;
            // Ask user for API token
            apiKey = await state.p.password({
                message: "Webflow API key:",
            });
            // Handle cancel
            if (state.p.isCancel(apiKey)) {
                await flows.viewSyncs(state);
                return;
            }
        }

        // Check if API token is valid by trying to get bases
        state.s.start("Checking API key...");
        let sites = await webflow.getSites(apiKey, state);

        // If API token is invalid, ask user to try again
        if (!sites) {
            state.p.log.error("Something went wrong.");
            state.p.log.message("Either your key is invalid, or it doesn't have proper permissions.");
            state.p.log.message("Please try again.");
            state.s.stop();
            return await getApiKeyAndReturnSites(state); // Recursively call the function again
        }
        state.s.stop(`✅ ${state.f.dim("Webflow key validated.")}`);

        if (createdThisSession) {
            // Ask user if they want to save the API token
            saveKey = await state.p.confirm({ message: "Save this API key to use in other syncs?" });
            if (state.p.isCancel(saveKey)) {
                await flows.viewSyncs(state);
                return;
            }
        }

        if (saveKey) {
            // Ask user for label for API token
            const keyLabel = await state.p.text({ message: "Key label" });
            if (state.p.isCancel(keyLabel)) {
                await flows.viewSyncs(state);
                return;
            }
            const key = {
                label: keyLabel,
                value: apiKey,
                platform: "webflow",
                id: uuidv4(),
            };
            // Save API token to config
            state.config.keys.push(key);
        }

        webflowSettings.apiKey = apiKey;
        webflowSettings.sites = sites;

        return webflowSettings;
    } catch (error) {
        throw error;
    }
}
