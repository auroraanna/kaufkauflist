<script>
	import PocketBase from 'pocketbase';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	// The app won't work without you setting `VITE_POCKETBASE_URL` with dotenv. The default pocketbase URL is `http://127.0.0.1:8090`.
	const client = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

	let user;

	$: items = [];
	$: listRecord = {items: []};

	async function getItems() {
		setTimeout(async function cb() {
			console.log("Using list…");
			const record = await client.collection('lists').getOne(user.list, {
				expand: 'items',
				key: user.key
			});

			// Subscribe to not yet subscribed items in list and make record and items globally available.
			let itemIds = [];
			for (const item of items) {
				itemIds.push(item.id);
			};
			console.log(record);
			console.log("items" in record.expand);
			if ("items" in record.expand) {
				for (const item of record.expand.items) {
					if (itemIds.includes(item.id) == false) {
						client.collection("items").subscribe(item.id, function (e) {
							getItems();
						});
						console.log(`Subscribed to item ${item.id}.`);
					};
				};

				items = record.expand.items;
			};
			listRecord = record;
		}, 0);
	}

	async function updateItems() {
		getItems();

		// Subscribe to list record in case new items are added.
		client.collection("lists").subscribe(user.list, function (e) {
			getItems();
		});
	}

	// Only runs when client loads site. We don't want the server listening for changes to the databse.
	onMount(async () => {
		const userId = $page.url.searchParams.get('user');
		console.log(`Set user to: ${userId}`);
		const userPassword = $page.url.searchParams.get('password');
		console.log(`Set password to: ${userPassword}`);

		const userApiResponse = await client.collection('users').authWithPassword(
			userId,
			userPassword
		);
		user = userApiResponse.record;
		console.log(user);

		updateItems();
	});

	async function toggleItems(toBeToggledItems) {
		for (let item of toBeToggledItems) {
			console.log(item.id);
			if (item.done) {
				item.done = false;
				client.collection('items').update(item.id, {done: false});
			} else {
				item.done = true;
				client.collection('items').update(item.id, {done: true});
			}
		}
	}

	async function checkItem(item, check) {
		// Only the database needs to be updated because the item is already set done by `bind:checked={item.done}`.
		client.collection('items').update(item.id, {done: item.done});
	}

	async function checkItems(toBeCheckedItems, check) {
		for (let item of toBeCheckedItems) {
			if (check && item.done == false) {
				item.done = true;
				client.collection('items').update(item.id, {done: true});
			} else if (check == false && item.done) {
				item.done = false;
				client.collection('items').update(item.id, {done: false});
			}
		}
		// `getItems()` is not needed here because the items were already checked locally.
		items = items;
	}

	async function deleteItem(id) {
		client.collection('items').delete(id);
	}

	async function deleteItems(toBeDeletedItems) {
		for (const item of toBeDeletedItems) {
			client.collection('items').delete(item.id);
		}
	}

	let answer = '';

	function generatePassword() {
		// Cryptographically secure password generator copied from <https://stackoverflow.com/a/29770068>. The password is about 50 characters long.
		return window.crypto.getRandomValues(new BigUint64Array(4)).reduce(
			(prev, curr, index) => (
				!index ? prev : prev.toString(36)
			) + (
				index % 2 ? curr.toString(36).toUpperCase() : curr.toString(36)
			)
		).split('').sort(() => 128 -
			window.crypto.getRandomValues(new Uint8Array(1))[0]
		).join('');
	}

	async function createItem() {
		const createdItemRecord = await client.collection('items').create({ done: false, name: answer, list: user.list });

		console.log(createdItemRecord);
		console.log(listRecord);

		listRecord.items.push(createdItemRecord.id);
		const data = {
			items: listRecord.items
		};
		client.collection('lists').update(user.list, data);
	}
</script>

<fieldset>
	<legend>Controls</legend>

	<button on:click={() => checkItems(items, true)}>Check all items</button>

	<button on:click={() => checkItems(items, false)}>Uncheck all items</button>

	<button on:click={() => toggleItems(items)}>Toggle all items</button>

	<button on:click={() => deleteItem(items[0].id)}>Delete first item</button>

	<button on:click={() => deleteItem(items[items.length - 1].id)}>Delete last item</button>

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
