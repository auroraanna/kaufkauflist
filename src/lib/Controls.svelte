<script>
	import {
		toggleItems,
		checkItems,
		deleteItem,
		deleteItems,
		anyCheckedItems,
		deleteCheckedItems,
		deleteList,
		createItem,
		importItemsFiles,
		downloadItemsFile,
		itemsStore,
		sortOrders,
		secondSortOrderStore
	} from '$lib/logic.js';
	import PredefinedListChooser from './PredefinedListChooser.svelte';

	let items = [];
	itemsStore.subscribe((data) => {
		items = data;
	});

	let nameInput = '';
	let files;

	let secondSortOrder = 0;
	secondSortOrderStore.subscribe((value) => {
		secondSortOrder = value;
	});
	$: secondSortOrderStore.set(secondSortOrder);
</script>

<fieldset class="rows no-print">
	<legend>Controls</legend>

	<div class="buttongroup">
		<button disabled={items.length == 0} on:click={() => toggleItems(items)}>Toggle all items</button>
		<button disabled={anyCheckedItems(items) == false} on:click={() => deleteCheckedItems(items)}
			>Delete checked items</button
		>
		<button on:click={() => deleteList()}>Delete list</button>
	</div>

	<div>
		<label for="sortOrderSelect">Secondary sort order</label>
		<select name="sortOrder" id="sortOrderSelect" bind:value={secondSortOrder}>
			{#each sortOrders as sortOrder, index}
				<option value={index}>{sortOrder}</option>
			{/each}
		</select>
	</div>

	<details>
		<summary>More controls</summary>

		<div class="rows">
			<div class="buttongroup">
				<button disabled={items.length == 0} on:click={() => checkItems(items, true)}
					>Check all items</button
				>
				<button disabled={items.length == 0} on:click={() => checkItems(items, false)}
					>Uncheck all items</button
				>
				<button disabled={items.length == 0} on:click={() => deleteItems(items)}
					>Delete all items</button
				>
			</div>
			<form on:submit|preventDefault={importItemsFiles(files)}>
				<label for="jsonFiles">JSON files</label>
				<input type="file" multiple id="jsonFiles" accept="application/json" bind:files />
				<button disabled={!files} type="submit">Import items</button>
			</form>
			<button on:click={() => downloadItemsFile(items)}>Download items as JSON</button>

			<PredefinedListChooser />
		</div>
	</details>
</fieldset>
