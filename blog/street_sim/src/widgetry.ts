// To be loaded by AppLoader, the wasm module is expected to have exported
// `run_in_dom_element` method, which sets the corresponding
// `widgetry::Settings.dom_element_id` property and launches the program.
//
// Additionally, it is assumed that the `init` method and `InitOutput` type are
// available, since they are automatically created by wasm_bindgen. Note that the type signatures
// for both `init` and `InitInput` were copy/pasted from the wasm_bindgen generated ts.d files,
// and should be stable. `InitOutput` on the other hand will vary from app to app.
export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;
export interface WidgetryApp<InitOutput> {
    init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
    run_in_dom_element(root_dom_id: string): void;
    wasmURLString(): string;
}

enum LoadState {
    unloaded, loading, loaded, error
}

export class AppLoader<T> {
    app: WidgetryApp<T>;
    el: HTMLElement;
    domId: string;
    state: LoadState = LoadState.unloaded;

    public constructor(app: WidgetryApp<T>, domId: string) {
        this.app = app;
        this.domId = domId;
        let el = document.getElementById(domId);
        if (el === null) {
            throw new Error(`element with domId: ${domId} not found`);
        }
        this.el = el;
        appendLoading(this.el);
        this.render();
        console.log("sim constructor", this);
    }

    public async loadAndStart() {
        try {
            await this.load();
            await this.start();
        } catch (e) {
            if (e.toString() == "Error: Using exceptions for control flow, don't mind me. This isn't actually an error!") {
                // This is an expected, albeit unfortunate, control flow mechanism for winit on wasm.
                console.debug("ignoring expected error:", e);
            } else {
                console.error("error while loading: ", e);
                this.updateState(LoadState.error);
                alert(e);
            }
        }
    }

    async load() {
        console.assert(this.state == LoadState.unloaded, "already loaded");
        // TODO: copy incremental loading logic from ABStreet for progress indication
        let response: Response = await fetch(this.app.wasmURLString());
        this.updateState(LoadState.loading);

        // TODO: Prefer streaming instantiation where available (not safari)? Seems like it'd be faster.
        // const { instance } = await WebAssembly.instantiateStreaming(response, imports);
        
        let blob: Blob = await response.blob();
        let bytes: ArrayBuffer = await blob.arrayBuffer();
        //let imports = {};
        //let instance = await WebAssembly.instantiate(bytes, imports);
        await this.app.init(bytes);
        this.app.run_in_dom_element(this.domId);

        this.updateState(LoadState.loaded);
    }

    async start() {
        console.assert(this.state == LoadState.loaded, "not yet loaded");
        // TODO - actually do something
        console.log("sim starting");
    }

    updateState(newValue: LoadState) {
        console.debug(`state change: ${LoadState[this.state]} -> ${LoadState[newValue]}`);
        this.state = newValue;
        this.render();
    }

    render() {
        this.el.style["border-style"] = "solid";
        this.el.style["border-thickness"] = "4px";
        this.el.style["border-color"] = ((): string => {
            switch (this.state) {
                case LoadState.unloaded: return "yellow";
                case LoadState.loading: return "green";
                case LoadState.loaded: return "white";
                case LoadState.error: return "red";
            }
        })();
    }
}

function appendLoading(el) {
    let loadingEl = document.createElement("p");
    let text = document.createTextNode("Loading...");
    loadingEl.append(text);
    loadingEl.id = "loading";

    el.append(loadingEl);
}
