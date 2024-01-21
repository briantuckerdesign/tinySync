/* -------------------------------------------------------------------------- */
/*                                    Start                                   */
/* -------------------------------------------------------------------------- */
/**
 * 1. Initialize state & loader
 * 2. Display welcome message
 * 3. Attempt login flow
 * 4. If successful, begin main menu flow
 */
import { flows } from "./flows/index.js";
import * as p from "@clack/prompts";
import f from "picocolors";
import { utils } from "./utils/index.js";

(async () => {
    let state = {
        config: null,
        password: null,
        p, // prompts (via clack)
        f, // format (via picocolors)
        s: p.spinner(), // spinner (via clack)
    };

    try {
        await utils.welcomeMessage(state);
    } catch (error) {
        console.log(error);
    }

    state.p.intro(state.f.dim(`tinySync v${process.env.npm_package_version}`)); // Fixed typo in variable name

    await flows.login(state);

    await flows.mainMenu(state);

    state.p.outro(`See ya later! 👋`);
})();
