import { airtable } from "../airtable/index.js";
import { configTools } from "../config-tools/index.js";
import { utils } from "../utils/index.js";
import { webflow } from "../webflow/index.js";
import { flows } from "./index.js";
import { v4 as uuidv4 } from "uuid";
export async function manageKeys(state) {
    try {
        state.p.log.info(state.f.bold("🔑 Manage keys"));
        let keys = state.config.keys;
        // create name that equals label
        keys.forEach((key) => {
            if (key.platform === "webflow") {
                key.name = `${key.label} [Webflow]`;
            }
            if (key.platform === "airtable") {
                key.name = `${key.label} [Airtable]`;
            }
        });
        let keysToSelect = utils.encapsulateObjectForSelect(keys);
        let createNewKey = {
            value: "createNewKey",
            label: "+ Create new key",
        };
        keysToSelect.unshift(createNewKey);
        let back = { value: "back", label: "Back" };
        keysToSelect.push(back);

        const selectedKey = await state.p.select({
            message: "Select a key",
            options: keysToSelect,
        });
        if (state.p.isCancel(selectedKey)) {
            await flows.mainMenu(state);
            return;
        }

        if (selectedKey === "createNewKey") {
            await createKey(state);
        } else if (selectedKey === "back") {
            await flows.mainMenu(state);
        } else {
            await manageKey(state, selectedKey);
        }
    } catch (error) {
        throw error;
    }
}

async function createKey(state) {
    let platform, apiKey, keyLabel;

    {
        // Ask user for platform
        platform = await state.p.select({
            message: "Select a platform",
            options: [
                { value: "airtable", label: "Airtable" },
                { value: "webflow", label: "Webflow" },
            ],
        });
        if (state.p.isCancel(platform)) {
            await flows.manageKeys(state);
            return;
        }
    }

    {
        // Ask user for label for API token
        keyLabel = await state.p.text({ message: "Key label" });
        if (state.p.isCancel(keyLabel)) {
            await flows.manageKeys(state);
            return;
        }
    }

    {
        // Ask user for API key
        apiKey = await state.p.password({ message: "API key" });
        if (state.p.isCancel(apiKey)) {
            await flows.manageKeys(state);
            return;
        }
    }

    {
        // test token
        if (platform === "airtable") {
            state.s.start("Checking API token...");
            let bases = await airtable.getBases(apiKey);

            // If API token is invalid, ask user to try again
            if (!bases) {
                state.p.log.error("Either your token is invalid, or it doesn't have 'create' permissions on any bases.");
                state.s.stop();
                return await flows.manageKeys(state); // Recursively call the function again
            }
            state.s.stop(`✅ ${state.f.dim("Airtable token validated.")}`);
        }
        if (platform === "webflow") {
            state.s.start("Checking API key...");

            let sites = await webflow.getSites(apiKey, state);

            // If API token is invalid, ask user to try again
            if (!sites) {
                state.p.log.error("Either your key is invalid, or it doesn't have proper permissions.");
                state.s.stop();
                return await flows.manageKeys(state); // Recursively call the function again
            }
            state.s.stop(`✅ ${state.f.dim("Webflow key validated.")}`);
        }
    }

    const key = {
        label: keyLabel,
        value: apiKey,
        platform: platform,
        id: uuidv4(),
    };
    // Save API token to config
    state.config.keys.push(key);

    await configTools.save(state);

    state.p.log.success("✅ Key created!");

    await flows.manageKeys(state);
}

async function manageKey(state, selectedKey) {
    try {
        const selectedAction = await state.p.select({
            message: "What would you like to do?",
            options: [
                { value: "renameKey", label: "Rename key" },
                { value: "deleteKey", label: "Delete key" },
                { value: "back", label: "Back" },
            ],
        });
        if (state.p.isCancel(selectedAction)) {
            await flows.manageKeys(state);
            return;
        }

        switch (selectedAction) {
            case "renameKey":
                await renameKey(state, selectedKey);
                break;
            case "deleteKey":
                await deleteKey(state, selectedKey);
                break;
            default:
                await manageKeys(state);
        }
    } catch (error) {
        throw error;
    }
}

async function renameKey(state, selectedKey) {
    try {
        const newLabel = await state.p.text({
            message: "Enter a new label",
            initialValue: selectedKey.label,
        });
        if (state.p.isCancel(newLabel)) {
            await manageKey(state, selectedKey);
            return;
        }

        const key = state.config.keys.find((key) => key.id === selectedKey.id);
        key.label = newLabel;

        await configTools.save(state);
        state.p.log.success("✅ Key renamed!");

        await flows.manageKeys(state);
    } catch (error) {
        throw error;
    }
}

async function deleteKey(state, selectedKey) {
    try {
        const confirmDelete = await state.p.confirm({
            message: `Are you sure you want to delete ${state.f.bold(selectedKey.label)}?`,
        });
        if (state.p.isCancel(confirmDelete) || !confirmDelete) {
            await manageKey(state, selectedKey);
            return;
        }

        state.config.keys = state.config.keys.filter((key) => key.id !== selectedKey.id);
        await configTools.save(state);
        state.p.log.success("✅ Key deleted!");

        await flows.manageKeys(state);
    } catch (error) {
        throw error;
    }
}
