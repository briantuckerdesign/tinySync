/* -------------------------------------------------------------------------- */
/*                        Create sync / Airtable setup                        */
/* -------------------------------------------------------------------------- */
/**
 *
 * 1. Ask user for API token and return bases from Airtable
 * 2. Ask user to select a base
 * 3. Get tables for selected base from Airtable
 * 4. Ask user to select a table
 * 5. Ask user to select a view
 * 6. Ask user to select special fields
 *      -state
 *      -slug
 *      -last published
 *      -webflow item ID
 *
 */

import { airtable } from "../../airtable/index.js";
import { flows } from "../index.js";
import { utils } from "../../utils/index.js";

export async function airtableSetup(state) {
    try {
        state.p.log.info(state.f.bold("Airtable"));

        // Ask user for API token and return bases
        let airtableSettings = await getApiTokenAndReturnBases(state);

        const basesToSelect = utils.encapsulateObjectForSelect(airtableSettings.bases);

        // Ask user to select a base
        airtableSettings.base = await state.p.select({
            message: "Airtable base:",
            options: basesToSelect,
        });

        if (state.p.isCancel(airtableSettings.base)) {
            await flows.viewSyncs(state);
        }

        state.s.start("Getting tables...");
        // Return tables for selected base
        airtableSettings.tables = await airtable.getTables(airtableSettings, state);
        state.s.stop(`✅ ${state.f.dim("Tables retrieved.")}`);

        const tablesToSelect = utils.encapsulateObjectForSelect(airtableSettings.tables);

        // Ask user to select a table
        airtableSettings.table = await state.p.select({
            message: "Airtable table:",
            options: tablesToSelect,
        });

        if (state.p.isCancel(airtableSettings.table)) {
            await flows.viewSyncs(state);
        }

        const viewsToSelect = utils.encapsulateObjectForSelect(airtableSettings.table.views);

        // Ask user to select a view
        airtableSettings.view = await state.p.select({
            message: "Airtable view:",
            options: viewsToSelect,
        });
        if (state.p.isCancel(airtableSettings.view)) {
            await flows.viewSyncs(state);
        }

        {
            //airtableSettings.table.fields is an array of objects
            // add one to the beginning of the array with name of "Create for me"
            let createForMe = {
                name: `${state.f.italic("Create for me")}`,
                tsCreateField: "createForMe",
            };

            let fieldsToSelect = JSON.parse(JSON.stringify(airtableSettings.table.fields));

            // Adds [ Create for me ] to options
            // User can select an existing field
            // or tinySync can create one for them
            fieldsToSelect.unshift(createForMe);

            fieldsToSelect = utils.encapsulateObjectForSelect(fieldsToSelect);
            {
                // State field:
                airtableSettings.table.stateField = await state.p.select({
                    message: "State: Airtable field to store item state.",
                    options: fieldsToSelect,
                });

                if (state.p.isCancel(airtableSettings.table.stateField)) {
                    await flows.viewSyncs(state);
                }

                // If user selects "Create for me" create the field
                if (airtableSettings.table.stateField.tsCreateField) {
                    airtableSettings.table.stateField = await createStateField(airtableSettings, state);
                }
            }
            {
                // Last Published field:
                airtableSettings.table.lastPublishedField = await state.p.select({
                    message: "Last Published: Airtable field to store last published date/time.",
                    options: fieldsToSelect,
                });

                if (state.p.isCancel(airtableSettings.table.lastPublishedField)) {
                    await flows.viewSyncs(state);
                }

                // If user selects "Create for me" create the field
                if (airtableSettings.table.lastPublishedField.tsCreateField) {
                    airtableSettings.table.lastPublishedField = await createLastPublishedField(airtableSettings, state);
                }
            }
            {
                // Slug field:
                airtableSettings.table.slugField = await state.p.select({
                    message: "Slug: Airtable field to store Webflow item slug.",
                    options: fieldsToSelect,
                });

                if (state.p.isCancel(airtableSettings.table.slugField)) {
                    await flows.viewSyncs(state);
                }

                // If user selects "Create for me" create the field
                if (airtableSettings.table.slugField.tsCreateField) {
                    airtableSettings.table.slugField = await createSlugField(airtableSettings, state);
                }
            }
            {
                // Webflow Item ID field:
                airtableSettings.table.webflowItemIdField = await state.p.select({
                    message: "Webflow Item ID: Airtable field to store Webflow item ID.",
                    options: fieldsToSelect,
                });

                if (state.p.isCancel(airtableSettings.table.webflowItemIdField)) {
                    await flows.viewSyncs(state);
                }

                // If user selects "Create for me" create the field
                if (airtableSettings.table.webflowItemIdField.tsCreateField) {
                    airtableSettings.table.webflowItemIdField = await createWebflowItemIdField(airtableSettings, state);
                }
            }
        }
        return airtableSettings;
    } catch (error) {
        throw error;
    }
}

