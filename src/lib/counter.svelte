<script lang="ts">
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";

	const now = new Date().getTime();
	const listedAt = new Date("2025-07-25T17:00:00Z").getTime();

	let timeLeft = Math.round((listedAt - now) / 1000);
	const listed = timeLeft <= 0;

	if (listed) {
		timeLeft = 140;
	}

	// let timeToList = $state(Math.round((listedAt.getTime() - now) / 1000))
	let timeToList = $state(timeLeft);
	const countDuration = 900;

	const days = $derived(Math.floor(timeToList / 86400));
	const hours = $derived(Math.floor((timeToList % 86400) / 3600));
	const minutes = $derived(Math.floor((timeToList % 3600) / 60));
	const seconds = $derived(Math.floor(timeToList % 60));

	let frontSeconds = $state(seconds);
	let backSeconds = $state(seconds);
	let flipSeconds = $state(false);

	$effect(() => {
		if (listed) {
			backSeconds = seconds;
			return;
		}

		frontSeconds = seconds;
		flipSeconds = true;

		setTimeout(() => {
			backSeconds = seconds;
			frontSeconds = seconds ? seconds - 1 : 59;
			flipSeconds = false;
		}, countDuration);
	});

	let frontMinutes = $state(minutes);
	let backMinutes = $state(minutes);
	let flipMinutes = $state(false);

	$effect(() => {
		frontMinutes = minutes;
		flipMinutes = true;

		setTimeout(() => {
			backMinutes = minutes;
			frontMinutes = minutes ? minutes - 1 : 59;
			flipMinutes = false;
		}, countDuration);
	});

	let frontHours = $state(hours);
	let backHours = $state(hours);
	let flipHours = $state(false);

	$effect(() => {
		frontHours = hours;
		flipHours = true;

		setTimeout(() => {
			backHours = hours;
			frontHours = hours ? hours - 1 : 23;
			flipHours = false;
		}, countDuration);
	});

	let frontDays = $state(days);
	let backDays = $state(days);
	let flipDays = $state(false);

	$effect(() => {
		frontDays = days;
		flipDays = true;

		setTimeout(() => {
			backDays = days;
			frontDays = days ? days - 1 : 0;
			flipDays = false;
		}, countDuration);
	});

	onMount(() => {
		if (!listed) {
			const interval = setInterval(() => {
				if (timeToList <= 0) {
					timeToList = 0;
					clearInterval(interval);
					return;
				}

				timeToList = timeToList - 1;
			}, 1000);

			return () => {
				clearInterval(interval);
			};
		} else {
			let animationRequest: ReturnType<typeof requestAnimationFrame> | undefined;

			function countDown() {
				if (timeToList <= 0) {
					timeToList = 0;
					return;
				}

				timeToList = timeToList - 1;
				animationRequest = requestAnimationFrame(countDown);
			}

			animationRequest = requestAnimationFrame(countDown);

			return () => {
				if (animationRequest) cancelAnimationFrame(animationRequest);
			};
		}
	});
</script>

<div class="short:gap-8 flex flex-grow flex-col justify-center gap-8 md:gap-12">
	<div class="flex items-center justify-center gap-2 md:gap-4">
		{@render count(frontDays, backDays, flipDays, "Days")}
		{@render colon()}
		{@render count(frontHours, backHours, flipHours, "Hours")}
		{@render colon()}
		{@render count(frontMinutes, backMinutes, flipMinutes, "Minutes")}
		{@render colon()}
		{@render count(frontSeconds, backSeconds, flipSeconds, "Seconds")}
	</div>
</div>

{#snippet colon()}
	<span aria-hidden="true" class="relative bottom-3 text-lg leading-none md:bottom-5 md:text-2xl">
		:
	</span>
{/snippet}

{#snippet count(front: number, back: number, flip: boolean, label: string)}
	<div class="flex flex-col items-center justify-center gap-4">
		<div class={`counter-item ${flip ? "flip" : ""}`}>
			<span class="back top">{front}</span>
			<span class="back bottom">{back}</span>
			<span class="front bottom">{front}</span>
			<span class="front top">{back}</span>
		</div>

		<span class="text-xs leading-none text-neutral-500">{label}</span>
	</div>
{/snippet}

<style lang="postcss">
	@reference "../app.css";

	.counter-item {
		@apply relative h-[64px] w-[64px] rounded-xl border border-neutral-950 md:h-[90px] md:w-[90px];
	}

	.counter-item::after {
		@apply border-b-1 border-black;
		content: "";
		height: 1px;
		transform: translateY(-1px);
		left: 0;
		position: absolute;
		top: 50%;
		width: 100%;
		z-index: 1000;
	}

	.counter-item span {
		@apply absolute inset-x-0 w-full overflow-hidden text-center text-3xl font-extralight md:text-5xl;

		height: 50%;
		text-shadow: 0 1px 2px #333;
	}

	.counter-item.flip span {
		transition: transform 900ms;
	}

	.counter-item .top {
		@apply rounded-t-xl border-t border-t-[#ffffff22] bg-black leading-[64px] md:leading-[90px];

		transform-origin: bottom center;
		/* border-top: 1px solid #444444; */
		transform: perspective(180px) rotatex(0);
		/* box-shadow: inset 0 15px 50px #111111; */
	}

	.counter-item .front.top {
		backface-visibility: hidden;
	}

	.counter-item .bottom {
		@apply rounded-b-xl border-b border-b-[#ffffff22] bg-black;

		top: 50%;
		line-height: 0;
		transform-origin: top center;
		/* border-bottom: 1px solid #444444; */
		/* box-shadow: inset 0 15px 50px #202020; */
	}

	.counter-item .front.bottom {
		transform: perspective(180px) rotatex(180deg);
	}

	.counter-item.flip .front.top {
		transform: perspective(180px) rotatex(-180deg);
	}

	.counter-item.flip .front.bottom {
		transform: perspective(180px) rotatex(0);
	}

	.counter-shadow {
		text-shadow:
			0 0 0.5rem hsl(0deg 0% 100% / 10%),
			0 0 1rem hsl(0deg 0% 100% / 10%),
			0 0 1.5rem hsl(0deg 0% 100% / 30%),
			0 0 2rem hsl(0deg 0% 100% / 30%);
	}
</style>
