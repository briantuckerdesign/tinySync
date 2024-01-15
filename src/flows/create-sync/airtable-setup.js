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

import { ui } from "../../ui/index.js";
import { airtable } from "../../airtable/index.js";
import c from "ansi-colors";

export async function airtableSetup(state) {
    try {
        let loader = state.loader;
        await ui.pretty.dashedLine();
        await ui.pretty.spacer();
        await ui.pretty.logHeading("Airtable");
        await ui.pretty.logBold("Let's get your Airtable information.");
        await ui.pretty.spacer();

        // Ask user for API token and return bases
        let airtableSettings = await getApiTokenAndReturnBases(state);

        // Ask user to select a base
        airtableSettings.base = await ui.selectAndReturn(airtableSettings.bases, "Airtable base:", "base");

        // Return tables for selected base
        airtableSettings.tables = await airtable.getTables(airtableSettings, state);

        // Ask user to select a table
        airtableSettings.table = await ui.selectAndReturn(airtableSettings.tables, "Airtable table:", "table");
        // Ask user to select a view
        airtableSettings.view = await ui.selectAndReturn(airtableSettings.table.views, "Airtable view:", "view");
        {
            //airtableSettings.table.fields is an array of objects
            // add one to the beginning of the array with name of "Create for me"
            let createForMe = {
                name: `${c.green("+")}${c.white(" Create for me")}`,
                tsCreateField: "createForMe",
            };

            // Adds [ Create for me ] to options
            // User can select an existing field
            // or tinySync can create one for them
            airtableSettings.table.fields.unshift(createForMe);

            // State field:
            airtableSettings.table.stateField = await ui.selectAndReturn(airtableSettings.table.fields, "State: Airtable field to store record state", "field");
            // If user selects "Create for me" create the field
            if (airtableSettings.table.stateField.tsCreateField) {
                airtableSettings.table.stateField = await createStateField(airtableSettings, state);
            }

            // Last Published field:
            airtableSettings.table.lastPublishedField = await ui.selectAndReturn(airtableSettings.table.fields, "Last Published: Airtable field to store the last published date/time.", "field");
            // If user selects "Create for me" create the field
            if (airtableSettings.table.lastPublishedField.tsCreateField) {
                airtableSettings.table.lastPublishedField = await createLastPublishedField(airtableSettings, state);
            }

            // Slug field:
            airtableSettings.table.slugField = await ui.selectAndReturn(airtableSettings.table.fields, "Slug: Airtable field to store Webflow item slug", "field");

            // If user selects "Create for me" create the field
            if (airtableSettings.table.slugField.tsCreateField) {
                airtableSettings.table.slugField = await createSlugField(airtableSettings, state);
            }

            // Webflow Item ID field:
            airtableSettings.table.webflowItemIdField = await ui.selectAndReturn(airtableSettings.table.fields, "Webflow Item ID: Airtable field to store Webflow item ID", "field");

            // If user selects "Create for me" create the field
            if (airtableSettings.table.webflowItemIdField.tsCreateField) {
                airtableSettings.table.webflowItemIdField = await createWebflowItemIdField(airtableSettings, state);
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

        // Ask user for API token
        let apiToken = await ui.input.prompt({
            name: "airtableApiToken",
            type: "password",
            message: "Airtable API token:",
        });

        // Check if API token is valid by trying to get bases
        let bases = await airtable.getBases(apiToken.airtableApiToken);

        // If API token is invalid, ask user to try again
        if (!bases) {
            console.log("Something went wrong! \nEither your API token is invalid, or it doesn't have 'create' permissions on any bases. \n\nPlease try again.");
            return await getApiTokenAndReturnBases(state); // Recursively call the function again
        }

        airtableSettings.apiToken = apiToken.airtableApiToken;
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
    const response = await airtable.createField(field, syncConfig, state);
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
    const response = await airtable.createField(field, syncConfig, state);

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
    const response = await airtable.createField(field, syncConfig, state);
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
    const response = await airtable.createField(field, syncConfig, state);
    return response;
}
