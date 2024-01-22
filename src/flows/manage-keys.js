export async function manageKeys(state) {
    try {
        state.p.log.info(state.f.bold("🔑 Manage keys"));
    } catch (error) {
        throw error;
    }
}
