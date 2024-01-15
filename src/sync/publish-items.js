/* -------------------------------------------------------------------------- */
/*                            Sync / Publish items                            */
/* -------------------------------------------------------------------------- */
import { webflow } from "../webflow/index.js";
import { airtable } from "../airtable/index.js";
import { utils } from "../utils/index.js";

export async function publishItems(records, syncConfig, loader, state) {
    try {
        const recordsToPublish = records.toPublish;
        if (recordsToPublish.length === 0) {
            return;
        }

        const idsFromNewItems = recordsToPublish.map((record) => record.itemId);
        const itemIdField = syncConfig.fields.find((field) => field.specialField === "itemId");
        const idsFromUpdatedItems = recordsToPublish.map((record) => record.fields[itemIdField.airtableName]);

        let ids = [...idsFromNewItems, ...idsFromUpdatedItems];

        // Remove falsy values and ensure uniqueness
        ids = Array.from(new Set(ids.filter(Boolean)));

        if (ids.length === 0) {
            return;
        }

        // Publish items to Webflow
        loader.text = "Publishing Webflow items...";
        loader.color = "blue";
        const response = await webflow.publishItems(syncConfig, ids);

        if (response.errors) {
            // If validation error occurred, republish site (if enabled)
            const validationError = response.errors.find((error) => error.includes("ValidationError"));
            if (validationError && syncConfig.autoPublish) {
                loader.color = "orange";
                loader.text = "Validation error occurred. Republishing site...";
                loader.stopAndPersist({ symbol: "✖" });
                loader.color = "gray";
                loader.start("Syncing...");
                await webflow.publishSite(syncConfig);
            } else if (validationError) {
                loader.color = "red";
                loader.text = "Validation error occurred. Republish site to fix.";
                loader.stopAndPersist({ symbol: "✖" });
                loader.color = "gray";
                loader.start("Syncing...");
            }
        }

        // Update lastPublished field in Airtable
        for (let record of recordsToPublish) {
            let lastPublishedField = utils.findSpecial("lastPublished", syncConfig);

            let recordUpdates = { [lastPublishedField.airtableName]: new Date() };

            recordUpdates = { fields: recordUpdates };

            loader.text = "Updating Airtable record...";
            loader.color = "yellow";
            await airtable.updateRecord(recordUpdates, record.id, syncConfig);
        }

        return response.data;
    } catch (error) {
        loader.warn("Error publishing items");
        if (error.response.status === 404) {
            loader.warn("Try repubishing your site! Item not found to publish.");
            return;
        }
        console.log("Error publishing items: ");
        throw error;
    }
}
