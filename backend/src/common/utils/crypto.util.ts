import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.TOKEN_ENCRYPTION_KEY 
  ? crypto.createHash('sha256').update(process.env.TOKEN_ENCRYPTION_KEY).digest()
  : crypto.createHash('sha256').update('crm-enterprise-default-secure-oauth-secret-key-2026').digest();

const IV_LENGTH = 16;

/**
 * Encrypts sensitive credentials (like OAuth access & refresh tokens) using AES-256-GCM
 */
export function encryptToken(plainText: string | null | undefined): string | null {
  if (!plainText) return null;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
    
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (err) {
    console.error('Failed to encrypt token:', err);
    return plainText;
  }
}

/**
 * Decrypts AES-256-GCM encrypted tokens safely
 */
export function decryptToken(cipherText: string | null | undefined): string | null {
  if (!cipherText) return null;
  
  // Check if formatted as encrypted token (iv:authTag:encrypted)
  const parts = cipherText.split(':');
  if (parts.length !== 3) {
    // Might be plaintext (legacy / unencrypted)
    return cipherText;
  }

  try {
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.warn('Failed to decrypt token (might be plain or invalid key):', err);
    return cipherText;
  }
}
