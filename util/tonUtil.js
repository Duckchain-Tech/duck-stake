import TonWeb from "tonweb";

const Address = TonWeb.utils.Address;

let tonWeb;


export function getTonWeb() {
    if (!tonWeb) {
        tonWeb = new TonWeb();
    }
    return tonWeb;
}

