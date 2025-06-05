<script lang="ts">
	import { Counter } from "$lib";
	import Typewriter from "typewriter-effect/dist/core";
	import { fade } from "svelte/transition";
	import { onMount } from "svelte";

	let mottoVisible = $state(false);
	let counterVisible = $state(false);

	onMount(() => {
		counterVisible = true;

		const writer = new Typewriter("#motto", {
			delay: 75
		});

		setTimeout(() => {
			mottoVisible = true;
		}, 2500);

		writer
			.pauseFor(2500)
			.typeString("Built in Silence.")
			.pauseFor(250)
			.typeString(" Engineered for Impact.")
			.pauseFor(500)
			.changeDeleteSpeed(150)
			.deleteChars(1)
			.changeDeleteSpeed(140)
			.deleteChars(1)
			.changeDeleteSpeed(130)
			.deleteChars(1)
			.changeDeleteSpeed(20)
			.deleteChars(19)
			.pauseFor(500)
			.changeDelay(100)
			.typeString("No Noise.")
			.pauseFor(500)
			.changeDelay(50)
			.typeString(" Just ")
			.typeString("<span style='color: #b8f6f6'>Signal</span")
			.typeString(".")
			.pauseFor(1000)
			.start();
	});
</script>

<div class="flex flex-col items-center justify-center gap-24">
	<div class="flex flex-col items-center justify-center gap-8">
		<h1 class="brand text-5xl font-extralight md:text-8xl">bitrover</h1>
		<p
			id="motto"
			class={`text-center text-xs md:text-base leading-relaxed jetbrains-mono transition-opacity ${mottoVisible ? "opacity-100" : "opacity-0"}`}
		></p>
	</div>

	{#if counterVisible}
		<div class="flex items-center justify-center" transition:fade={{ delay: 13000, duration: 1000 }}>
			<Counter />
		</div>
	{/if}
</div>
