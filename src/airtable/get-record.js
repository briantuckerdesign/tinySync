import axios from "axios";
/* -------------------------------------------------------------------------- */
/*                            Airtable / Get record                           */
/* -------------------------------------------------------------------------- */
/**
 * Retrieves a specific record from an Airtable table.
 *
 * @param {object} syncConfig - The synchronization configuration object containing
 *    Airtable API token, base ID, and table ID.
 * @param {string} recordId - The ID of the record to be retrieved.
 * @param {string} [tableId=syncConfig.airtable.table.id] - Optional. The ID of the table
 *    from which the record is to be retrieved. Defaults to the table ID provided in syncConfig.
 * @param {string} [baseId=syncConfig.airtable.base.id] - Optional. The ID of the Airtable base
 *    from which the record is to be retrieved. Defaults to the base ID provided in syncConfig.
 * @returns {Promise<object>} A promise that resolves to the data of the requested record.
 *
 * Note: This function constructs a URL using the provided baseId, tableId, and recordId to
 * make a GET request to the Airtable API. It returns the data of the specified record.
 * The function assumes the structure of `syncConfig` includes `airtable.apiToken`,
 * `airtable.base.id`, and `airtable.table.id`.
 */
export async function getRecord(
    syncConfig,
    recordId,
    tableId = syncConfig.airtable.table.id,
    baseId = syncConfig.airtable.base.id
) {
    try {
        const apiToken = syncConfig.airtable.apiToken;
        const url = `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`;
        const options = {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
            params: {
                // returnFieldsByFieldId: true,
            },
        };

        // Docs: https://airtable.com/developers/web/api/get-record
        const response = await axios.get(url, options);

        return response.data;
    } catch (error) {
        // TODO: Handle error
        throw error;
    }
}
