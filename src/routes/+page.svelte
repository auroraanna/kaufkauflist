<script>
	$: items = [];

	function toggleItems() {
		for (let item of items) {
			if (item.done) {
				item.done = false;
			} else {
				item.done = true;
			}
		}
		items = items;
	}

	function checkItems(check) {
		for (let item of items) {
			if (check) {
				item.done = true;
				console.log('item done');
			} else {
				item.done = false;
				console.log('item undone');
			}
		}
		items = items;
	}

	function removeItem(i) {
		items.splice(i, 1);
		items = items;
	}

	function removeItems(s, e) {
		items.splice(s, e);
		items = items;
	}

	let answer = '';

	function addItem() {
		items.push({ done: false, name: answer });
		items = items;
		console.log(items);
	}
</script>

<h1>kaufkauflist</h1>

<fieldset>
	<legend>Controls</legend>

	<button on:click={() => checkItems(true)}> Check all items </button>

	<button on:click={() => checkItems(false)}> Uncheck all items </button>

	<button on:click={toggleItems}> Toggle all items </button>

	<button on:click={() => removeItem(0)}> Remove first item </button>

	<button on:click={() => removeItems(0, items.length)}> Remove all items </button>

	<form on:submit|preventDefault={addItem}>
		<input bind:value={answer} />

		<button disabled={!answer} type="submit"> Add item </button>
	</form>
</fieldset>

<fieldset>
	<legend>Items</legend>

	<ol>
		{#each items as item, i}
			<li>
				<input type="checkbox" id={i} name={item.name} bind:checked={item.done} />
				<label for={i}>{item.name}</label>
				<button on:click={() => removeItem(i)}> Remove item </button>
			</li>
		{/each}
	</ol>
</fieldset>
