/* -------------------------------------------------------------------------- */
/*                           UI / Select and return                           */
/* -------------------------------------------------------------------------- */
import { ui } from "./index.js";

export async function selectAndReturn(choices, message, name = "name") {
    const selected = ui.input.select({
        name: name,
        message: message,
        choices: choices,
        margin: [1, 1, 1, 1],
        result: (name) => {
            const selectedOption = choices.find((choice) => choice.name === name);
            return selectedOption;
        },
    });
    return selected;
}
