/* -------------------------------------------------------------------------- */
/*                                     UI                                     */
/* -------------------------------------------------------------------------- */
import enquirer from "enquirer";
import { pretty } from "./pretty.js";
import { selectAndReturn } from "./select-and-return.js";
export const ui = {
    pretty,
    input: enquirer,
    selectAndReturn,
};
