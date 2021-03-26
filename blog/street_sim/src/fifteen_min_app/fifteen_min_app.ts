// To be loaded by AppLoader, the wasm module is expected to have exported a
// `run` method, which configures `widgetry::Settings` and launches the program.
//
// Additionally, it is assumed that the `init` method and `InitOutput` type are
// available, since they are automatically created by wasm_bindgen:
import {
    default as fifteenMinInit,
    run as fifteenMinRun,
    InitOutput as FifteenMinInitOutput
} from './wasm_pkg/fifteen_min.js';

import { AppLoader, InitInput, pkgRoot } from '../widgetry.js';

export class FifteenMinute {
    appLoader: AppLoader<FifteenMinInitOutput>;
    pkgRoot: string;

    init(module_or_path?: InitInput | Promise<InitInput>): Promise<FifteenMinInitOutput> {
        return fifteenMinInit(module_or_path);
    }

    run(rootDomId: string, assetsBaseURL: string): void {
        fifteenMinRun(rootDomId, assetsBaseURL);
    }

    wasmURLString(): string {
        return this.pkgRoot + "wasm_pkg/fifteen_min_bg.wasm";
    }

    assetsBaseURL(): string {
        return this.pkgRoot + "static_assets";
    }

    public constructor(domId: string) {
        this.pkgRoot = pkgRoot(import.meta);
        this.appLoader = new AppLoader(this, domId);
    }

    public async loadAndStart() {
        this.appLoader.loadAndStart();
    }
}
