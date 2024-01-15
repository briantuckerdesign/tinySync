/* -------------------------------------------------------------------------- */
/*                     Match fields / Build field mapping                     */
/* -------------------------------------------------------------------------- */
/**
 * This builds the combined field format that is used throughout the application.
 *
 * @param {Object} airtableField - Airtable field information.
 * @param {Object} webflowFieldInfo - Webflow field information.
 * @returns {Object} - Field mapping object containing various properties.
 */
export function buildFieldMapping(airtableField = {}, webflowFieldInfo = {}) {
    return {
        webflowSlug: webflowFieldInfo.slug || null,
        airtableName: airtableField.name || null,
        webflowName: webflowFieldInfo.displayName || null,
        airtableId: airtableField.id || null,
        webflowId: webflowFieldInfo.id || null,
        airtableType: airtableField.type || null,
        webflowType: webflowFieldInfo.type || null,
        validations: webflowFieldInfo.validations || {},
        options: airtableField.options || {},
        specialField: null,
    };
}
