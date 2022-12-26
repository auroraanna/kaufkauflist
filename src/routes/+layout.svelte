<style>
	:global(:root) {
		font-size: 1.1rem;
		font-family: 'Google Sans', Inter, Roboto, 'Open Sans', sans-serif;
		font-variant-ligatures: common-ligatures;
		font-variant-numeric: slashed-zero;
		overflow-wrap: anywhere;
		background-color: var(--background);
		color: var(--on_background);
		width: fit-content;
	}

	:global(a) {
		color: var(--primary);
	}

	:global(a:hover) {
		color: var(--on_primary_container);
	}

	:global(fieldset) {
		border-color: var(--on_background);
		border-width: 0.1rem;
		border-radius: 0.4rem;
		border-style: solid;
	}

	:global(label) {
		vertical-align: middle;
	}

	:global(button) {
		font-size: 1.1rem;
		background-color: var(--secondary_container);
		color: var(--on_secondary_container);
		border-radius: 0.2rem;
		border: none;
		margin: 0.2rem;
		padding: 0.2rem;
		min-width: 5rem;
		min-height: 2.74rem;
		vertical-align: middle;
	}

	:global(button:disabled) {
		background-color: var(--outline);
		color: var(--on_backround);
	}

	:global(input[type=text]) {
		font-size: 1.1rem;
		background-color: var(--surface_variant);
		color: var(--on_surface_variant);
		border-radius: 0.2rem;
		border: none;
		margin: 0.2rem;
		padding: 0.2rem;
		min-width: 5rem;
		min-height: 1rem;
		vertical-align: middle;
	}

	:global(input[type=checkbox]) {
		background-color: var(--on_primary);
		color: var(--primary);
		border-radius: 0.2rem;
		border: none;
		width: 1.5rem;
		height: 1.5rem;
		vertical-align: middle;
	}

	:global(input[type=checkbox]:checked) {
		background-color: var(--primary);
		color: var(--on_primary);
		border-radius: 0.2rem;
		border: none;
	}

	:global(.important) {
		background-color: var(--error);
		color: var(--on_error);
		padding: 0.4rem;
		border-radius: 0.4rem;
		border: none;
	}

	@media (prefers-color-scheme: light) {
		:global(:root) {
			--primary: #a500cf;
			--on_primary: #9af8ff;
			--primary_container: #fed5ff;
			--on_primary_container: #340044;
			--secondary: #e5daff;
			--on_secondary: #5622ce;
			--secondary_container: #bb9bff;
			--on_secondary_container: #241727;
			--background: #ffffff;
			--on_background: #000000;
			--outline: #7e747d;
			--surface_variant: #ffbe64;
			--on_surface_variant: #231400;
			--error: #ba1a1a;
			--on_error: #ffffff;
			--error_container: #ffdad6;
			--on_error_container: #410002;
		}
	}

	@media (prefers-color-scheme: dark) {
		:global(:root) {
			--primary: #d119ff;
			--on_primary: #1e002f;
			--primary_container: #1d002e;
			--on_primary_container: #e57bff;
			--secondary: #ddd2ef;
			--on_secondary: #1c0e3e;
			--secondary_container: #2a008d;
			--on_secondary_container: #eee4ff;
			--background: #0a0022;
			--on_background: #fafffb;
			--outline: #938F99;
			--surface_variant: #592e00;
			--on_surface_variant: #fff6e9;
			--error: #ffb4ab;
			--on_error: #690005;
			--error_container: #93000a;
			--on_error_container: #ffdad6;
		}
	}
</style>

<slot />

