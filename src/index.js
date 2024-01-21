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
import { utils } from "./utils/index.js";
import * as p from "@clack/prompts";
import f from "picocolors";

(async () => {
    let state = {
        config: null,
        password: null,
        p, // p for prompts (via clack)
        f, // f for format (via picocolors)
        s: p.spinner(), // s for spinner (via clack)
    };

    try {
        await utils.welcomeMessage(state);
    } catch (error) {
        console.log("There was an error running tinySync.");
    }

    state.p.intro(state.f.dim(`tinySync v${process.env.npm_package_version}`));

    await flows.login(state);

    await flows.mainMenu(state);

    state.p.outro(`See ya later! 👋`);
})();
