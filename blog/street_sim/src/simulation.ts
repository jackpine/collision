import { default as init } from './boot.js'

export class SimulationConfig {
   wasmURL: URL;

   public constructor() {
        this.wasmURL = new URL('http://abstreet.s3-website.us-east-2.amazonaws.com/dev/game/game_bg.wasm');
   } 

   public wasmURLString() {
       return this.wasmURL.toString()
   }
}

export enum SimulationLoadState {
    unloaded, loading, loaded, error
}

export class Simulation {
    el: HTMLElement;
    config: SimulationConfig;
    state: SimulationLoadState = SimulationLoadState.unloaded;

    public constructor(el: HTMLElement) {
        this.el = el;
        this.config = new SimulationConfig();
        this.render();

        console.log("sim constructor", this);
    }

    public async loadAndStart() {
        try {
            await this.load();
            await this.start();
        } catch (e) {
            console.error("error loading: " + e);
            this.updateState(SimulationLoadState.error);
            alert(e);
        }
    }

    updateState(newValue: SimulationLoadState) {
        console.debug(`state change: ${SimulationLoadState[this.state]} -> ${SimulationLoadState[newValue]}`);
        this.state = newValue;
        this.render();
    }

    async load() {
        console.assert(this.state == SimulationLoadState.unloaded, "already loaded");
        // TODO: copy incremental loading logic from ABStreet for progress indication
        let response: Response = await fetch(this.config.wasmURLString());
        this.updateState(SimulationLoadState.loading);

        // TODO: Prefer streaming instantiation where available (not safari)? Seems like it'd be faster.
        // const { instance } = await WebAssembly.instantiateStreaming(response, imports);
        
        let blob: Blob = await response.blob();
        let bytes: ArrayBuffer = await blob.arrayBuffer();
        //let imports = {};
        //let instance = await WebAssembly.instantiate(bytes, imports);
        console.log("footch2");
        await init(bytes);

        this.updateState(SimulationLoadState.loaded);
    }

    async start() {
        console.assert(this.state == SimulationLoadState.loaded, "not yet loaded");
        // TODO - actually do something
        console.log("sim starting");
    }

    public render() {
        this.el.style["border-style"] = "solid";
        this.el.style["border-thickness"] = "4px";
        this.el.style["border-color"] = ((): string => {
            switch (this.state) {
                case SimulationLoadState.unloaded: return "yellow";
                case SimulationLoadState.loading: return "green";
                case SimulationLoadState.loaded: return "white";
                case SimulationLoadState.error: return "red";
            }
        })();
    }
}

