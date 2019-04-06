export function delayedCall(callback: () => void, delay: number): void {

	const time: number = Date.now() + delay;

	function check(): void {
		if (Date.now() >= time) {
			callback();
		} else {
			requestAnimationFrame(() => check());
		}
	}

	requestAnimationFrame(() => check());
}
