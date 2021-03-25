// To be loaded by AppLoader, the wasm module is expected to have exported
// `run_in_dom_element` method, which sets the corresponding
// `widgetry::Settings.dom_element_id` property and launches the program.
//
// Additionally, it is assumed that the `init` method and `InitOutput` type are
// available, since they are automatically created by wasm_bindgen:
import {
    default as fifteenMinInit,
    runWithRootId as fifteenMinRunWithRootId,
    InitOutput as FifteenMinInitOutput
} from './pkg/fifteen_min.js';

import { AppLoader, InitInput } from '../widgetry.js';

export class FifteenMinute {
    appLoader: AppLoader<FifteenMinInitOutput>;

    init(module_or_path?: InitInput | Promise<InitInput>): Promise<FifteenMinInitOutput> {
        return fifteenMinInit(module_or_path);
    }

    runWithRootId(rootDomId: string): void {
        fifteenMinRunWithRootId(rootDomId);
    }

    wasmURLString(): string {
        let url = new URL('http://localhost:4000/js/street_sim/fifteen_min_app/pkg/fifteen_min_bg.wasm');
        return url.toString();
    }

    public constructor(domId: string) {
        this.appLoader = new AppLoader(this, domId);
    }

    public async loadAndStart() {
        this.appLoader.loadAndStart();
    }
}
