<slot />

<style>
	:global(:root) {
		font-size: 1.1rem;
		font-family: 'Google Sans', Inter, Roboto, 'Open Sans', sans-serif;
		font-variant-ligatures: common-ligatures;
		font-variant-numeric: slashed-zero;
		line-height: 1.5;
		overflow-wrap: anywhere;
		background-color: var(--background);
		color: var(--on_background);
		width: fit-content;
	}

	:global(a) {
		color: var(--anchor);
	}

	:global(a:focus) {
		font-weight: bold;
		background-color: var(--anchor);
		color: var(--on_anchor);
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
		background-color: var(--on_button);
		color: var(--button);
		border-radius: 0.2rem;
		border-width: 0.1rem;
		border-style: solid;
		border-color: var(--button);
		margin: 0.2rem;
		padding: 0.2rem;
		min-width: 5rem;
		min-height: 2.74rem;
		vertical-align: middle;
	}

	:global(button:active) {
		background-color: var(--button);
		color: var(--on_button);
	}

	:global(button:disabled) {
		background-color: var(--on_disabled_button);
		color: var(--disabled_button);
		border-color: var(--disabled_button);
	}

	:global(input[type='text'], input[type='file']) {
		font-size: 1.1rem;
		background-color: var(--on_input);
		color: var(--input);
		border-radius: 0.2rem;
		border-width: 0.1rem;
		border-style: solid;
		border-color: var(--input);
		margin: 0.2rem;
		padding: 0.2rem;
		min-width: 5rem;
		min-height: 1rem;
		vertical-align: middle;
	}

	:global(input[type='checkbox']) {
		border-radius: 0.2rem;
		width: 1.5rem;
		height: 1.5rem;
		vertical-align: middle;
	}

	:global(input[type='checkbox']:checked) {
		border-radius: 0.2rem;
	}

	:global(.error) {
		background-color: var(--on_error);
		color: var(--error);
		padding: 0.4rem;
		border-radius: 0.2rem;
		border-width: 0.1rem;
		border-style: solid;
		border-color: var(--error);
	}

	:global(:root) {
		color-scheme: light;
		--background: #ffffff;
		--on_background: #000000;
		--anchor: #0400ff;
		--on_anchor: #57ffff;
		--button: #804200;
		--on_button: #fff5e5;
		--disabled_button: #394c3b;
		--on_disabled_button: #dee3de;
		--input: #600094;
		--on_input: #eac2ff;
		--error: #8c1c18;
		--on_error: #f9dedc;
	}

	@media (prefers-color-scheme: dark) {
		:global(:root) {
			color-scheme: dark;
			--background: #000000;
			--on_background: #ffffff;
			--anchor: #fbff00;
			--on_anchor: #a80000;
			--button: #66b0ff;
			--on_button: #001f3d;
			--disabled_button: #b9a2b7;
			--on_disabled_button: #211c21;
			--input: #98ff61;
			--on_input: #1d5200;
			--error: #f9dedc;
			--on_error: #8c1c18;
		}
	}
</style>
