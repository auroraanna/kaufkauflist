import PocketBase from 'pocketbase';
import { writable } from 'svelte/store';

// The app won't work without you setting `VITE_POCKETBASE_URL` with dotenv. The default pocketbase URL is `http://127.0.0.1:8090`.
const client = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

let list;
let listPassword;

let isProcessingSubscriptionEvent = false;
const subscriptionEventQueue = [];

let items = [];
const itemsStore = writable(items);
itemsStore.subscribe((data) => {
	items = data;
	console.log("Updated itemsStore!");
});

function itemIdToIndex(items, id) {
	const hasIdX = (item) => item.id == id;
	return items.findIndex(hasIdX);
}

async function initExisting() {
	const params = new URLSearchParams(window.location.search);
	const username = params.get('list');
	console.log('Got list username from URL query parameters:', username);
	listPassword = params.get('password');
	console.log('Got password from URL query parameters:', listPassword);

	await authorize(username, listPassword);

		list = await client.collection('lists').getOne(list.id, {
			expand: 'items'
		});

		if ('expand' in list) {
			if ('items' in list.expand) {
			itemsStore.update(items => list.expand.items);
		}
	}

	for (const item of items) {
		subscribeToItem(item.id);
	}

	// Subscribe to list record in case new items are added or the list is deleted.
	client.collection('lists').subscribe(list.id, async function (event) {
		if (event.action == 'update') {
			console.log("List update! Adding event to queue…");
			subscriptionEventQueue.push(event);
			processQueue();
		}

		if (event.action == 'delete') {
			window.location.replace('/');
		}
	});

	sortItems();
}

async function processQueue() {
	if (isProcessingSubscriptionEvent) {
		console.log("Queue is already being processed.");
		return;
	}
	isProcessingSubscriptionEvent = true;

	while (subscriptionEventQueue.length > 0) {
		console.log("Processing queue…");

		const event = subscriptionEventQueue.shift();

			// If an item was deleted then these are not actually the old items since the subscription to the item already updated items. I don't know what else to name these though.
			const oldItems = window.structuredClone(items);
			let oldItemIds = [];
			for (const item of oldItems) {
				oldItemIds.push(item.id);
			}
			console.log("Old item ids:", oldItemIds);

			list = event.record;
			console.log("New item ids:", list.items);
			for (const itemId of list.items) {
				if (oldItemIds.includes(itemId) == false) {
					console.log("New item found!")
				await authorizeIfIdChanged(list.username, listPassword);
					const item = await client.collection('items').getOne(itemId);
					items.push(item);
					itemsStore.set(items);

					subscribeToItem(item.id);

				sortItems();
				}
			}
			// Deleting local items is done here rather than in subscribeToItem() because although less efficient, this ensures it doesn't matter which subscription function is run first. If subscribeToItem() were to delete the local item upon an event.action of 'delete', then the lists subscription would think a new item was added.
			for (const itemId of oldItemIds) {
				if (list.items.includes(itemId) == false) {
				itemsStore.set(items.toSpliced(itemIdToIndex(items, itemId), 1));
					console.log("Deleted item with id:", itemId);
				}
			}
		}

	isProcessingSubscriptionEvent = false;
	console.log("Done processing queue.");
}

async function subscribeToItem(id) {
	client.collection('items').subscribe(id, async function (event) {
		if (event.action == 'update') {
			items[itemIdToIndex(items, id)] = event.record;
			itemsStore.set(items);
			}

		sortItems();
	});
}

async function authorize(username, listPassword) {
	const listApiResponse = await client.collection('lists').authWithPassword(username, listPassword);
	await console.log('API response to authentication:', listApiResponse);
	list = listApiResponse.record;
}

// This function is used for now to reauthorize if another browser tab (unfortunately sharing the same authorization store) has since authorized so that the wrong authorization token isn't used.
async function authorizeIfIdChanged(username, listPassword) {
	if (client.authStore.model.id != list.id) {
		await authorize(username, listPassword);
	}
}

async function toggleItems(toBeToggledItems) {
	await authorizeIfIdChanged(list.username, listPassword);
	for (let item of toBeToggledItems) {
		console.log('Toggling item with id:', item.id);
		if (item.done) {
			item.done = false;
			await client.collection('items').update(item.id, { done: false });
		} else {
			item.done = true;
			client.collection('items').update(item.id, { done: true });
		}
	}
}

async function checkItem(item, check) {
	await authorizeIfIdChanged(list.username, listPassword);
	// Only the database needs to be updated because the item is already set done by `bind:checked={item.done}`.
	client.collection('items').update(item.id, { done: item.done });
}

async function checkItems(toBeCheckedItems, check) {
	await authorizeIfIdChanged(list.username, listPassword);
	for (let item of toBeCheckedItems) {
		if (check && item.done == false) {
			item.done = true;
			client.collection('items').update(item.id, { done: true });
		} else if (check == false && item.done) {
			item.done = false;
			client.collection('items').update(item.id, { done: false });
		}
	}
}

async function renameItem(id, name) {
	await authorizeIfIdChanged(list.username, listPassword);
	client.collection('items').update(id, { name: name })
}

