#!/usr/bin/env node
// Deletes old or empty lists to free up wasted space from the database.

import PocketBase from 'pocketbase';

const args = process.argv
const env = process.env;

// Prints help menu or does everything else.
if (args.includes('-h') || args.includes('--help')) {
	console.log(
`USAGE:
	KAUFDBCLEAN_HOST=[HOST] KAUFDBCLEAN_EMAIL=[EMAIL] KAUFDBCLEAN_PASSWORD=[PASSWORD] ${args[0]} ${args[1]} [OPTIONS]

OPTIONS:
	-h, --help`
	);
} else if (!env.KAUFDBCLEAN_HOST || !env.KAUFDBCLEAN_EMAIL || !env.KAUFDBCLEAN_PASSWORD) {
	console.log("Not all required environment variables set.");
} else {
	const host = env.KAUFDBCLEAN_HOST;
	const email = env.KAUFDBCLEAN_EMAIL;
	const password = env.KAUFDBCLEAN_PASSWORD;

	const pb = new PocketBase(host);

	// Authenticates as admin.
	await pb.admins.authWithPassword(email, password);

	const lists = await pb.collection('lists').getFullList(500, {
		expand: 'items',
	});

	const now = Date.now();
	const oneDay = 1000 * 60 * 60 * 24;
	const oneWeek = oneDay * 7;
	const oneMonth = oneDay * 30;
	const oneWeekAgo = now - oneWeek;
	const oneMonthAgo = now - oneMonth;

	function deleteList(id) {
		pb.collection('lists').delete(id);
	}

	// Cleans up the lists collection.
	for (const list of lists) {
		const then = Date.parse(list.updated);
		if (then <= oneWeekAgo && list.items.length == 0) {
			console.log(`List ${list.id} was updated more than a week ago and is empty, deleting…`);
			deleteList(list.id);
		} else if (then <= oneMonthAgo) {
			console.log(`List ${list.id} was updated more than one month ago, deleting…`);
			deleteList(list.id);
		} else {
			console.log(`List ${list.id} was updated less than one week ago, doing nothing.`);
		}
	}

	// Logs out.
	pb.authStore.clear();
}
