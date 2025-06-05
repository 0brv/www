import starsWorkerUrl from "$lib/starsWorker?worker&url";

type Resolve = (value: unknown) => void;
type Reject = (reason?: any) => void;

let starsWorker: Worker | undefined;
let initialized = $state(false);
let started = $state(false);

export async function resizeAnimation(canvas: HTMLCanvasElement, screenH: number, screenW: number) {
	if (!initialized) return Promise.resolve("NOT_INITIALIZED");
	if (!starsWorker) return Promise.reject("NO_WORKER_INSTANCE_EXISTS");

	const { promise, resolve } = withResolvers();

	starsWorker.postMessage({ command: "resize", screenH, screenW });
	starsWorker.addEventListener(
		"message",
		({ data }) => {
			const { status } = data;
			if (status === "resized") {
				resolve(true);
			}
		},
		{ once: true }
	);

	return promise;
}

export async function init(canvas: HTMLCanvasElement, screenH: number, screenW: number) {
	if (initialized) return Promise.resolve("ALREADY_INITIALIZED");
	if (starsWorker) return Promise.reject("WORKER_INSTANCE_EXISTS");

	const { promise, resolve, reject } = withResolvers();

	const offscreenCanvas = canvas.transferControlToOffscreen();
	starsWorker = new Worker(starsWorkerUrl, { type: "module" });
	starsWorker.postMessage({ command: "init", offscreenCanvas, screenH, screenW }, [
		offscreenCanvas
	]);
	starsWorker.addEventListener(
		"message",
		({ data }) => {
			const { status } = data;
			if (status === "initialized") {
				initialized = true;
				resolve(true);
			}
		},
		{ once: true }
	);
	starsWorker.addEventListener(
		"error",
		(e) => {
			reject(e.error);
		},
		{ once: true }
	);

	return promise;
}

export async function startAnimation(screenH: number, screenW: number) {
	if (!initialized) return Promise.reject("NOT_INITIALIZED");
	if (!starsWorker) return Promise.reject("NO_WORKER_INSTANCE_EXISTS");

	const { promise, resolve } = withResolvers();

	starsWorker.postMessage({ command: "start", screenH, screenW });
	starsWorker.addEventListener(
		"message",
		({ data }) => {
			const { status } = data;
			if (status === "started") {
				started = true;
				resolve(true);
			}
		},
		{ once: true }
	);

	return promise;
}

export async function stopAnimation() {
	if (!initialized) return Promise.reject("NOT_INITIALIZED");
	if (!started) return Promise.reject("NOT_STARTED");
	if (!starsWorker) return Promise.reject("NO_WORKER_INSTANCE_EXISTS");

	const { promise, resolve } = withResolvers();

	starsWorker.postMessage({ command: "stop" });

	started = false;
	resolve(true);
	return promise;
}

function withResolvers() {
	let resolve: Resolve | undefined = undefined;
	let reject: Reject | undefined = undefined;

	const promise = new Promise((rs, rj) => {
		resolve = rs;
		reject = rj;
	});

	return { promise, resolve: resolve!, reject: reject! };
}
