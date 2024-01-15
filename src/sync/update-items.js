/* -------------------------------------------------------------------------- */
/*                             Sync / Update items                            */
/* -------------------------------------------------------------------------- */
import { utils } from "../utils/index.js";
import { webflow } from "../webflow/index.js";
import { airtable } from "../airtable/index.js";

export async function updateItems(records, syncConfig, loader, state) {
    if (records.toUpdate.length === 0) {
        return;
    }
    for (const record of records.toUpdate) {
        // Parse data from Airtable to Webflow format
        let parsedData = await utils.parseRecordData(record, syncConfig, state);

        // Get itemId special field value
        const itemIdField = syncConfig.fields.find((field) => field.specialField === "itemId");

        // Create item in Webflow
        loader.text = "Updating Webflow item...";
        loader.color = "blue";
        const response = await webflow.updateItem(parsedData, syncConfig, record.fields[itemIdField.airtableName]);

        // Update Airtable record with Webflow response
        loader.text = "Updating Airtable record...";
        loader.color = "yellow";
        await updateAirtableRecord(record, response, syncConfig, loader);

        // Add to publishing queue
        records.toPublish.push(record);
    }
}
// TODO: Ask ChatGPT about the three version of this function to see how to combine them
async function updateAirtableRecord(record, response, syncConfig, loader) {
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
        console.log("Error updating Airtable record");
        throw error;
    }
}
