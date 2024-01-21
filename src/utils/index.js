/* -------------------------------------------------------------------------- */
/*                                    Utils                                   */
/* -------------------------------------------------------------------------- */
import { checkIfSchemaIsCurrent } from "./check-if-schema-is-current.js";
import { parseRecordData } from "./parse-record-data.js";
import { filterByPropertyPath } from "./filter-by-property-path.js";
import { markdownToHtml } from "./markdown-to-html.js";
import { findSpecial } from "./find-special-field.js";
import { encapsulateObjectForSelect } from "./encapsulate-object-for-select.js";
export const utils = {
    encapsulateObjectForSelect,
    findSpecial,
    markdownToHtml,
    filterByPropertyPath,
    checkIfSchemaIsCurrent,
    parseRecordData,
};
