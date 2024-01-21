/* -------------------------------------------------------------------------- */
/*                         Create sync / Match fields                         */
/* -------------------------------------------------------------------------- */
/**
 *
 * Best of luck to anyone who has gotten this far. I'm sorry. Good luck.
 *
 */
import { getCompatibleAirtableFields } from "./get-compatible-airtable-fields.js";
import { buildFieldMapping } from "./build-field-mapping.js";
import { storeExcludedFields } from "./store-excluded-fields.js";
import { utils } from "../../../utils/index.js";
import { flows } from "../../index.js";

/**
 * Match Airtable fields to corresponding Webflow fields based on configuration
 * and user selection.
 *
 * @param {Object} config - Configuration object containing Airtable and Webflow field information.
 * @returns {Array} - Array of matched field mappings between Airtable and Webflow.
 */
export async function matchFields(airtableSettings, webflowSettings, state) {
    try {
        let fields = [];

        // Airtable fields to match
        // Excluding:
        // Primary Field, Slug, Last Published, State, Item ID
        const airtableFields = removeFieldsById(airtableSettings.table.fields, [airtableSettings.table.primaryFieldId, airtableSettings.table.slugField.id, airtableSettings.table.lastPublishedField.id, airtableSettings.table.stateField.id, airtableSettings.table.webflowItemIdField.id]);

        // Webflow fields to match
        // Excluding:
        // Name and Slug
        const webflowFields = webflowSettings.collection.fields.filter((field) => field.slug !== "slug" && field.slug !== "name");

        // Store the excluded fields
        const specialFields = storeExcludedFields(airtableSettings, webflowSettings);
        fields.push(...specialFields);

        // Match the remaining fields
        const matchedFields = await userMatchesFields(airtableFields, webflowFields, state);
        fields.push(...matchedFields);

        return fields.filter((field) => field !== null);
    } catch (error) {
        throw error;
    }
}

async function userMatchesFields(airtableFields, webflowFields, state) {
    const fields = [];

    for (const webflowField of webflowFields) {
        // Return compatible Airtable fields
        const compatibleAirtableFields = await getCompatibleAirtableFields(webflowField.type, airtableFields);

        // If there are no compatible fields, skip this field
        if (compatibleAirtableFields.length === 0) continue;

        // User selects the Airtable field to match
        const matchedAirtableField = await matchField(webflowField, compatibleAirtableFields, state);

        if (matchedAirtableField === null) continue;

        // Combine the Airtable and Webflow field information
        const field = buildFieldMapping(matchedAirtableField, webflowField);

        // Add the field to the fields array
        fields.push(field);
    }

    return fields;
}

/**
 * Prompts user to match a Webflow field with Airtable fields.
 *
 * @param {object} webflowField - The Webflow field to be matched.
 * @param {array} airtableFields - The list of Airtable fields to choose from.
 * @returns {object} - The matched Airtable field.
 */
async function matchField(webflowField, airtableFields, state) {
    if (!webflowField.isEditable) return null;

    if (!webflowField.isRequired) {
        // Can't skip required fields
        const skipOption = {
            name: "Skip",
            message: "Skip...",
        };
        airtableFields.unshift(skipOption);
    }

    state.p.log.message(state.f.italic(`Webflow field: ${webflowField.displayName} matches to:`));

    const message = `${state.f.bold("Airtable")} field:`;

    let fieldsToSelect = utils.encapsulateObjectForSelect(airtableFields);

    const matchedField = await state.p.select({
        message: message,
        options: fieldsToSelect,
    });

    if (state.p.isCancel(matchedField)) {
        await flows.viewSyncs(state);
    }

    if (matchedField.name === "Skip") return null;
    return matchedField;
}

/**
 * Removes fields from Airtable settings based on the provided field IDs.
 *
 * @param {object} fields - The Airtable settings object.
 * @param {string[]} ids - An array of field IDs to be removed.
 * @returns {Array} - The Airtable fields after removing specified fields.
 */
function removeFieldsById(fields, ids) {
    return fields.filter((field) => !ids.includes(field.id));
}
