let controller = new AbortController();
let stars: Star[] = [];
let canvas: OffscreenCanvas | undefined;
let ctx: OffscreenCanvasRenderingContext2D | undefined;

const NUM_STARS = 250;
const COLORS = [
	"255, 255, 255",
	"255, 255, 255",
	"200, 200, 0",
	"200, 200, 0",
	"255, 150, 150",
	"150, 150, 255"
];

self.onmessage = (event: MessageEvent) => {
	const { command, offscreenCanvas, screenH, screenW } = event.data;
	if (!["init", "start", "stop", "resize"].includes(command)) {
		console.error("starsWorker: unknown command received", command);
		return;
	}

	switch (command) {
		case "init": {
			if (!offscreenCanvas || !screenH || !screenW) {
				self.postMessage({
					status: "failed",
					message: "failed to init animation due to incomplete data"
				});
				return;
			}

			canvas = offscreenCanvas;
			ctx = offscreenCanvas.getContext("2d") || undefined;

			if (!ctx) {
				self.postMessage({ status: "failed", message: "failed to get context" });
				return;
			}

			initAnimation(canvas!, ctx, screenH, screenW);

			break;
		}

		case "start": {
			if (!ctx) {
				self.postMessage({ status: "failed", message: "failed to start, no context" });
				return;
			}

			if (!screenH || !screenW) {
				self.postMessage({
					status: "failed",
					message: "failed to start animation due to incomplete data"
				});
				return;
			}

			startAnimation(ctx, screenH, screenW);
			break;
		}

		case "stop": {
			stopAnimation();
			break;
		}

		case "resize": {
			if (!ctx || !canvas || !screenH || !screenW) {
				return;
			}
			resizeAnimation(canvas, ctx, screenH, screenW);
			break;
		}
	}
};

function resizeAnimation(
	canvas: OffscreenCanvas,
	ctx: OffscreenCanvasRenderingContext2D,
	screenH: number,
	screenW: number
) {
	canvas.width = screenW;
	canvas.height = screenH;

	generateStars(screenH, screenW);

	ctx.clearRect(0, 0, screenW, screenH);
	for (const star of stars) {
		star.updateAndDraw(ctx);
	}

	self.postMessage({ status: "resized" });
}

function initAnimation(
	canvas: OffscreenCanvas,
	ctx: OffscreenCanvasRenderingContext2D,
	screenH: number,
	screenW: number
) {
	canvas.width = screenW;
	canvas.height = screenH;

	generateStars(screenH, screenW);

	ctx.clearRect(0, 0, screenW, screenH);
	for (const star of stars) {
		star.updateAndDraw(ctx);
	}

	self.postMessage({ status: "initialized" });
}

function startAnimation(ctx: OffscreenCanvasRenderingContext2D, screenH: number, screenW: number) {
	controller.abort();
	controller = new AbortController();

	(function (ctx: OffscreenCanvasRenderingContext2D, screenH: number, screenW: number) {
		function animate() {
			ctx.clearRect(0, 0, screenW, screenH);

			if (controller.signal.aborted) {
				return;
			}

			for (const star of stars) {
				star.updateAndDraw(ctx);
			}

			requestAnimationFrame(animate);
		}

		requestAnimationFrame(animate);
		self.postMessage({ status: "started" });
	})(ctx, screenH, screenW);
}

function stopAnimation() {
	if (controller) controller.abort();
	self.postMessage({ status: "stopped" });
}

function generateStars(screenH: number, screenW: number) {
	stars = [];
	for (let i = 0; i < NUM_STARS; i++) {
		const x = Math.random() * screenW;
		const y = Math.random() * screenH;
		const size = 1 + Math.random();
		const opacity = Math.random();
		stars.push(new Star(x, y, size, opacity, screenW, screenH));
	}
}

class Star {
	x: number;
	y: number;
	size: number;
	opacity: number;
	factor: number;
	increment: number;
	colorRGB: string;
	maxOpacity: number;
	screenW: number;
	screenH: number;

	constructor(
		x: number,
		y: number,
		size: number,
		opacity: number,
		screenW: number,
		screenH: number
	) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.opacity = opacity;
		this.factor = 1;
		this.increment = 0.002 + Math.random() * 0.008;
		// this.maxOpacity = 0.75 + Math.random() * 0.25;
		this.maxOpacity = 1;
		this.colorRGB = COLORS[Math.floor(Math.random() * COLORS.length)];
		this.screenW = screenW;
		this.screenH = screenH;
	}

	updateAndDraw(ctx: OffscreenCanvasRenderingContext2D) {
		this.opacity += this.increment * this.factor;

		if (this.opacity >= this.maxOpacity) {
			this.opacity = this.maxOpacity;
			this.factor = -1;
		} else if (this.opacity <= 0) {
			this.opacity = 0;
			this.factor = 1;

			this.x = Math.random() * this.screenW;
			this.y = Math.random() * this.screenH;
		}

		ctx.globalAlpha = this.opacity;
		ctx.fillStyle = `rgb(${this.colorRGB})`;

		ctx.shadowBlur = 5;
		ctx.shadowColor = `rgba(${this.colorRGB}, ${this.opacity})`;

		const half = this.size / 2;
		ctx.fillRect(this.x - half, this.y - half, this.size, this.size);

		// const radius = this.size / 2;
		// ctx.beginPath();
		// ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
		// ctx.fill();

		ctx.globalAlpha = 1;
		ctx.shadowBlur = 0;
	}
}
