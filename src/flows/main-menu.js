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

import { ui } from "../ui/index.js";
import { flows } from "./index.js";
import c from "ansi-colors";

export const mainMenu = async (state) => {
    try {
        await ui.pretty.spacer();
        await ui.pretty.dashedLine();
        await ui.pretty.spacer();

        const choices = [
            { message: `${c.green("»")} View syncs`, name: "viewSyncs" },
            { message: `${c.yellow("»")} Change password`, name: "changePassword" },
            { message: `${c.dim("✖")} Exit`, name: "exit" },
        ];
        const userChoice = await ui.input.select({
            name: "mainMenu",
            message: " ",
            choices: choices,
        });

        switch (userChoice) {
            case "viewSyncs":
                await flows.viewSyncs(state);
                break;
            case "changePassword":
                await flows.changePassword(state);
                break;
            case "exit":
                await ui.pretty.log("Exiting...");
                process.exit();
        }
    } catch (error) {
        throw error;
    }
};
