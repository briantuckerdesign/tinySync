/* -------------------------------------------------------------------------- */
/*                            Airtable / Get views                            */
/* -------------------------------------------------------------------------- */
/**
 * Retrieves views from a specified table within a collection of tables.
 *
 * @param {Array} tables - An array of table objects. Each table object should contain
 *    at least an 'id' and a 'views' property.
 * @param {string} tableId - The ID of the table from which views are to be retrieved.
 * @returns {Array} An array of views from the specified table. Returns an empty array
 *    if the table is not found or if there are no views.
 *
 * Note: This function assumes that 'tables' is an array of objects where each object
 * represents a table with 'id' and 'views' properties. It searches for a table with
 * the matching 'tableId' and returns its views.
 */
export async function getViewsFromTables(tables, tableId) {
    try {
        const table = tables.find((table) => table.id === tableId);
        const views = table.views;

        return views;
    } catch (error) {
        // TODO: Handle error
        throw error;
    }
}
