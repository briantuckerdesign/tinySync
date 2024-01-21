/* -------------------------------------------------------------------------- */
/*                                 Sync / Run                                 */
/* -------------------------------------------------------------------------- */
import { airtable } from "../airtable/index.js";
import { webflow } from "../webflow/index.js";
import { sync } from "./index.js";
import { utils } from "../utils/index.js";
import { AsciiTable3 } from "ascii-table3";
import { flows } from "../flows/index.js";

export async function runSync(state, syncConfig) {
    try {
        state.p.log.info(state.f.bold("🌐 Syncing"));

        // start timer
        const startTime = new Date().getTime();

        // 1. Check if schema is current on both ends
        state.s.start("Validating schemas...");
        syncConfig = await utils.checkIfSchemaIsCurrent(syncConfig, state);
        state.s.stop(`✅ ${state.f.dim("Schemas validated.")}`);

        // 2. Fetch records from Airtable and Webflow
        state.s.start("Getting records/items...");
        const [airtableRecords, webflowRecords] = await Promise.all([airtable.getRecords(syncConfig), webflow.getItems(syncConfig)]);
        state.s.stop(`✅ ${state.f.dim("Records/items retrieved.")}`);

        // 3. Sort records into create, update, and delete arrays
        let { records } = await sync.sortRecords(syncConfig, airtableRecords, webflowRecords);

        // 4. Log the number of records to create, update, and delete
        let table = new AsciiTable3().setHeading("", "Records").addRowMatrix([
            ["To Create", records.toCreate.length],
            ["To Update", records.toUpdate.length],
            ["To Delete", records.toDelete.length],
        ]);
        state.p.note(`${table.toString()}`);

        // 5. Create new items in Webflow
        await sync.createItems(records, syncConfig, state);

        // 6. Update items in Webflow
        await sync.updateItems(records, syncConfig, state);

        // 7. Publish the new and updated items in Webflow
        await sync.publishItems(records, syncConfig, state);

        // 8. Delete items in that no longer exist in Airtable (optional)
        await sync.deleteItems(records, syncConfig, state);

        // calculate time elapsed
        const endTime = new Date().getTime();
        const timeElapsed = (endTime - startTime) / 1000;

        state.p.log.success("✅ Sync complete");
        state.p.log.message(`⏱  ${timeElapsed} seconds`);

        if (syncConfig.errors.length === 0) {
            await flows.viewSync(state, syncConfig);
        }
    } catch (error) {
        state.p.log.error("Error running sync");
        throw error;
    }
}
