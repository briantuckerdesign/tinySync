/* -------------------------------------------------------------------------- */
/*                                Config tools                                */
/* -------------------------------------------------------------------------- */
/**
 * Any time we manipulate the config file, we use this module.
 *
 * This ensures keys are always encrypted when saved.
 */
import { saveConfig } from "./save.js";
import { initConfig } from "./init.js";
import { loadConfig } from "./load.js";
import { secure } from "./secure.js";

export const configTools = {
    save: saveConfig,
    init: initConfig,
    load: loadConfig,
    secure,
};
