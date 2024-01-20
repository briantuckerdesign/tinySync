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

import { flows } from "./index.js";

export async function viewSyncs(state) {
    try {
        const config = state.config;
        if (!config.syncs) {
            config = { syncs: [] };
        }
        const syncs = config.syncs || [];

        // Formats syncs for select prompt
        const choices = syncs.map((sync) => {
            return {
                label: state.f.italic(sync.name),
                value: sync,
            };
        });

        choices.push(
            {
                label: "Create new sync",
                value: "createSync",
            },
            {
                label: "Back",
                value: "back",
            },
            {
                label: "Exit",
                value: "exit",
            }
        );

        // Returns the selected sync
        let selectedSync = await state.p.select({
            message: state.f.bold("🔍 View syncs"),
            options: choices,
        });

        if (state.p.isCancel(selectedSync)) {
            await flows.mainMenu(state);
        }

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
