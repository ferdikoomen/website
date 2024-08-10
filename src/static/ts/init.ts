import { delayedCall } from './delayedCall';
import { initProject, Project } from './initProject';

const elements: HTMLElement[] = [];
const projects: Project[] = [];

const setPosition = () => {
    let height = 0;

    for (let i = 0, n = elements.length; i < n; i++) {
        const element = elements[i];
        element.style.position = 'absolute';
        element.style.position = 'absolute';
        element.style.top = `${height}px`;
        element.style.transition = 'none';
        element.style.webkitTransition = 'none';
        element.style.transform = 'translate(0, 0)';
        element.style.webkitTransform = 'translate(0, 0)';
        height += element.clientHeight;
    }

    document.body.style.height = `${height}px`;
};

const onMoveStart = () => {
    setPosition();

    for (let i = 0, n = elements.length; i < n; i++) {
        const element = elements[i];
        element.style.transition = '';
        element.style.webkitTransition = '';
    }
};

const onMove = (height: number, index: number) => {
    for (let i = index + 1, n = elements.length; i < n; i++) {
        const element = elements[i];
        element.style.transform = `translate(0, ${height}px)`;
        element.style.webkitTransform = `translate(0, ${height}px)`;
    }
};

const resize = () => {
    setPosition();
    for (let i = 0, n = projects.length; i < n; i++) {
        projects[i].resize();
    }
};

export const init = () => {
    const sectionElements = document.querySelectorAll('header,section,footer');
    const projectElements = document.querySelectorAll('.project');
    let index = 1;

    for (let i = 0, n = sectionElements.length; i < n; i++) {
        elements.push(sectionElements[i] as HTMLElement);
    }

    for (let i = 0, n = projectElements.length; i < n; i++) {
        const j = index++;
        projects.push(
            initProject(
                projectElements[i] as HTMLElement,
                () => onMoveStart(),
                () => setPosition(),
                (height: number) => onMove(height, j)
            )
        );
    }

    const fonts = document.fonts;
    if (fonts) {
        fonts.ready.then(() => {
            delayedCall(() => {
                resize();
            }, 100);
        });
    }

    window.addEventListener(
        'resize',
        () => {
            resize();
        },
        false
    );

    window.addEventListener(
        'orientationchange',
        () => {
            delayedCall(() => resize(), 100);
        },
        false
    );

    delayedCall(() => resize(), 100);
    resize();
};
