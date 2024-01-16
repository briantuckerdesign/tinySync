/* -------------------------------------------------------------------------- */
/*                             Flows / View syncs                             */
/* -------------------------------------------------------------------------- */

/**
 * 1. Create array of syncs from config
 * 2. Add additional options to array
 * 3. [ Ask user ] how to proceed
 *    - (List of syncs to view) -> view sync
 *    - "Create new sync" -> create sync
 *    - "Back" -> main menu
 *    - "Exit" -> exit
 * 4. Execute selected option
 */

import { ui } from "../ui/index.js";
import { flows } from "./index.js";
import c from "ansi-colors";

export async function viewSyncs(state) {
    try {
        await ui.pretty.spacer();
        await ui.pretty.dashedLine();
        await ui.pretty.spacer();
        const config = state.config;
        if (!config.syncs) {
            config = { syncs: [] };
        }
        const syncs = config.syncs || [];

        // Formats syncs for select prompt
        const choices = syncs.map((sync) => {
            return {
                name: sync.name,
                value: sync,
            };
        });

        choices.push(
            {
                name: `${c.green("+")} Create new sync`,
                value: "createSync",
            },
            {
                name: `${c.dim("←")} Back`,
                value: "back",
            },
            {
                name: `${c.dim("✖")} Exit`,
                value: "exit",
            }
        );

        // Asks user which sync they want to view
        async function selectSyncs(choices) {
            const syncToView = await ui.selectAndReturn(choices, "Which sync would you like to view?", "syncToView");

            return syncToView.value;
        }

        // Returns the selected sync
        let selectedSync = await selectSyncs(choices);

        switch (selectedSync) {
            case "back":
                await flows.mainMenu(state);
                break;
            case "exit":
                process.exit();
            case "createSync":
                await flows.createSync(state);
                await flows.viewSyncs(state);
                break;
            default:
                await flows.viewSync(state, selectedSync);
                break;
        }
    } catch (error) {
        // TODO: Handle error
        throw error;
    }
}
