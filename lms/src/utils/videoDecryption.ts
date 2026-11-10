import CryptoJS from 'crypto-js';

/**
 * Decrypts a Laravel-style encrypted video URL using the user's Bearer Token.
 * 
 * @param encryptedData - The base64 encoded JSON payload from the backend.
 * @param bearerToken - The user's authentication token used as the decryption key.
 * @returns The decrypted plain-text URL.
 */
export function decryptVideoUrl(encryptedData: string, bearerToken: string): string {
    if (!encryptedData || !bearerToken) return encryptedData;

    // If it's already a direct URL (not encrypted), return it as is
    if (encryptedData.startsWith('http') || encryptedData.includes('youtube.com')) {
        return encryptedData;
    }

    try {
        // 1. Generate the key using SHA256 of the bearer token
        const key = CryptoJS.SHA256(bearerToken);

        // 2. Decode the Laravel payload (Base64 -> JSON)
        // Using window.atob for client-side decoding
        const payload = JSON.parse(window.atob(encryptedData));

        // 3. Parse IV and Encrypted Value from Base64
        const iv = CryptoJS.enc.Base64.parse(payload.iv);
        const encryptedValue = CryptoJS.enc.Base64.parse(payload.value);

        // 4. Perform AES-256-CBC Decryption
        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: encryptedValue } as any,
            key,
            {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        );

        const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

        if (!decryptedText) {
            throw new Error('Decryption resulted in empty string');
        }

        return decryptedText;
    } catch (error) {
        console.error('Video Decryption Error:', error);
        // Return original data as fallback if decryption fails
        return encryptedData;
    }
}