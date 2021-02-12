var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { default as init } from './boot.js';
var SimulationConfig = /** @class */ (function () {
    function SimulationConfig() {
        this.wasmURL = new URL('http://abstreet.s3-website.us-east-2.amazonaws.com/dev/game/game_bg.wasm');
    }
    SimulationConfig.prototype.wasmURLString = function () {
        return this.wasmURL.toString();
    };
    return SimulationConfig;
}());
export { SimulationConfig };
export var SimulationLoadState;
(function (SimulationLoadState) {
    SimulationLoadState[SimulationLoadState["unloaded"] = 0] = "unloaded";
    SimulationLoadState[SimulationLoadState["loading"] = 1] = "loading";
    SimulationLoadState[SimulationLoadState["loaded"] = 2] = "loaded";
    SimulationLoadState[SimulationLoadState["error"] = 3] = "error";
})(SimulationLoadState || (SimulationLoadState = {}));
var Simulation = /** @class */ (function () {
    function Simulation(el) {
        this.state = SimulationLoadState.unloaded;
        this.el = el;
        this.config = new SimulationConfig();
        this.render();
        console.log("sim constructor", this);
    }
    Simulation.prototype.loadAndStart = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.load()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.start()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        console.error("error loading: " + e_1);
                        this.updateState(SimulationLoadState.error);
                        alert(e_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Simulation.prototype.updateState = function (newValue) {
        console.debug("state change: " + SimulationLoadState[this.state] + " -> " + SimulationLoadState[newValue]);
        this.state = newValue;
        this.render();
    };
    Simulation.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, blob, bytes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.assert(this.state == SimulationLoadState.unloaded, "already loaded");
                        return [4 /*yield*/, fetch(this.config.wasmURLString())];
                    case 1:
                        response = _a.sent();
                        this.updateState(SimulationLoadState.loading);
                        return [4 /*yield*/, response.blob()];
                    case 2:
                        blob = _a.sent();
                        return [4 /*yield*/, blob.arrayBuffer()];
                    case 3:
                        bytes = _a.sent();
                        //let imports = {};
                        //let instance = await WebAssembly.instantiate(bytes, imports);
                        console.log("footch2");
                        return [4 /*yield*/, init(bytes)];
                    case 4:
                        _a.sent();
                        this.updateState(SimulationLoadState.loaded);
                        return [2 /*return*/];
                }
            });
        });
    };
    Simulation.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.assert(this.state == SimulationLoadState.loaded, "not yet loaded");
                // TODO - actually do something
                console.log("sim starting");
                return [2 /*return*/];
            });
        });
    };
    Simulation.prototype.render = function () {
        var _this = this;
        this.el.style["border-style"] = "solid";
        this.el.style["border-thickness"] = "4px";
        this.el.style["border-color"] = (function () {
            switch (_this.state) {
                case SimulationLoadState.unloaded: return "yellow";
                case SimulationLoadState.loading: return "green";
                case SimulationLoadState.loaded: return "white";
                case SimulationLoadState.error: return "red";
            }
        })();
    };
    return Simulation;
}());
export { Simulation };
//# sourceMappingURL=simulation.js.map