/* -------------------------------------------------------------------------- */
/*                             Sync / Sort records                            */
/* -------------------------------------------------------------------------- */
export async function sortRecords(selectedSync, airtableRecords, webflowItems, loader) {
    try {
        loader.text = "Sorting records...";
        loader.color = "grey";
        const fields = selectedSync.fields;

        const itemIdFieldName = fields.find((field) => field.specialField === "itemId").airtableName;

        const stateFieldName = fields.find((field) => field.specialField === "state").airtableName;

        let recordsToCreate = [];
        let recordsToUpdate = [];
        let recordsWithErrors = [];
        let recordsToDelete = [];

        // get existing itemIds from webflow
        let webflowItemIds = new Set(webflowItems.map((item) => item.id));
        let usedItemIds = [];

        for (let record of airtableRecords) {
            // get webflowId from airtable record
            const webflowIdAirtableValue = record.fields[itemIdFieldName];
            const idsMatch = webflowItemIds.has(webflowIdAirtableValue);
            let state = record.fields[stateFieldName];

            const matchErorrMessage =
                "Airtable record contained an Item ID that was not found in Webflow. To fix, clear the Item ID field in Airtable, or update the Item ID field in Airtable to match the ID of an existing item in Webflow.";

            switch (state) {
                /*
                 * ***********************
                 * State: Staging
                 * ***********************
                 */
                case "Staging":
                    // If webflowId, add to usedItemIds to prevent deletion
                    if (webflowIdAirtableValue) {
                        usedItemIds.push(webflowIdAirtableValue);
                    }
                    break;
                /*
                 * ***********************
                 * State: Not Synced
                 * ***********************
                 */
                case "Not synced":
                    if (webflowIdAirtableValue) {
                        record.airtableRecordId = record.id;
                        record.webflowItemId = webflowIdAirtableValue;
                        // Airtable ID matches webflow ID: delete in webflow
                        usedItemIds.push(webflowIdAirtableValue);
                        recordsToDelete.push(record);
                        break;
                    } else if (webflowIdAirtableValue && !idsMatch) {
                        console.error("not synced, no match");
                        // Airtable ID does not match webflow ID: error
                        usedItemIds.push(webflowIdAirtableValue);
                        record.error = matchErorrMessage;
                        recordsWithErrors.push(record);
                        break;
                    } else {
                        // No webflowId: do nothing
                        break;
                    }
                /*
                 * ***********************
                 * State: Queued for sync
                 * ***********************
                 */
                case "Queued for sync":
                    if (!webflowIdAirtableValue) {
                        // if no webflowId, create
                        recordsToCreate.push(record);
                        break;
                    } else if (!idsMatch) {
                        // if webflowId but no match, error
                        usedItemIds.push(webflowIdAirtableValue);
                        console.error("queued for sync, no match");
                        record.error = matchErorrMessage;
                        recordsWithErrors.push(record);
                    } else {
                        // if webflowId and match, update
                        usedItemIds.push(webflowIdAirtableValue);
                        recordsToUpdate.push(record);
                        break;
                    }
                /*
                 * ***********************
                 * State: Always sync
                 * ***********************
                 */
                case "Always sync":
                    if (!webflowIdAirtableValue) {
                        // if no webflowId, create
                        recordsToCreate.push(record);
                        break;
                    } else if (!idsMatch) {
                        // if webflowId but no match, error
                        console.error("always sync, no match");
                        usedItemIds.push(webflowIdAirtableValue);
                        record.error = matchErorrMessage;
                        recordsWithErrors.push(record);
                        break;
                    } else {
                        // if webflowId and match, update
                        usedItemIds.push(webflowIdAirtableValue);
                        recordsToUpdate.push(record);
                        break;
                    }
                /*
                 * ***********************
                 * State: all other states
                 * ***********************
                 */
                default:
                    if (webflowIdAirtableValue) {
                        usedItemIds.push(webflowIdAirtableValue);
                    }
                    record.error = "State field didn't match any of the expected values.";
                    recordsWithErrors.push(record);
                    break;
            }

            //    process.exit();
        }
        // Create a set of usedItemIds to prevent deletion of items
        let usedItemIdsSet = new Set(usedItemIds);

        // Only delete items if config.deleteRecordsNotInAirtable is true
        if (selectedSync.deleteRecords) {
            // These are the records that are in Webflow but not in Airtable...
            // If selectedSync.deleteRecords is true,
            // these webflow items will be deleted.
            const recordsNotInAirtable = webflowItems.filter((item) => !usedItemIdsSet.has(item.id));
            recordsToDelete = recordsToDelete.concat(recordsNotInAirtable);
        }
        // process.exit();
        return {
            records: {
                toCreate: recordsToCreate,
                toUpdate: recordsToUpdate,
                withErrors: recordsWithErrors,
                toDelete: recordsToDelete,
                toPublish: [],
            },
        };
    } catch (error) {
        console.log("Error sorting records.");
        throw error;
    }
}
