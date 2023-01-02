<script>
	import { toggleItems, checkItems, deleteItem, deleteItems, anyCheckedItems, deleteCheckedItems, deleteList, createItem, importItemsFiles, downloadItemsFile, itemsStore } from '$lib/logic.js';

	let items = [];
	itemsStore.subscribe((data) => {
		items = data;
	})

	let nameInput = '';
	let files;
</script>

<fieldset>
	<legend>Controls</legend>

	<button disabled={items.length == 0} on:click={() => toggleItems(items)}>Toggle all items</button>
	<button disabled={anyCheckedItems(items) == false} on:click={() => deleteCheckedItems(items)}>Delete checked items</button>
	<button on:click={() => deleteList()}>Delete list</button>
	<form on:submit|preventDefault={createItem({name: nameInput, done: false})}>
		<label for="createItem">Item name</label>
		<input type="text" id="createItem" bind:value={nameInput} />
		<button disabled={!nameInput} type="submit">Create item</button>
	</form>
	<details>
		<summary>More controls</summary>
		<button disabled={items.length == 0} on:click={() => checkItems(items, true)}>Check all items</button>
		<button disabled={items.length == 0} on:click={() => checkItems(items, false)}>Uncheck all items</button>
		<button disabled={items.length == 0} on:click={() => deleteItem(items[0].id)}>Delete first item</button>
		<button disabled={items.length == 0} on:click={() => deleteItem(items[items.length - 1].id)}>Delete last item</button>
		<button disabled={items.length == 0} on:click={() => deleteItems(items)}>Delete all items</button>
		<form on:submit|preventDefault={importItemsFiles(files)}>
			<label for="jsonFiles">JSON files</label>
			<input type="file" multiple id="jsonFiles" accept="application/json" bind:files>
			<button disabled={!files} type="submit">Import items</button>
		</form>
		<button on:click={() => downloadItemsFile(items)}>Download items as JSON</button>
	</details>
</fieldset>

