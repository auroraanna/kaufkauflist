<script>
	import { onMount } from 'svelte';
	import { initExisting } from '$lib/logic.js';
	import Controls from '$lib/Controls.svelte';
	import Items from '$lib/Items.svelte';

	// Only runs when client loads site. We don't want the server listening for changes to the databse.
	onMount(async () => {
		initExisting();
	});
</script>

<Controls />
<Items />

