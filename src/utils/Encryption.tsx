//AADHAAR ENCRYPTION 
const encryptAadhaar = async (publicKey: string, aadhaarNumber: string) => {
    return new Promise((resolve, reject) => {
        importRsaKey(publicKey)
            .then(publicKey => {
                encryptDataWithPublicKey(aadhaarNumber, publicKey)
                    .then(encryptedData => {
                        const encryptedDataString = ab2str(encryptedData)
                        const encryptedDataStringBase64Encoded = window.btoa(encryptedDataString)
                        resolve(encode(encryptedDataStringBase64Encoded))
                    })
            })
    })
}

const str2ab = (str: string) => {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

const ab2str = (str: ArrayBuffer) => {
    const byteArray = new Uint8Array(str);
    let byteString = '';
    for (let i = 0; i < byteArray.byteLength; i++) {
        byteString += String.fromCodePoint(byteArray[i]);
    }
    return byteString;
}

// IMPORT PUBLICKEY STRING TO KEY OBJECT 
const importRsaKey = (pemContents: string) => {
    // base64 decode the string to get binary data
    const binary = window.atob(decode(pemContents));
    // convert binary data to an ArrayBuffer
    const binaryAb = str2ab(binary);
    // MDN WEB DOCS - https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey
    return window.crypto.subtle.importKey(
        "spki", // SubjectPublicKeyInfo -> Format for public keys
        binaryAb, // ArrayBuffer of the binary key data
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        }, // Algorithm
        false, // False since we won't be exporting the key object to portable format
        ["encrypt"] // Specifies that the key will be used for encryption
    );
}

// ENCRYPT DATA WITH PUBLIC KEY OBJECT
const encryptDataWithPublicKey = (data: string, key: CryptoKey) => {
    const dataToEncrypt: ArrayBuffer = str2ab(data);
    // MDN WEB DOCS - https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt
    return window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP"
        },
        key,
        dataToEncrypt
    );
}

// base64URL -> base64
const decode = (input: string) => {
    // Replace non-url compatible chars with base64 standard chars
    input = input
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    // Pad out with standard base64 required padding characters
    var pad = input.length % 4;
    if (pad) {
        if (pad === 1) {
            throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
        }
        input += new Array(5 - pad).join('=');
    }
    return input;
}

//base64 -> base64URL
const encode = (input: string) => {
    // Replace non-url compatible chars with base64 standard chars
    input = input
        .replace(/\+/g, '-')
        .replace(/\//g, '_').replace(/\=/g, '');
    // Pad out with standard base64 required padding characters
    var pad = input.length % 4;
    if (pad) {
        if (pad === 1) {
            throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
        }
        input += new Array(5 - pad).join('=');
    }
    return input;
}

export {
    encryptAadhaar
}