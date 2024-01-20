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
import { flows } from "./index.js";
import { createPassword } from "./login.js";

export async function changePassword(state) {
    const confirmChange = await state.p.confirm({ message: "Are you sure you want to change your password?" });

    if (state.p.isCancel(confirmChange) || !confirmChange) {
        state.p.log.message(state.f.yellow("Ok..."));
        await flows.mainMenu(state);
        return;
    }

    if (confirmChange) {
        await createPassword(state);
        state.p.log.success("Password changed!");
        await configTools.save(state);
        await flows.mainMenu(state);
        return;
    }
}
