import {getMultiPrice} from "../../util/getTokenPrice.js";
import {logger} from "../../util/logUtil.js";


async function excutegetMultiPrice() {
    logger.info("begin excutegetMultiPrice by:", new Date());
    await getMultiPrice();
    await new Promise(resolve => setTimeout(resolve, 3600000));
    excutegetMultiPrice();
}

excutegetMultiPrice();
