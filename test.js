
const t = (coinList, target) => {
    var coinListLength = coinList.length;
    var inf = 10000000000;
    var dp = new Array(target + 1).fill(inf);
    dp[0] = 0;
    for (var num = 1; num <= target; num++) {
        for (var j = 0; j < coinListLength; j++) {
            let coin = coinList[j];
            if (num >= coin) {
                console.log(dp[num - coin] + 1)
                dp[num] = Math.min(dp[num], dp[num - coin] + 1);
            }
        }
    }
    console.log(dp)
    return dp[target]
}

const m = (coinList, target) => {
    let targetCopy = target;
    let count = 0;
    const coinListSorted = coinList.sort((a,b)=> b-a)
    while (targetCopy > 0) {
        for (let i = 0; i < coinList.length; i++) {
            if (targetCopy >= coinListSorted[i]) {
                count += Math.floor(targetCopy / coinListSorted[i]);
                targetCopy = targetCopy % coinListSorted[i];
            }
        }
    }

    return count==0? -1 : count;
}
var target = 23;
var a = [2, 5, 10, 25];
console.log(t(a, target));