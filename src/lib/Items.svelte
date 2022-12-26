<script>
	import { checkItem, deleteItem, itemsStore } from '$lib/logic.js';

	let items = [];
	itemsStore.subscribe((data) => {
		items = data;
	})
</script>

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

