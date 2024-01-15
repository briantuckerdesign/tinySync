/* -------------------------------------------------------------------------- */
/*                             Sync / Delete items                            */
/* -------------------------------------------------------------------------- */
import { airtable } from "../airtable/index.js";
import { utils } from "../utils/index.js";
import { webflow } from "../webflow/index.js";

// Delete items in Webflow that no longer exist in Airtable
export async function deleteItems(records, syncConfig, loader = { text: "", color: "" }, state) {
    try {
        if (records.toDelete.length === 0) {
            return;
        }
        // Only delete items if config.deleteRecordsNotInAirtable is true
        if (syncConfig.deleteRecords) {
            let itemsToDelete = records.toDelete;

            // let itemIds = itemsToDelete.map((item) => item["id"]);
            let itemIdField = utils.findSpecial("itemId", syncConfig);
            let lastPublishedField = utils.findSpecial("lastPublished", syncConfig);

            for (let item of itemsToDelete) {
                loader.text = "Deleting Webflow item...";
                loader.color = "blue";
                // THIS is webflow ID...
                await webflow.deleteItem(item.webflowItemId, syncConfig);

                let recordUpdates = {
                    [lastPublishedField.airtableName]: null,
                    [itemIdField.airtableName]: "",
                };

                recordUpdates = { fields: recordUpdates };

                await airtable.updateRecord(recordUpdates, item.airtableRecordId, syncConfig);
            }
        }
    } catch (error) {
        loader.warn("Error Webflow deleting items");
        if (error.response && error.response.status === 409) {
            loader.warn("Item is referenced by another item. Skipping delete.");
            return;
        }
        throw error;
    }
}
