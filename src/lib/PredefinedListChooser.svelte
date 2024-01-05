<script>
	import { createItem } from '$lib/logic.js';
	import predefinedItemCategories from './predefinedItemCategories.json';
</script>

<details>
	<summary>Choose from predefined list</summary>

	<fieldset>
		<legend>Predefined items</legend>

		<ol>
			{#each predefinedItemCategories as category}
				<li>
					{category.name}
					<ol>
						{#each category.items as item}
							<li>
								<label>{item}</label>
								<button
									on:click={() =>
										createItem({
										done: false,
										name: item
									})}
									aria-label="Add item to your own list"
									title="Add item to your own list"
								>
									Add
								</button>
							</li>
						{/each}
					</ol>
				</li>
			{/each}
		</ol>
	</fieldset>
</details>