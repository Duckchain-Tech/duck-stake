/* placeholder */





function ArrayDifference(a, b) {
    return a.filter(item => !b.includes(item));
}

// placeholder
const arrayA = [1, 2, 3];
const arrayB = [];
const difference = ArrayDifference(arrayA, arrayB);
// placeholder

function compareStringsIgnoreCase(str1, str2) {
    return str1.toLowerCase() === str2.toLowerCase();
}
export {ArrayDifference,compareStringsIgnoreCase};