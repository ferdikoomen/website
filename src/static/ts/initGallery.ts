export type Gallery = {
    resize: () => void;
    disable: () => void;
};

export function initGallery(element: HTMLElement): Gallery {
    const slides: HTMLElement[] = [];
    const dots: HTMLElement[] = [];
    const videos: (HTMLVideoElement | null)[] = [];
    const wrapper: HTMLElement = element.querySelector('div') as HTMLElement;
    const figures: NodeListOf<HTMLElement> = element.querySelectorAll('figure');
    const count: number = figures.length;
    const velocities: { position: number; time: number }[] = [];

    let index: number = 0;
    let offset: number = 0;
    let widthItem: number = 0;
    let down: boolean = false;
    let first: boolean = true;
    let locked: boolean = false;
    let startX: number = 0;
    let startY: number = 0;
    let pos: number = 0;
    let inView: boolean = false;

    function setOffset(value: number): void {
        offset = value;
        wrapper.style.transform = `translate(${offset}px, 0)`;
        wrapper.style.webkitTransform = `translate(${offset}px, 0)`;
    }

    function show(indexNext: number): void {
        indexNext = indexNext < 0 ? 0 : indexNext > count - 1 ? count - 1 : indexNext;

        if (indexNext !== index) {
            if (videos[index] !== null) {
                try {
                    videos[index]!.pause();
                } catch (e) {
                    // console.log(e);
                }
            }
            if (videos[indexNext] !== null) {
                try {
                    videos[indexNext]!.play().catch();
                } catch (e) {
                    // console.log(e);
                }
            }
        }

        slides[index].setAttribute('aria-hidden', 'true');
        slides[index].setAttribute('tabindex', '-1');
        dots[index].className = '';
        index = indexNext;
        setOffset(index * -widthItem);
        slides[index].setAttribute('aria-hidden', 'false');
        slides[index].removeAttribute('tabindex');
        dots[index].className = 'active';
        buttonPrev.setAttribute('aria-hidden', index > 0 ? 'false' : 'true');
        buttonNext.setAttribute('aria-hidden', index < count - 1 ? 'false' : 'true');
    }

    function onClickNext(e: MouseEvent): void {
        if (!down) {
            e.preventDefault();
            e.stopImmediatePropagation();
            show(index + 1);
        }
    }

    function onClickPrev(e: MouseEvent): void {
        if (!down) {
            e.preventDefault();
            e.stopImmediatePropagation();
            show(index - 1);
        }
    }

    function onScroll(): void {
        const video: HTMLVideoElement | null = videos[index];
        const rect: ClientRect = element.getBoundingClientRect();
        const center: number = rect.top + rect.height / 2;
        inView = center >= 0 && center <= window.innerHeight;

        try {
            if (video !== null) {
                if (!video.paused && !inView) {
                    video.pause();
                } else if (video.paused && inView) {
                    video.play();
                }
            }
        } catch (e) {
            // console.log(e);
        }
    }

    function onKeyDown(e: KeyboardEvent): void {
        if (inView && e.keyCode === 37) {
            show(index - 1);
        }
        if (inView && e.keyCode === 39) {
            show(index + 1);
        }
    }

    function onTouchStart(e: any): void {
        if (!down) {
            down = true;
            startX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
            startY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
            pos = startX;

            if (velocities.length === 0) {
                velocities.push({
                    position: pos,
                    time: Date.now(),
                });
            }

            const left: number = wrapper.getBoundingClientRect().left - element.getBoundingClientRect().left;
            wrapper.style.transition = 'none';
            wrapper.style.webkitTransition = 'none';
            wrapper.classList.add('grabbing');
            setOffset(left);
        }
    }

    function onTouchMove(e: any): void {
        if (down) {
            const posX: number = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
            const posY: number = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;

            if (first) {
                first = false;
                const angle: number = Math.abs((Math.atan2(posY - startY, posX - startX) * 180) / Math.PI);
                locked = (angle >= 0 && angle <= 45) || (angle >= 135 && angle <= 180);
            }

            if (locked) {
                e.preventDefault();
                e.stopImmediatePropagation();

                const diff: number = posX - pos;
                pos = posX;
                setOffset(offset + diff);

                velocities.push({
                    position: pos,
                    time: Date.now(),
                });
            }
        }
    }

    function onTouchEnd(): void {
        if (down) {
            down = false;

            let velocity: number = 0;
            if (velocities.length > 1) {
                const eventA = velocities.pop();
                const eventB = velocities.pop();
                const distance = eventA!.position - eventB!.position;
                const time = eventA!.time - eventB!.time;
                velocity = distance / time;
                velocity = velocity / 2;
                if (Math.abs(velocity) < 0.02) {
                    velocity = 0;
                }
                if (time > 150 || Date.now() - eventA!.time > 300) {
                    velocity = 0;
                }
            }
            velocities.length = 0;
            locked = false;
            first = true;

            wrapper.style.transition = '';
            wrapper.style.webkitTransition = '';
            wrapper.classList.remove('grabbing');
            show(velocity < 0 ? index + 1 : velocity > 0 ? index - 1 : index);
        }
    }

    function resize(): void {
        wrapper.style.transition = 'none';
        wrapper.style.webkitTransition = 'none';
        widthItem = element.clientWidth;
        show(index);

        requestAnimationFrame(() => {
            wrapper.style.transition = '';
            wrapper.style.webkitTransition = '';
        });
    }

    function disable(): void {
        inView = false;
        for (const video of videos) {
            if (video !== null) {
                try {
                    video.currentTime = 0;
                    video.pause();
                } catch (e) {
                    // console.log(e);
                }
            }
        }
    }

    for (let i: number = 0, n = figures.length; i < n; i++) {
        const figure: HTMLElement = figures[i];
        const video: HTMLVideoElement | null = figure.querySelector('video');
        if (video !== null) {
            video.addEventListener('waiting', () => {
                figure.classList.add('loading');
            });
            video.addEventListener('canplay', () => {
                figure.classList.remove('loading');
            });
        }
        videos.push(video);
        slides.push(figure);
    }

    const ol: HTMLElement = document.createElement('ol');
    for (let i: number = 0; i < count; i++) {
        const li: HTMLElement = document.createElement('li');
        li.addEventListener('click', (e: MouseEvent) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            if (!down) {
                show(i);
            }
        });
        ol.appendChild(li);
        dots.push(li);
    }
    element.appendChild(ol);

    const buttonPrev: HTMLElement = element.querySelector('.btn.prev') as HTMLElement;
    const buttonNext: HTMLElement = element.querySelector('.btn.next') as HTMLElement;
    buttonPrev.addEventListener('click', e => onClickPrev(e), false);
    buttonNext.addEventListener('click', e => onClickNext(e), false);
    element.addEventListener('mousedown', e => onTouchStart(e), false);
    element.addEventListener('mousemove', e => onTouchMove(e), false);
    document.addEventListener('mouseup', () => onTouchEnd(), false);
    element.addEventListener('touchstart', e => onTouchStart(e), false);
    element.addEventListener('touchmove', e => onTouchMove(e), false);
    document.addEventListener('touchend', () => onTouchEnd(), false);
    window.addEventListener('scroll', () => onScroll(), false);
    window.addEventListener('keydown', e => onKeyDown(e), false);

    return {
        resize,
        disable,
    };
}
