import { delayedCall } from './delayedCall';
import { initGallery } from './initGallery';
import { scrollToPos } from './scrollToPos';

export type Project = {
    resize: () => void;
};

export const initProject = (element: HTMLElement, moveStart: () => void, moveDone: () => void, move: (height: number) => void): Project => {
    const header = element.querySelectorAll('div')[0] as HTMLElement;
    const content = element.querySelectorAll('div')[1] as HTMLElement;
    const summary = header.querySelector('p') as HTMLElement;
    const buttonMore = element.querySelector('.btn-more') as HTMLElement;
    const buttonClose = element.querySelector('.btn-close') as HTMLElement;
    const gallery = initGallery(element.querySelector('.gallery') as HTMLElement);
    let isOpen = false;

    const getHeightClosed = () => {
        if (window.innerWidth >= 740) {
            return 300;
        }
        const elementStyle = window.getComputedStyle(element);
        const elementPaddingTop = parseFloat(elementStyle.paddingTop!);
        const elementPaddingBottom = parseFloat(elementStyle.paddingBottom!);
        return Math.round(header.clientHeight + elementPaddingTop + elementPaddingBottom);
    };

    const getHeightOpen = () => {
        const windowHeight = window.innerHeight;
        const elementStyle = window.getComputedStyle(element);
        const elementPaddingTop = parseFloat(elementStyle.paddingTop!);
        const elementPaddingBottom = parseFloat(elementStyle.paddingBottom!);
        const elementOffset = element.getBoundingClientRect().top;
        const elementHeight = header.clientHeight + content.scrollHeight + elementPaddingTop + elementPaddingBottom;
        return Math.round(Math.min(elementHeight, windowHeight - elementOffset));
    };

    const open = (e: MouseEvent) => {
        if (!isOpen) {
            isOpen = true;
            buttonMore.setAttribute('aria-expanded', 'true');
            content.setAttribute('aria-hidden', 'false');

            e.preventDefault();
            e.stopImmediatePropagation();

            const elementStyle = window.getComputedStyle(element);
            const elementPaddingTop = parseFloat(elementStyle.paddingTop!);
            const scrollPos = element.offsetTop + elementPaddingTop + 1;

            scrollToPos(scrollPos, () => {
                element.style.height = `${getHeightClosed()}px`;
                element.classList.add('open');
                content.style.top = null!;
                moveStart();

                delayedCall(() => {
                    move(getHeightOpen() - element.clientHeight);
                    element.style.height = 'auto';
                    delayedCall(() => {
                        moveDone();
                    }, 500);
                }, 1);
            });
        }
    };

    const close = (e: MouseEvent) => {
        if (isOpen) {
            isOpen = false;
            buttonMore.setAttribute('aria-expanded', 'false');
            content.setAttribute('aria-hidden', 'true');

            e.preventDefault();
            e.stopImmediatePropagation();

            element.style.height = `${getHeightOpen()}px`;
            element.classList.remove('open');
            moveStart();
            gallery.disable();

            if (window.innerWidth < 740) {
                const offset = Math.round(-summary.clientHeight);
                content.style.top = `${offset}px`;
            }

            delayedCall(() => {
                move(getHeightClosed() - element.clientHeight);
                delayedCall(() => {
                    element.style.height = null!;
                    content.style.top = null!;
                    moveDone();
                }, 500);
            }, 1);
        }
    };

    const resize = () => {
        gallery.resize();
    };

    buttonMore.addEventListener('click', e => open(e), false);
    buttonClose.addEventListener('click', e => close(e), false);

    return {
        resize,
    };
};
