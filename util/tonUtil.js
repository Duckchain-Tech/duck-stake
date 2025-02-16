import TonWeb from "tonweb";

const Address = TonWeb.utils.Address;

let tonWeb;


export function getTonWeb() {
    if (!tonWeb) {
        tonWeb = new TonWeb();
    }
    return tonWeb;
}


export function addressTransfer(address) {
    const rawAddress = new Address(address);
    const bounceableAddress1 = rawAddress.toString( true, false,true);
    const bounceableAddress2 = bounceableAddress1.replaceAll("/","_");
    return {
        rawAddress: rawAddress.toString(false)
        , friendlyAddress: rawAddress.toString(true)
        , bounceableAddress1:bounceableAddress1,
        bounceableAddress2: bounceableAddress2
    };
}


// console.log(await getTonWeb());
// console.log(addressTransfer("UQCRPlnu7OyIF7IBiyys8phNDBu7fo86zBLyhTVjfZxCcs7c"));
// console.log(addressTransfer("0:2f956143c461769579baef2e32cc2d7bc18283f40d20bb03e432cd603ac33ffc"));
