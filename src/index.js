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

(async () => {
    let loader = ora({ spinner: "arc", color: "gray" });

    let state = {
        config: null,
        password: null,
        loader,
    };

    await ui.pretty.spacer();
    await ui.pretty.solidLine();
    await ui.pretty.heading("TinySync", "green");
    await ui.pretty.spacer();
    await ui.pretty.signature();
    await ui.pretty.spacer();

    await flows.login(state);
    await flows.mainMenu(state);
})();
