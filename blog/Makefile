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
	$(call generate_wasm_with_system_assets,fifteen_min_app,~/src/abs/abstreet/fifteen_min)

define generate_wasm 
	$(eval $@_PKG_ROOT_OUT=$(shell pwd)/street_sim/src/$1/pkg)
	wasm-pack build --dev --target web --out-dir $($@_PKG_ROOT_OUT) $2 -- --no-default-features --features wasm

	# Install compiled packages to site
	mkdir -p js/street_sim/$1/
	cp -r $($@_PKG_ROOT_OUT) js/street_sim/$1/
endef

define generate_wasm_with_system_assets
	$(eval $@_PKG_ROOT_OUT=$(shell pwd)/street_sim/src/$1/pkg)
	wasm-pack build --dev --target web --out-dir $($@_PKG_ROOT_OUT) $2 -- --no-default-features --features wasm

	# ABStreet has a symlink to the data dir at this location. We want to copy in the data dir
	# Not the most efficient thing from a disk perspective, but I think we want these modules to "stand alone"
	# ... If this is problematic, maybe we could make a "data" package or something to consolidate?
	cp -r $2/pkg/system $($@_PKG_ROOT_OUT)

	# Install compiled packages to site
	mkdir -p js/street_sim/$1/
	cp -r $($@_PKG_ROOT_OUT) js/street_sim/$1/
endef

