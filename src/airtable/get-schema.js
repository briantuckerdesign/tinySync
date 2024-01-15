import axios from "axios";
/* -------------------------------------------------------------------------- */
/*                            Airtable / Get schema                           */
/* -------------------------------------------------------------------------- */
/**
 * Retrieves the schema of a specified table and view from an Airtable base.
 *
 * @param {object} syncConfig - The synchronization configuration object containing
 *    Airtable API token, base ID, table ID, and view ID.
 * @param {boolean} [returnFullData=false] - If true, returns the full table schema.
 *    If false, returns the syncConfig object with the table schema added.
 * @returns {Promise<object>} A promise that resolves to the table schema or
 *    the updated syncConfig object, based on the value of returnFullData.
 *
 * Note: This function makes a GET request to the Airtable API to retrieve the schema
 * of all tables in a base and then extracts the specific table and view schema based
 * on the provided tableId and viewId. It adds error handling for cases where the
 * specified table or view is not found. The function modifies the syncConfig object
 * by adding the new schema if returnFullData is false.
 */
export async function getUpdatedSchema(syncConfig, returnFullData = false) {
    const apiKey = syncConfig.airtable.apiToken;
    const baseId = syncConfig.airtable.base.id;
    const tableId = syncConfig.airtable.table.id;
    const viewId = syncConfig.airtable.table.view.id;
    const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`;
    const options = {
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
    };

    try {
        // Docs: https://airtable.com/developers/web/api/get-base-schema
        const response = await axios.get(url, options);

        const tables = response.data.tables;
        const table = tables.find((table) => {
            return table.id === tableId;
        });
        if (!table) {
            throw new Error("Table not found. It may have been deleted.");
        }

        const views = table.views;
        const view = views.find((view) => {
            return view.id === viewId;
        });
        if (!view) {
            throw new Error("View not found. It may have been deleted.");
        }
        // Sometimes we want to return the full data, sometimes we don't.
        if (returnFullData) {
            return table;
        }

        syncConfig.airtable.newSchema = table;

        return syncConfig;
    } catch (error) {
        // TODO: Handle error
        throw error;
    }
}
