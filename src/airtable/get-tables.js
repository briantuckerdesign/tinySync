import axios from "axios";
/* -------------------------------------------------------------------------- */
/*                            Airtable / Get tables                           */
/* -------------------------------------------------------------------------- */
/**
 * Retrieves all tables from a specified Airtable base.
 *
 * @param {object} airtableSettings - The settings object containing Airtable API token
 *    and base ID.
 * @returns {Promise<Array>} A promise that resolves to an array of table objects
 *    from the specified Airtable base.
 *
 * Note: This function makes a GET request to the Airtable API to retrieve the list of
 * tables in a base. The function expects `airtableSettings` to be an object with
 * `apiToken` and `base.id` properties. It handles any errors that occur during the
 * API request by throwing them for the caller to handle.
 */
export async function getTables(airtableSettings, state) {
    const apiKey = airtableSettings.apiToken;
    const baseId = airtableSettings.base.id;
    const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`;
    const options = {
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
    };
    try {
        // Docs: https://airtable.com/developers/web/api/get-base-schema
        const response = await axios.get(url, options);

        return response.data.tables;
    } catch (error) {
        // TODO: Handle error
        throw error;
    }
}
