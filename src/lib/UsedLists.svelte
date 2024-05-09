<script>
	import { onMount } from 'svelte';
	import { listUrl } from '$lib/logic.js';

	let usedLists = [];
	onMount(() => {
		let usedListsJson = window.localStorage.getItem('usedLists');
		if (usedListsJson == null) {
			usedLists = [];
		} else {
			usedLists = JSON.parse(usedListsJson);
		}
	});
</script>

{#if usedLists.length != 0}
	<h2>Lists you've used</h2>
	<ul>
		{#each usedLists as list}
			<li>
				<a href={listUrl(list.username, list.password)}>
					{#if (list.name == null) || (list.name == "")}
						unnamed
					{:else}
						{list.name}
					{/if}
				</a>
			</li>
		{/each}
	</ul>
{/if}
