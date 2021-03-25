DEFAULT: serve

.PHONY: widgetry_demo_wasm fifteen_min_wasm

serve:
	bundle exec jekyll serve --watch

tsc:
	tsc --project street_sim --outDir "js/street_sim" --watch

clean:
	rm -r js/street_sim

wasm: widgetry_demo_wasm fifteen_min_wasm

widgetry_demo_wasm:
	$(call generate_wasm,widgetry_demo_app,~/src/abs/abstreet/widgetry_demo)

fifteen_min_wasm:
	$(call generate_wasm,fifteen_min_app,~/src/abs/abstreet/fifteen_min)

define generate_wasm 
	wasm-pack build --dev --target web --out-dir $(shell pwd)/street_sim/src/$1/pkg $2 -- --no-default-features --features wasm
	mkdir -p js/street_sim/$1/
	cp -r $(shell pwd)/street_sim/src/$1/pkg js/street_sim/$1/
endef

