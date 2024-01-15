export function findSpecial(fieldName, syncConfig) {
    return syncConfig.fields.find((field) => field.specialField === fieldName);
}
