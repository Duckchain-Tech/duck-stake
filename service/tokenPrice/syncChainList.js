import {logger} from "../../util/logUtil.js";
import {getAllChainList} from "../../util/okxPrice.js";
import {addChainApiInfo, chainNameAndIdExist} from "../tokenService.js";

async function excutegetAllChainList() {
    logger.info("begin excutegetAllChainList by:", new Date());
    const chainList = await getAllChainList();
    if (chainList && chainList.length >0){
        for (const chainInfo of chainList) {
            const chainId = Number(chainInfo.chainId);
            const chainFullName = chainInfo.chainFullName;
            const chainShortName = chainInfo.chainShortName;

            if (!await chainNameAndIdExist(chainShortName,chainId)){
                await addChainApiInfo(chainId,chainFullName,chainShortName);
            }
            // console.log(chainId,chainFullName,chainShortName);
        }
    }
    await new Promise(resolve => setTimeout(resolve, 24 * 60 * 60 * 1000));
    excutegetAllChainList();
}

excutegetAllChainList();
