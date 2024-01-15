/* -------------------------------------------------------------------------- */
/*                             Sync / Create items                            */
/* -------------------------------------------------------------------------- */
import { utils } from "../utils/index.js";
import { webflow } from "../webflow/index.js";
import { airtable } from "../airtable/index.js";

export async function createItems(records, syncConfig, loader = { text: "", color: "" }, state) {
    records.toUpdateInAirtable = [];
    if (records.toCreate.length === 0) {
        return;
    }
    for (const record of records.toCreate) {
        // Parse data from Airtable to Webflow format
        let parsedData = await utils.parseRecordData(record, syncConfig, state);

        // Create item in Webflow
        loader.text = "Creating Webflow item...";
        loader.color = "blue";
        const response = await webflow.createItem(parsedData, syncConfig, state);

        // Update Airtable record with Webflow response
        loader.text = "Updating Airtable record...";
        loader.color = "yellow";
        await updateAirtableRecord(record, response, syncConfig, state);

        // Add to publishing queue
        records.toPublish.push(record);
    }
}

async function updateAirtableRecord(record, response, syncConfig, state) {
    // Get value of slug field from Webflow response
    const webflowSlug = response.fieldData.slug;
    // Find field in config where specialField = "Slug"
    const recordSlugField = utils.findSpecial("slug", syncConfig);
    // const recordSlugField = syncConfig.fields.find((field) => field.specialField === "slug");
    // Get value of slug field from Airtable record
    const recordSlug = record.fields[recordSlugField.airtableName];

    // Get value of itemId field from Webflow response
    const webflowItemId = response.id;

    // Find field in config where specialField = "itemId"
    // const recordItemIdField = syncConfig.fields.find((field) => field.specialField === "itemId");
    const recordItemIdField = utils.findSpecial("itemId", syncConfig);
    // Write webflowItemId to record at top level
    record.itemId = response.id;

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

    if (updateId) {
        const idUpdate = { [recordItemIdField.airtableName]: webflowItemId };
        recordUpdates = { ...recordUpdates, ...idUpdate };
    }
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
}
