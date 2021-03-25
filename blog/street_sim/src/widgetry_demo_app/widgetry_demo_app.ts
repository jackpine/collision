// To be loaded by AppLoader, the wasm module is expected to have exported
// `run_in_dom_element` method, which sets the corresponding
// `widgetry::Settings.dom_element_id` property and launches the program.
//
// Additionally, it is assumed that the `init` method and `InitOutput` type are
// available, since they are automatically created by wasm_bindgen:
import {
    default as widgetryDemoInit,
    runWithRootId as widgetryDemoRunWithRootId,
    InitOutput as WidgetryDemoInitOutput
} from './pkg/widgetry_demo.js';

import { AppLoader, InitInput } from '../widgetry.js';

export class WidgetryDemo {
    appLoader: AppLoader<WidgetryDemoInitOutput>;

    init(module_or_path?: InitInput | Promise<InitInput>): Promise<WidgetryDemoInitOutput> {
        return widgetryDemoInit(module_or_path);
    }

    runWithRootId(rootDomId: string): void {
        widgetryDemoRunWithRootId(rootDomId);
    }

    wasmURLString(): string {
        let url = new URL('http://localhost:4000/js/street_sim/widgetry_demo_app/pkg/widgetry_demo_bg.wasm');
        return url.toString();
    }

    public constructor(domId: string) {
        this.appLoader = new AppLoader(this, domId);
    }

    public async loadAndStart() {
        this.appLoader.loadAndStart();
    }
}
