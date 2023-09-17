import PocketBase from 'pocketbase';
import { writable } from 'svelte/store';

// The app won't work without you setting `VITE_POCKETBASE_URL` with dotenv. The default pocketbase URL is `http://127.0.0.1:8090`.
const client = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

let list;
let listPassword;

let items = [];
const itemsStore = writable(items);
itemsStore.subscribe((data) => {
	items = data;
});

async function initExisting() {
	const params = new URLSearchParams(window.location.search);
	const username = params.get('list');
	console.log('Got list username from URL query parameters:', username);
	listPassword = params.get('password');
	console.log('Got password from URL query parameters:', listPassword);

	await authorize(username, listPassword);

	updateItems();
}

async function getItems() {
	await authorizeIfIdChanged(list.username, listPassword);
	setTimeout(async function cb() {
		list = await client.collection('lists').getOne(list.id, {
			expand: 'items'
		});

		// Subscribe to not yet subscribed items in list and make record and items globally available.
		let itemIds = [];
		for (const item of items) {
			itemIds.push(item.id);
		}
		console.log('list:', list);
		console.log('items in list.expand exists:', ('items' in list.expand));
		if ('items' in list.expand) {
			for (const item of list.expand.items) {
				if (itemIds.includes(item.id) == false) {
					client.collection('items').subscribe(item.id, async function (e) {
						if (!(e.action == 'delete')) {
							await getItems();
						}
					});
					console.log('Subscribed to item with id:', item.id);
				}
			}
			itemsStore.update((currentData) => list.expand.items);
		} else {
			itemsStore.update((currentData) => []);
		}
	}, 0);
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

async function updateItems() {
	getItems();

	await authorizeIfIdChanged(list.username, listPassword);
	// Subscribe to list record in case new items are added.
	client.collection('lists').subscribe(list.id, function (e) {
		getItems();
	});
}

async function toggleItems(toBeToggledItems) {
	await authorizeIfIdChanged(list.username, listPassword);
	for (let item of toBeToggledItems) {
		console.log('Toggling item with id:', item.id);
		if (item.done) {
			item.done = false;
			client.collection('items').update(item.id, { done: false });
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
	// `getItems()` is not needed here because the items were already checked locally.
	items = items;
}

async function renameItem(id, name) {
	await authorizeIfIdChanged(list.username, listPassword);
	client.collection('items').update(id, { name: name })
}

function editItemName(id) {
	let newName = prompt("New name of the item");
	if (newName != null) {
		if (newName.length >= 1 && newName.length <= 100) {
			renameItem(id, newName);
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
		console.log('Current items:', items);

		list.items.push(createdItemRecord.id);
		const data = {
			items: list.items
		};
		console.log('list.items will be updated to', data);

		client.collection('lists').update(list.id, data);
	} catch (error) {
		console.error(error);
		alert(
			'The item was not created. You might not be able to create items this fast or the item name might be too long.'
		);
	}
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

export {
	initExisting,
	getItems,
	updateItems,
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
	itemsStore
};
