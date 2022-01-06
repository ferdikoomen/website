export const delayedCall = (callback: () => void, delay: number) => {
    const time = Date.now() + delay;

    const check = () => {
        if (Date.now() >= time) {
            callback();
        } else {
            requestAnimationFrame(() => check());
        }
    };

    requestAnimationFrame(() => check());
};
