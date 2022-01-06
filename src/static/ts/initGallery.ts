export type Gallery = {
    resize: () => void;
    disable: () => void;
};

export const initGallery = (element: HTMLElement): Gallery => {
    const slides: HTMLElement[] = [];
    const dots: HTMLElement[] = [];
    const videos: (HTMLVideoElement | null)[] = [];
    const wrapper = element.querySelector('div') as HTMLElement;
    const figures = element.querySelectorAll('figure');
    const count = figures.length;
    const velocities: { position: number; time: number }[] = [];

    let index = 0;
    let offset = 0;
    let widthItem = 0;
    let down = false;
    let first = true;
    let locked = false;
    let startX = 0;
    let startY = 0;
    let pos = 0;
    let inView = false;

    const setOffset = (value: number) => {
        offset = value;
        wrapper.style.transform = `translate(${offset}px, 0)`;
        wrapper.style.webkitTransform = `translate(${offset}px, 0)`;
    };

    const show = (indexNext: number) => {
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
    };

    const onClickNext = (e: MouseEvent) => {
        if (!down) {
            e.preventDefault();
            e.stopImmediatePropagation();
            show(index + 1);
        }
    };

    const onClickPrev = (e: MouseEvent) => {
        if (!down) {
            e.preventDefault();
            e.stopImmediatePropagation();
            show(index - 1);
        }
    };

    const onScroll = () => {
        const video = videos[index];
        const rect = element.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
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
    };

    const onKeyDown = (e: KeyboardEvent) => {
        if (inView && e.keyCode === 37) {
            show(index - 1);
        }
        if (inView && e.keyCode === 39) {
            show(index + 1);
        }
    };

    const onTouchStart = (e: any) => {
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

            const left = wrapper.getBoundingClientRect().left - element.getBoundingClientRect().left;
            wrapper.style.transition = 'none';
            wrapper.style.webkitTransition = 'none';
            wrapper.classList.add('grabbing');
            setOffset(left);
        }
    };

    const onTouchMove = (e: any) => {
        if (down) {
            const posX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
            const posY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;

            if (first) {
                first = false;
                const angle = Math.abs((Math.atan2(posY - startY, posX - startX) * 180) / Math.PI);
                locked = (angle >= 0 && angle <= 45) || (angle >= 135 && angle <= 180);
            }

            if (locked) {
                e.preventDefault();
                e.stopImmediatePropagation();

                const diff = posX - pos;
                pos = posX;
                setOffset(offset + diff);

                velocities.push({
                    position: pos,
                    time: Date.now(),
                });
            }
        }
    };

    const onTouchEnd = () => {
        if (down) {
            down = false;

            let velocity = 0;
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
    };

    const resize = () => {
        wrapper.style.transition = 'none';
        wrapper.style.webkitTransition = 'none';
        widthItem = element.clientWidth;
        show(index);

        requestAnimationFrame(() => {
            wrapper.style.transition = '';
            wrapper.style.webkitTransition = '';
        });
    };

    const disable = () => {
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
    };

    for (let i = 0, n = figures.length; i < n; i++) {
        const figure = figures[i];
        const video = figure.querySelector('video');
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

    const ol = document.createElement('ol');
    for (let i = 0; i < count; i++) {
        const li = document.createElement('li');
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

    const buttonPrev = element.querySelector('.btn.prev') as HTMLElement;
    const buttonNext = element.querySelector('.btn.next') as HTMLElement;
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
};
