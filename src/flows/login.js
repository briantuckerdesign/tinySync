/* -------------------------------------------------------------------------- */
/*                                Flows / Login                               */
/* -------------------------------------------------------------------------- */

import { ui } from "../ui/index.js";
import { configTools } from "../config-tools/index.js";

/**
 * Either prompts the user to log in, or to create a password.
 *
 * If logging in, decrypts config/stores in state
 * If creating a password, initializes config/stores in state
 *
 * @param {object} state - The state object.
 * @returns {Promise<void>} - A promise that resolves when the login process is complete.
 */
export async function login(state) {
    try {
        state.config = await configTools.load();

        if (!state.config.encryptedData) {
            await ui.pretty.log("Create a password to continue");
            state.password = await createPassword();
            state.config = await configTools.init(state);
        } else {
            await inputPassword(state);
        }
    } catch (error) {
        console.log("There was an error logging in.");
        process.exit(1);
    }
}

/**
 * Prompts the user to input a password and decrypts the configuration using the password.
 * If the password is incorrect, it prompts the user to try again.
 * @param {object} state - The state object containing the password and configuration.
 * @param {boolean} [repeat=false] - Indicates whether the function is being called recursively.
 * @throws {Error} - If an error occurs during the execution of the function.
 */
async function inputPassword(state, repeat = false) {
    if (!repeat) {
        await ui.pretty.log("Enter your password to continue.");
        await ui.pretty.spacer();
        // Only shown on first attempt
    }

    // Ask for password
    const password = await ui.input.prompt({
        name: "password",
        type: "password",
        message: "Enter your password:",
    });

    try {
        // try to drypt using password
        state.config = configTools.secure.decrypt(state.config, password.password);
        state.password = password.password;
    } catch (error) {
        // if password is incorrect, prompt user again
        await ui.pretty.log("Incorrect password. Try again.");
        await inputPassword(state, true);
    }
    return;
}

/**
 * Prompts the user to input a password and confirms it.
 * If the passwords don't match, prompts the user again.
 * @returns {Promise<string>} The password entered by the user.
 */
export async function createPassword() {
    // Ask for password
    const password = await ui.input.prompt({
        name: "password",
        type: "password",
        message: "Enter a password:",
    });
    // Ask for password again to confirm
    const confirmPassword = await ui.input.prompt({
        name: "confirmPassword",
        type: "password",
        message: "Confirm password:",
    });
    // If passwords don't match, prompt user again
    if (password.password !== confirmPassword.confirmPassword) {
        await ui.pretty.log("Passwords don't match. Try again.");
        await createPassword();
    } else {
        // If passwords match, return password
        return password.password;
    }
}
