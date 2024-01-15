import crypto from "crypto";
/* -------------------------------------------------------------------------- */
/*                            Config tools / Secure                           */
/* -------------------------------------------------------------------------- */

export const secure = {
    encrypt,
    decrypt,
};

/* -------------------------------------------------------------------------- */
/*                              Secure / Encrypt                              */
/* -------------------------------------------------------------------------- */
/**
 * Encrypts a text string using a specified password.
 *
 * @param {string} text - The text to be encrypted.
 * @param {string} password - The password to use for generating the encryption key.
 * @returns {object} An object containing the initialization vector (iv), salt,
 *    and encrypted data, all as hex strings.
 *
 * Note: This function generates a random salt and initialization vector (iv) for
 * each encryption process. It uses the PBKDF2 algorithm to derive a key from the
 * password and salt, and then encrypts the text using AES-256-CBC. The resulting
 * encrypted data, along with the iv and salt, are returned as hex strings.
 */

function encrypt(text, password) {
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha512");
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString("hex"), salt: salt.toString("hex"), encryptedData: encrypted.toString("hex") };
}
/* -------------------------------------------------------------------------- */
/*                              Secure / Decrypt                              */
/* -------------------------------------------------------------------------- */
/**
 * Decrypts encrypted data using a specified password.
 *
 * @param {object} encrypted - An object containing the iv, salt, and encryptedData,
 *    all as hex strings.
 * @param {string} password - The password to use for generating the decryption key.
 * @returns {object} The decrypted data as a JSON object.
 * @throws {Error} Throws an error if decryption fails.
 *
 * Note: This function uses the provided iv and salt to generate a key using the
 * PBKDF2 algorithm. It then uses this key to decrypt the encrypted data with AES-256-CBC.
 * The function assumes that the encrypted data is a JSON string and parses it into
 * a JSON object. It includes error handling for decryption failures.
 */
function decrypt(encrypted, password) {
    try {
        const iv = Buffer.from(encrypted.iv, "hex");
        const salt = Buffer.from(encrypted.salt, "hex");
        const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha512");
        const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
        let decrypted = decipher.update(Buffer.from(encrypted.encryptedData, "hex"));
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        const decryptedString = decrypted.toString();
        return JSON.parse(decryptedString);
    } catch (error) {
        throw error;
    }
}
