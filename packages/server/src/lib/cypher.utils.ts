import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV — recommended for GCM
const SALT_LEN = 16; // 128-bit salt for key derivation
const KEY_LENGTH = 32; // 256-bit key for AES-256
const SEPARATOR = ":"; // delimiter between encoded segments

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────

export interface EncryptResult {
  encrypted: string; // full portable ciphertext: salt:iv:authTag:ciphertext (base64)
  salt: string; // base64 — stored so decrypt can re-derive the same key
  iv: string; // base64 — required for GCM decryption
  authTag: string; // base64 — GCM authentication tag (tamper detection)
  ciphertext: string; // base64 — the actual encrypted payload
}

// ─────────────────────────────────────────────
//  Key derivation
//  scrypt turns an arbitrary passphrase into a
//  fixed-length cryptographic key deterministically.
// ─────────────────────────────────────────────

function deriveKey(passphrase: string, salt: Buffer): Buffer {
  return scryptSync(passphrase, salt, KEY_LENGTH);
}

// ─────────────────────────────────────────────
//  ENCRYPT
// ─────────────────────────────────────────────

/**
 * Encrypts a plaintext value with a passphrase using AES-256-GCM.
 *
 * @param value      - The plaintext string to encrypt.
 * @param passphrase - The secret key / password.
 * @returns          An `EncryptResult` whose `.encrypted` field is the
 *                   self-contained portable ciphertext you can store or transmit.
 *
 * @example
 * const { encrypted } = encrypt("hello world", "my-secret-key");
 * console.log(encrypted);
 * // → "a3f1...base64...salt:iv:authTag:ciphertext"
 */
export function encrypt(value: string, passphrase: string): EncryptResult {
  const salt = randomBytes(SALT_LEN);
  const iv = randomBytes(IV_LENGTH);
  const key = deriveKey(passphrase, salt);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Encode every component as base64 for safe transport/storage
  const b64 = (buf: Buffer) => buf.toString("base64");

  const saltB64 = b64(salt);
  const ivB64 = b64(iv);
  const authTagB64 = b64(authTag);
  const ciphertextB64 = b64(ciphertext);

  return {
    encrypted: [saltB64, ivB64, authTagB64, ciphertextB64].join(SEPARATOR),
    salt: saltB64,
    iv: ivB64,
    authTag: authTagB64,
    ciphertext: ciphertextB64,
  };
}

// ─────────────────────────────────────────────
//  DECRYPT
// ─────────────────────────────────────────────

/**
 * Decrypts a ciphertext produced by `encrypt()`.
 *
 * @param encryptedValue - The `.encrypted` string returned by `encrypt()`.
 * @param passphrase     - The same secret key used during encryption.
 * @returns              The original plaintext string.
 * @throws               If the passphrase is wrong or the ciphertext was tampered with.
 *
 * @example
 * const plaintext = decrypt(encrypted, "my-secret-key");
 * console.log(plaintext); // → "hello world"
 */
export function decrypt(encryptedValue: string, passphrase: string): string {
  const parts = encryptedValue.split(SEPARATOR);

  if (parts.length !== 4) {
    throw new Error(
      "Invalid ciphertext format. Expected: salt:iv:authTag:ciphertext",
    );
  }

  const [saltB64, ivB64, authTagB64, ciphertextB64] = parts;

  const salt = Buffer.from(saltB64, "base64");
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const ciphertext = Buffer.from(ciphertextB64, "base64");

  const key = deriveKey(passphrase, salt);
  const decipher = createDecipheriv(ALGORITHM, key, iv);

  decipher.setAuthTag(authTag); // GCM will throw if the tag doesn't match

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return plaintext.toString("utf8");
}

export class Cypher {
  static encrypt(value: string, passphrase: string): EncryptResult {
    return encrypt(value, passphrase);
  }

  static decrypt(encryptedValue: string, passphrase: string): string {
    return decrypt(encryptedValue, passphrase);
  }
}

// ─────────────────────────────────────────────
//  Quick demo (remove in production)
// ─────────────────────────────────────────────

const SECRET = "super-secret-passphrase-123";
const PLAIN_TEXT = "Pay $1,250.00 to wallet 0xABCDEF…";

const result = encrypt(PLAIN_TEXT, SECRET);
const recovered = decrypt(result.encrypted, SECRET);

console.log("Original  :", PLAIN_TEXT);
console.log("Encrypted :", result.encrypted);
console.log("Decrypted :", recovered);
console.log("Match     :", recovered === PLAIN_TEXT);
