/* -------------------------------------------------------------------------- */
/*                                Flows / Login                               */
/* -------------------------------------------------------------------------- */

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
    state.p.log.info(state.f.bold("🔐 Login"));
    try {
        state.config = await configTools.load();

        if (!state.config.encryptedData) {
            await createPassword(state);
            state.config = await configTools.init(state);
        } else {
            await inputPassword(state);
        }
        state.p.log.success(state.f.green("Success!"));
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
    let message = "Incorrect password. Try again.";
    if (!repeat) {
        message = "Enter your password:";
    }

    const password = await state.p.password({
        message: message,
    });

    if (state.p.isCancel(password)) {
        state.p.cancel("Ok then...");
        process.exit(0);
    }

    try {
        // try to drypt using password
        state.config = configTools.secure.decrypt(state.config, password);
        state.password = password;
    } catch (error) {
        // if password is incorrect, prompt user again
        await inputPassword(state, true);
    }
    return;
}

/**
 * Prompts the user to input a password and confirms it.
 * If the passwords don't match, prompts the user again.
 * @returns {Promise<string>} The password entered by the user.
 */
export async function createPassword(state, isRepeat = false) {
    let message = "Create a password:";
    if (isRepeat) message = "Passwords don't match. Try again.";

    let password = await state.p.password({ message: message });
    if (state.p.isCancel(password)) {
        state.p.cancel("Ok then...");
        process.exit(0);
    }
    message = "Confirm password:";
    let confirmPassword = await state.p.password({ message: message });

    if (state.p.isCancel(confirmPassword)) {
        state.p.cancel("Ok then...");
        process.exit(0);
    }
    // If passwords don't match, prompt user again
    if (password !== confirmPassword) {
        await createPassword(state, true);
    } else {
        // If passwords match, set password in state
        state.password = password;
        return;
    }
}
