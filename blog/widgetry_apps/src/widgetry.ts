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
    loadingEl?: HTMLElement;
    unsupportedEl?: HTMLElement;
    domId: string;
    state: LoadState = LoadState.unloaded;
    // (receivedLength, totalLength)
    downloadProgress?: [number, number];
    errorMessage: string;

    public constructor(app: WidgetryApp<T>, domId: string) {
        this.app = app;
        this.domId = domId;
        let el = document.getElementById(domId);
        if (el === null) {
            throw new Error(`element with domId: ${domId} not found`);
        }
        this.el = el;
        console.log("sim constructor", this);
    }

    public async loadAndStart() {
        this.render();
        try {
            await this.load();
            await this.start();
        } catch (e) {
            this.reportErrorState("error while loading: " + e.toString());
            throw e;
        }
    }

    async load() {
        console.assert(this.state == LoadState.unloaded, "already loaded");
        this.updateState(LoadState.loading);
        
        console.log("Started loading WASM");
        const t0 = performance.now();
        let response: Response = await fetch(this.app.wasmURLString());

        if (response.body == null) {
            this.reportErrorState("response.body was unexpectedly null");
            return;
        }
        let reader = response.body.getReader();

        let contentLength = response.headers.get('Content-Length');
        if (contentLength == undefined) {
            this.reportErrorState("contentLength was unexpectedly undefined");
            return;
        }

        this.downloadProgress = [0, parseInt(contentLength)];

        let chunks: Uint8Array[] = [];
        while (true) {
            const {done, value} = await reader.read();
            if (done) {
                break;
            }
            if (value == undefined) {
                console.error("reader value was unexpectedly undefined");
                break;
            }
            chunks.push(value);
            this.downloadProgress[0] += value.length;
            this.render();
        }
        let blob = new Blob(chunks);
        let buffer = await blob.arrayBuffer();
        const t1 = performance.now();
        console.log(`It took ${t1 - t0} ms to download WASM, now initializing it`);

        // TODO: Prefer streaming instantiation where available (not safari)? Seems like it'd be faster.
        // const { instance } = await WebAssembly.instantiateStreaming(response, imports);
        
        //let imports = {};
        //let instance = await WebAssembly.instantiate(bytes, imports);
        
        await this.app.init(buffer);
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

    isWebGL1Supported(): boolean {
        try {
            var canvas = document.createElement('canvas');
            return !!canvas.getContext('webgl');
        } catch(e) {
            return false;
        }
    }

    isWebGL2Supported(): boolean {
        try {
            var canvas = document.createElement('canvas');
            return !!canvas.getContext('webgl2');
        } catch(e) {
            return false;
        }
    }

    updateState(newValue: LoadState) {
        console.debug(`state change: ${LoadState[this.state]} -> ${LoadState[newValue]}`);
        this.state = newValue;
        this.render();
    }

    reportErrorState(errorMessage: string) {
        this.errorMessage = errorMessage;
        this.updateState(LoadState.error)
    }

    // UI
    
    render() {
        this.el.style["background-color"] = "black";

        switch (this.state) {
            case LoadState.loading: {
                if (this.loadingEl == undefined) {
                    this.loadingEl = buildLoadingEl();
                    // insert after rendering initial progress to avoid jitter.
                    this.el.append(this.loadingEl);
                }

                if (this.downloadProgress != undefined) {
                    let received = this.downloadProgress[0];
                    let total = this.downloadProgress[1];
                    let progressText = `${prettyPrintBytes(received)} / ${prettyPrintBytes(total)}`;
                    let percentText = `${100.0 * received / total}%`;
                    this.loadingEl.querySelector<HTMLElement>(".progress-text")!.innerText = progressText;
                    this.loadingEl.querySelector<HTMLElement>(".progress-bar")!.style.width = percentText;
                } 

                break;
            }
            case LoadState.error: {
                if (this.loadingEl != undefined) {
                    this.loadingEl.remove();
                    this.loadingEl = undefined;
                }

                if (this.unsupportedEl == undefined && !this.isWebGL1Supported() && !this.isWebGL2Supported()) {
                    console.error("neither WebGL nor WebGL2 is supported")
                    let el = buildUnsupportedEl();
                    this.unsupportedEl = el;
                    this.el.append(el);
                }

                this.el.append(this.errorMessage);
                break;
            }
        }
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

function buildLoadingEl(): HTMLElement {
    let loadingEl = document.createElement('div');
    loadingEl.innerHTML = `
        <p><strong>Loading...</strong></p>
        <div style="width: 100%; background-color: black; border: 1px solid white; border-radius: 4px;">
            <div style="width: 1%; background-color: white; height: 12px;" class="progress-bar"></div>
        </div>
        <div style="margin-bottom: 16px" class="progress-text">0 / 0</div>
        <p>If you think something has broken, check your browser's developer console (Ctrl+Shift+I or similar)</p>
        <p>(Your browser must support WebGL and WebAssembly)</p>
    `;
 
    loadingEl.id = "loading";
    loadingEl.style.padding = "16px";

    return loadingEl;
}

function buildUnsupportedEl(): HTMLElement {
    let el = document.createElement('p');
    el.innerHTML = `
      😭 Looks like your browser doesn't support WebGL.
    `;
    el.style["textAlign"] = "center";
    el.style["padding"] = "16px";
    return el;
}

function prettyPrintBytes(bytes: number): string {
    if (bytes < 1024 ** 2) {
        return Math.round(bytes / 1024) + " KB";
    }
    return Math.round(bytes / 1024 ** 2) + " MB";
}

