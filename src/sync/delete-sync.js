/* -------------------------------------------------------------------------- */
/*                             Sync / Delete sync                             */
/* -------------------------------------------------------------------------- */
import { flows } from "../flows/index.js";
import { configTools } from "../config-tools/index.js";

export async function deleteSync(state, syncConfig) {
    const confirmDelete = await state.p.confirm({ message: `Are you sure you want to delete ${syncConfig.name}?` });

    if (state.p.isCancel(confirmDelete) || confirmDelete === false) {
        await flows.viewSync(state, syncConfig);
        return;
    }

    if (confirmDelete) {
        const syncs = state.config.syncs;
        // Returns all syncs except the one to delete
        state.config.syncs = syncs.filter((sync) => {
            return sync.name !== syncConfig.name;
        });

        await configTools.save(state);

        state.p.log.message(`✅ ${state.f.bold(syncConfig.name)} deleted.`);
        await flows.viewSyncs(state);
    } else {
        await flows.viewSync(state, syncConfig);
    }
}
