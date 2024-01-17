import fs from "fs";
import { configTools } from "./index.js";
/* -------------------------------------------------------------------------- */
/*                             Config tools / Save                            */
/* -------------------------------------------------------------------------- */
/**
 * Saves the application configuration to a file after encrypting it.
 *
 * @param {object} state - The state object containing the configuration to be saved.
 *    It should include a 'config' property with the configuration data and a 'password'
 *    property for encryption.
 * @returns {Promise<void>} A promise that resolves once the configuration has been
 *    encrypted and saved to the file.
 *
 * Note: This function encrypts the configuration data using `configTools.secure.encrypt`,
 * which is assumed to be an available utility for encryption. The 'password' from
 * the state object is used for this purpose. After encryption, the function writes
 * the encrypted data to `./src/data/config.json`. The operation is synchronous
 * as it uses `fs.writeFileSync`. Care should be taken to ensure the password
 * and encryption method are secure.
 */

export async function saveConfig(state) {
    const password = state.password;

    state.config.version = process.env.npm_package_version;

    const encryptedConfig = await configTools.secure.encrypt(JSON.stringify(state.config), password);

    fs.writeFileSync("./src/data/config.json", JSON.stringify(encryptedConfig, null, 2));
}
