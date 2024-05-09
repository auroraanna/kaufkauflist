<script>
	import { createList } from '$lib/logic.js';
	import UsedLists from '$lib/UsedLists.svelte';
</script>

<svelte:head>
	<title>kaufkauflist</title>
</svelte:head>

<button on:click={() => createList()}>Create list</button>

<UsedLists />
