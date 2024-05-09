<script>
	import {
		listNameStore,
		editListName
	} from '$lib/logic.js';

	let listNameOrPlaceholder;
	listNameStore.subscribe((data) => {
		console.log(data);
		if ((data == null) || (data == "")) {
			listNameOrPlaceholder = "unnamed";
		} else {
			listNameOrPlaceholder = data;
		}
	});
</script>

<svelte:head>
	<title>kaufkauflist - List: {listNameOrPlaceholder}</title>
</svelte:head>

<div id="listName">
	<h1>{listNameOrPlaceholder}</h1>
	<button
		on:click={() => editListName()}
		title="Edit list's name"
	>
		✏️
	</button>
</div>

<style>
	#listName {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 5pt;
	}
</style>
