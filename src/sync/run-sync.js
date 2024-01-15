/* -------------------------------------------------------------------------- */
/*                                 Sync / Run                                 */
/* -------------------------------------------------------------------------- */
import { airtable } from "../airtable/index.js";
import { webflow } from "../webflow/index.js";
import { sync } from "./index.js";
import { utils } from "../utils/index.js";
import { ui } from "../ui/index.js";
import c from "ansi-colors";
import { flows } from "../flows/index.js";

export async function runSync(state, syncConfig) {
    try {
        // start timer
        const startTime = new Date().getTime();
        await ui.pretty.dashedLine();
        await ui.pretty.syncing();
        await ui.pretty.spacer();

        let loader = state.loader;
        loader.text = "Syncing...";
        loader.start();

        // 1. Check if schema is current on both ends
        syncConfig = await utils.checkIfSchemaIsCurrent(syncConfig, loader, state);

        // 2. Fetch records from Airtable and Webflow
        const airtableRecords = await airtable.getRecords(syncConfig, loader);
        const webflowRecords = await webflow.getItems(syncConfig, loader);

        // 3. Sort records into create, update, delete, publish, and error arrays

        let { records } = await sync.sortRecords(syncConfig, airtableRecords, webflowRecords, loader);

        loader.stopAndPersist({
            text: `
Creating items: ${records.toCreate.length} 
Updating items: ${records.toUpdate.length}
Deleting items: ${records.toDelete.length}`,
        });

        // await new Promise((resolve) => setTimeout(resolve, 3000));

        loader.start("Syncing...");

        // 5. Create new items in Webflow
        await sync.createItems(records, syncConfig, loader, state);

        // 6. Update items in Webflow
        await sync.updateItems(records, syncConfig, loader, state);

        // 7. Publish the new and updated items in Webflow
        await sync.publishItems(records, syncConfig, loader, state);

        // 8. Delete items in that no longer exist in Airtable (optional)
        await sync.deleteItems(records, syncConfig, loader, state);

        loader.succeed("Sync complete!");
        // calculate time elapsed
        const endTime = new Date().getTime();
        const timeElapsed = (endTime - startTime) / 1000;
        await ui.pretty.log(c.gray(`${timeElapsed} seconds.`));

        if (syncConfig.errors.length === 0) {
            await ui.pretty.success();
            await flows.viewSync(state, syncConfig);
        } else {
            await ui.pretty.error();
            await ui.pretty.spacer();
        }
    } catch (error) {
        console.log("Error running sync");
        throw error;
    }
}
