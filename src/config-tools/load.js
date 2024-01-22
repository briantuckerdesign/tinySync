import fs from "fs/promises";
/* -------------------------------------------------------------------------- */
/*                             Config tools / Load                            */
/* -------------------------------------------------------------------------- */
/**
 * Loads the application configuration from a JSON file.
 *
 * @returns {Promise<object>} A promise that resolves to the configuration object
 *    loaded from the file.
 *
 * Note: This function attempts to read a configuration file from a specified path
 * (`./src/data/config.json`). If the file does not exist, it creates a new file with
 * an empty object as its content and then retries loading the configuration.
 * In case of other errors (not related to file non-existence), the error is thrown
 * for the caller to handle. This function is an asynchronous operation and should be
 * awaited when called.
 */

export const loadConfig = async () => {
    try {
        // Read the file
        const filePath = "./src/data/config.json";
        const file = await fs.readFile(filePath, "utf8");
        let config = JSON.parse(file);
        config = handleVersionChanges(config);

        return config;
    } catch (error) {
        // If the file doesn't exist, create it.
        if (error.code === "ENOENT") {
            await fs.writeFile("./src/data/config.json", "{}", "utf8");
            // Try again
            return await loadConfig();
        } else {
            // If there is an error other than file not found, throw it.
            // TODO: Handle error
            throw error;
        }
    }
};
function handleVersionChanges(config) {
    // todo
    return config;
}
