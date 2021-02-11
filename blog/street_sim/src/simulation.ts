class SimulationConfig {
   wasmURL: URL 

   public constructor() {
        this.wasmURL = new URL("http://abstreet.s3-website.us-east-2.amazonaws.com/dev/game/game_bg.wasm");
   } 

   public wasmURLString() {
       return this.wasmURL.toString()
   }
}

enum SimulationLoadState {
    unloaded, loaded, error
}

class Simulation {
    el: HTMLElement;
    config: SimulationConfig;
    state: SimulationLoadState = SimulationLoadState.unloaded;

    public constructor(html_id: string) {
        let el: HTMLElement = document.getElementById(html_id);
        this.el = el;
        this.config = new SimulationConfig();

        this.render();

        console.log("sim constructor", self);
    }

    public async load() {
        console.assert(this.state == SimulationLoadState.unloaded, "already loaded");
        console.debug("starting loading", self);
        try {
            await fetch(this.config.wasmURLString());
        } catch (e) {
            console.error("error loading: " + e);
            this.state = SimulationLoadState.error;
            return;
        }
        this.state = SimulationLoadState.loaded;
        this.render();
        console.debug("finished loading", self);
    }

    public async start() {
        console.assert(this.state == SimulationLoadState.loaded, "not yet loaded");
        // TODO
        this.render();
        console.log("sim starting");
    }

    public render() {
        this.el.style["border-style"] = "solid";
        this.el.style["border-thickness"] = "4px";
        this.el.style["border-color"] = ((): string => {
            switch (this.state) {
                case SimulationLoadState.unloaded: return "yellow";
                case SimulationLoadState.loaded: return "green";
                case SimulationLoadState.error: return "red";
            }
        })();
    }
}

