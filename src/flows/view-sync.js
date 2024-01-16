/* -------------------------------------------------------------------------- */
/*                             Flows / View sync                              */
/* -------------------------------------------------------------------------- */

/**
 * 1. Displays sync details:
 *    - Sync name
 *    - Custom domains
 *    - Site/Base
 *    - Table/Collection
 *    - Settings
 * 2. [ Ask user ] how to proceed
 *    - "Sync" -> run sync
 *    - "Publish site" -> publish site
 *    - "Delete sync" -> delete sync
 *    - "Back" -> view syncs
 *
 *
 * @param {object} state
 * @param {object} syncConfig
 */

import { sync } from "../sync/index.js";
import { ui } from "../ui/index.js";
import c from "ansi-colors";
import { flows } from "./index.js";
import { printTable } from "console-table-printer";

export async function viewSync(state, syncConfig) {
    try {
        {
            await ui.pretty.spacer();
            await ui.pretty.dashedLine();
            await ui.pretty.spacer();
            await ui.pretty.log("Sync details:");
            await ui.pretty.spacer();
            await ui.pretty.logBold(c.inverse(`     ${syncConfig.name}     `));
            await ui.pretty.spacer();
            if (syncConfig.webflow.site.customDomains.length > 0) {
                for (const domain of syncConfig.webflow.site.customDomains) {
                    await ui.pretty.log(`${c.dim(`${domain.url}`)}`);
                }
            } else {
                await ui.pretty.log(`${c.dim("No custom domains. Publishing to Webflow subdomain.")}`);
            }
            await ui.pretty.spacer();
            //Create a table
            const syncDetails = [
                {
                    _: "Site/Base",
                    Airtable: syncConfig.airtable.base.name,
                    Webflow: syncConfig.webflow.site.name,
                },
                {
                    _: "Table/Collection",
                    Airtable: syncConfig.airtable.table.name,
                    Webflow: syncConfig.webflow.collection.name,
                },
            ];
            printTable(syncDetails);
            const settings = [
                {
                    Setting: "Publish on error",
                    Value: syncConfig.autoPublish,
                },
                {
                    Setting: "Airtable SSOT",
                    Value: syncConfig.deleteRecords,
                },
            ];
            printTable(settings);

            await ui.pretty.spacer();
        }

        const syncMessage = "What would you like to do?";
        const syncChoices = [
            {
                message: `${c.green("»")} Sync`,
                name: "runSync",
            },
            { message: `${c.cyan("↑")} Publish site`, name: "publishSite" },
            { message: `${c.red("✖")} Delete sync`, name: "deleteSync" },
            { message: `${c.dim("←")} Back`, name: "back" },
            { message: `${c.dim("✖")} Exit`, name: "exit" },
        ];

        // Asks user what they want to do with the selected sync
        const userChoice = await ui.input.select({
            name: "syncMenu",
            message: syncMessage,
            choices: syncChoices,
        });

        switch (userChoice) {
            case "runSync":
                await sync.run(state, syncConfig);
                break;
            case "publishSite":
                await sync.publish(state, syncConfig);
                break;
            case "deleteSync":
                await sync.delete(state, syncConfig);

            case "back":
                await flows.viewSyncs(state);
                break;
            case "exit":
                await ui.pretty.log("Exiting...");
                process.exit();
            default:
                break;
        }
    } catch (error) {
        // TODO: handle
        throw error;
    }
}
