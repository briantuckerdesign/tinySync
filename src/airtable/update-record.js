import axios from "axios";
/* -------------------------------------------------------------------------- */
/*                          Airtable / Update record                          */
/* -------------------------------------------------------------------------- */
/**
 * Updates a specific record in an Airtable table.
 *
 * @param {object} record - The record object containing updated data.
 *    The structure should conform to the Airtable API's requirements for record updates.
 * @param {string} recordId - The ID of the record to be updated.
 * @param {object} syncConfig - The synchronization configuration object containing
 *    Airtable API token, base ID, and table ID.
 * @returns {Promise<object>} A promise that resolves to the updated record data
 *    from Airtable.
 *
 * Note: This function constructs a URL using the provided baseId, tableId, and recordId
 * to make a PATCH request to the Airtable API, updating the specified record.
 * It requires the `record` object to be structured as per the Airtable API's
 * requirements for updating records. Error handling is to be implemented where
 * this function is called.
 */
export async function updateRecord(record, recordId, syncConfig) {
    try {
        const baseId = syncConfig.airtable.base.id;
        const tableId = syncConfig.airtable.table.id;
        const apiToken = syncConfig.airtable.apiToken;
        const url = `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`;
        const options = {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        };

        // Docs: https://airtable.com/developers/web/api/update-record
        const response = await axios.patch(url, record, options);

        return response.data;
    } catch (error) {
        // TODO: Handle error
        throw error;
    }
}
