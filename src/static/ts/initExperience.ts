import { delayedCall } from './delayedCall';

export function initExperience(element: HTMLElement, moveStart: () => void, moveDone: () => void, move: (height: number) => void): void {
    let isOpen = false;

    const setHeight = (value: number) => {
        element.style.height = `${value}px`;
    };

    const getHeightOpen = () => {
        const windowHeight = window.innerHeight;
        const elementOffset = element.getBoundingClientRect().top;
        const elementHeight = element.scrollHeight;
        return Math.round(Math.min(elementHeight, windowHeight - elementOffset));
    };

    const open = () => {
        if (!isOpen) {
            isOpen = true;

            setHeight(60);
            element.classList.add('open');
            moveStart();

            delayedCall(() => {
                move(getHeightOpen() - element.clientHeight);
                element.style.height = 'auto';
                delayedCall(() => {
                    moveDone();
                }, 500);
            }, 1);
        }
    };

    const close = () => {
        if (isOpen) {
            isOpen = false;

            setHeight(getHeightOpen());
            element.classList.remove('open');
            moveStart();

            delayedCall(() => {
                move(60 - element.clientHeight);
                delayedCall(() => {
                    element.style.height = null!;
                    moveDone();
                }, 500);
            }, 1);
        }
    };

    element.addEventListener(
        'click',
        (e: MouseEvent) => {
            if (window.innerWidth < 480 && (e.srcElement as any).nodeName.toUpperCase() !== 'A') {
                e.preventDefault();
                e.stopImmediatePropagation();

                if (!isOpen) {
                    open();
                } else {
                    close();
                }
            }
        },
        false
    );
}
