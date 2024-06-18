function getStartOfDayTimestamp() {
    const now = new Date();
    // console.log(`now ${now}`);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    return startOfDay.getTime();
}


function isoToTimestamp(isoString) {
    const date = new Date(isoString);
    return date.getTime();
}

function gettimestampSeconds(){
    const timestampSeconds = Math.floor(Date.now() / 1000);
    // console.log("Timestamp in seconds:", timestampSeconds);
    return timestampSeconds;
}
// Test the function
// console.log(getStartOfDayTimestamp());

function getTodayUnixTimeRange() {
    const now = new Date();

    // placeholder
    const startOfDay = new Date(now.setHours(0, 0, 0, 0)).getTime() / 1000;

    // placeholder
    const endOfDay = new Date(now.setHours(24, 0, 0, 0)).getTime() / 1000;

    return {
        startOfDay: Math.floor(startOfDay),  // placeholder
        endOfDay: Math.floor(endOfDay)       // placeholder
    };
}

function getNowDateUnix() {
    return Math.floor((new Date()).getTime() / 1000);
}
export {getStartOfDayTimestamp,isoToTimestamp,gettimestampSeconds,getTodayUnixTimeRange,getNowDateUnix}

// console.log(getNowDateUnix());
