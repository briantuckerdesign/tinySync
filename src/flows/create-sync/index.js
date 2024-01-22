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

        state.p.log.info(state.f.bold("🔨 Create sync"));
        state.p.note(`You will need a few things to get started:

    - Airtable API token
    - Webflow API key

    - Airtable fields (tinySync can create these for you)
        - Name 
        - Slug
        - State
        - Webflow item ID
        - Last published

Read more about these required fields on Github.`);

        const shallWeContinue = await state.p.confirm({ message: "Got it?" });

        if (shallWeContinue === false || state.p.isCancel(shallWeContinue)) {
            await flows.viewSyncs(state);
            return;
        }

        let airtableSettings = await airtableSetup(state);
        let webflowSettings = await webflowSetup(state);

        state.p.log.info(state.f.bold("Field matching"));
        state.p.log.message("Hopefully it's not too confusing...");

        let fields = await matchFields(airtableSettings, webflowSettings, state);

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

        state.p.log.info(state.f.bold("Settings"));

        settings = await state.p.group(
            {
                syncName: () => state.p.text({ message: "What would you like to name this sync?" }),
                autoPublish: () => state.p.confirm({ message: "Automatically publish site if validation error occurs?" }),
                deleteRecords: () => state.p.confirm({ message: "Delete records from Webflow if they are deleted in Airtable?" }),
            },
            {
                onCancel: async ({ results }) => {
                    await flows.viewSyncs(state);
                    return;
                },
            }
        );

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

        state.p.log.success("✅ Sync added successfully!");
        state.p.log.message("");
    } catch (error) {
        state.p.log.error("There was an error creating the sync.");
        throw error;
    }
}