function editItemName(item) {
	let newName = prompt("New name of the item", item.name);
	if (newName != null) {
		if (newName.length >= 1 && newName.length <= 100) {
			renameItem(item.id, newName);
		} else {
			alert('The new name must be must be a minimum of 1 character and a maximum of 100 characters. The name you entered does not fulfill those requirements.');
		}
	}
}

async function deleteItem(id) {
	if (confirm('Do you really want to delete that item? You have no way of recovering it.')) {
		await authorizeIfIdChanged(list.username, listPassword);
		client.collection('items').delete(id);
	}
}

async function deleteItems(toBeDeletedItems) {
	if (confirm('Do you really want to delete those items? You have no way of recovering them.')) {
		await authorizeIfIdChanged(list.username, listPassword);
		for (const item of toBeDeletedItems) {
			client.collection('items').delete(item.id);
		}
	}
}

async function anyCheckedItems(items) {
	for (const item of items) {
		if (item.done) {
			return true;
			break;
		}
	}

	return false;
}

async function deleteCheckedItems(items) {
	if (confirm('Do you really want to delete all the checked items? You have no way of recovering them.')) {
		await authorizeIfIdChanged(list.username, listPassword);
		for (const item of items) {
			if (item.done) {
				client.collection('items').delete(item.id);
			}
		}
	}
}

async function deleteList() {
	if (confirm('Do you really want to delete the list? You have no way of recovering it.')) {
		await authorizeIfIdChanged(list.username, listPassword);
		await client.collection('lists').delete(list.id);

		window.location.replace('/');
	}
}

function generatePassword() {
	// Cryptographically secure password generator copied from <https://stackoverflow.com/a/29770068>. The password is about 50 characters long.
	return window.crypto
		.getRandomValues(new BigUint64Array(4))
		.reduce(
			(prev, curr, index) =>
				(!index ? prev : prev.toString(36)) +
				(index % 2 ? curr.toString(36).toUpperCase() : curr.toString(36))
		)
		.split('')
		.sort(() => 128 - window.crypto.getRandomValues(new Uint8Array(1))[0])
		.join('');
}

async function createList() {
	listPassword = generatePassword();
	const data = {
		username: generatePassword(),
		password: listPassword,
		passwordConfirm: listPassword,
		items: items,
	};
	list = await client.collection('lists').create(data);
	console.log('Created list:', list);
	console.log('Password:', listPassword);
	await authorize(list.username, listPassword);

	let url = `/lists.html?list=${list.username}&password=${listPassword}`;
	console.log('Going just created list:', url);
	window.location.replace(url);
}

async function createItem(item) {
	await authorizeIfIdChanged(list.username, listPassword);
	try {
		const createdItemRecord = await client
			.collection('items')
			.create({ done: item.done, name: item.name, list: list.id });

		console.log('Created item:', createdItemRecord);

		let updatedList = list;
		updatedList.items.push(createdItemRecord.id);
		const data = {
			items: updatedList.items
		};
		client.collection('lists').update(list.id, data);
	} catch (error) {
		console.error(error);
		alert(
			'The item was not created. You might not be able to create items this fast or the item name might be too long.'
		);
	}
}

function sortItems() {
	const newItems = [];
	const done = [];

	for (const item of items) {
		if (item.done) {
			done.push(item);
		} else {
			newItems.push(item);
		}
	}

	done.forEach((item) => newItems.push(item));

	itemsStore.set(newItems);
}

async function importItemsJson(jsonItems) {
	console.log('jsonItems:', jsonItems);
	const parsedItems = JSON.parse(jsonItems);
	console.log('parsedItems:', parsedItems);

	for (const item of parsedItems) {
		await createItem({ name: item.name, done: item.done });
	}
}

async function importItemsFiles(jsonFiles) {
	console.log('Imported files:', jsonFiles);
	for (const file of jsonFiles) {
		await importItemsJson(await file.text());
	}
}

function downloadItemsFile(items) {
	const jsonItems = JSON.stringify(items);

	// The following a hack and Anna Aurora wanted to use a better solution but she couldn't get the `download()` function of the [`downloads`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads) API to work and it's not supported widely either.
	// This creates an invisible anchor element with the JSON encoded as base64 into a URI as it's `href`. Then the anchor is clicked and removed.
	var downloadElement = document.createElement('a');
	downloadElement.setAttribute(
		'href',
		'data:application/json;charset=utf-8,' + encodeURIComponent(jsonItems)
	);
	downloadElement.setAttribute('download', 'items.json');
	document.body.appendChild(downloadElement);
	downloadElement.click();
	document.body.removeChild(downloadElement);
}

function itemsContainingXString(items, x) {
	const itemsContainingX = [];

	for (const item of items) {
		if (item.name.toLowerCase().includes(x.toLowerCase())) {
			itemsContainingX.push(item.id);
		}
	}

	return itemsContainingX;
}

export {
	initExisting,
	toggleItems,
	checkItem,
	checkItems,
	editItemName,
	deleteItem,
	deleteItems,
	anyCheckedItems,
	deleteCheckedItems,
	deleteList,
	createList,
	createItem,
	importItemsFiles,
	downloadItemsFile,
	itemsContainingXString,
	itemsStore
};
