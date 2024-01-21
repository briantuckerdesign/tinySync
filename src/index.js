/* -------------------------------------------------------------------------- */
/*                                    Start                                   */
/* -------------------------------------------------------------------------- */
/**
 * 1. Initialize state & loader
 * 2. Display welcome message
 * 3. Attempt login flow
 * 4. If successful, begin main menu flow
 */
import { ui } from "./ui/index.js";
import { flows } from "./flows/index.js";
import ora from "ora";
import * as p from "@clack/prompts";
import f from "picocolors";

(async () => {
    let loader = ora({ spinner: "arc", color: "gray" });

    let state = {
        config: null,
        password: null,
        loader, // to be removed
        p, // prompts/loader (via clack)
        f, // format (via picocolors)
        s: p.spinner(),
    };
    await ui.pretty.heading("TinySync", "green");
    await ui.pretty.spacer();
    await ui.pretty.signature();
    await ui.pretty.spacer();

    state.p.intro(state.f.dim(`tinySync v${process.env.npm_package_version}`)); // Fixed typo in variable name

    await flows.login(state);

    await flows.mainMenu(state);

    state.p.outro(`See ya later! 👋`);
})();
