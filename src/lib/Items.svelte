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

	<form on:submit|preventDefault={() => createItem({ name: searchInput, done: false })}>
	<label for="search">Search box</label>
		<input
			type="search"
			id="search"
			bind:value={searchInput}
			minlength="1"
			maxlength="100"
			placeholder="potatoes"
		/>
	<button
			disabled={!showingSearch}
		on:click={() => clearSearch()}
			type="submit"
			aria-label="Create item from search box input"
			title="Create item from search box input">
			Add
	</button>
	</form>

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
