/* -------------------------------------------------------------------------- */
/*                             Sync / Publish site                            */
/* -------------------------------------------------------------------------- */
import axios from "axios";
import { ui } from "../ui/index.js";
import { flows } from "../flows/index.js";

export async function publishWebflowSite(state, syncConfig) {
    try {
        // Webflow API requires an array of custom domain IDs to be passed in the request body. These are collected during config process.
        const customDomainIds = [];
        syncConfig.webflow.site.customDomains.forEach((domain) => {
            customDomainIds.push(domain.id);
        });

        let body;
        if (customDomainIds.length === 0) {
            body = {
                publishToWebflowSubdomain: true,
            };
        } else {
            body = {
                publishToWebflowSubdomain: syncConfig.publishWebflowSubdomain,
                customDomains: customDomainIds,
            };
        }

        const response = await axios.post(
            `https://api.webflow.com/v2/sites/${syncConfig.webflow.site.id}/publish`,
            body,
            {
                headers: {
                    accept: "application/json",
                    authorization: `Bearer ${syncConfig.webflow.apiKey}`,
                },
            }
        );
        if (!response) throw new Error(`Failed to publish site ${syncConfig.webflow.site.name}`);
        if (response.status === 202) {
            await ui.pretty.success();
            await ui.pretty.log("Site published successfully!");
            await flows.viewSync(state, syncConfig);
        }
        return;
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.log("Try republishing in a minute or two. You've hit the Webflow API rate limit.");
        } else {
            throw error;
        }
    }
}