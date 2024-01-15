/* -------------------------------------------------------------------------- */
/*                                   Webflow                                  */
/* -------------------------------------------------------------------------- */
/**
 * Any time we talk to Webflow directly, we use this module.
 *
 * Note, this is not the official webflow js package,
 * as I wasn't happy with how it works with api v2 at this time.
 * These use axios.
 *
 * Future TODO: switch to referencing by ID to simplify... everything.
 */
import { deleteAllItems } from "./delete-all-items.js";
import { deleteItem } from "./delete-item.js";
import { getCollection } from "./get-collection.js";
import { getCollections } from "./get-collections.js";
import { getFields } from "./get-fields.js";
import { getItems } from "./get-items.js";
import { getSchema } from "./get-schema.js";
import { getSites } from "./get-sites.js";
import { publishItem } from "./publish-item.js";
import { publishItems } from "./publish-items.js";
import { publishSite } from "./publish-site.js";
import { createItem } from "./create-item.js";
import { updateItem } from "./update-item.js";

export const webflow = {
    deleteAllItems,
    deleteItem,
    getFields,
    getCollection,
    getCollections,
    getItems,
    getSchema,
    getSites,
    publishItem,
    publishItems,
    publishSite,
    createItem,
    updateItem,
};
