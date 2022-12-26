<script>
	import { toggleItems, checkItems, deleteItem, deleteItems, createItem, itemsStore } from '$lib/logic.js';

	let items = [];
	itemsStore.subscribe((data) => {
		items = data;
	})

	let answer = '';
</script>

<fieldset>
	<legend>Controls</legend>

	<button on:click={() => checkItems(items, true)}>Check all items</button>

	<button on:click={() => checkItems(items, false)}>Uncheck all items</button>

	<button on:click={() => toggleItems(items)}>Toggle all items</button>

	<button on:click={() => deleteItem(items[0].id)}>Delete first item</button>

	<button on:click={() => deleteItem(items[items.length - 1].id)}>Delete last item</button>

	<button on:click={() => deleteItems(items)}>Delete all items</button>

	<form on:submit|preventDefault={createItem(answer)}>
		<input bind:value={answer} />

		<button disabled={!answer} type="submit">Create item</button>
	</form>
</fieldset>

