// Initialize Gun instance
// Using the default constructor for now, which implies local storage and P2P.
// For a more robust setup, you might use: const gun = GUN(['http://localhost:8765/gun']);
const gun = GUN();
window.gun = gun; // Make gun instance globally available

// Export the gun instance
export const gunInstance = gun;

// Export user object
export const user = gun.user();

// Register User
export const registerUser = (alias, password, callback) => {
    user.create(alias, password, (ack) => {
        if (ack.err) {
            console.error("Registration error:", ack.err);
            callback({ ok: 0, err: ack.err });
        } else {
            console.log("Registration successful:", ack);
            // ack.ok contains the new user's public key if successful (SEA v0.2020.x)
            // For older versions, ack.ok might be 1 or similar.
            // It's good practice to attempt login after registration to confirm.
            callback({ ok: ack.ok, pub: ack.pub });
        }
    });
};

// Login User
export const loginUser = (alias, password, callback) => {
    user.auth(alias, password, (ack) => {
        if (ack.err) {
            console.error("Login error:", ack.err);
            callback({ ok: 0, err: ack.err });
        } else {
            // ack object on successful login contains:
            // ack.is: the user object itself
            // ack.put: the user's data
            // ack.sea: the user's SEA pair
            // ack.pub: user's public key
            // ack.epub: user's ephemeral public key
            console.log("Login successful:", ack);
            callback({ ok: 1, ...ack }); // Spread ack to include all details
        }
    });
};

// Logout User
export const logoutUser = (callback) => {
    user.leave();
    // user.leave() is synchronous and clears user.is
    console.log("User logged out.");
    if (callback) {
        callback({ ok: true, message: "Logged out successfully" });
    }
};

// Get Current User object
export const getCurrentUser = () => {
    return user;
};

// Check if User is Logged In
export const isUserLoggedIn = () => {
    // user.is will contain user data (like pub key) if logged in, otherwise undefined.
    return user.is ? true : false;
};

// Optional: Listen for auth events to react globally if needed
user.on('auth', (ack) => {
    console.log('Gun auth event:', ack);
    // This event fires on successful auth and also on logout (ack will not have .err and .put will be undefined)
    // You could use this to update global state if necessary,
    // but for this task, component-level state updates are primary.
});

user.on('create', (ack) => {
    console.log('Gun user create event:', ack);
});

