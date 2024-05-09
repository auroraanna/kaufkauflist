<script>
	import { createList } from '$lib/logic.js';
</script>

<svelte:head>
	<title>kaufkauflist</title>
</svelte:head>

<button on:click={() => createList()}>Create list</button>
