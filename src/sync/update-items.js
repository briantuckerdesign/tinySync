/* -------------------------------------------------------------------------- */
/*                             Sync / Update items                            */
/* -------------------------------------------------------------------------- */
import { utils } from "../utils/index.js";
import { webflow } from "../webflow/index.js";
import { airtable } from "../airtable/index.js";

export async function updateItems(records, syncConfig, state) {
    if (records.toUpdate.length === 0) {
        return;
    }

    state.s.start("Updating items...");
    for (const record of records.toUpdate) {
        // Parse data from Airtable to Webflow format
        let parsedData = await utils.parseRecordData(record, syncConfig, state);

        // Get itemId special field value
        const itemIdField = syncConfig.fields.find((field) => field.specialField === "itemId");

        // Create item in Webflow
        const response = await webflow.updateItem(parsedData, syncConfig, record.fields[itemIdField.airtableName]);

        // Update Airtable record with Webflow response
        await updateAirtableRecord(record, response, syncConfig);

        // Add to publishing queue
        records.toPublish.push(record);
    }
    state.s.stop(`✅ ${state.f.dim("Webflow items updated.")}`);
}

async function updateAirtableRecord(record, response, syncConfig) {
    try {
        // Get value of slug field from Webflow response
        const webflowSlug = response.fieldData.slug;
        // Find field in config where specialField = "Slug"
        const recordSlugField = syncConfig.fields.find((field) => field.specialField === "slug");
        // Get value of slug field from Airtable record
        const recordSlug = record.fields[recordSlugField.airtableName];

        // Find field in config where specialField = "State"
        const recordStateField = syncConfig.fields.find((field) => field.specialField === "state");
        const recordState = record.fields[recordStateField.airtableName];

        let updateId, updateSlug, updateState, removeId, updatePublishDate;

        switch (recordState) {
            case "Always sync":
            case "Staging":
                updateId = true;
                updateSlug = true;
                break;
            case "Not synced":
                removeId = true;
                break;
            case "Queued for sync":
                updateId = true;
                updateSlug = true;
                updateState = true;
                break;
        }

        let recordUpdates = {};

        if (updateSlug && webflowSlug !== recordSlug) {
            const slugUpdate = { [recordSlugField.airtableName]: webflowSlug };
            recordUpdates = { ...recordUpdates, ...slugUpdate };
        }
        if (updateState) {
            const stateUpdate = { [recordStateField.airtableName]: "Staging" };
            recordUpdates = { ...recordUpdates, ...stateUpdate };
        }

        recordUpdates = { fields: recordUpdates };

        await airtable.updateRecord(recordUpdates, record.id, syncConfig);
    } catch (error) {
        throw error;
    }
}
