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
let listRecord = {id: '', items: []};

async function initExisting() {
	const params = new URLSearchParams(window.location.search);
	const username = params.get("user");
	console.log(`Set user to: ${username}`);
	userPassword = params.get("password");
	console.log(`Set password to: ${userPassword}`);

	await getUser(username, userPassword);

	updateItems();
}

async function getItems() {
	setTimeout(async function cb() {
		const record = await client.collection('lists').getOne(user.list, {
			expand: 'items',
		});

		// Subscribe to not yet subscribed items in list and make record and items globally available.
		let itemIds = [];
		for (const item of items) {
			itemIds.push(item.id);
		};
		console.log(record);
		console.log("items in record.expand exists:");
		console.log("items" in record.expand);
		if ("items" in record.expand) {
			for (const item of record.expand.items) {
				if (itemIds.includes(item.id) == false) {
					client.collection("items").subscribe(item.id, async function (e) {
						if (!(e.action == "delete")) {
							await getItems();
						};
					});
					console.log(`Subscribed to item ${item.id}.`);
				};
			};

			itemsStore.update((currentData) => record.expand.items);
		};
		listRecord = record;
	}, 0);
}

async function getUser(username, userPassword) {
	const userApiResponse = await client.collection('users').authWithPassword(
		username,
		userPassword
	);
	console.log("userApiResponse");
	console.log(userApiResponse);
	user = userApiResponse.record;
	console.log("user");
	console.log(user);
}

async function updateItems() {
	getItems();

	// Subscribe to list record in case new items are added.
	client.collection("lists").subscribe(user.list, function (e) {
		getItems();
	});
}

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

async function deleteList() {
	if (confirm("Do you really want to delete the list? There is no way of recovering the list.")) {
		await deleteItems(items);
		await client.collection('lists').delete(user.list);
		await client.collection('users').delete(user.id);

		window.location.replace('/');
	}
}

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

async function createUser() {
	userPassword = generatePassword();
	const data = {
		username: generatePassword(),
		password: userPassword,
		passwordConfirm: userPassword,
		key: generatePassword()
	};
	user = await client.collection('users').create(data);
	console.log("Created user:");
	console.log(user);
	console.log(`userPassword: ${userPassword}`);
	await getUser(user.username, userPassword);
}

async function createList() {
	await createUser();

	const listData = {
		items: items,
		user: user.id,
		key: user.key
	};
	console.log(listData);
	listRecord = await client.collection('lists').create(listData);
	console.log("listRecord");
	console.log(listRecord);

	const userData = {
		list: listRecord.id
	};
	user = await client.collection('users').update(user.id, userData);

	let url = `/lists.html?user=${user.username}&password=${userPassword}`;
	console.log(url);
	window.location.replace(url);
}

async function createItem(answer) {
	const createdItemRecord = await client.collection('items').create({ done: false, name: answer, list: user.list });

	console.log(createdItemRecord);
	console.log(listRecord);

	listRecord.items.push(createdItemRecord.id);
	const data = {
		items: listRecord.items
	};
	client.collection('lists').update(user.list, data);
}

export { initExisting, getItems, updateItems, toggleItems, checkItem, checkItems, deleteItem, deleteItems, deleteList, createList, createItem, itemsStore };
