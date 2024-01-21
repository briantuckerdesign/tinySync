/* -------------------------------------------------------------------------- */
/*                                    Flows                                   */
/* -------------------------------------------------------------------------- */
/**
 * Flows are the main entry points for the application.
 *
 * Each user flow is visualized here:
 * https://www.figma.com/file/obXOZS1GoeVKKjJojHK0Dl/User-Flows
 */
import { login } from "./login.js";
import { mainMenu } from "./main-menu.js";
import { viewSync } from "./view-sync.js";
import { viewSyncs } from "./view-syncs.js";
import { createSync } from "./create-sync/index.js";
import { changePassword } from "./change-password.js";
import { manageKeys } from "./manage-keys.js";

export const flows = {
    manageKeys,
    login,
    mainMenu,
    viewSyncs,
    viewSync,
    createSync,
    changePassword,
};
