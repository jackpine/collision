// and should be stable. `InitOutput` on the other hand will vary from app to app.
// To be loaded by AppLoader, the wasm module is expected to have exported a
// `run` method, which configures `widgetry::Settings` and launches the program.
//
// Additionally, it is assumed that the `init` method and `InitOutput` type are
// available, since they are automatically created by wasm_bindgen:
//
// Note that the type signatures for both `init` and `InitInput` were
// copy/pasted from the wasm_bindgen generated ts.d files. Those parts, at
// least, should be stable.
export type InitInput = RequestInfo | URL | Response | BufferSource |
    WebAssembly.Module;

export interface WidgetryApp<InitOutput> {
    init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
    run(rootDomId: string, assetsBaseUrl: string): void;
    wasmURLString(): string;
    assetsBaseURL(): string;
}

enum LoadState {
    unloaded, loading, loaded, starting, started, error
}

/**
 * Helper class used by `WidgetryApp` implementations to load their wasm and
 * render their content.
 */
export class AppLoader<T> {
    app: WidgetryApp<T>;
    el: HTMLElement;
    loadingEl: HTMLElement;
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
        this.loadingEl = appendLoading(el);
        this.render();
        console.log("sim constructor", this);
    }

    public async loadAndStart() {
        try {
            await this.load();
            await this.start();
        } catch (e) {
            console.error("error while loading: ", e);
            this.updateState(LoadState.error);
            alert(e);
            //throw e;
        }
    }

    async load() {
        console.assert(this.state == LoadState.unloaded, "already loaded");
        this.updateState(LoadState.loading);
        // TODO: copy incremental loading logic from ABStreet for progress indication
        let response: Response = await fetch(this.app.wasmURLString());

        // TODO: Prefer streaming instantiation where available (not safari)? Seems like it'd be faster.
        // const { instance } = await WebAssembly.instantiateStreaming(response, imports);
        
        let blob: Blob = await response.blob();
        let bytes: ArrayBuffer = await blob.arrayBuffer();
        //let imports = {};
        //let instance = await WebAssembly.instantiate(bytes, imports);
        await this.app.init(bytes);
        this.updateState(LoadState.loaded);
    }

    async start() {
        console.assert(this.state == LoadState.loaded, "not yet loaded");
        this.updateState(LoadState.starting);
        try {
            this.app.run(this.domId, this.app.assetsBaseURL());
        } catch (e) {
            if (e.toString() == "Error: Using exceptions for control flow, don't mind me. This isn't actually an error!") {
                // This is an expected, albeit unfortunate, control flow mechanism for winit on wasm.
                this.updateState(LoadState.started);
            } else {
                throw e
            }
        }
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
                case LoadState.unloaded: return "white";
                case LoadState.loading: return "#ffff0088";
                case LoadState.loaded: return "#ffff00";
                case LoadState.starting: return "#00ff0088";
                case LoadState.started: return "#00ff0000";
                case LoadState.error: return "red";
            }
        })();

        this.loadingEl.innerText = ((): string => {
            switch (this.state) {
                case LoadState.unloaded: return "unloaded";
                case LoadState.loading: return "loading";
                case LoadState.loaded: return "loaded";
                case LoadState.starting: return "starting";
                case LoadState.started: return "started";
                case LoadState.error: return "error";
            }
        })();
    }
}

export function modRoot(importMeta: ImportMeta): string {
    function dirname(path: string) {
        return path.match(/.*\//);
    }
    // Is there a better way to do this?
    // import.meta is a *relatively* new feature (2020ish)
    // can/should we dedupe this?
    let url = new URL(importMeta['url']);
    url.pathname = dirname(url.pathname) + "";
    return url.toString();
}

function appendLoading(el: HTMLElement): HTMLElement {
    let loadingEl = document.createElement("p");
    let text = document.createTextNode("Loading...");
    loadingEl.append(text);
    loadingEl.id = "loading";

    el.append(loadingEl);
    return loadingEl;
}
