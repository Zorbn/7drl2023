export const randomInt = (range) => {
    return Math.floor(Math.random() * range);
}

export const wrap = (value, max) => {
    if (value < 0) {
        return max - 1;
    } else if (value >= max) {
        return 0;
    }

    return value;
}