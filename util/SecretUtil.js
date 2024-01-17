function generateRandomNonce(length = 16) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let nonce = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        nonce += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return nonce;
}

// Test the function
//console.log(generateRandomNonce());
//console.log(generateRandomNonce(24)); // Generating a nonce with a specific length

function generateInviteCode(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let nonce = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        nonce += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return nonce;
}

export {generateRandomNonce,generateInviteCode};