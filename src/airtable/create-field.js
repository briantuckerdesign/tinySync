import axios from "axios";
/* -------------------------------------------------------------------------- */
/*                           Airtable / Create field                          */
/* -------------------------------------------------------------------------- */
/**
 * Creates a field in a specified Airtable table.
 *
 * @param {object} field - The field object to be created. This should conform to the
 *    Airtable API specifications for creating a field.
 * @param {object} syncConfig - The synchronization configuration object.
 *    This object should contain the necessary Airtable base ID, table ID, and API token.
 * @returns {Promise<object>} A promise that resolves to the response data
 *    from Airtable upon successful creation of the field.
 *
 * Note: This function expects `syncConfig` to be an object with a structure that includes
 * `airtable.base.id`, `airtable.table.id`, and `airtable.apiToken`. The function makes a POST
 * request to the Airtable API to create a field in the specified table.
 */
export async function createField(field, syncConfig, state) {
    try {
        const baseId = syncConfig.airtable.base.id;
        const tableId = syncConfig.airtable.table.id;
        const apiToken = syncConfig.airtable.apiToken;
        const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables/${tableId}/fields`;
        const options = {
            headers: {
                Authorization: `Bearer ${apiToken}`,
                "Content-Type": "application/json",
            },
        };

        // Docs: https://airtable.com/developers/web/api/create-field
        const response = await axios.post(url, field, options);

        const responseData = response.data;

        return responseData;
    } catch (error) {
        // TODO: ERROR HANDLE
        throw error;
    }
}
