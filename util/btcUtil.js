import bitcore from "bitcore-lib";
//https://testbridgeapi.duckchain.io/user/btc_login?address=bc1qavlx8ehvh05jmaqa08ft8cvcc6hczxahldr30n&sig=IFtFVIotHG3O1jSZmCw8tV2v69DTQra02MoWKxEEeke6cQGru3W0WNMtLWrFpB%2BqG5J7AuMYugFbP0CK05C1Htc%3D&publicKey=034772a3b9f9ba95853048e719beea30159879addb81f8e59a836392903854255d
function decryptSignature(){
    const oriText=`Welcome to DuckChain:
bc1p7mm84ywghhk7u6fvaajvxpmv6znz7xqr9q59dqpc4ftm3peyftlsk5wnfx`;

    const sig="IFtFVIotHG3O1jSZmCw8tV2v69DTQra02MoWKxEEeke6cQGru3W0WNMtLWrFpB+qG5J7AuMYugFbP0CK05C1Htc";
    const message = new bitcore.Message(oriText);

    const signature = bitcore.crypto.Signature.fromCompact(Buffer.from(sig, 'base64'));
    const hash = message.magicHash();

    const ecdsa = new bitcore.crypto.ECDSA();
    ecdsa.hashbuf = hash;
    ecdsa.sig = signature;

    const pubkeyInSig = ecdsa.toPublicKey();

    const pubkeyInSigString = new bitcore.PublicKey(
        Object.assign({}, pubkeyInSig.toObject(), {compressed: true})
    ).toString();
    console.log("pubkeyInSigString::",pubkeyInSigString);
}

decryptSignature();