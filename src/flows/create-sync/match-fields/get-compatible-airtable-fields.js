/* -------------------------------------------------------------------------- */
/*                   Match fields / Get compatible fields                     */
/* -------------------------------------------------------------------------- */
/**
 * Map of field types and their compatible data types.
 * Keys are Airtable field types.
 * Values are arrays of Webflow field types.
 *
 * e.g. airtableField: ["webflowField", "webflowField", ...]
 *
 * @type {Object.<string, string[] | null>}
 */

// TODO: update reference in updateschema to this
export const fieldCompatibilityMap = {
    PlainText: ["singleLineText", "multilineText", "url", "email", "phoneNumber", "number", "currency", "percent", "autoNumber", "rating", "formula", "rollup", "lookup", "singleSelect", "multipleSelect"],
    RichText: ["richText", "formula"],
    Image: ["multipleAttachments"],
    MultiImage: ["multipleAttachments"],
    VideoLink: ["singleLineText", "url", "formula"],
    Link: ["singleLineText", "url", "formula"],
    Email: ["singleLineText", "email", "formula"],
    Phone: ["singleLineText", "phoneNumber", "formula"],
    Number: ["singleLineText", "number", "currency", "percent", "autoNumber", "rating", "formula", "rollup"],
    DateTime: ["singleLineText", "dateTime", "formula"],
    Switch: ["singleLineText", "checkbox", "formula"],
    Color: ["singleLineText", "formula"],
    Option: ["singleLineText", "singleSelect", "formula"],
    File: ["multipleAttachments"],
    Reference: ["multipleRecordLinks"],
    MultiReference: ["multipleRecordLinks"],
};

/**
 * Retrieves the compatible Airtable fields based on the given Webflow type.
 * @param {string} webflowType - The Webflow type.
 * @param {Array} airtableFields - The array of Airtable fields.
 * @returns {Promise<Array>} - The array of compatible Airtable fields.
 */
export async function getCompatibleAirtableFields(webflowType, airtableFields) {
    const compatibleTypes = fieldCompatibilityMap[webflowType] || [];
    return airtableFields.filter((field) => compatibleTypes.includes(field.type));
}
