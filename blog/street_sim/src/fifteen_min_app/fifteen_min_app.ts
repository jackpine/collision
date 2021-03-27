// To be loaded by AppLoader, the wasm module is expected to have exported a
// `run` method, which configures `widgetry::Settings` and launches the program.
//
// Additionally, it is assumed that the `init` method and `InitOutput` type are
// available, since they are automatically created by wasm_bindgen:
import * as wasm_pkg from './wasm_pkg/fifteen_min.js';

import { AppLoader, InitInput, modRoot } from '../widgetry.js';

export class FifteenMinute {
    appLoader: AppLoader<wasm_pkg.InitOutput>;
    modRoot: string;

    init(module_or_path?: InitInput | Promise<InitInput>): Promise<wasm_pkg.InitOutput> {
        return wasm_pkg.default(module_or_path);
    }

    run(rootDomId: string, assetsBaseURL: string): void {
        wasm_pkg.run(rootDomId, assetsBaseURL);
    }

    wasmURLString(): string {
        return this.modRoot + "wasm_pkg/fifteen_min_bg.wasm";
    }

    assetsBaseURL(): string {
        return this.modRoot + "static_assets";
    }

    public constructor(domId: string) {
        this.modRoot = modRoot(import.meta);
        this.appLoader = new AppLoader(this, domId);
    }

    public async loadAndStart() {
        this.appLoader.loadAndStart();
    }
}
