import { delayedCall } from './delayedCall';
import { Gallery, initGallery } from './initGallery';
import { scrollToPos } from './scrollToPos';

export type Project = {
    resize: () => void;
};

export function initProject(element: HTMLElement, moveStart: () => void, moveDone: () => void, move: (height: number) => void): Project {
    const header: HTMLElement = element.querySelectorAll('div')[0] as HTMLElement;
    const content: HTMLElement = element.querySelectorAll('div')[1] as HTMLElement;
    const summary: HTMLElement = header.querySelector('p') as HTMLElement;
    const buttonMore: HTMLElement = element.querySelector('.btn-more') as HTMLElement;
    const buttonClose: HTMLElement = element.querySelector('.btn-close') as HTMLElement;
    const gallery: Gallery = initGallery(<HTMLElement>element.querySelector('.gallery'));
    let isOpen: boolean = false;

    function getHeightClosed(): number {
        if (window.innerWidth >= 740) {
            return 300;
        }
        const elementStyle: CSSStyleDeclaration = window.getComputedStyle(element);
        const elementPaddingTop: number = parseFloat(elementStyle.paddingTop!);
        const elementPaddingBottom: number = parseFloat(elementStyle.paddingBottom!);
        return Math.round(header.clientHeight + elementPaddingTop + elementPaddingBottom);
    }

    function getHeightOpen(): number {
        const windowHeight: number = window.innerHeight;
        const elementStyle: CSSStyleDeclaration = window.getComputedStyle(element);
        const elementPaddingTop: number = parseFloat(elementStyle.paddingTop!);
        const elementPaddingBottom: number = parseFloat(elementStyle.paddingBottom!);
        const elementOffset: number = element.getBoundingClientRect().top;
        const elementHeight: number = header.clientHeight + content.scrollHeight + elementPaddingTop + elementPaddingBottom;
        return Math.round(Math.min(elementHeight, windowHeight - elementOffset));
    }

    function open(e: MouseEvent): void {
        if (!isOpen) {
            isOpen = true;
            buttonMore.setAttribute('aria-expanded', 'true');
            content.setAttribute('aria-hidden', 'false');

            e.preventDefault();
            e.stopImmediatePropagation();

            const elementStyle: CSSStyleDeclaration = window.getComputedStyle(element);
            const elementPaddingTop: number = parseFloat(elementStyle.paddingTop!);
            const scrollPos: number = element.offsetTop + elementPaddingTop + 1;

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
    }

    function close(e: MouseEvent): void {
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
                const offset: number = Math.round(-summary.clientHeight);
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
    }

    function resize(): void {
        gallery.resize();
    }

    buttonMore.addEventListener('click', e => open(e), false);
    buttonClose.addEventListener('click', e => close(e), false);

    element.addEventListener(
        'click',
        (e: MouseEvent) => {
            if (window.innerWidth >= 740) {
                open(e);
            }
        },
        false
    );

    return {
        resize,
    };
}
