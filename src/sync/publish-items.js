/* -------------------------------------------------------------------------- */
/*                            Sync / Publish items                            */
/* -------------------------------------------------------------------------- */
import { webflow } from "../webflow/index.js";
import { airtable } from "../airtable/index.js";
import { utils } from "../utils/index.js";

export async function publishItems(records, syncConfig, state) {
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

        state.s.start("Publishing items...");

        // Publish items to Webflow
        const response = await webflow.publishItems(syncConfig, ids);

        if (response.errors) {
            // If validation error occurred, republish site (if enabled)
            const validationError = response.errors.find((error) => error.includes("ValidationError"));
            if (validationError && syncConfig.autoPublish) {
                state.s.stop(`❌ ${state.f.dim("Validation error occurred. Republishing site...")}`);
                state.s.start("Publishing site...");
                await webflow.publishSite(syncConfig);
                state.s.stop(`✅ ${state.f.dim("Site published.")}`);
            } else if (validationError) {
                state.s.stop(`🪲 ${state.f.dim("Validation error occurred.  Republish site to fix.")}`);
            }
        }

        state.s.stop(`✅ ${state.f.dim("Items published.")}`);

        state.s.start("Updating records in Airtable...");
        // Update lastPublished field in Airtable
        for (let record of recordsToPublish) {
            let lastPublishedField = utils.findSpecial("lastPublished", syncConfig);

            let recordUpdates = { [lastPublishedField.airtableName]: new Date() };

            recordUpdates = { fields: recordUpdates };

            await airtable.updateRecord(recordUpdates, record.id, syncConfig);
        }
        state.s.stop(`✅ ${state.f.dim("Records updated.")}`);

        return response.data;
    } catch (error) {
        state.p.log.error("Error publishing items");
        if (error.response.status === 404) {
            state.p.log.error("Try repubishing your site! Item not found to publish.");
            return;
        }
        throw error;
    }
}
