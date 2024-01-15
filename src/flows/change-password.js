/* -------------------------------------------------------------------------- */
/*                           Flows / Change password                          */
/* -------------------------------------------------------------------------- */
/**
 * 1. Ask user to confirm
 * 2. If no, return to main menu
 * 3. If yes, ask for new password
 * 4. Confirm new password
 * 5. If passwords do not match, return to step 3
 * 6. If passwords match, change password in config
 * 7. Save config using new password
 *
 */

import { configTools } from "../config-tools/index.js";
import { ui } from "../ui/index.js";
import { flows } from "./index.js";
import { createPassword } from "./login.js";

export async function changePassword(state) {
    const confirmChange = await ui.input.toggle({
        name: "confirmChange",
        disabled: "No",
        enabled: "Yes",
        message: `Are you sure you want to change your password?`,
    });

    if (confirmChange) {
        state.password = await createPassword(state);
        await configTools.save(state);

        await ui.pretty.success();
        await ui.pretty.log("Password changed!");
        await flows.mainMenu(state);
    } else {
        await ui.pretty.ok();
        await flows.mainMenu(state);
    }

    if (newPassword !== newPasswordConfirm) {
        await ui.pretty.error("Passwords do not match.");
        await changePassword(state);
    } else {
        state.password = newPassword;
        await ui.pretty.log("Changing password...");
        await ui.pretty.spacer();
        await ui.pretty.dashedLine();
        await ui.pretty.spacer();
        await ui.pretty.log("Password changed.");
        await ui.pretty.spacer();
        await ui.pretty.dashedLine();
        await ui.pretty.spacer();
        await flows.mainMenu(state);
    }
}
