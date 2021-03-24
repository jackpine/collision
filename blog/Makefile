DEFAULT: serve

WASM_PROJECT_ROOT=~/src/abs/abstreet/widgetry_demo

serve:
	bundle exec jekyll serve --watch

tsc:
	tsc --project street_sim --outDir "js" --watch

wasm:
	wasm-pack build --dev --target web --out-dir $(shell pwd)/js/pkg $(WASM_PROJECT_ROOT) -- --no-default-features --features wasm
