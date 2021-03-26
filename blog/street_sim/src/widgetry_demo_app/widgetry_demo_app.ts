// To be loaded by AppLoader, the wasm module is expected to have exported a
// `run` method, which configures `widgetry::Settings` and launches the program.
//
// Additionally, it is assumed that the `init` method and `InitOutput` type are
// available, since they are automatically created by wasm_bindgen:
import {
    default as widgetryDemoInit,
    run as widgetryDemoRun,
    InitOutput as WidgetryDemoInitOutput
} from './pkg/widgetry_demo.js';

import { AppLoader, InitInput, pkgRoot } from '../widgetry.js';

export class WidgetryDemo {
    appLoader: AppLoader<WidgetryDemoInitOutput>;
    pkgRoot: string;

    init(module_or_path?: InitInput | Promise<InitInput>): Promise<WidgetryDemoInitOutput> {
        return widgetryDemoInit(module_or_path);
    }

    run(rootDomId: string, assetsBaseUrl: string): void {
        widgetryDemoRun(rootDomId, assetsBaseUrl);
    }

    wasmURLString(): string {
        return this.pkgRoot + "//widgetry_demo_bg.wasm";
    }

    assetsBaseURL(): string {
        return this.pkgRoot;
    }

    public constructor(domId: string) {
        this.pkgRoot = pkgRoot(import.meta);
        this.appLoader = new AppLoader(this, domId);
    }

    public async loadAndStart() {
        this.appLoader.loadAndStart();
    }
}
