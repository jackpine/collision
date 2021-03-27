DEFAULT: wasm

.PHONY: widgetry_demo_wasm fifteen_min_wasm

serve:
	bundle exec jekyll serve --watch

tsc:
	tsc --project widgetry_apps --outDir "js/widgetry_apps" --watch

clean:
	rm -fr js/widgetry_apps

wasm: widgetry_demo_wasm abstreet_wasm fifteen_min_wasm

widgetry_demo_wasm:
	$(call generate_wasm,widgetry_demo,~/src/abs/abstreet/widgetry_demo)

abstreet_wasm:
	$(call generate_wasm,abstreet,~/src/abs/abstreet/game)
	$(call copy_system_assets,abstreet,~/src/abs/abstreet/game)

fifteen_min_wasm:
	$(call generate_wasm,fifteen_min,~/src/abs/abstreet/fifteen_min)
	$(call copy_system_assets,fifteen_min,~/src/abs/abstreet/fifteen_min)

# WASM_PACK_FLAGS="--dev"
WASM_PACK_FLAGS="--release"

define generate_wasm 
	$(eval $@_WASM_PKG_ROOT=$(shell pwd)/widgetry_apps/src/$1/wasm_pkg)
	wasm-pack build $(WASM_PACK_FLAGS) --target web --out-dir $($@_WASM_PKG_ROOT) $2 -- --no-default-features --features wasm

	# Install compiled packages to site
	mkdir -p js/widgetry_apps/$1/
	cp -r $($@_WASM_PKG_ROOT) js/widgetry_apps/$1/
endef

define copy_system_assets
	$(eval $@_ASSETS_ROOT=$(shell pwd)/js/widgetry_apps/$1/static_assets)
	# ABStreet has a symlink to the data dir at this location. We want to copy in the data dir
	# Not the most efficient thing from a disk perspective, but I think we want these modules to "stand alone"
	# ... If this is problematic, maybe we could make a "data" package or something to consolidate?
	mkdir -p $($@_ASSETS_ROOT)
	cp -r $2/pkg/system $($@_ASSETS_ROOT)

	# TODO: optionally compress assets, i.e. for production distribution
	# I think there is an issue with escaping in the following line
	# find $($@_ASSETS_ROOT) -type f -name \*.bin -exec gzip {} \;
endef

