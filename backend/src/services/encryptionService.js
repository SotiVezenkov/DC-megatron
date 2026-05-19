const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";

const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update("temporary-development-key")
  .digest();

function encryptSecret(secret) {
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(secret, "utf8", "hex");
  encrypted += cipher.final("hex");

  const payload = {
    encrypted,
    iv: iv.toString("hex"),
    authTag: cipher.getAuthTag().toString("hex"),
  };

  return JSON.stringify(payload);
}

function decryptSecret(encryptedValue) {
  const payload = JSON.parse(encryptedValue);

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    ENCRYPTION_KEY,
    Buffer.from(payload.iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(payload.authTag, "hex"));

  let decrypted = decipher.update(payload.encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

module.exports = {
  encryptSecret,
  decryptSecret,
};