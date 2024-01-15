import axios from "axios";
/* -------------------------------------------------------------------------- */
/*                           Airtable / Get records                           */
/* -------------------------------------------------------------------------- */
/**
 * Retrieves all records from a specified Airtable view, handling pagination automatically.
 *
 * @param {object} syncConfig - The synchronization configuration object containing
 *    Airtable API token, base ID, table ID, and view ID.
 * @returns {Promise<Array>} A promise that resolves to an array of all records
 *    from the specified view in the Airtable table.
 *
 * Note: This function uses a do-while loop to handle Airtable's pagination, as it
 * limits record retrieval to 100 records per request. It concatenates batches of
 * records until all records are retrieved. The function constructs a URL using the
 * provided baseId and tableId and makes POST requests to the Airtable API with the
 * appropriate view and offset parameters. The function assumes the structure of
 * `syncConfig` includes `airtable.apiToken`, `airtable.base.id`, `airtable.table.id`,
 * and `airtable.table.view.id`.
 */
export async function getRecords(syncConfig) {
    try {
        const baseId = syncConfig.airtable.base.id;
        const tableId = syncConfig.airtable.table.id;
        const viewId = syncConfig.airtable.table.view.id;
        const apiToken = syncConfig.airtable.apiToken;
        const url = `https://api.airtable.com/v0/${baseId}/${tableId}/listRecords`;
        const options = {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        };
        let allRecords = [];
        let offset;

        do {
            // Can only retrieve 100 records at a time, so this retrieves in batches.
            const postData = offset
                ? {
                      view: viewId,
                      offset: offset,
                  }
                : { view: viewId };

            // Docs: https://airtable.com/developers/web/api/list-records
            const response = await axios.post(url, postData, options);

            const { records, offset: newOffset } = response.data;

            allRecords = allRecords.concat(records);

            offset = newOffset;
        } while (offset);

        return allRecords;
    } catch (error) {
        // TODO: Handle error
        throw error;
    }
}
