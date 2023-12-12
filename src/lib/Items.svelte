<script>
	import { checkItem, editItemName, deleteItem, itemsContainingXString, itemsStore } from '$lib/logic.js';

	let searchInput = '';
	$: showingSearch = searchInput.length != 0;
	$: notHiddenItemIds = showingSearch ? itemsContainingXString(items, searchInput) : [];

	function clearSearch() {
		searchInput = '';
	}

	let items = [];
	itemsStore.subscribe((data) => {
		items = data;
	});
</script>

<fieldset>
	<legend>Items</legend>

	<label for="search">Search box</label>
	<input type="text" id="search" bind:value={searchInput} />
	<button
		on:click={() => clearSearch()}
		disabled={!showingSearch}
		aria-label="Clear the search"
		title="Clear the search">
		❌
	</button>

	<ol>
		{#each items as item}
			{#if (showingSearch && notHiddenItemIds.includes(item.id)) || !showingSearch}
				<li>
					<input
						type="checkbox"
						id={item.id}
						name={item.name}
						bind:checked={item.done}
						on:change={() => checkItem(item, item.done)}
					/>
					<label for={item.id}>{item.name}</label>
					<button
						on:click={() => editItemName(item)}
						aria-label="Edit item's name"
						title="Edit item's name">
						✏️
					</button>
					<button
						on:click={() => deleteItem(item.id)}
						aria-label="Delete item"
						title="Delete item">
						❌
					</button>
				</li>
			{/if}
		{/each}
	</ol>
</fieldset>
