import { delayedCall } from './delayedCall';
import { initExperience } from './initExperience';
import { initProject, Project } from './initProject';

const elements: HTMLElement[] = [];
const projects: Project[] = [];

function setPosition(): void {
    let height: number = 0;

    for (let i: number = 0, n = elements.length; i < n; i++) {
        const element: HTMLElement = elements[i];
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
}

function onMoveStart(): void {
    setPosition();

    for (let i: number = 0, n = elements.length; i < n; i++) {
        const element: HTMLElement = elements[i];
        element.style.transition = '';
        element.style.webkitTransition = '';
    }
}

function onMove(height: number, index: number): void {
    for (let i: number = index + 1, n = elements.length; i < n; i++) {
        const element: HTMLElement = elements[i];
        element.style.transform = `translate(0, ${height}px)`;
        element.style.webkitTransform = `translate(0, ${height}px)`;
    }
}

function resize(): void {
    setPosition();
    for (let i: number = 0, n = projects.length; i < n; i++) {
        projects[i].resize();
    }
}

export function init(): void {
    const sectionElements: NodeListOf<HTMLElement> = document.querySelectorAll('header,section,footer');
    const projectElements: NodeListOf<HTMLElement> = document.querySelectorAll('.project');
    const experienceElements: NodeListOf<HTMLElement> = document.querySelectorAll('.experience');
    let index: number = 1;

    for (let i: number = 0, n = sectionElements.length; i < n; i++) {
        elements.push(sectionElements[i]);
    }

    for (let i: number = 0, n = projectElements.length; i < n; i++) {
        const j: number = index++;
        projects.push(
            initProject(
                projectElements[i],
                () => onMoveStart(),
                () => setPosition(),
                (height: number) => onMove(height, j)
            )
        );
    }

    for (let i: number = 0, n = experienceElements.length; i < n; i++) {
        const j: number = index++;
        initExperience(
            experienceElements[i],
            () => onMoveStart(),
            () => setPosition(),
            (height: number) => onMove(height, j)
        );
    }

    const fonts: any = (<any>document).fonts;
    fonts &&
        fonts.ready.then(() => {
            delayedCall(() => {
                resize();
            }, 100);
        });

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
}
