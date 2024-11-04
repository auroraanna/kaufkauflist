<script>
	import {
		createItem,
		checkItem,
		editItemName,
		deleteItem,
		itemsContainingXString,
		itemsStore
	} from '$lib/logic.js';

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

	function handleSubmit() {
		createItem({ name: searchInput, done: false });
		clearSearch();
	}
</script>

<fieldset>
	<legend>Items</legend>

	<form class="no-print" on:submit|preventDefault={() => handleSubmit()}>
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
			type="submit"
			aria-label="Create item from search box input"
			title="Create item from search box input"
		>
			Add
		</button>
	</form>

	<ol id="userItemList">
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
						class="no-print"
						on:click={() => editItemName(item)}
						aria-label="Edit item's name"
						title="Edit item's name"
					>
						✏️
					</button>
					<button
						class="no-print"
						on:click={() => deleteItem(item.id)}
						aria-label="Delete item"
						title="Delete item"
					>
						❌
					</button>
				</li>
			{/if}
		{/each}
	</ol>
</fieldset>

<style>
	#userItemList {
		list-style-type: none;
		padding-inline-start: 0rem;
	}
</style>
