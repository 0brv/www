<script lang="ts">
	import { init, startAnimation, stopAnimation, resizeAnimation } from "$lib/stars.svelte";
	import '../app.css';
	import { onMount } from 'svelte';

	let { children } = $props();

	let screenH = $state(0);
	let screenW = $state(0);

	let starsVisible = $state(false);

	let canvas = $state<HTMLCanvasElement | undefined>();

	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	function handleAnimationResize() {
		if (starsVisible) {
			starsVisible = false;
			void stopAnimation();
		}

		clearInterval(timeoutId);
		timeoutId = setTimeout(async () => {
			const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
			if (darkModePreference.matches && canvas) {
				try {
					await resizeAnimation(canvas, screenH, screenW);
					starsVisible = true;
					await startAnimation(screenH, screenW);
				} catch (e) {
					console.log(e);
				}
			}
		}, 1000);
	}

	async function initAndStartAnimation(screenH: number, screenW: number) {
		if (!canvas) return;

		try {
			await init(canvas, screenH, screenW);
			starsVisible = true;
			await startAnimation(screenH, screenW);
		} catch (e) {
			console.log(e);
		}
	}

	onMount(() => {
		initAndStartAnimation(screenH, screenW);
	});
</script>

<svelte:window
	bind:innerHeight={screenH}
	bind:innerWidth={screenW}
	on:resize={handleAnimationResize}
/>

<canvas
	bind:this={canvas}
	class={`fixed inset-0 transition-opacity duration-1000 ${starsVisible ? "opacity-100" : "opacity-0"}`}
></canvas>

<div class="max-w-4xl mx-auto p-4 pt-32 relative md:pt-24 flex items-center justify-center">
	{@render children()}
</div>
