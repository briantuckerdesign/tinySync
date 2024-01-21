/* -------------------------------------------------------------------------- */
/*                                  Main menu                                 */
/* -------------------------------------------------------------------------- */

/**
 * 1. [ Ask user ] how to proceed
 *   - "View syncs" -> view syncs
 *   - "Change password" -> change password
 *   - "Exit" -> exit
 * 2. Execute selected option
 *
 * @param {object} state
 */

import { flows } from "./index.js";

export const mainMenu = async (state) => {
    try {
        state.p.log.info(state.f.bold("🏠 Menu"));
        const menu = await state.p.select({
            message: "What would you like to do?",
            options: [
                { value: "viewSyncs", label: "View syncs" },
                { value: "changePassword", label: "Change password" },
                { value: "exit", label: "Exit", hint: "Bye!" },
            ],
        });

        switch (menu) {
            case "viewSyncs":
                await flows.viewSyncs(state);
                break;
            case "changePassword":
                await flows.changePassword(state);
                break;
            default:
                state.p.outro("See ya later! 👋");
                process.exit(0);
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
};
