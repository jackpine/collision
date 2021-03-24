
let wasm;

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    if (typeof(heap_next) !== 'number') throw new Error('corrupt heap');

    heap[idx] = obj;
    return idx;
}

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function _assertBoolean(n) {
    if (typeof(n) !== 'boolean') {
        throw new Error('expected a boolean argument');
    }
}

let WASM_VECTOR_LEN = 0;

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (typeof(arg) !== 'string') throw new Error('expected a string argument');

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);
        if (ret.read !== arg.length) throw new Error('failed to pass whole string');
        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function _assertNum(n) {
    if (typeof(n) !== 'number') throw new Error('expected a number argument');
}

let cachegetFloat64Memory0 = null;
function getFloat64Memory0() {
    if (cachegetFloat64Memory0 === null || cachegetFloat64Memory0.buffer !== wasm.memory.buffer) {
        cachegetFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachegetFloat64Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}

function logError(f) {
    return function () {
        try {
            return f.apply(this, arguments);

        } catch (e) {
            let error = (function () {
                try {
                    return e instanceof Error ? `${e.message}\n\nStack:\n${e.stack}` : e.toString();
                } catch(_) {
                    return "<failed to stringify thrown value>";
                }
            }());
            console.error("wasm-bindgen: imported JS function that was not marked as `catch` threw an error:", error);
            throw e;
        }
    };
}
function __wbg_adapter_30(arg0, arg1, arg2) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hb2d76f2614ba9f2f(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_33(arg0, arg1, arg2) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h1c43c52f14ee3260(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_36(arg0, arg1, arg2) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h06d1b3f3eacc3969(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_39(arg0, arg1, arg2) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h8f83f13d808d8fbb(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_42(arg0, arg1, arg2) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hef6b181d373e5679(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_45(arg0, arg1, arg2) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hf6410bfb5abc2878(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_48(arg0, arg1, arg2) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hb5bbd5895450997a(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_51(arg0, arg1, arg2) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hfa7893c2ae58db0c(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_54(arg0, arg1, arg2) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__he565f2a6932bd146(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_57(arg0, arg1) {
    _assertNum(arg0);
    _assertNum(arg1);
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__he09385d290470974(arg0, arg1);
}

/**
*/
export function run() {
    wasm.run();
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

function handleError(f) {
    return function () {
        try {
            return f.apply(this, arguments);

        } catch (e) {
            wasm.__wbindgen_exn_store(addHeapObject(e));
        }
    };
}

let cachegetFloat32Memory0 = null;
function getFloat32Memory0() {
    if (cachegetFloat32Memory0 === null || cachegetFloat32Memory0.buffer !== wasm.memory.buffer) {
        cachegetFloat32Memory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachegetFloat32Memory0;
}

function getArrayF32FromWasm0(ptr, len) {
    return getFloat32Memory0().subarray(ptr / 4, ptr / 4 + len);
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {

        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = import.meta.url.replace(/\.js$/, '_bg.wasm');
    }
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        var ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        var ret = false;
        _assertBoolean(ret);
        return ret;
    };
    imports.wbg.__wbindgen_json_serialize = function(arg0, arg1) {
        const obj = getObject(arg1);
        var ret = JSON.stringify(obj === undefined ? null : obj);
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        var ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_fetch_d790d4bcf68e8a52 = logError(function(arg0) {
        var ret = fetch(getObject(arg0));
        return addHeapObject(ret);
    });
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        var ret = getObject(arg0) === undefined;
        _assertBoolean(ret);
        return ret;
    };
    imports.wbg.__wbg_instanceof_WebGl2RenderingContext_f259b779e8a37d5d = logError(function(arg0) {
        var ret = getObject(arg0) instanceof WebGL2RenderingContext;
        _assertBoolean(ret);
        return ret;
    });
    imports.wbg.__wbg_bindVertexArray_1c571a32554cb96d = logError(function(arg0, arg1) {
        getObject(arg0).bindVertexArray(getObject(arg1));
    });
    imports.wbg.__wbg_bufferData_813f25df0c990663 = logError(function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
    });
    imports.wbg.__wbg_createVertexArray_51acb43e08d168a2 = logError(function(arg0) {
        var ret = getObject(arg0).createVertexArray();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_deleteVertexArray_97d2121cc69fc033 = logError(function(arg0, arg1) {
        getObject(arg0).deleteVertexArray(getObject(arg1));
    });
    imports.wbg.__wbg_readPixels_38a00ce9bc7e504a = handleError(function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
        getObject(arg0).readPixels(arg1, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, arg7 === 0 ? undefined : getArrayU8FromWasm0(arg7, arg8));
    });
    imports.wbg.__wbg_texImage3D_ec6a0a22840f139d = handleError(function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
        getObject(arg0).texImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8 >>> 0, arg9 >>> 0, getObject(arg10));
    });
    imports.wbg.__wbg_texStorage3D_20f71e56ae4e67c5 = logError(function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).texStorage3D(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5, arg6);
    });
    imports.wbg.__wbg_uniform3fv_a1cdcd7207306065 = logError(function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform3fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
    });
    imports.wbg.__wbg_attachShader_435c833d3ca8f564 = logError(function(arg0, arg1, arg2) {
        getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
    });
    imports.wbg.__wbg_bindBuffer_b45faf4508424c2a = logError(function(arg0, arg1, arg2) {
        getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
    });
    imports.wbg.__wbg_bindTexture_13c5db7bd22b86cd = logError(function(arg0, arg1, arg2) {
        getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
    });
    imports.wbg.__wbg_blendFuncSeparate_0cede3ddb2462689 = logError(function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).blendFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    });
    imports.wbg.__wbg_clear_e3b5c108ec1393b3 = logError(function(arg0, arg1) {
        getObject(arg0).clear(arg1 >>> 0);
    });
    imports.wbg.__wbg_clearColor_816770046d61cafd = logError(function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).clearColor(arg1, arg2, arg3, arg4);
    });
    imports.wbg.__wbg_clearDepth_ac9c51b8e25bb907 = logError(function(arg0, arg1) {
        getObject(arg0).clearDepth(arg1);
    });
    imports.wbg.__wbg_compileShader_d9cf97450ba46b86 = logError(function(arg0, arg1) {
        getObject(arg0).compileShader(getObject(arg1));
    });
    imports.wbg.__wbg_createBuffer_34aca55d34936cb7 = logError(function(arg0) {
        var ret = getObject(arg0).createBuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_createProgram_7f512be46ef2090e = logError(function(arg0) {
        var ret = getObject(arg0).createProgram();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_createShader_c08686de7661eff0 = logError(function(arg0, arg1) {
        var ret = getObject(arg0).createShader(arg1 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_createTexture_2e23958a641af64b = logError(function(arg0) {
        var ret = getObject(arg0).createTexture();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_deleteBuffer_f10f1dd760bb72fb = logError(function(arg0, arg1) {
        getObject(arg0).deleteBuffer(getObject(arg1));
    });
    imports.wbg.__wbg_deleteShader_9cba962f67fc9740 = logError(function(arg0, arg1) {
        getObject(arg0).deleteShader(getObject(arg1));
    });
    imports.wbg.__wbg_depthFunc_1a3340a964da766f = logError(function(arg0, arg1) {
        getObject(arg0).depthFunc(arg1 >>> 0);
    });
    imports.wbg.__wbg_detachShader_2f64caf6e33f8a82 = logError(function(arg0, arg1, arg2) {
        getObject(arg0).detachShader(getObject(arg1), getObject(arg2));
    });
    imports.wbg.__wbg_drawElements_c9d953f7687b4f81 = logError(function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).drawElements(arg1 >>> 0, arg2, arg3 >>> 0, arg4);
    });
    imports.wbg.__wbg_enable_93767887882fa986 = logError(function(arg0, arg1) {
        getObject(arg0).enable(arg1 >>> 0);
    });
    imports.wbg.__wbg_enableVertexAttribArray_bb2bba2941e17b92 = logError(function(arg0, arg1) {
        getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
    });
    imports.wbg.__wbg_generateMipmap_1bfea84cda0b5c28 = logError(function(arg0, arg1) {
        getObject(arg0).generateMipmap(arg1 >>> 0);
    });
    imports.wbg.__wbg_getExtension_460d214c3edfce63 = handleError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).getExtension(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_getProgramInfoLog_41d3ebfde4246fd9 = logError(function(arg0, arg1, arg2) {
        var ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    });
    imports.wbg.__wbg_getProgramParameter_4e13e6daab89623e = logError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_getShaderInfoLog_c9bbabb140e03d0f = logError(function(arg0, arg1, arg2) {
        var ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    });
    imports.wbg.__wbg_getShaderParameter_05fa9af4df7ed8dd = logError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_getUniformLocation_39124d965f679564 = logError(function(arg0, arg1, arg2, arg3) {
        var ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_linkProgram_8bc3021aa40f0948 = logError(function(arg0, arg1) {
        getObject(arg0).linkProgram(getObject(arg1));
    });
    imports.wbg.__wbg_pixelStorei_2f4fcd552ae27dd2 = logError(function(arg0, arg1, arg2) {
        getObject(arg0).pixelStorei(arg1 >>> 0, arg2);
    });
    imports.wbg.__wbg_scissor_19ca00c5404b43a5 = logError(function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).scissor(arg1, arg2, arg3, arg4);
    });
    imports.wbg.__wbg_shaderSource_2dcc20f3552ae568 = logError(function(arg0, arg1, arg2, arg3) {
        getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
    });
    imports.wbg.__wbg_useProgram_e1334a2752ff3d80 = logError(function(arg0, arg1) {
        getObject(arg0).useProgram(getObject(arg1));
    });
    imports.wbg.__wbg_vertexAttribPointer_8781b6e5c846817e = logError(function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
    });
    imports.wbg.__wbg_viewport_7e9633b09867dbf5 = logError(function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).viewport(arg1, arg2, arg3, arg4);
    });
    imports.wbg.__wbg_instanceof_Window_fbe0320f34c4cd31 = logError(function(arg0) {
        var ret = getObject(arg0) instanceof Window;
        _assertBoolean(ret);
        return ret;
    });
    imports.wbg.__wbg_document_2b44f2a86e03665a = logError(function(arg0) {
        var ret = getObject(arg0).document;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_location_df2a42f020b6b0fe = logError(function(arg0) {
        var ret = getObject(arg0).location;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_innerWidth_c4fa0fec0fd477b8 = handleError(function(arg0) {
        var ret = getObject(arg0).innerWidth;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_innerHeight_6344b1c89c013158 = handleError(function(arg0) {
        var ret = getObject(arg0).innerHeight;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_devicePixelRatio_36c226e2b5d4b9c7 = logError(function(arg0) {
        var ret = getObject(arg0).devicePixelRatio;
        return ret;
    });
    imports.wbg.__wbg_localStorage_bab0c25407317e26 = handleError(function(arg0) {
        var ret = getObject(arg0).localStorage;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_cancelAnimationFrame_594443705ec1f21d = handleError(function(arg0, arg1) {
        getObject(arg0).cancelAnimationFrame(arg1);
    });
    imports.wbg.__wbg_matchMedia_033fe3caf7d12eb5 = handleError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).matchMedia(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_open_60b689228619d8e2 = handleError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).open(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_requestAnimationFrame_65ebf8f2415064e2 = handleError(function(arg0, arg1) {
        var ret = getObject(arg0).requestAnimationFrame(getObject(arg1));
        _assertNum(ret);
        return ret;
    });
    imports.wbg.__wbg_get_8d1433ebd6a5186d = logError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0)[getStringFromWasm0(arg1, arg2)];
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_clearTimeout_691ea78b4285bbea = logError(function(arg0, arg1) {
        getObject(arg0).clearTimeout(arg1);
    });
    imports.wbg.__wbg_fetch_99437343e599cf5a = logError(function(arg0, arg1) {
        var ret = getObject(arg0).fetch(getObject(arg1));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_setTimeout_62ddbd1dbc58b759 = handleError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
        _assertNum(ret);
        return ret;
    });
    imports.wbg.__wbg_matches_b0b5c3f4db00c9b8 = logError(function(arg0) {
        var ret = getObject(arg0).matches;
        _assertBoolean(ret);
        return ret;
    });
    imports.wbg.__wbg_pointerId_3d3249dda347fa45 = logError(function(arg0) {
        var ret = getObject(arg0).pointerId;
        _assertNum(ret);
        return ret;
    });
    imports.wbg.__wbg_now_5ae3d18d57dd226f = logError(function(arg0) {
        var ret = getObject(arg0).now();
        return ret;
    });
    imports.wbg.__wbg_newwithstrandinit_ddb9c1fa02972c36 = handleError(function(arg0, arg1, arg2) {
        var ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_charCode_c6dcb643d56248cd = logError(function(arg0) {
        var ret = getObject(arg0).charCode;
        _assertNum(ret);
        return ret;
    });
    imports.wbg.__wbg_keyCode_9de4c14bf3d88f3c = logError(function(arg0) {
        var ret = getObject(arg0).keyCode;
        _assertNum(ret);
        return ret;
    });
    imports.wbg.__wbg_altKey_9a5448cda4b8c161 = logError(function(arg0) {
        var ret = getObject(arg0).altKey;
        _assertBoolean(ret);
        return ret;
    });
    imports.wbg.__wbg_ctrlKey_3b651d58cff29579 = logError(function(arg0) {
        var ret = getObject(arg0).ctrlKey;
        _assertBoolean(ret);
        return ret;
    });
    imports.wbg.__wbg_shiftKey_64fbb7a0afa8c5fa = logError(function(arg0) {
        var ret = getObject(arg0).shiftKey;
        _assertBoolean(ret);
        return ret;
    });
    imports.wbg.__wbg_metaKey_4a44b03d9be0f1aa = logError(function(arg0) {
        var ret = getObject(arg0).metaKey;
        _assertBoolean(ret);
        return ret;
    });
    imports.wbg.__wbg_key_3cc6551a67a37a79 = logError(function(arg0, arg1) {
        var ret = getObject(arg1).key;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    });
    imports.wbg.__wbg_code_5f0608a8d1b7d1db = logError(function(arg0, arg1) {
        var ret = getObject(arg1).code;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    });
    imports.wbg.__wbg_getModifierState_1eeb36fe47208eb3 = logError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).getModifierState(getStringFromWasm0(arg1, arg2));
        _assertBoolean(ret);
        return ret;
    });
    imports.wbg.__wbg_addEventListener_63378230aa6735d7 = handleError(function(arg0, arg1, arg2, arg3) {
        getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
    });
    imports.wbg.__wbg_addEventListener_e8fdfac380f9ea25 = handleError(function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3), getObject(arg4));
    });
    imports.wbg.__wbg_removeEventListener_19da1e4551104118 = handleError(function(arg0, arg1, arg2, arg3) {
        getObject(arg0).removeEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
    });
    imports.wbg.__wbg_width_8225e9e48185d280 = logError(function(arg0) {
        var ret = getObject(arg0).width;
        _assertNum(ret);
        return ret;
    });
    imports.wbg.__wbg_setwidth_80b60efe20240a3e = logError(function(arg0, arg1) {
        getObject(arg0).width = arg1 >>> 0;
    });
    imports.wbg.__wbg_height_c55678b905b560e1 = logError(function(arg0) {
        var ret = getObject(arg0).height;
        _assertNum(ret);
        return ret;
    });
    imports.wbg.__wbg_setheight_5c308278bb4139ed = logError(function(arg0, arg1) {
        getObject(arg0).height = arg1 >>> 0;
    });
    imports.wbg.__wbg_getContext_7f0328be9fe8c1ec = handleError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_target_62e7aaed452a6541 = logError(function(arg0) {
        var ret = getObject(arg0).target;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_cancelBubble_a4349da6fa1d1e4f = logError(function(arg0) {
        var ret = getObject(arg0).cancelBubble;
        _assertBoolean(ret);
        return ret;
    });
    imports.wbg.__wbg_preventDefault_4eb36ec8e5563ad6 = logError(function(arg0) {
        getObject(arg0).preventDefault();
    });
    imports.wbg.__wbg_stopPropagation_a8397a950849e3f6 = logError(function(arg0) {
        getObject(arg0).stopPropagation();
    });
    imports.wbg.__wbg_matches_cfe9c516ae19f39b = logError(function(arg0) {
        var ret = getObject(arg0).matches;
        _assertBoolean(ret);
        return ret;
    });
    imports.wbg.__wbg_addListener_4dbcd9f3252931c8 = handleError(function(arg0, arg1) {
        getObject(arg0).addListener(getObject(arg1));
    });
    imports.wbg.__wbg_removeListener_8e03ee7295ded298 = handleError(function(arg0, arg1) {
        getObject(arg0).removeListener(getObject(arg1));
    });
    imports.wbg.__wbg_appendChild_98dedaeac24501f2 = handleError(function(arg0, arg1) {
        var ret = getObject(arg0).appendChild(getObject(arg1));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_body_08ba7a3043ff8e77 = logError(function(arg0) {
        var ret = getObject(arg0).body;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_fullscreenElement_c5e89c878e199ef8 = logError(function(arg0) {
        var ret = getObject(arg0).fullscreenElement;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_createElement_7cbe07ad3289abea = handleError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_getElementById_5bd6efc3d82494aa = logError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).getElementById(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_getBoundingClientRect_813f74e2f4f344e2 = logError(function(arg0) {
        var ret = getObject(arg0).getBoundingClientRect();
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_requestFullscreen_3908b12ff707a58a = handleError(function(arg0) {
        getObject(arg0).requestFullscreen();
    });
    imports.wbg.__wbg_setAttribute_b638fce95071fff6 = handleError(function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    });
    imports.wbg.__wbg_setPointerCapture_32e6c85c6de6003f = handleError(function(arg0, arg1) {
        getObject(arg0).setPointerCapture(arg1);
    });
    imports.wbg.__wbg_remove_c97dfca8d3d760c4 = logError(function(arg0) {
        getObject(arg0).remove();
    });
    imports.wbg.__wbg_instanceof_WebGlRenderingContext_5f4db52925ef5603 = logError(function(arg0) {
        var ret = getObject(arg0) instanceof WebGLRenderingContext;
        _assertBoolean(ret);
        return ret;
    });
    imports.wbg.__wbg_bufferData_283c9170f3c599d2 = logError(function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
    });
    imports.wbg.__wbg_readPixels_ca4d92d668303946 = handleError(function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
        getObject(arg0).readPixels(arg1, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, arg7 === 0 ? undefined : getArrayU8FromWasm0(arg7, arg8));
    });
    imports.wbg.__wbg_uniform3fv_55648569ea84161e = logError(function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform3fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
    });
    imports.wbg.__wbg_attachShader_b10f3a6e94e2e190 = logError(function(arg0, arg1, arg2) {
        getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
    });
    imports.wbg.__wbg_bindBuffer_cdca8a246dc033e5 = logError(function(arg0, arg1, arg2) {
        getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
    });
    imports.wbg.__wbg_bindTexture_36a5955154ca7269 = logError(function(arg0, arg1, arg2) {
        getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
    });
    imports.wbg.__wbg_blendFuncSeparate_4932bb360c8a2d96 = logError(function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).blendFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    });
    imports.wbg.__wbg_clear_c7bb0cc46853ad89 = logError(function(arg0, arg1) {
        getObject(arg0).clear(arg1 >>> 0);
    });
    imports.wbg.__wbg_clearColor_8b13b519ef2dd2d7 = logError(function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).clearColor(arg1, arg2, arg3, arg4);
    });
    imports.wbg.__wbg_clearDepth_de3cfee3848f5b55 = logError(function(arg0, arg1) {
        getObject(arg0).clearDepth(arg1);
    });
    imports.wbg.__wbg_compileShader_406e03b35834cb67 = logError(function(arg0, arg1) {
        getObject(arg0).compileShader(getObject(arg1));
    });
    imports.wbg.__wbg_createBuffer_bad9101b9d0e33e7 = logError(function(arg0) {
        var ret = getObject(arg0).createBuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_createProgram_19eb97f37bc7d978 = logError(function(arg0) {
        var ret = getObject(arg0).createProgram();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_createShader_16e76257819c682b = logError(function(arg0, arg1) {
        var ret = getObject(arg0).createShader(arg1 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_createTexture_3008adb3eb4b8e63 = logError(function(arg0) {
        var ret = getObject(arg0).createTexture();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_deleteBuffer_36be51077cf3e581 = logError(function(arg0, arg1) {
        getObject(arg0).deleteBuffer(getObject(arg1));
    });
    imports.wbg.__wbg_deleteShader_913f6c4e5843248d = logError(function(arg0, arg1) {
        getObject(arg0).deleteShader(getObject(arg1));
    });
    imports.wbg.__wbg_depthFunc_6382ec1f95ff9893 = logError(function(arg0, arg1) {
        getObject(arg0).depthFunc(arg1 >>> 0);
    });
    imports.wbg.__wbg_detachShader_6a0744139188a37c = logError(function(arg0, arg1, arg2) {
        getObject(arg0).detachShader(getObject(arg1), getObject(arg2));
    });
    imports.wbg.__wbg_drawElements_c16ecda7ff210a65 = logError(function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).drawElements(arg1 >>> 0, arg2, arg3 >>> 0, arg4);
    });
    imports.wbg.__wbg_enable_98a346f4f5f740b7 = logError(function(arg0, arg1) {
        getObject(arg0).enable(arg1 >>> 0);
    });
    imports.wbg.__wbg_enableVertexAttribArray_c7db971134fe1d3c = logError(function(arg0, arg1) {
        getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
    });
    imports.wbg.__wbg_generateMipmap_ff0cba00f6b3d1fa = logError(function(arg0, arg1) {
        getObject(arg0).generateMipmap(arg1 >>> 0);
    });
    imports.wbg.__wbg_getExtension_3ce292edc1f35484 = handleError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).getExtension(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_getProgramInfoLog_efa3ee9c01a6c5d6 = logError(function(arg0, arg1, arg2) {
        var ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    });
    imports.wbg.__wbg_getProgramParameter_f1068d691eca8e1f = logError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_getShaderInfoLog_c942a4f3fa1537cf = logError(function(arg0, arg1, arg2) {
        var ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    });
    imports.wbg.__wbg_getShaderParameter_f330a1f677514bd0 = logError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_getUniformLocation_e97e7d6bc3036b6d = logError(function(arg0, arg1, arg2, arg3) {
        var ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_linkProgram_dc8c83ec66322d5e = logError(function(arg0, arg1) {
        getObject(arg0).linkProgram(getObject(arg1));
    });
    imports.wbg.__wbg_pixelStorei_fca9dd56da4e09ed = logError(function(arg0, arg1, arg2) {
        getObject(arg0).pixelStorei(arg1 >>> 0, arg2);
    });
    imports.wbg.__wbg_scissor_2cbe53f411318ac2 = logError(function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).scissor(arg1, arg2, arg3, arg4);
    });
    imports.wbg.__wbg_shaderSource_d8cce8917aa7df4a = logError(function(arg0, arg1, arg2, arg3) {
        getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
    });
    imports.wbg.__wbg_useProgram_5a83ef734fbc034b = logError(function(arg0, arg1) {
        getObject(arg0).useProgram(getObject(arg1));
    });
    imports.wbg.__wbg_vertexAttribPointer_e809b011773856d1 = logError(function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
    });
    imports.wbg.__wbg_viewport_d6e0a7f81b3499c9 = logError(function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).viewport(arg1, arg2, arg3, arg4);
    });
    imports.wbg.__wbg_debug_6caa7e8684a5b22d = logError(function(arg0) {
        console.debug(getObject(arg0));
    });
    imports.wbg.__wbg_error_9783be44659339ea = logError(function(arg0) {
        console.error(getObject(arg0));
    });
    imports.wbg.__wbg_error_b0449737f51f454d = logError(function(arg0, arg1) {
        console.error(getObject(arg0), getObject(arg1));
    });
    imports.wbg.__wbg_info_d458d4c6ed836a93 = logError(function(arg0) {
        console.info(getObject(arg0));
    });
    imports.wbg.__wbg_log_2e875b1d2f6f87ac = logError(function(arg0) {
        console.log(getObject(arg0));
    });
    imports.wbg.__wbg_warn_632e55193637edf0 = logError(function(arg0) {
        console.warn(getObject(arg0));
    });
    imports.wbg.__wbg_style_854f82bcc16efd28 = logError(function(arg0) {
        var ret = getObject(arg0).style;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_fetch_72d8bdd672493862 = logError(function(arg0, arg1) {
        var ret = getObject(arg0).fetch(getObject(arg1));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_x_11fb85648a0b7137 = logError(function(arg0) {
        var ret = getObject(arg0).x;
        return ret;
    });
    imports.wbg.__wbg_y_b7910e55f598e1dc = logError(function(arg0) {
        var ret = getObject(arg0).y;
        return ret;
    });
    imports.wbg.__wbg_href_6a2edee803039e44 = handleError(function(arg0, arg1) {
        var ret = getObject(arg1).href;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    });
    imports.wbg.__wbg_clientX_df24871aabb01061 = logError(function(arg0) {
        var ret = getObject(arg0).clientX;
        _assertNum(ret);
        return ret;
    });
    imports.wbg.__wbg_clientY_b91be9a030c7bd7c = logError(function(arg0) {
        var ret = getObject(arg0).clientY;
        _assertNum(ret);
        return ret;
    });
    imports.wbg.__wbg_offsetX_94c9b1e16e81033a = logError(function(arg0) {
        var ret = getObject(arg0).offsetX;
        _assertNum(ret);
        return ret;
    });
    imports.wbg.__wbg_offsetY_7a5e47fc44c400e9 = logError(function(arg0) {
        var ret = getObject(arg0).offsetY;
        _assertNum(ret);
        return ret;
    });
    imports.wbg.__wbg_ctrlKey_eb7dba635c32dc7f = logError(function(arg0) {
        var ret = getObject(arg0).ctrlKey;
        _assertBoolean(ret);
        return ret;
    });
    imports.wbg.__wbg_shiftKey_31c1bdd985f9be8e = logError(function(arg0) {
        var ret = getObject(arg0).shiftKey;
        _assertBoolean(ret);
        return ret;
    });
    imports.wbg.__wbg_altKey_a40ec4c5074686f1 = logError(function(arg0) {
        var ret = getObject(arg0).altKey;
        _assertBoolean(ret);
        return ret;
    });
    imports.wbg.__wbg_metaKey_d67dff8c6652544a = logError(function(arg0) {
        var ret = getObject(arg0).metaKey;
        _assertBoolean(ret);
        return ret;
    });
    imports.wbg.__wbg_button_d650056716876a47 = logError(function(arg0) {
        var ret = getObject(arg0).button;
        _assertNum(ret);
        return ret;
    });
    imports.wbg.__wbg_buttons_7c50ee2fdde8e486 = logError(function(arg0) {
        var ret = getObject(arg0).buttons;
        _assertNum(ret);
        return ret;
    });
    imports.wbg.__wbg_getItem_3af4bbb09db34f91 = handleError(function(arg0, arg1, arg2, arg3) {
        var ret = getObject(arg1).getItem(getStringFromWasm0(arg2, arg3));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    });
    imports.wbg.__wbg_setItem_9adee84a49a67e70 = handleError(function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setItem(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    });
    imports.wbg.__wbg_setProperty_e3d42ccff5ebac2f = handleError(function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    });
    imports.wbg.__wbg_new_4944b2c17ea129e4 = handleError(function() {
        var ret = new Headers();
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_append_ff8f4bebd972bf3e = handleError(function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    });
    imports.wbg.__wbg_bindVertexArrayOES_b2d1a15566a7fa7e = logError(function(arg0, arg1) {
        getObject(arg0).bindVertexArrayOES(getObject(arg1));
    });
    imports.wbg.__wbg_createVertexArrayOES_8119c8c9653537fa = logError(function(arg0) {
        var ret = getObject(arg0).createVertexArrayOES();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    });
    imports.wbg.__wbg_deleteVertexArrayOES_54ed1e0994b72905 = logError(function(arg0, arg1) {
        getObject(arg0).deleteVertexArrayOES(getObject(arg1));
    });
    imports.wbg.__wbg_instanceof_Response_692fcbbfbfd64a77 = logError(function(arg0) {
        var ret = getObject(arg0) instanceof Response;
        _assertBoolean(ret);
        return ret;
    });
    imports.wbg.__wbg_url_9824072ca68971fa = logError(function(arg0, arg1) {
        var ret = getObject(arg1).url;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    });
    imports.wbg.__wbg_status_10f0636ee9065069 = logError(function(arg0) {
        var ret = getObject(arg0).status;
        _assertNum(ret);
        return ret;
    });
    imports.wbg.__wbg_ok_015f6396ebd3dd20 = logError(function(arg0) {
        var ret = getObject(arg0).ok;
        _assertBoolean(ret);
        return ret;
    });
    imports.wbg.__wbg_statusText_da0c86eaa585c11a = logError(function(arg0, arg1) {
        var ret = getObject(arg1).statusText;
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    });
    imports.wbg.__wbg_headers_35e4eb2d79ac768c = logError(function(arg0) {
        var ret = getObject(arg0).headers;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_arrayBuffer_02aa93c3b506b861 = handleError(function(arg0) {
        var ret = getObject(arg0).arrayBuffer();
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_deltaX_6db9b75fa9a51024 = logError(function(arg0) {
        var ret = getObject(arg0).deltaX;
        return ret;
    });
    imports.wbg.__wbg_deltaY_f2e82bfd030f24e4 = logError(function(arg0) {
        var ret = getObject(arg0).deltaY;
        return ret;
    });
    imports.wbg.__wbg_deltaMode_6e3c8d5ed2afcaf8 = logError(function(arg0) {
        var ret = getObject(arg0).deltaMode;
        _assertNum(ret);
        return ret;
    });
    imports.wbg.__wbindgen_is_function = function(arg0) {
        var ret = typeof(getObject(arg0)) === 'function';
        _assertBoolean(ret);
        return ret;
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        var ret = typeof(val) === 'object' && val !== null;
        _assertBoolean(ret);
        return ret;
    };
    imports.wbg.__wbg_next_2c07be68164d0ad8 = logError(function(arg0) {
        var ret = getObject(arg0).next;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_next_ab04804bd9e39520 = handleError(function(arg0) {
        var ret = getObject(arg0).next();
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_done_790ba9eb974fda34 = logError(function(arg0) {
        var ret = getObject(arg0).done;
        _assertBoolean(ret);
        return ret;
    });
    imports.wbg.__wbg_value_139e9a85487a7b6b = logError(function(arg0) {
        var ret = getObject(arg0).value;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_iterator_dd6f82a781c70b40 = logError(function() {
        var ret = Symbol.iterator;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_get_4bab9404e99a1f85 = handleError(function(arg0, arg1) {
        var ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_call_ab183a630df3a257 = handleError(function(arg0, arg1) {
        var ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_newnoargs_ab5e899738c0eff4 = logError(function(arg0, arg1) {
        var ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_is_e8ad5aa6da4b8c83 = logError(function(arg0, arg1) {
        var ret = Object.is(getObject(arg0), getObject(arg1));
        _assertBoolean(ret);
        return ret;
    });
    imports.wbg.__wbg_new_dc5b27cfd2149b8f = logError(function() {
        var ret = new Object();
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_resolve_9b0f9ddf5f89cb1e = logError(function(arg0) {
        var ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_then_b4358f6ec1ee6657 = logError(function(arg0, arg1) {
        var ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_then_3d9a54b0affdf26d = logError(function(arg0, arg1, arg2) {
        var ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_self_77eca7b42660e1bb = handleError(function() {
        var ret = self.self;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_window_51dac01569f1ba70 = handleError(function() {
        var ret = window.window;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_globalThis_34bac2d08ebb9b58 = handleError(function() {
        var ret = globalThis.globalThis;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_global_1c436164a66c9c22 = handleError(function() {
        var ret = global.global;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_buffer_bc64154385c04ac4 = logError(function(arg0) {
        var ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_newwithbyteoffsetandlength_955ddd0ce3f6f8f7 = logError(function(arg0, arg1, arg2) {
        var ret = new Int8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_newwithbyteoffsetandlength_4ac754dd0e4a9d36 = logError(function(arg0, arg1, arg2) {
        var ret = new Int16Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_newwithbyteoffsetandlength_14c58fd914c5e030 = logError(function(arg0, arg1, arg2) {
        var ret = new Int32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_newwithbyteoffsetandlength_3c8748473807c7cf = logError(function(arg0, arg1, arg2) {
        var ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_new_22a33711cf65b661 = logError(function(arg0) {
        var ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_set_b29de3f25280c6ec = logError(function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    });
    imports.wbg.__wbg_length_e9f6f145de2fede5 = logError(function(arg0) {
        var ret = getObject(arg0).length;
        _assertNum(ret);
        return ret;
    });
    imports.wbg.__wbg_newwithbyteoffsetandlength_00c580aa4e676e36 = logError(function(arg0, arg1, arg2) {
        var ret = new Uint16Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_newwithbyteoffsetandlength_4fec8b44f7ca5e63 = logError(function(arg0, arg1, arg2) {
        var ret = new Uint32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_newwithbyteoffsetandlength_193d0d8755287921 = logError(function(arg0, arg1, arg2) {
        var ret = new Float32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    });
    imports.wbg.__wbg_has_09f0cde2d542e767 = handleError(function(arg0, arg1) {
        var ret = Reflect.has(getObject(arg0), getObject(arg1));
        _assertBoolean(ret);
        return ret;
    });
    imports.wbg.__wbg_set_3afd31f38e771338 = handleError(function(arg0, arg1, arg2) {
        var ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        _assertBoolean(ret);
        return ret;
    });
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        var ret = typeof(obj) === 'number' ? obj : undefined;
        if (!isLikeNone(ret)) {
            _assertNum(ret);
        }
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        var ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        var ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        _assertNum(ret);
        return ret;
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        var ret = debugString(getObject(arg1));
        var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_memory = function() {
        var ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper483 = logError(function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 2520, __wbg_adapter_30);
        return addHeapObject(ret);
    });
    imports.wbg.__wbindgen_closure_wrapper46971 = logError(function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 2977, __wbg_adapter_33);
        return addHeapObject(ret);
    });
    imports.wbg.__wbindgen_closure_wrapper53628 = logError(function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 3304, __wbg_adapter_36);
        return addHeapObject(ret);
    });
    imports.wbg.__wbindgen_closure_wrapper53630 = logError(function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 3300, __wbg_adapter_39);
        return addHeapObject(ret);
    });
    imports.wbg.__wbindgen_closure_wrapper53632 = logError(function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 3310, __wbg_adapter_42);
        return addHeapObject(ret);
    });
    imports.wbg.__wbindgen_closure_wrapper53634 = logError(function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 3308, __wbg_adapter_45);
        return addHeapObject(ret);
    });
    imports.wbg.__wbindgen_closure_wrapper53636 = logError(function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 3298, __wbg_adapter_48);
        return addHeapObject(ret);
    });
    imports.wbg.__wbindgen_closure_wrapper53638 = logError(function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 3306, __wbg_adapter_51);
        return addHeapObject(ret);
    });
    imports.wbg.__wbindgen_closure_wrapper53640 = logError(function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 3302, __wbg_adapter_54);
        return addHeapObject(ret);
    });
    imports.wbg.__wbindgen_closure_wrapper53642 = logError(function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 3296, __wbg_adapter_57);
        return addHeapObject(ret);
    });

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    const { instance, module } = await load(await input, imports);

    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;
    wasm.__wbindgen_start();
    return wasm;
}

export default init;

