import PocketBase from 'pocketbase';
import { writable } from 'svelte/store';

// The app won't work without you setting `VITE_POCKETBASE_URL` with dotenv. The default pocketbase URL is `http://127.0.0.1:8090`.
const client = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

let user;
let userPassword;

let items = [];
const itemsStore = writable(items);
itemsStore.subscribe((data) => {
	items = data;
});
let listRecord = { id: '', items: [] };

async function initExisting() {
	const params = new URLSearchParams(window.location.search);
	const username = params.get('user');
	console.log(`Got username from URL query parameters: ${username}`);
	userPassword = params.get('password');
	console.log(`Got password from URL query parameters: ${userPassword}`);

	await getUser(username, userPassword);

	updateItems();
}

async function getItems() {
	setTimeout(async function cb() {
		const record = await client.collection('lists').getOne(user.list, {
			expand: 'items'
		});

		// Subscribe to not yet subscribed items in list and make record and items globally available.
		let itemIds = [];
		for (const item of items) {
			itemIds.push(item.id);
		}
		console.log(record);
		console.log('items in record.expand exists:');
		console.log('items' in record.expand);
		if ('items' in record.expand) {
			for (const item of record.expand.items) {
				if (itemIds.includes(item.id) == false) {
					client.collection('items').subscribe(item.id, async function (e) {
						if (!(e.action == 'delete')) {
							await getItems();
						}
					});
					console.log(`Subscribed to item with id: ${item.id}`);
				}
			}
			itemsStore.update((currentData) => record.expand.items);
		} else {
			itemsStore.update((currentData) => []);
		}
		listRecord = record;
	}, 0);
}

async function getUser(username, userPassword) {
	const userApiResponse = await client.collection('users').authWithPassword(username, userPassword);
	console.log('API response to user authentication:', userApiResponse);
	user = userApiResponse.record;
}

async function updateItems() {
	getItems();

	// Subscribe to list record in case new items are added.
	client.collection('lists').subscribe(user.list, function (e) {
		getItems();
	});
}

async function toggleItems(toBeToggledItems) {
	for (let item of toBeToggledItems) {
		console.log(item.id);
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
	// Only the database needs to be updated because the item is already set done by `bind:checked={item.done}`.
	client.collection('items').update(item.id, { done: item.done });
}

async function checkItems(toBeCheckedItems, check) {
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

async function deleteItem(id) {
	client.collection('items').delete(id);
}

async function deleteItems(toBeDeletedItems) {
	for (const item of toBeDeletedItems) {
		client.collection('items').delete(item.id);
	}
}

function anyCheckedItems(items) {
	for (const item of items) {
		if (item.done) {
			return true;
			break;
		}
	}

	return false;
}

async function deleteCheckedItems(items) {
	for (const item of items) {
		if (item.done) {
			client.collection('items').delete(item.id);
		}
	}
}

async function deleteList() {
	if (confirm('Do you really want to delete the list? There is no way of recovering the list.')) {
		await deleteItems(items);
		await client.collection('lists').delete(user.list);
		await client.collection('users').delete(user.id);

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

async function createUser() {
	userPassword = generatePassword();
	const data = {
		username: generatePassword(),
		password: userPassword,
		passwordConfirm: userPassword,
		key: generatePassword()
	};
	user = await client.collection('users').create(data);
	console.log('Created user:', user);
	console.log(`Password: ${userPassword}`);
	await getUser(user.username, userPassword);
}

async function createList() {
	await createUser();

	const listData = {
		items: items,
		user: user.id,
		key: user.key
	};
	console.log('Data of to be created list:', listData);
	listRecord = await client.collection('lists').create(listData);
	console.log('Current list:', listRecord);

	const userData = {
		list: listRecord.id
	};
	user = await client.collection('users').update(user.id, userData);

	let url = `/lists.html?user=${user.username}&password=${userPassword}`;
	console.log('Going just created list:', url);
	window.location.replace(url);
}

async function createItem(item) {
	try {
		const createdItemRecord = await client
			.collection('items')
			.create({ done: item.done, name: item.name, list: user.list });

		console.log('Created item:', createdItemRecord);
		console.log('Current list', listRecord);

		listRecord.items.push(createdItemRecord.id);
		const data = {
			items: listRecord.items
		};

		client.collection('lists').update(user.list, data);
	} catch (error) {
		console.error(error);
		alert(
			'The item was not created. You might not be able to create items this fast or the item name might be too long.'
		);
	}
}

async function importItemsJson(jsonItems) {
	console.log('jsonItems', jsonItems);
	const parsedItems = JSON.parse(jsonItems);
	console.log('parsedItems', parsedItems);

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
