<script>
	import { toggleItems, checkItems, deleteItem, deleteItems, deleteList, createItem, itemsStore } from '$lib/logic.js';

	let items = [];
	itemsStore.subscribe((data) => {
		items = data;
	})

	let answer = '';
</script>

<fieldset>
	<legend>Controls</legend>

	<button disabled={items.length == 0} on:click={() => checkItems(items, true)}>Check all items</button>
	<button disabled={items.length == 0} on:click={() => checkItems(items, false)}>Uncheck all items</button>
	<button disabled={items.length == 0} on:click={() => toggleItems(items)}>Toggle all items</button>
	<button disabled={items.length == 0} on:click={() => deleteItem(items[0].id)}>Delete first item</button>
	<button disabled={items.length == 0} on:click={() => deleteItem(items[items.length - 1].id)}>Delete last item</button>
	<button disabled={items.length == 0} on:click={() => deleteItems(items)}>Delete all items</button>
	<button on:click={() => deleteList()}>Delete list</button>
	<form on:submit|preventDefault={createItem(answer)}>
		<label for="createItem">Item name</label>
		<input type="text" id="createItem" bind:value={answer} />
		<button disabled={!answer} type="submit">Create item</button>
	</form>
</fieldset>

