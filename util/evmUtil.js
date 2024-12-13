import Web3 from 'web3';

function verifyEvmConnectSignature(walletAddress,signature){
    const originalMessage="Welcome to DuckChain";
    // const originalMessage="131313";
    const signingAddress = new Web3().eth.accounts.recover(originalMessage, signature);
    const valid = signingAddress.toLowerCase() === walletAddress.toLowerCase();
    return valid;
}

// placeholder
function Signature(message,pk) {
    const signature = new Web3().eth.accounts.sign(message,pk);
    return signature;
}

export {verifyEvmConnectSignature}

// console.log(verifyEvmConnectSignature("0xF48276d7AFc876778506d76Db61f3c8135d36dAe","0xc63617c98671222d78d14e0f5a7687305e21598bff7679e5fabc4d9149b20ce52827a8f945772719b0f6e39f5f7f83076d7ac260ab265abd9d5b2a92efe8265e1b"));
// console.log(verifyEvmConnectSignature("0xF48276d7AFc876778506d76Db61f3c8135d36dAe","0xc63617c98671222d78d14e0f5a7687305e21598bff7679e5fabc4d9149b20ce52827a8f945772719b0f6e39f5f7f83076d7ac260ab265abd9d5b2a92efe8265e1b"));
// console.log(Signature("Welcome to DuckChain","0x64ef78161b743052a0b4732dce2a3ccbae15ec19cf98b83bdcd8a928668f1bd4"));
// console.log(verifyEvmConnectSignature("0x3641492135DdD323C701E08FEe058B8903CcB1f7","0x9f387092eae3ce526f3d8c97aaade0b9fe53f218f734e8e1802732b99c973d037b1a90e7f5dc367238030897934fe0d3204bcb8db068ef9b9a179bce36f1f9801b"));