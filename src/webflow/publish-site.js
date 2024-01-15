/* -------------------------------------------------------------------------- */
/*                           Webflow / Publish site                           */
/* -------------------------------------------------------------------------- */

import axios from "axios";
import { ui } from "../ui/index.js";

export async function publishSite(syncConfig) {
    try {
        const siteId = syncConfig.webflow.site.id;
        const apiKey = syncConfig.webflow.apiKey;
        // Webflow API requires an array of custom domain IDs to be passed in the request body. These are collected during config process.
        const customDomainIds = [];
        syncConfig.webflow.site.customDomains.forEach((domain) => {
            customDomainIds.push(domain.id);
        });

        const url = `https://api.webflow.com/v2/sites/${siteId}/publish`;
        const body = {
            publishToWebflowSubdomain: syncConfig.publishWebflowSubdomain,
            customDomains: customDomainIds,
        };
        const options = {
            headers: {
                accept: "application/json",
                authorization: `Bearer ${apiKey}`,
            },
        };

        const response = await axios.post(url, body, options);

        if (!response) throw new Error(`Failed to publish site ${syncConfig.webflow.site.name}`);

        if (response.status === 202) {
            await ui.pretty.success();
            await ui.pretty.log("Site published successfully!");
        }

        return response.data;
    } catch (error) {
        if (error.response.status === 429) {
            console.log("Try republishing in a minute or two. You've hit the Webflow API rate limit.");
        } else {
            console.log("Error publishing site.");
            throw error;
        }
    }
}