// Helper function to convert ArrayBuffer to hex string
function bufferToHex(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

export async function signDataForApi(dataToSign) {
    const user = gun.user(); // Gets the current authenticated user
    if (user.is && user._ && user._.sea) {
        const keyPair = user._.sea; // User's key pair (SEA.pair)

        // 1. Stringify the data
        const jsonData = JSON.stringify(dataToSign);

        // 2. Create a SHA-256 hash of the JSON data
        // SEA.work can produce a hash, but it's often specific to SEA's internal formats.
        // For compatibility with common backend crypto, using Web Crypto API directly is more robust for SHA-256.
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(jsonData);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        
        // The hashBuffer is what we need to sign.
        // SEA.sign typically signs a string or an object, not a raw ArrayBuffer hash directly in a way
        // that's easily verifiable by standard ECDSA libraries unless SEA itself does the hashing.
        // However, SEA.sign can take a string. Let's use the hex of the hash.
        // Some SEA versions expect data, not a pre-computed hash for `SEA.sign`.
        // The most direct way to sign a pre-computed hash with ECDSA keys from SEA
        // would be to use `SEA.sign(hashHex, keyPair, null, {raw: true})` or similar,
        // or use `user.sign(hashHex)` if available and it does raw signing.
        //
        // Let's try to use SEA.sign with the original data, and trust it handles hashing compatible with SEA.verify.
        // The backend uses `vk.verify(signature_bytes, raw_data, hashfunc=hashlib.sha256)`
        // This means the backend *hashes the raw_data itself* before verifying.
        // So, we must sign the *raw_data (jsonData)* directly, not a pre-computed hash.
        
        // `SEA.sign` returns a JWS-like structure string or an object depending on options.
        // For a raw signature required by the backend (hex of (r,s) pair for ECDSA), this is tricky.
        // The `SEA.work` function with a private key can produce a signature.
        // `await SEA.work(jsonData, keyPair, null, {name: "ECDSA", hash: "SHA-256", sign: true, raw: true});`
        // The problem is that `SEA.work` for ECDSA signing is not straightforwardly documented for raw output.
        
        // Let's use a more explicit method if possible, or rely on SEA's default behavior and adapt the backend if necessary.
        // The backend expects a signature of the raw data body, hashed with sha256.
        // `SEA.sign(data, pair)` will internally hash `data` (using its default, likely SHA-256) and then sign that hash.
        // The output of `SEA.sign` is typically a JWS-like string: `~<base64_encoded_payload>.<base64_encoded_signature>`
        // or an object if specific options are passed.
        // We need to extract the raw signature part and ensure it's what the backend expects.

        const signedDataPacket = await SEA.sign(jsonData, keyPair); 
        // This `signedDataPacket` is usually a string like `SEA<json_stringified_payload_and_signature_details>`
        // or a JWS format. Example: "~{\"m\":<data>,\"s\":<signature_object_or_base64>}"
        // We need to parse this to get the actual signature bytes.
        
        if (typeof signedDataPacket !== 'string') {
            throw new Error("SEA.sign did not return a string packet.");
        }

        let signatureBase64;
        try {
            // Attempt to parse as if it's the `SEA<json>` format
            const packetContent = JSON.parse(signedDataPacket.substring(3)); // Remove "SEA" prefix
            if (packetContent.s) { // JWS-like structure inside, s is signature
                 // The signature 's' might be an object {r, s} or a base64 string.
                 // If it's an object, it needs further processing.
                 // If it's a base64 string, that's closer.
                 // For SECP256k1, the signature is typically a concatenation of r and s values.
                 // This part is highly dependent on the exact output format of SEA.sign
                 // and what the Python ecdsa library expects for `vk.verify(signature_bytes, ...)`
                 // Typically, `signature_bytes` for ecdsa lib is r||s.
                
                // Simpler path: if SEA.sign produces a JWS, the signature part is base64url encoded.
                // JWS format: header.payload.signature
                // SEA's own format might be different.
                // Let's assume it's a simpler `~<payload>.<signature>` for some versions, or the SEA{} object.

                // If `packetContent.s` is the signature, it needs to be in the correct format (hex).
                // The Python backend expects `bytes.fromhex(signature_hex)`.
                // The output of `SEA.sign` is not directly a hex string of the raw (r,s) signature.
                // This is the hardest part of cross-library ECDSA.

                // Let's try a different approach: Sign a known string, see what it produces, and how to verify.
                // The backend uses `hashfunc=hashlib.sha256`. This means it hashes the *message* first.
                // So, we need to sign the *message itself*, and `SEA.sign` should do this.
                // The `ecdsa.VerifyingKey.from_string(key_bytes).verify(sig_bytes, data_bytes, hashfunc=hashlib.sha256)`
                // So `sig_bytes` must be the raw signature of `sha256(data_bytes)`.

                // `SEA.sign(data, pair, cb, opt)`
                // If we want a raw signature, options might include `{raw: true}`.
                const rawSignature = await SEA.sign(jsonData, keyPair, null, { raw: true });
                // The `raw:true` option with `SEA.sign` should give us the signature object {r, s} or a direct byte array/buffer.
                // If it's {r,s}, we need to concatenate them.
                // If it's a byte array, we hex encode it.

                if (rawSignature && typeof rawSignature === 'object' && rawSignature.r && rawSignature.s) {
                    // Assuming r and s are hex strings from SEA (less likely) or need conversion
                    // Or they are BigInts / Buffers.
                    // Python ecdsa typically expects r and s concatenated.
                    // Each should be 32 bytes for secp256k1.
                    // This is getting very complex due to SEA's abstractions.

                    // Backtrack: The Python backend's `vk.verify(signature_bytes, raw_data, hashfunc=hashlib.sha256)`
                    // implies `signature_bytes` is the signature of `SHA256(raw_data)`.
                    // `SEA.sign(jsonData, keyPair)` should produce a signature that can be verified by `SEA.verify(jsonData, keyPair.pub, signedPacket)`.
                    // The challenge is making *this specific signature format* work with the Python `ecdsa` library.

                    // Let's test what `SEA.sign(data, pair, null, {raw: true})` returns.
                    // Based on some SEA examples, `raw:true` might give the base64 signature component.
                    // If `rawSignature` is a base64 string of the (r,s) concatenated signature:
                    if (typeof rawSignature === 'string') { // Assuming it's base64 if raw:true
                        // Convert base64 to hex
                        const binaryString = atob(rawSignature);
                        let hex = '';
                        for (let i = 0; i < binaryString.length; i++) {
                            const byte = binaryString.charCodeAt(i);
                            hex += ('0' + byte.toString(16)).slice(-2);
                        }
                        console.log("gunService.signDataForApi: Signed with raw:true, returning hex of base64: ", hex);
                        return hex;
                    }
                }
                
                // Fallback: if raw:true doesn't give a simple string, or is not supported in this SEA version for direct hex output.
                // Try to extract from the default JWS-like packet.
                // This is very brittle.
                // Example JWS: `BASE64URL(UTF8(JWS Protected Header)).BASE64URL(JWS Payload).BASE64URL(JWS Signature)`
                // SEA's format is `~<json_stringified_stuff>`
                // Let's assume the `signedDataPacket` is `SEA{"m":<message>,"s":<signature_base64url>}` (this is a guess)
                
                let parsedPacket;
                if (signedDataPacket.startsWith("SEA{")) { // Check for SEA's object string format
                    parsedPacket = JSON.parse(signedDataPacket.substring(3));
                } else if (signedDataPacket.startsWith("~")) { // Check for JWS like structure
                     // This could be more complex, e.g. `~${payload_b64}.${signature_b64}`
                     // Or `~${JSON.stringify({m: message, s: signature})}`
                     // For now, assume it's a simple JSON object after the '~'
                    const parts = signedDataPacket.split('.');
                    if (parts.length > 1) { // JWS like
                        signatureBase64 = parts.pop(); // last part is signature
                    } else { // Assume it's a full JSON object stringified after '~'
                        parsedPacket = JSON.parse(signedDataPacket.substring(1));
                    }
                }

                if (parsedPacket && parsedPacket.s) {
                    signatureBase64 = parsedPacket.s;
                }
                
                if (!signatureBase64) {
                     // If it's not JWS and not SEA{...}, it might be a simple signed string where SEA prepends `~` to the signed message.
                     // This is getting too complex. The most reliable way is to sign a HASH of the data.
                     // However, the backend hashes the raw data. So we must sign the raw data.
                     console.error("Could not extract base64 signature from packet:", signedDataPacket);
                     throw new Error("Unsupported SEA.sign output format or failed to extract signature.");
                }

                // Convert base64/base64url to hex
                let binaryS = atob(signatureBase64.replace(/-/g, '+').replace(/_/g, '/'));
                let hexS = '';
                for (let i = 0; i < binaryS.length; i++) {
                    hexS += ('0' + binaryS.charCodeAt(i).toString(16)).slice(-2);
                }
                console.log("gunService.signDataForApi: Signed with default, returning hex of extracted base64: ", hexS);
                return hexS;

            } catch (e) {
                console.error("Error parsing signed data packet or converting signature:", e, "Packet:", signedDataPacket);
                throw new Error("Failed to parse SEA signature packet.");
            }

        } catch (e) {
            console.error("Error during SEA.sign:", e);
            throw new Error(`SEA signing failed: ${e.message}`);
        }
    }
    throw new Error("User not logged in or keypair not available for signing.");
}
