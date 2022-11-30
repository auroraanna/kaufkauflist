<script>
	import PocketBase from 'pocketbase';
	import { onMount } from 'svelte';

	// The app won't work without you setting `POCKETBASE_URL` with dotenv. The default pocketbase URL is `http://127.0.0.1:8090`.
	const client = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

	$: items = [];

	async function getItems() {
		items = await client.collection('items').getFullList(1, 20, {
			sort: '-done',
		});
	}

	getItems();
	
	async function updateItems() {
		await client.realtime.subscribe('items', function (e) {
			getItems();
		});
	}

	// Only runs when client loads site. We don't want the server listening for changes to the databse.
	onMount(async () => {
		updateItems();
	});

	async function toggleItems(toBeToggledItems) {
		for (let item of toBeToggledItems) {
			if (item.done) {
				await client.collection('items').update(item.id, {done: false});
			} else {
				await client.collection('items').update(item.id, {done: true});
			}
		}
	}

	async function checkItem(item, check) {
		// Only the database needs to be updated because the item is already set done by `bind:checked={item.done}`.
		await client.collection('items').update(item.id, { done: item.done, name: item.name });
	}

	async function checkItems(toBeCheckedItems, check) {
		for (let item of toBeCheckedItems) {
			if (check) {
				item.done = true;
				await client.collection('items').update(item.id, {done: true});
			} else {
				item.done = false;
				await client.collection('items').update(item.id, {done: false});
			}
		}
		// `getItems()` is not needed here because the items were already checked locally.
		items = items;
	}

	async function deleteItem(id) {
		await client.collection('items').delete(id);
	}

	async function deleteItems(toBeDeletedItems) {
		for (let item of toBeDeletedItems) {
			await client.collection('items').delete(item.id);
		}
	}

	let answer = '';

	async function createItem() {
		await client.collection('items').create({ done: false, name: answer });
	}
</script>

<fieldset>
	<legend>Controls</legend>

	<button on:click={() => checkItems(items, true)}>Check all items</button>

	<button on:click={() => checkItems(items, false)}>Uncheck all items</button>

	<button on:click={() => toggleItems(items)}>Toggle all items</button>

	<button on:click={() => deleteItem(items[0].id)}>Delete first item</button>

	<button on:click={() => deleteItems(items)}>Delete all items</button>

	<form on:submit|preventDefault={createItem}>
		<input bind:value={answer} />

		<button disabled={!answer} type="submit">Create item</button>
	</form>
</fieldset>

<fieldset>
	<legend>Items</legend>

	<ol>
		{#each items as item}
			<li>
				<input type="checkbox" id={item.id} name={item.name} bind:checked={item.done} on:change={() => checkItem(item, item.done)}/>
				<label for={item.id}>{item.name}</label>
				<button on:click={() => deleteItem(item.id)}>Delete item</button>
			</li>
		{/each}
	</ol>
</fieldset>
