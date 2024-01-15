/* -------------------------------------------------------------------------- */
/*                             Flows / Create sync                            */
/* -------------------------------------------------------------------------- */
/**
 * This section is a monster.
 *
 * 1. Notify user of requirements and ask if they want to continue
 * 2. Initialize Airtable and Webflow settings via separate sub functions
 * 3. Ask user to match fields
 * 4. Ask user for additional settings
 * 5. Create sync object
 * 6. Save updated config
 *
 */
import { ui } from "../../ui/index.js";
import { v4 as uuidv4 } from "uuid";
import { configTools } from "../../config-tools/index.js";
import { flows } from "../index.js";
import { airtableSetup } from "./airtable-setup.js";
import { webflowSetup } from "./webflow-setup.js";
import { matchFields } from "./match-fields/index.js";

export async function createSync(state) {
    try {
        let config = state.config;
        let settings, syncSettings;

        await ui.pretty.spacer();
        await ui.pretty.logHeading("You will need a few things to get started:");
        await ui.pretty.log("- A couple minutes of your time");
        await ui.pretty.log("- An Airtable table with some ");
        await ui.pretty.log("  matching fields in a Webflow collection");
        await ui.pretty.log("- Airtable API token");
        await ui.pretty.log("- Webflow API key");
        await ui.pretty.log("- Airtable fields for:");
        await ui.pretty.log("  - Name");
        await ui.pretty.log("  - Slug");
        await ui.pretty.log("  - State");
        await ui.pretty.log("  - Webflow Item ID");
        await ui.pretty.log("  - Last Published");
        await ui.pretty.log("Read more about these required fields on Github.");
        await ui.pretty.spacer();

        const shallWeContinue = await ui.input.toggle({
            name: "requirements",
            disabled: "Uhhh nevermind.",
            enabled: "Yes!",
            message: "Got it?",
        });
        if (shallWeContinue === false) {
            await flows.viewSyncs(state);
        }

        let airtableSettings = await airtableSetup(state);
        let webflowSettings = await webflowSetup(state);

        await ui.pretty.dashedLine();
        await ui.pretty.spacer();
        await ui.pretty.logHeading("Field Matching");
        await ui.pretty.log("Hopefully it's not too confusing...");
        await ui.pretty.spacer();

        let fields = await matchFields(airtableSettings, webflowSettings);

        /**
         * Settings
         *
         * 1. Ask user to name the sync
         *
         * 2. Ask user if they want to auto publish when validation
         *    error occurs. This is a common error, but risky if often
         *    making changes directly in Webflow.
         *
         * 3. Ask user if they want to delete records from Webflow if
         *    they are deleted in Airtable. I think of this is
         *    "Total sync mode", where Airtable is the source of truth.
         *    What you see in Airtable is what you get in Webflow.
         */

        await ui.pretty.dashedLine();
        await ui.pretty.spacer();
        await ui.pretty.logHeading("Settings");
        await ui.pretty.log("Okay a couple final details...");
        await ui.pretty.spacer();

        // Ask user for additional settings
        settings = await ui.input.prompt([
            {
                type: "input",
                name: "syncName",
                message: "What would you like to name this sync?",
            },
            {
                type: "toggle",
                name: "autoPublish",
                message: "Automatically publish site if validation error occurs?",
            },
            {
                type: "toggle",
                name: "deleteRecords",
                message: "Delete records from Webflow if they are deleted in Airtable?",
            },
        ]);

        /**
         * Sync object output
         *
         * This is the format for a sync object.
         * This is encrypted before saving.
         *
         */

        syncSettings = {
            id: uuidv4(),
            name: settings.syncName,
            autoPublish: settings.autoPublish,
            deleteRecords: settings.deleteRecords,
            publishToSubdomain: false,
            errors: [],
            fields: fields,
            airtable: {
                apiToken: airtableSettings.apiToken,
                base: {
                    id: airtableSettings.base.id,
                    name: airtableSettings.base.name,
                },
                table: {
                    id: airtableSettings.table.id,
                    name: airtableSettings.table.name,
                    view: airtableSettings.view,
                    fields: airtableSettings.table.fields,
                    primaryFieldId: airtableSettings.table.primaryFieldId.id,
                    slugFieldId: airtableSettings.table.slugField.id,
                    lastPublishedFieldId: airtableSettings.table.lastPublishedField.id,
                    stateFieldId: airtableSettings.table.stateField.id,
                    itemIdFieldId: airtableSettings.table.webflowItemIdField.id,
                },
            },
            webflow: {
                apiKey: webflowSettings.apiKey,
                site: {
                    id: webflowSettings.site.id,
                    name: webflowSettings.site.name,
                    customDomains: webflowSettings.site.customDomains,
                },
                collection: {
                    id: webflowSettings.collection.id,
                    slug: webflowSettings.collection.slug,
                    name: webflowSettings.collection.name,
                    fields: webflowSettings.collection.fields,
                },
            },
        };

        config.syncs.push(syncSettings);

        state.config = config;
        await configTools.save(state);

        await ui.pretty.success();
        await ui.pretty.logBold("Sync added successfully!");
    } catch (error) {
        console.log("Error creating sync.");
        throw error;
    }
}
