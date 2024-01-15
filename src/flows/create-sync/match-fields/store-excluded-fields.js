/* -------------------------------------------------------------------------- */
/*                    Match fields / Store excluded fields                    */
/* -------------------------------------------------------------------------- */

import { buildFieldMapping } from "./build-field-mapping.js";

/**
 * Stores the excluded fields based on the provided Airtable and Webflow settings.
 *
 * Look, I know this is a mess. But here is what it does...
 * - Manually matches the Name/Slug Airtable <> Webflow fields
 * - Manually saves the Airtable-only fields (Last Published, State, Item ID)
 * - Returns an array of field mappings to be added to the other fields
 *
 * @param {object} airtableSettings - The Airtable settings.
 * @param {object} webflowSettings - The Webflow settings.
 * @returns {Array} - An array of field mappings representing the excluded fields.
 */
export function storeExcludedFields(airtableSettings, webflowSettings) {
    const webflowNameField = webflowSettings.collection.fields.find((field) => field.slug === "name");
    const airtablePrimaryFieldId = airtableSettings.table.primaryFieldId;
    const airtablePrimaryField = airtableSettings.table.fields.find(
        (field) => field.id === airtablePrimaryFieldId
    );
    const nameField = buildFieldMapping(airtablePrimaryField, webflowNameField);
    // This flag is used throughout the application
    nameField.specialField = "name";

    const webflowSlugField = webflowSettings.collection.fields.find((field) => field.slug === "slug");
    const airtableSlugField = airtableSettings.table.slugField;
    const slugField = buildFieldMapping(airtableSlugField, webflowSlugField);
    // This flag is used throughout the application
    slugField.specialField = "slug";

    const airtableLastPublishedField = airtableSettings.table.lastPublishedField;
    const lastPublishedField = buildFieldMapping(airtableLastPublishedField);
    // This flag is used throughout the application
    lastPublishedField.specialField = "lastPublished";

    const airtableStateField = airtableSettings.table.stateField;
    const stateField = buildFieldMapping(airtableStateField);
    // This flag is used throughout the application
    stateField.specialField = "state";

    const airtableItemIdField = airtableSettings.table.webflowItemIdField;
    const itemIdField = buildFieldMapping(airtableItemIdField);
    // This flag is used throughout the application
    itemIdField.specialField = "itemId";

    return [nameField, slugField, lastPublishedField, stateField, itemIdField];
}
