import { airtable } from "../airtable/index.js";
import { webflow } from "../webflow/index.js";
import { configTools } from "../config-tools/index.js";
import { fieldCompatibilityMap } from "../flows/create-sync/match-fields/get-compatible-airtable-fields.js";
/**
 * Checks if the schema is current by fetching the Airtable and Webflow schemas,
 * and updating the configuration file with secure API tokens.
 * @param {object} syncConfig - The configuration object.
 * @returns {object} - The updated configuration object.
 */
export async function checkIfSchemaIsCurrent(syncConfig, state) {
    // Saves updated schema to config.newSchema
    try {
        state.s.start("Getting Airtable schema...");
        await airtable.getSchema(syncConfig);
        state.s.stop(`✅ ${state.f.dim("Airtable schema retrieved.")}`);

        state.s.start("Getting Webflow schema...");
        await webflow.getSchema(syncConfig);
        state.s.stop(`✅ ${state.f.dim("Webflow schema retrieved.")}`);

        // Compare the new schema to the existing schema
        state.s.start("Comparing schemas...");
        await checkIfSchemaIsCurrentHelper(syncConfig, "airtable");
        await checkIfSchemaIsCurrentHelper(syncConfig, "webflow");
        state.s.stop(`✅ ${state.f.dim("Schemas are current.")}`);

        {
            const config = state.config;
            // Find the index of the sync to be updated
            const syncIndex = config.syncs.findIndex((sync) => sync.id === syncConfig.id);
            // Overwrite the sync with the updated sync
            config.syncs[syncIndex] = syncConfig;
            // Save the config
            configTools.save(state);
        }

        return syncConfig;
    } catch (error) {
        console.log("Error checking schema");
        throw error;
    }
}

/**
 * Checks if the schema is current for the given configuration and platform.
 * @param {Object} syncConfig - The configuration object.
 * @param {string} platform - The platform name.
 * @returns {Promise<Object>} - The updated configuration object.
 */
async function checkIfSchemaIsCurrentHelper(syncConfig, platform) {
    try {
        for (let field of syncConfig.fields) {
            // Skip special fields
            if (field.specialField === "lastPublished" || field.specialField === "itemId" || field.specialField === "state") {
                continue;
            }
            let newField = syncConfig[platform].newSchema.fields.find((f) => f.id === field[`${platform}Id`]);
            if (!newField) {
                throw new Error(`Field "${field[`${platform}Name`]}" 
wasn't found, it may have been deleted. 
Please re-run config.`);
            }

            // Airtable only:
            // If the field type has changed, check if the new type is supported
            if (platform === "airtable" && field.airtableType !== newField.type) {
                checkFieldType(newField, field);
            }

            updateFieldIfChanged(field, newField, platform, "Name");
            if (platform === "webflow") {
                updateFieldIfChanged(field, newField, platform, "Slug");
            }
        }

        delete syncConfig[platform].newSchema;

        return syncConfig;
    } catch (error) {
        console.log(`Error checking ${platform} schema`);
        throw error;
    }
}

/**
 * Updates a field if it has changed based on the provided platform and property.
 * @param {object} field - The field object to be updated.
 * @param {object} newField - The new field object containing the updated values.
 * @param {string} platform - The platform on which the field is being updated.
 * @param {string} property - The property of the field being updated.
 */
function updateFieldIfChanged(field, newField, platform, property) {
    const propName = `${platform}${property}`;
    const newPropName = platform === "webflow" ? (property === "Name" ? "displayName" : "slug") : "name";
    if (field[propName] !== newField[newPropName]) {
        // console.log(
        //     `Field "${field[propName]}" has changed ${property.toLowerCase()} to "${newField[newPropName]}".`
        // );
        field[propName] = newField[newPropName];
    }
}

/**
 * Checks the compatibility of a new field type with an existing field type.
 * Throws an error if the types are not compatible.
 * Updates the existing field type if the types are compatible.
 *
 * @param {Object} newField - The new field object.
 * @param {Object} existingField - The existing field object.
 * @throws {Error} Throws an error if the types are not compatible.
 */
function checkFieldType(newField, existingField) {
    if (fieldCompatibilityMap[newField.type].includes(existingField.webflowType)) {
        throw new Error(`Airtable field "${existingField.airtableName}" has changed type from "${existingField.airtableType}" to "${newField.type}". This is not supported. Please re-run config.`);
    } else {
        // console.log(
        //     `Airtable field "${existingField.airtableName}" has changed type from" ${existingField.airtableType}" to "${newField.type}".`
        // );
        existingField.airtableType = newField.type;
    }
}