/**
 * Retrieves the API token from the user and returns the Airtable bases associated with the token.
 *
 * 1. Asks user for API Token
 * 2. Checks if token is valid by trying to get bases
 * 3. If not valid, asks user to try again
 * 4. If valid, returns the token and Airtable bases
 *
 *
 * @param {object} airtableSettings - The Airtable settings object.
 * @returns {Promise<object>} - A promise that resolves to the updated Airtable settings object.
 */
async function getApiTokenAndReturnBases(state) {
    try {
        const airtableSettings = {};

        let apiToken = await state.p.password({
            message: "Airtable API token:",
        });
        if (state.p.isCancel(apiToken)) {
            await flows.viewSyncs(state);
            return;
        }

        state.s.start("Checking API token...");
        // Check if API token is valid by trying to get bases
        let bases = await airtable.getBases(apiToken);
        state.s.stop(`✅ ${state.f.dim("Airtable token validated.")}`);

        // If API token is invalid, ask user to try again
        if (!bases) {
            state.p.log.error("Something went wrong.");
            state.p.log.message("Either your token is invalid, or it doesn't have 'create' permissions on any bases.");
            state.p.log.message("Please try again.");
            return await getApiTokenAndReturnBases(state); // Recursively call the function again
        }

        airtableSettings.apiToken = apiToken;
        airtableSettings.bases = bases;

        return airtableSettings;
    } catch (error) {
        throw error;
    }
}

async function createStateField(airtableSettings, state) {
    const syncConfig = {
        airtable: { ...airtableSettings },
    };

    const field = {
        name: "State [TinySync]",
        type: "singleSelect",
        description: "Tells TinySync how to proceed. Read the docs for more info.",
        options: {
            choices: [
                {
                    name: "Not synced",
                    color: "grayLight2",
                },
                {
                    name: "Queued for sync",
                    color: "redBright",
                },
                {
                    name: "Always sync",
                    color: "purpleBright",
                },
                {
                    name: "Staging",
                    color: "greenLight2",
                },
            ],
        },
    };
    state.s.start("Creating state field...");
    const response = await airtable.createField(field, syncConfig, state);
    state.s.stop(`✅ ${state.f.dim("State field created.")}`);
    return response;
}

async function createLastPublishedField(airtableSettings, state) {
    const syncConfig = {
        airtable: { ...airtableSettings },
    };

    const field = {
        name: "Last Published [TinySync]",
        type: "dateTime",
        description: "Stores the last published date/time.",
        options: {
            timeZone: "client",
            dateFormat: {
                name: "local",
            },
            timeFormat: {
                name: "12hour",
            },
        },
    };
    state.s.start("Creating last published field...");
    const response = await airtable.createField(field, syncConfig, state);
    state.s.stop(`✅ ${state.f.dim("Last published field created.")}`);

    return response;
}

async function createSlugField(airtableSettings, state) {
    const syncConfig = {
        airtable: { ...airtableSettings },
    };

    const field = {
        name: "Slug [TinySync]",
        type: "singleLineText",
        description: "Stores the Webflow item slug.",
    };
    state.s.start("Creating slug field...");
    const response = await airtable.createField(field, syncConfig, state);
    state.s.stop(`✅ ${state.f.dim("Slug field created.")}`);
    return response;
}

async function createWebflowItemIdField(airtableSettings, state) {
    const syncConfig = {
        airtable: { ...airtableSettings },
    };

    const field = {
        name: "Webflow Item ID [TinySync]",
        type: "singleLineText",
        description: "Stores the Webflow item ID.",
    };
    state.s.start("Creating webflow item ID field...");
    const response = await airtable.createField(field, syncConfig, state);
    state.s.stop(`✅ ${state.f.dim("Webflow item ID field created.")}`);
    return response;
}
