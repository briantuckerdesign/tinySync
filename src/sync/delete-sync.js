/* -------------------------------------------------------------------------- */
/*                             Sync / Delete sync                             */
/* -------------------------------------------------------------------------- */
import { ui } from "../ui/index.js";
import { flows } from "../flows/index.js";
import { configTools } from "../config-tools/index.js";

export async function deleteSync(state, syncConfig) {
    const confirmDelete = await ui.input.toggle({
        name: "confirmDelete",
        disabled: "No, don't delete!",
        enabled: "Yes",
        message: `Are you sure you want to delete ${syncConfig.name}?`,
    });

    if (confirmDelete) {
        const syncs = state.config.syncs;
        // Returns all syncs except the one to delete
        state.config.syncs = syncs.filter((sync) => {
            return sync.name !== syncConfig.name;
        });

        await configTools.save(state);

        await ui.pretty.success();
        await ui.pretty.log("Sync deleted successfully!");
        await flows.viewSyncs(state);
    } else {
        await ui.pretty.ok();
        await flows.viewSync(state, syncConfig);
    }
}
