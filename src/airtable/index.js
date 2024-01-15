/* -------------------------------------------------------------------------- */
/*                                  Airtable                                  */
/* -------------------------------------------------------------------------- */
/**
 * Any time we talk to Airtable directly, we use this module.
 *
 * Note, this is not the official airtable.js package.
 * These use axios.
 *
 * Future TODO: switch to referencing by ID to simplify... everything.
 */

import { getBases } from "./get-bases.js";
import { getUpdatedSchema } from "./get-schema.js";
import { getTables } from "./get-tables.js";
import { getFieldsFromTables } from "./get-fields.js";
import { getViewsFromTables } from "./get-views.js";
import { getRecords } from "./get-records.js";
import { updateRecord } from "./update-record.js";
import { createField } from "./create-field.js";
import { getRecord } from "./get-record.js";

export const airtable = {
    getBases,
    getSchema: getUpdatedSchema,
    getTables,
    getFields: getFieldsFromTables,
    getViews: getViewsFromTables,
    getRecord,
    getRecords,
    updateRecord,
    createField,
};
