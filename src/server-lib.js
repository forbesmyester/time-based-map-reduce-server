import R from 'ramda';

function pad(l, n) {
    while (("" + n).length < l) {
        n = '0' + n;
    }
    return n;
}

function addAndPad(toAdd, length, max) {
    return function([bucket, key]) {
        let pre = bucket + toAdd + key;
        return R.map((n) => {
            return [pre, String(pad(length, n))];
        }, R.range(0, max));
    };
}

    let regex = [
        ['second', /^d\d{5}-\d{2}\:\d{2}/],
        ['minute', /^d\d{5}-\d{2}/],
        ['hour', /^d\d{5}$/],
        ['day', /^d$/]
    ];

    let pres = { minute: ':', hour: '-', day: '' };

    let answers = {
        second: () => { return []; },
        minute: addAndPad(pres.minute, 2, 60),
        hour: addAndPad(pres.hour, 2, 60),
        day: addAndPad(pres.day, 2, 24)
    };

export function lastPossibleMilliInBucket([bucket, key]) {
    // let str = '';
    // for (let rgx of regex) {
    //     if (bucket.match(rgx[1])) {
    //         str = bucket + pres[rgx[0] + key;
    //     }
    // }
    let day = bucket.match(/^d(\d+)/);
    if (day) { day = day[1]; }

    if (bucket === 'd') {
        day = key;
    }

    let millisSinceEpochForDay = day * 24 * 60 * 60 * 1000;
    day = new Date(millisSinceEpochForDay);
    day = day.toISOString().replace(/T.*/, '');

    if (bucket === 'd') {
        return new Date(day + 'T23:59:59.999Z');
    }

    let constructorParts = day.split(/[^0-9]/);
    let leftOverParts = bucket.replace(/^d[0-9]+\-?/, '').split(/[^0-9]/);
    if ((leftOverParts.length == 1) && (leftOverParts[0] == '')) {
        leftOverParts = [];
    }
    leftOverParts.push(key);
    let defaults = [23, 59, 59, 999];
    while (defaults.length) {
        let val = defaults.shift();
        if (leftOverParts.length) {
            val = leftOverParts.shift();
        }
        constructorParts.push(val);
    }

    return new Date(constructorParts[0], constructorParts[1] - 1, constructorParts[2], constructorParts[3], constructorParts[4], constructorParts[5], constructorParts[6]);

}

export function getKeysWithin([bucket, key]) {
    for (let rgx of regex) {
        if (bucket.match(rgx[1])) {
            return answers[rgx[0]]([bucket, key]);
        }
    }
    throw new Error(JSON.stringify({
        err: "UNABLE_TO_GET_KEYS_IN",
        bucket: bucket,
        key: key
    }));
}
