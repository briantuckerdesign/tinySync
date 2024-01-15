/* -------------------------------------------------------------------------- */
/*                            Airtable / Get fields                           */
/* -------------------------------------------------------------------------- */
/**
 * Retrieves fields from a specified table within a collection of tables.
 *
 * @param {Array} tables - An array of table objects. Each table object should contain
 *    at least an 'id' and a 'fields' property.
 * @param {string} tableId - The ID of the table from which fields are to be retrieved.
 * @returns {Array} An array of fields from the specified table. Returns an empty array
 *    if the table is not found or if there are no fields.
 *
 * Note: This function assumes that 'tables' is an array of objects where each object
 * represents a table with 'id' and 'fields' properties. It searches for a table with
 * the matching 'tableId' and returns its fields.
 */
export async function getFieldsFromTables(tables, tableId) {
    try {
        const table = tables.find((table) => table.id === tableId);
        const fields = table.fields;

        return fields;
    } catch (error) {
        // TODO: Handle error
        throw error;
    }
}
