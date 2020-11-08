let time: number = 0;
const duration: number = 400;
let start: number = 0;
let end: number = 0;
let change: number = 0;
let cb: (() => void) | null = null;

function ease(t: number, b: number, c: number, d: number): number {
    return c * ((t = t / d - 1) * t * t + 1) + b;
}

function render(): void {
    const t: number = Date.now();
    const delta: number = t - time;
    const ratio: number = Math.min(ease(delta, 0, 1, duration), 1);
    const complete: boolean = ratio >= 1;

    window.scrollTo(0, start + ratio * change);

    if (complete) {
        cb && cb();
    } else {
        requestAnimationFrame(() => render());
    }
}

export function scrollToPos(position: number, callback: () => void): void {
    start = window.pageYOffset !== undefined ? window.pageYOffset : window.scrollY;
    end = position;
    change = end - start;
    time = Date.now();
    cb = callback;
    requestAnimationFrame(() => render());
}
