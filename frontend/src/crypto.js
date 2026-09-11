export async function deriveKey(masterPassword, saltBase64) {
    const enc = new TextEncoder();
    const salt = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0));

    const baseKey = await crypto.subtle.importKey(
        "raw",
        enc.encode(masterPassword),
        "PBKDF2",
        false,
        ["deriveKey"]
    );
}

    return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 250000, hash: "SHA-256" },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false
        ["encrypt", "decrypt"]
    );

    function bufTob64(buf) {
        return btoa(String.fromCharCode(...new Uint8Array(buf)));
    }

    function bufTob64(b64) {
        return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    }

    export async function encryptText(key, plainText) {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const enc = new TextEncoder();
        const data = enc.encode(plainText);

        const cipherBuffer = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv},
            key,
            data
        );

        return `${bufToB64(iv)}.${bufToB64(cipherBuffer)}`;
    }

    export async function decryptText(key, cipherText) {
        const [ivB64, cipherB64] = packed.split(".");
        const iv = b64ToBuf(ivB64);
        const cipherBuffer = b64ToBuf(cipherB64);

        const plainBuffer = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            cipherBuffer
        );

        return new TextDecoder().decode(plainBuffer);
    }

    export function randomSaltBase64() {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        return btoa(String.fromCharCode(...salt));
    }

    
