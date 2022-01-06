let time: number = 0;
const duration: number = 400;
let start: number = 0;
let end: number = 0;
let change: number = 0;
let cb: (() => void) | null = null;

const ease = (t: number, b: number, c: number, d: number) => {
    return c * ((t = t / d - 1) * t * t + 1) + b;
};

const render = () => {
    const t = Date.now();
    const delta = t - time;
    const ratio = Math.min(ease(delta, 0, 1, duration), 1);
    const complete = ratio >= 1;

    window.scrollTo(0, start + ratio * change);

    if (complete) {
        cb && cb();
    } else {
        requestAnimationFrame(() => render());
    }
};

export const scrollToPos = (position: number, callback: () => void) => {
    start = window.pageYOffset !== undefined ? window.pageYOffset : window.scrollY;
    end = position;
    change = end - start;
    time = Date.now();
    cb = callback;
    requestAnimationFrame(() => render());
};
