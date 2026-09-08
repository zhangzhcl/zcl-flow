"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotifyExecutor = exports.AggregateExecutor = exports.TextProcessExecutor = exports.ClassifyExecutor = exports.JsonExtractExecutor = exports.LoopExecutor = exports.SubflowExecutor = exports.SwitchExecutor = exports.DelayExecutor = exports.VariableExecutor = exports.TemplateExecutor = exports.HttpExecutor = exports.ConditionExecutor = exports.CodeExecutor = exports.LlmExecutor = exports.EndExecutor = exports.StartExecutor = void 0;
var common_1 = require("@nestjs/common");
var vm = require("vm");
var engine_types_1 = require("./engine.types");
var template_util_1 = require("./template.util");
/** Evaluate a boolean expression in a sandboxed vm context. */
function evalBool(expression, ctx) {
    try {
        var sandbox = { input: ctx.input, nodes: ctx.outputs, variables: ctx.variables };
        var context = vm.createContext(sandbox, {
            codeGeneration: { strings: false, wasm: false },
        });
        return Boolean(new vm.Script("(".concat(expression, ")")).runInContext(context, { timeout: 1000 }));
    }
    catch (_a) {
        return false;
    }
}
/** Start node: exposes workflow input as its output. */
var StartExecutor = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var StartExecutor = _classThis = /** @class */ (function () {
        function StartExecutor_1() {
            this.type = 'start';
        }
        StartExecutor_1.prototype.execute = function (_node, ctx) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, { output: __assign({}, ctx.input) }];
                });
            });
        };
        return StartExecutor_1;
    }());
    __setFunctionName(_classThis, "StartExecutor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        StartExecutor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return StartExecutor = _classThis;
}();
exports.StartExecutor = StartExecutor;
/** End node: collects the final workflow output. */
var EndExecutor = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var EndExecutor = _classThis = /** @class */ (function () {
        function EndExecutor_1() {
            this.type = 'end';
        }
        EndExecutor_1.prototype.execute = function (node, ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var template, output;
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    template = (_d = (_b = (_a = node.data) === null || _a === void 0 ? void 0 : _a.outputs) !== null && _b !== void 0 ? _b : (_c = node.data) === null || _c === void 0 ? void 0 : _c.output) !== null && _d !== void 0 ? _d : {};
                    output = (0, template_util_1.interpolateDeep)(template, ctx);
                    return [2 /*return*/, { output: typeof output === 'object' && output !== null ? output : { result: output } }];
                });
            });
        };
        return EndExecutor_1;
    }());
    __setFunctionName(_classThis, "EndExecutor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EndExecutor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EndExecutor = _classThis;
}();
exports.EndExecutor = EndExecutor;
/** LLM node: prompt template -> chat completion with resolved provider config. */
var LlmExecutor = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var LlmExecutor = _classThis = /** @class */ (function () {
        function LlmExecutor_1(llm, models) {
            this.llm = llm;
            this.models = models;
            this.type = 'llm';
        }
        LlmExecutor_1.prototype.execute = function (node, ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var data, prompt, systemPrompt, config, response;
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            data = (_a = node.data) !== null && _a !== void 0 ? _a : {};
                            prompt = String((_c = (0, template_util_1.interpolate)(String((_b = data.prompt) !== null && _b !== void 0 ? _b : ''), ctx)) !== null && _c !== void 0 ? _c : '');
                            systemPrompt = data.systemPrompt
                                ? String((_d = (0, template_util_1.interpolate)(String(data.systemPrompt), ctx)) !== null && _d !== void 0 ? _d : '')
                                : undefined;
                            return [4 /*yield*/, this.models.resolveConfig(data.modelConfigId ? String(data.modelConfigId) : undefined)];
                        case 1:
                            config = _e.sent();
                            return [4 /*yield*/, this.llm.complete({
                                    prompt: prompt,
                                    systemPrompt: systemPrompt,
                                    config: config,
                                    signal: ctx.signal,
                                    model: data.model ? String(data.model) : undefined,
                                    temperature: data.temperature != null && data.temperature !== ''
                                        ? Number(data.temperature)
                                        : undefined,
                                })];
                        case 2:
                            response = _e.sent();
                            return [2 /*return*/, {
                                    output: { text: response.text, model: response.model, mock: response.mock },
                                }];
                    }
                });
            });
        };
        return LlmExecutor_1;
    }());
    __setFunctionName(_classThis, "LlmExecutor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        LlmExecutor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return LlmExecutor = _classThis;
}();
exports.LlmExecutor = LlmExecutor;
/** Code node: runs user JavaScript in a sandboxed vm context. */
var CodeExecutor = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var CodeExecutor = _classThis = /** @class */ (function () {
        function CodeExecutor_1(config) {
            this.config = config;
            this.type = 'code';
        }
        CodeExecutor_1.prototype.execute = function (node, ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var code, timeout, sandbox, context, script, value, output;
                var _a, _b;
                return __generator(this, function (_c) {
                    code = String((_b = (_a = node.data) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : 'return {};');
                    timeout = Number(this.config.get('CODE_NODE_TIMEOUT', 5000));
                    sandbox = {
                        input: ctx.input,
                        nodes: ctx.outputs,
                        variables: ctx.variables,
                        console: { log: function () { return undefined; } },
                        result: undefined,
                    };
                    context = vm.createContext(sandbox, { codeGeneration: { strings: false, wasm: false } });
                    script = new vm.Script("result = (function main(input, nodes, variables) {\n".concat(code, "\n})(input, nodes, variables);"));
                    script.runInContext(context, { timeout: timeout });
                    value = sandbox.result;
                    output = value !== null && typeof value === 'object'
                        ? value
                        : { result: value };
                    return [2 /*return*/, { output: output }];
                });
            });
        };
        return CodeExecutor_1;
    }());
    __setFunctionName(_classThis, "CodeExecutor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CodeExecutor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CodeExecutor = _classThis;
}();
exports.CodeExecutor = CodeExecutor;
/** Condition node: evaluates an expression and selects a branch port. */
var ConditionExecutor = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ConditionExecutor = _classThis = /** @class */ (function () {
        function ConditionExecutor_1() {
            this.type = 'condition';
        }
        ConditionExecutor_1.prototype.execute = function (node, ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var expression, resolved, passed;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    expression = String((_b = (_a = node.data) === null || _a === void 0 ? void 0 : _a.expression) !== null && _b !== void 0 ? _b : 'true');
                    resolved = String((_c = (0, template_util_1.interpolate)(expression, ctx)) !== null && _c !== void 0 ? _c : 'false');
                    passed = evalBool(resolved, ctx);
                    return [2 /*return*/, {
                            output: { passed: passed, expression: resolved },
                            branch: passed ? 'if_true' : 'if_false',
                        }];
                });
            });
        };
        return ConditionExecutor_1;
    }());
    __setFunctionName(_classThis, "ConditionExecutor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ConditionExecutor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ConditionExecutor = _classThis;
}();
exports.ConditionExecutor = ConditionExecutor;
/** HTTP node: performs a request with template-interpolated params. */
var HttpExecutor = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var HttpExecutor = _classThis = /** @class */ (function () {
        function HttpExecutor_1(config) {
            this.config = config;
            this.type = 'http';
        }
        HttpExecutor_1.prototype.execute = function (node, ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var data, url, method, timeout, headers, parsed, body, interpolated, controller, timer, onCancel, response, text, parsed, error_1, detail;
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                return __generator(this, function (_l) {
                    switch (_l.label) {
                        case 0:
                            data = (_a = node.data) !== null && _a !== void 0 ? _a : {};
                            url = String((_c = (0, template_util_1.interpolate)(String((_b = data.url) !== null && _b !== void 0 ? _b : ''), ctx)) !== null && _c !== void 0 ? _c : '');
                            if (!url) {
                                throw new Error('HTTP node: url is required');
                            }
                            method = String((_d = data.method) !== null && _d !== void 0 ? _d : 'GET').toUpperCase();
                            timeout = Number(this.config.get('HTTP_NODE_TIMEOUT', 15000));
                            headers = { 'Content-Type': 'application/json' };
                            if (data.headers) {
                                try {
                                    parsed = typeof data.headers === 'string'
                                        ? JSON.parse(String((0, template_util_1.interpolate)(String(data.headers), ctx)))
                                        : (0, template_util_1.interpolateDeep)(data.headers, ctx);
                                    headers = __assign(__assign({}, headers), parsed);
                                }
                                catch (_m) {
                                    // keep default headers when parsing fails
                                }
                            }
                            if (method !== 'GET' && method !== 'HEAD' && data.body) {
                                interpolated = (0, template_util_1.interpolate)(String(data.body), ctx);
                                body =
                                    typeof interpolated === 'object'
                                        ? JSON.stringify(interpolated)
                                        : String(interpolated !== null && interpolated !== void 0 ? interpolated : '');
                            }
                            controller = new AbortController();
                            timer = setTimeout(function () { return controller.abort(); }, timeout);
                            onCancel = function () { return controller.abort(); };
                            (_e = ctx.signal) === null || _e === void 0 ? void 0 : _e.addEventListener('abort', onCancel, { once: true });
                            _l.label = 1;
                        case 1:
                            _l.trys.push([1, 4, 5, 6]);
                            return [4 /*yield*/, fetch(url, {
                                    method: method,
                                    headers: headers,
                                    body: body,
                                    signal: controller.signal,
                                })];
                        case 2:
                            response = _l.sent();
                            return [4 /*yield*/, response.text()];
                        case 3:
                            text = _l.sent();
                            parsed = text;
                            try {
                                parsed = JSON.parse(text);
                            }
                            catch (_o) {
                                // keep raw text
                            }
                            return [2 /*return*/, {
                                    output: { status: response.status, body: parsed },
                                }];
                        case 4:
                            error_1 = _l.sent();
                            if ((error_1 === null || error_1 === void 0 ? void 0 : error_1.name) === 'AbortError') {
                                if ((_f = ctx.signal) === null || _f === void 0 ? void 0 : _f.aborted)
                                    throw new engine_types_1.ExecutionCancelledError();
                                throw new Error("HTTP node: request timed out after ".concat(timeout, "ms (").concat(url, ")"));
                            }
                            detail = (_j = (_h = (_g = error_1 === null || error_1 === void 0 ? void 0 : error_1.cause) === null || _g === void 0 ? void 0 : _g.message) !== null && _h !== void 0 ? _h : error_1 === null || error_1 === void 0 ? void 0 : error_1.message) !== null && _j !== void 0 ? _j : String(error_1);
                            throw new Error("HTTP node: ".concat(detail, " (").concat(method, " ").concat(url, ")"));
                        case 5:
                            clearTimeout(timer);
                            (_k = ctx.signal) === null || _k === void 0 ? void 0 : _k.removeEventListener('abort', onCancel);
                            return [7 /*endfinally*/];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        return HttpExecutor_1;
    }());
    __setFunctionName(_classThis, "HttpExecutor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        HttpExecutor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return HttpExecutor = _classThis;
}();
exports.HttpExecutor = HttpExecutor;
/** Template node: renders a text template with variable interpolation. */
var TemplateExecutor = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var TemplateExecutor = _classThis = /** @class */ (function () {
        function TemplateExecutor_1() {
            this.type = 'template';
        }
        TemplateExecutor_1.prototype.execute = function (node, ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var template, text;
                var _a, _b;
                return __generator(this, function (_c) {
                    template = String((_b = (_a = node.data) === null || _a === void 0 ? void 0 : _a.template) !== null && _b !== void 0 ? _b : '');
                    text = (0, template_util_1.interpolate)(template, ctx);
                    return [2 /*return*/, {
                            output: { text: typeof text === 'object' ? JSON.stringify(text) : String(text !== null && text !== void 0 ? text : '') },
                        }];
                });
            });
        };
        return TemplateExecutor_1;
    }());
    __setFunctionName(_classThis, "TemplateExecutor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TemplateExecutor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TemplateExecutor = _classThis;
}();
exports.TemplateExecutor = TemplateExecutor;
/** Variable node: assigns values into the workflow variable pool. */
var VariableExecutor = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var VariableExecutor = _classThis = /** @class */ (function () {
        function VariableExecutor_1() {
            this.type = 'variable';
        }
        VariableExecutor_1.prototype.execute = function (node, ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var raw, assignments, resolved;
                var _a, _b;
                return __generator(this, function (_c) {
                    raw = (_b = (_a = node.data) === null || _a === void 0 ? void 0 : _a.assignments) !== null && _b !== void 0 ? _b : '{}';
                    try {
                        assignments =
                            typeof raw === 'string' ? JSON.parse(raw || '{}') : raw;
                    }
                    catch (_d) {
                        throw new Error('Variable node: assignments must be a valid JSON object');
                    }
                    resolved = (0, template_util_1.interpolateDeep)(assignments, ctx);
                    Object.assign(ctx.variables, resolved);
                    return [2 /*return*/, { output: resolved }];
                });
            });
        };
        return VariableExecutor_1;
    }());
    __setFunctionName(_classThis, "VariableExecutor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        VariableExecutor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return VariableExecutor = _classThis;
}();
exports.VariableExecutor = VariableExecutor;
/** Delay node: pauses the flow for the configured milliseconds (capped). */
var DelayExecutor = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var DelayExecutor = _classThis = /** @class */ (function () {
        function DelayExecutor_1() {
            this.type = 'delay';
        }
        DelayExecutor_1.prototype.execute = function (node, ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var MAX_DELAY, raw, ms;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            MAX_DELAY = 30000;
                            raw = (0, template_util_1.interpolate)(String((_b = (_a = node.data) === null || _a === void 0 ? void 0 : _a.ms) !== null && _b !== void 0 ? _b : '0'), ctx);
                            ms = Math.min(Math.max(Number(raw) || 0, 0), MAX_DELAY);
                            (0, engine_types_1.assertNotCancelled)(ctx);
                            // Resolve early when the run is cancelled instead of holding the wave.
                            return [4 /*yield*/, new Promise(function (resolve, reject) {
                                    var _a;
                                    var timer = setTimeout(function () {
                                        var _a;
                                        (_a = ctx.signal) === null || _a === void 0 ? void 0 : _a.removeEventListener('abort', onCancel);
                                        resolve();
                                    }, ms);
                                    function onCancel() {
                                        clearTimeout(timer);
                                        reject(new engine_types_1.ExecutionCancelledError());
                                    }
                                    (_a = ctx.signal) === null || _a === void 0 ? void 0 : _a.addEventListener('abort', onCancel, { once: true });
                                })];
                        case 1:
                            // Resolve early when the run is cancelled instead of holding the wave.
                            _c.sent();
                            return [2 /*return*/, { output: { waitedMs: ms } }];
                    }
                });
            });
        };
        return DelayExecutor_1;
    }());
    __setFunctionName(_classThis, "DelayExecutor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DelayExecutor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DelayExecutor = _classThis;
}();
exports.DelayExecutor = DelayExecutor;
/** Switch node: multi-way branch (case_1 / case_2 / default). */
var SwitchExecutor = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var SwitchExecutor = _classThis = /** @class */ (function () {
        function SwitchExecutor_1() {
            this.type = 'switch';
        }
        SwitchExecutor_1.prototype.execute = function (node, ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var data, cases, _i, cases_1, item, resolved;
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    data = (_a = node.data) !== null && _a !== void 0 ? _a : {};
                    cases = [
                        { port: 'case_1', expression: String((_b = data.case1) !== null && _b !== void 0 ? _b : '') },
                        { port: 'case_2', expression: String((_c = data.case2) !== null && _c !== void 0 ? _c : '') },
                    ];
                    for (_i = 0, cases_1 = cases; _i < cases_1.length; _i++) {
                        item = cases_1[_i];
                        if (!item.expression.trim())
                            continue;
                        resolved = String((_d = (0, template_util_1.interpolate)(item.expression, ctx)) !== null && _d !== void 0 ? _d : 'false');
                        if (evalBool(resolved, ctx)) {
                            return [2 /*return*/, { output: { matched: item.port, expression: resolved }, branch: item.port }];
                        }
                    }
                    return [2 /*return*/, { output: { matched: 'default' }, branch: 'default' }];
                });
            });
        };
        return SwitchExecutor_1;
    }());
    __setFunctionName(_classThis, "SwitchExecutor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SwitchExecutor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SwitchExecutor = _classThis;
}();
exports.SwitchExecutor = SwitchExecutor;
/**
 * Shared machinery for nodes that run another workflow.
 *
 * Implemented as a plain helper rather than an abstract base class on purpose:
 * a subclass that does not redeclare its constructor emits no
 * `design:paramtypes` metadata, so Nest would instantiate it with no
 * dependencies at all.
 */
var WorkflowInvoker = /** @class */ (function () {
    function WorkflowInvoker(workflows, engine, config) {
        this.workflows = workflows;
        this.engine = engine;
        this.config = config;
    }
    /** Loads the target workflow, enforcing ownership and recursion limits. */
    WorkflowInvoker.prototype.resolveTarget = function (workflowId, ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var maxDepth, target;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!workflowId) {
                            throw new Error('No target workflow selected');
                        }
                        maxDepth = Number(this.config.get('MAX_SUBFLOW_DEPTH', 3));
                        if (ctx.depth >= maxDepth) {
                            throw new Error("Sub-workflow nesting limit reached (MAX_SUBFLOW_DEPTH=".concat(maxDepth, ")"));
                        }
                        if (ctx.callStack.includes(workflowId)) {
                            throw new Error("Recursive sub-workflow call detected: ".concat(__spreadArray(__spreadArray([], ctx.callStack, true), [workflowId], false).join(' -> ')));
                        }
                        return [4 /*yield*/, this.workflows.findOneBy({ id: workflowId })];
                    case 1:
                        target = _a.sent();
                        if (!target) {
                            throw new Error("Target workflow ".concat(workflowId, " not found"));
                        }
                        // A sub-workflow must belong to the same account as the caller.
                        if (target.ownerId !== ctx.ownerId) {
                            throw new common_1.ForbiddenException('You do not have access to the target workflow');
                        }
                        return [2 /*return*/, target];
                }
            });
        });
    };
    /** Runs the target workflow as a child execution of the current run. */
    WorkflowInvoker.prototype.invoke = function (target, input, ctx) {
        return this.engine.run(target, input, {
            signal: ctx.signal,
            parentExecutionId: ctx.executionId,
            depth: ctx.depth + 1,
            callStack: ctx.callStack,
            triggerType: 'manual',
        });
    };
    WorkflowInvoker.prototype.limit = function (key, fallback) {
        return Number(this.config.get(key, fallback));
    };
    return WorkflowInvoker;
}());
/** Parses a JSON-object node field, with template interpolation applied. */
function parseObjectField(raw, ctx, label) {
    if (raw === undefined || raw === null || raw === '')
        return {};
    var parsed;
    try {
        parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    }
    catch (_a) {
        throw new Error("".concat(label, " must be a valid JSON object"));
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error("".concat(label, " must be a valid JSON object"));
    }
    return (0, template_util_1.interpolateDeep)(parsed, ctx);
}
/**
 * Sub-workflow node: runs another workflow and exposes its output.
 * This is the reuse primitive - extract a shared sequence once, call it from
 * many workflows.
 */
var SubflowExecutor = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var SubflowExecutor = _classThis = /** @class */ (function () {
        function SubflowExecutor_1(workflows, engine, config) {
            this.type = 'subflow';
            this.invoker = new WorkflowInvoker(workflows, engine, config);
        }
        SubflowExecutor_1.prototype.execute = function (node, ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var data, target, input, child;
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            (0, engine_types_1.assertNotCancelled)(ctx);
                            data = (_a = node.data) !== null && _a !== void 0 ? _a : {};
                            return [4 /*yield*/, this.invoker.resolveTarget(String((_b = data.workflowId) !== null && _b !== void 0 ? _b : ''), ctx)];
                        case 1:
                            target = _e.sent();
                            input = parseObjectField(data.input, ctx, 'Sub-workflow input');
                            return [4 /*yield*/, this.invoker.invoke(target, input, ctx)];
                        case 2:
                            child = _e.sent();
                            if (child.status === 'cancelled') {
                                throw new engine_types_1.ExecutionCancelledError();
                            }
                            if (child.status !== 'success') {
                                throw new Error("Sub-workflow \"".concat(target.name, "\" failed: ").concat((_c = child.error) !== null && _c !== void 0 ? _c : 'unknown error'));
                            }
                            return [2 /*return*/, {
                                    output: __assign(__assign({}, ((_d = child.output) !== null && _d !== void 0 ? _d : {})), { 
                                        // Kept flat alongside the payload so the UI can drill into the child run.
                                        executionId: child.id, workflowName: target.name }),
                                }];
                    }
                });
            });
        };
        return SubflowExecutor_1;
    }());
    __setFunctionName(_classThis, "SubflowExecutor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SubflowExecutor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SubflowExecutor = _classThis;
}();
exports.SubflowExecutor = SubflowExecutor;
/**
 * Loop node: iterates over an array and runs a sub-workflow per item.
 *
 * Implemented on top of the sub-workflow primitive rather than as a nested
 * canvas: the loop body is a normal, independently testable workflow, and the
 * free-layout editor stays free of nested sub-graphs.
 */
var LoopExecutor = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var LoopExecutor = _classThis = /** @class */ (function () {
        function LoopExecutor_1(workflows, engine, config) {
            this.type = 'loop';
            this.invoker = new WorkflowInvoker(workflows, engine, config);
        }
        LoopExecutor_1.prototype.execute = function (node, ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var data, target, items, maxItems, concurrency, continueOnError, extraInput, results, errors, _loop_1, offset;
                var _this = this;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            (0, engine_types_1.assertNotCancelled)(ctx);
                            data = (_a = node.data) !== null && _a !== void 0 ? _a : {};
                            return [4 /*yield*/, this.invoker.resolveTarget(String((_b = data.workflowId) !== null && _b !== void 0 ? _b : ''), ctx)];
                        case 1:
                            target = _c.sent();
                            items = this.resolveItems(data.items, ctx);
                            maxItems = this.invoker.limit('MAX_LOOP_ITEMS', 50);
                            if (items.length > maxItems) {
                                throw new Error("Loop node: ".concat(items.length, " items exceeds MAX_LOOP_ITEMS (").concat(maxItems, ")"));
                            }
                            concurrency = Math.min(Math.max(Number(data.concurrency) || 1, 1), this.invoker.limit('MAX_LOOP_CONCURRENCY', 4));
                            continueOnError = data.continueOnError === true || data.continueOnError === 'true';
                            extraInput = parseObjectField(data.input, ctx, 'Loop input');
                            results = new Array(items.length).fill(null);
                            errors = [];
                            _loop_1 = function (offset) {
                                var slice;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            (0, engine_types_1.assertNotCancelled)(ctx);
                                            slice = items.slice(offset, offset + concurrency);
                                            return [4 /*yield*/, Promise.all(slice.map(function (item, position) { return __awaiter(_this, void 0, void 0, function () {
                                                    var index, child, error_2;
                                                    var _a, _b, _c;
                                                    return __generator(this, function (_d) {
                                                        switch (_d.label) {
                                                            case 0:
                                                                index = offset + position;
                                                                _d.label = 1;
                                                            case 1:
                                                                _d.trys.push([1, 3, , 4]);
                                                                return [4 /*yield*/, this.invoker.invoke(target, __assign(__assign({}, extraInput), { item: item, index: index }), ctx)];
                                                            case 2:
                                                                child = _d.sent();
                                                                if (child.status === 'cancelled')
                                                                    throw new engine_types_1.ExecutionCancelledError();
                                                                if (child.status !== 'success') {
                                                                    throw new Error((_a = child.error) !== null && _a !== void 0 ? _a : 'unknown error');
                                                                }
                                                                results[index] = (_b = child.output) !== null && _b !== void 0 ? _b : {};
                                                                return [3 /*break*/, 4];
                                                            case 3:
                                                                error_2 = _d.sent();
                                                                if (error_2 instanceof engine_types_1.ExecutionCancelledError)
                                                                    throw error_2;
                                                                errors.push({ index: index, error: String((_c = error_2 === null || error_2 === void 0 ? void 0 : error_2.message) !== null && _c !== void 0 ? _c : error_2) });
                                                                if (!continueOnError)
                                                                    throw error_2;
                                                                return [3 /*break*/, 4];
                                                            case 4: return [2 /*return*/];
                                                        }
                                                    });
                                                }); }))];
                                        case 1:
                                            _d.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            };
                            offset = 0;
                            _c.label = 2;
                        case 2:
                            if (!(offset < items.length)) return [3 /*break*/, 5];
                            return [5 /*yield**/, _loop_1(offset)];
                        case 3:
                            _c.sent();
                            _c.label = 4;
                        case 4:
                            offset += concurrency;
                            return [3 /*break*/, 2];
                        case 5:
                            if (errors.length && !continueOnError) {
                                throw new Error("Loop node: item ".concat(errors[0].index, " failed: ").concat(errors[0].error));
                            }
                            return [2 /*return*/, {
                                    output: {
                                        results: results,
                                        count: items.length,
                                        succeeded: items.length - errors.length,
                                        failed: errors.length,
                                        errors: errors,
                                    },
                                }];
                    }
                });
            });
        };
        /** Accepts a template reference, a JSON array literal, or a live array. */
        LoopExecutor_1.prototype.resolveItems = function (raw, ctx) {
            if (Array.isArray(raw))
                return raw;
            var text = String(raw !== null && raw !== void 0 ? raw : '').trim();
            if (!text)
                return [];
            var resolved = (0, template_util_1.interpolate)(text, ctx);
            if (Array.isArray(resolved))
                return resolved;
            if (typeof resolved === 'string') {
                try {
                    var parsed = JSON.parse(resolved);
                    if (Array.isArray(parsed))
                        return parsed;
                }
                catch (_a) {
                    // fall through to the error below
                }
            }
            throw new Error('Loop node: "items" must resolve to an array (e.g. {{nodes.code_1.list}} or ["a","b"])');
        };
        return LoopExecutor_1;
    }());
    __setFunctionName(_classThis, "LoopExecutor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        LoopExecutor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return LoopExecutor = _classThis;
}();
exports.LoopExecutor = LoopExecutor;
/* ------------------------------------------------------------------ */
/* AI-native nodes (v0.6)                                             */
/* ------------------------------------------------------------------ */
/**
 * JSON extract node: parses structured JSON out of (usually LLM-produced)
 * text. Understands ```json fenced blocks as well as raw JSON, and can
 * optionally validate that a set of top-level keys is present. Pure parsing -
 * no model call - so it is cheap and deterministic.
 */
var JsonExtractExecutor = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var JsonExtractExecutor = _classThis = /** @class */ (function () {
        function JsonExtractExecutor_1() {
            this.type = 'json';
        }
        JsonExtractExecutor_1.prototype.execute = function (node, ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var data, source, mode, candidate, parsed, schemaRaw, valid, keys;
                var _a, _b, _c, _d, _e;
                return __generator(this, function (_f) {
                    data = (_a = node.data) !== null && _a !== void 0 ? _a : {};
                    source = String((_c = (0, template_util_1.interpolate)(String((_b = data.source) !== null && _b !== void 0 ? _b : ''), ctx)) !== null && _c !== void 0 ? _c : '');
                    mode = String((_d = data.extractMode) !== null && _d !== void 0 ? _d : 'auto');
                    candidate = this.extract(source, mode);
                    try {
                        parsed = JSON.parse(candidate);
                    }
                    catch (_g) {
                        // Extraction is best-effort: report validity instead of failing the run.
                        return [2 /*return*/, { output: { data: null, valid: false, error: 'No valid JSON found' } }];
                    }
                    schemaRaw = String((_e = data.schema) !== null && _e !== void 0 ? _e : '').trim();
                    valid = true;
                    if (schemaRaw && parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
                        keys = schemaRaw
                            .split(',')
                            .map(function (key) { return key.trim(); })
                            .filter(Boolean);
                        valid = keys.every(function (key) { return key in parsed; });
                    }
                    return [2 /*return*/, { output: { data: parsed, valid: valid } }];
                });
            });
        };
        /** Pulls the JSON payload out of the source text according to the mode. */
        JsonExtractExecutor_1.prototype.extract = function (source, mode) {
            var trimmed = source.trim();
            if (mode === 'raw')
                return trimmed;
            var block = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
            if (mode === 'codeBlock')
                return block ? block[1].trim() : trimmed;
            // auto: prefer a fenced block, fall back to the whole text
            return block ? block[1].trim() : trimmed;
        };
        return JsonExtractExecutor_1;
    }());
    __setFunctionName(_classThis, "JsonExtractExecutor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        JsonExtractExecutor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return JsonExtractExecutor = _classThis;
}();
exports.JsonExtractExecutor = JsonExtractExecutor;
/**
 * Classify node: asks an LLM to route a piece of text into one of the
 * configured categories and selects the matching branch port (cat_0, cat_1,
 * ... or `otherwise` when nothing matches).
 */
var ClassifyExecutor = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ClassifyExecutor = _classThis = /** @class */ (function () {
        function ClassifyExecutor_1(llm, models) {
            this.llm = llm;
            this.models = models;
            this.type = 'classify';
        }
        ClassifyExecutor_1.prototype.execute = function (node, ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var data, input, categories, config, list, prompt, response, answer, normalized, index, branch;
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            data = (_a = node.data) !== null && _a !== void 0 ? _a : {};
                            input = String((_c = (0, template_util_1.interpolate)(String((_b = data.input) !== null && _b !== void 0 ? _b : ''), ctx)) !== null && _c !== void 0 ? _c : '');
                            categories = this.parseCategories(data.categories);
                            if (categories.length === 0) {
                                throw new Error('Classify node: at least one category is required');
                            }
                            return [4 /*yield*/, this.models.resolveConfig(data.modelConfigId ? String(data.modelConfigId) : undefined)];
                        case 1:
                            config = _e.sent();
                            list = categories
                                .map(function (category, index) { return "".concat(index, ". ").concat(category.name).concat(category.description ? " - ".concat(category.description) : ''); })
                                .join('\n');
                            prompt = [
                                'Classify the following text into exactly one of the categories below.',
                                'Categories:',
                                list,
                                '',
                                'Text:',
                                input,
                                '',
                                'Reply with ONLY the category name, nothing else.',
                            ].join('\n');
                            return [4 /*yield*/, this.llm.complete({ prompt: prompt, config: config, signal: ctx.signal })];
                        case 2:
                            response = _e.sent();
                            answer = String((_d = response.text) !== null && _d !== void 0 ? _d : '').trim();
                            normalized = answer
                                .toLowerCase()
                                .replace(/^["'`]+|["'`。，,.!！?？]+$/g, '')
                                .trim();
                            index = categories.findIndex(function (category) { return category.name.toLowerCase() === normalized; });
                            if (index === -1) {
                                index = categories.findIndex(function (category) {
                                    return normalized.includes(category.name.toLowerCase());
                                });
                            }
                            branch = index >= 0 ? "cat_".concat(index) : 'otherwise';
                            return [2 /*return*/, {
                                    output: {
                                        category: index >= 0 ? categories[index].name : null,
                                        index: index,
                                        raw: answer,
                                        mock: response.mock,
                                    },
                                    branch: branch,
                                }];
                    }
                });
            });
        };
        /** Accepts a JSON array literal (string) or a live array of categories. */
        ClassifyExecutor_1.prototype.parseCategories = function (raw) {
            var normalize = function (items) {
                return items
                    .map(function (item) {
                    var _a;
                    return ({
                        name: String((_a = item === null || item === void 0 ? void 0 : item.name) !== null && _a !== void 0 ? _a : '').trim(),
                        description: (item === null || item === void 0 ? void 0 : item.description) ? String(item.description) : undefined,
                    });
                })
                    .filter(function (category) { return category.name; });
            };
            if (Array.isArray(raw))
                return normalize(raw);
            var text = String(raw !== null && raw !== void 0 ? raw : '').trim();
            if (!text)
                return [];
            try {
                var parsed = JSON.parse(text);
                if (Array.isArray(parsed))
                    return normalize(parsed);
            }
            catch (_a) {
                // fall through to empty result
            }
            return [];
        };
        return ClassifyExecutor_1;
    }());
    __setFunctionName(_classThis, "ClassifyExecutor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ClassifyExecutor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ClassifyExecutor = _classThis;
}();
exports.ClassifyExecutor = ClassifyExecutor;
/**
 * Text process node: a batteries-included LLM wrapper for the common text
 * operations (summarize / extract / translate / rewrite / custom), so users do
 * not have to hand-write a prompt for each one.
 */
var TextProcessExecutor = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var TextProcessExecutor = _classThis = /** @class */ (function () {
        function TextProcessExecutor_1(llm, models) {
            this.llm = llm;
            this.models = models;
            this.type = 'text';
        }
        TextProcessExecutor_1.prototype.execute = function (node, ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var data, operation, input, instruction, config, response;
                var _a, _b, _c, _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            data = (_a = node.data) !== null && _a !== void 0 ? _a : {};
                            operation = String((_b = data.operation) !== null && _b !== void 0 ? _b : 'summarize');
                            input = String((_d = (0, template_util_1.interpolate)(String((_c = data.input) !== null && _c !== void 0 ? _c : ''), ctx)) !== null && _d !== void 0 ? _d : '');
                            instruction = data.instruction
                                ? String((_e = (0, template_util_1.interpolate)(String(data.instruction), ctx)) !== null && _e !== void 0 ? _e : '')
                                : '';
                            return [4 /*yield*/, this.models.resolveConfig(data.modelConfigId ? String(data.modelConfigId) : undefined)];
                        case 1:
                            config = _f.sent();
                            return [4 /*yield*/, this.llm.complete({
                                    prompt: input,
                                    systemPrompt: this.systemPromptFor(operation, instruction),
                                    config: config,
                                    signal: ctx.signal,
                                })];
                        case 2:
                            response = _f.sent();
                            return [2 /*return*/, { output: { text: response.text, operation: operation, mock: response.mock } }];
                    }
                });
            });
        };
        TextProcessExecutor_1.prototype.systemPromptFor = function (operation, instruction) {
            var extra = instruction ? "\nAdditional instruction: ".concat(instruction) : '';
            switch (operation) {
                case 'extract':
                    return "Extract the key information from the user's text and present it clearly and concisely.".concat(extra);
                case 'translate':
                    return "Translate the user's text. If it is Chinese, translate it to English; otherwise translate it to Chinese.".concat(extra);
                case 'rewrite':
                    return "Rewrite and polish the user's text. Keep the original meaning while improving clarity and tone.".concat(extra);
                case 'custom':
                    return instruction || 'Process the user\'s text as instructed.';
                case 'summarize':
                default:
                    return "Summarize the user's text concisely, preserving the key points.".concat(extra);
            }
        };
        return TextProcessExecutor_1;
    }());
    __setFunctionName(_classThis, "TextProcessExecutor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TextProcessExecutor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TextProcessExecutor = _classThis;
}();
exports.TextProcessExecutor = TextProcessExecutor;
/**
 * Aggregate node: merges the outputs of its direct predecessors. Useful after
 * a multi-way split (classify / condition / switch) to recombine the branch
 * results before continuing. `object` mode keys outputs by node id; `array`
 * mode collects them in edge order.
 */
var AggregateExecutor = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AggregateExecutor = _classThis = /** @class */ (function () {
        function AggregateExecutor_1() {
            this.type = 'aggregate';
        }
        AggregateExecutor_1.prototype.execute = function (node, ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var mode, predecessorIds, items, merged, _i, predecessorIds_1, id;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    mode = String((_b = (_a = node.data) === null || _a === void 0 ? void 0 : _a.mode) !== null && _b !== void 0 ? _b : 'object');
                    predecessorIds = __spreadArray([], new Set(((_c = ctx.edges) !== null && _c !== void 0 ? _c : [])
                        .filter(function (edge) { return edge.targetNodeID === node.id; })
                        .map(function (edge) { return edge.sourceNodeID; })), true);
                    if (mode === 'array') {
                        items = predecessorIds
                            .filter(function (id) { return ctx.outputs[id] !== undefined; })
                            .map(function (id) { return ctx.outputs[id]; });
                        return [2 /*return*/, { output: { items: items, count: items.length } }];
                    }
                    merged = {};
                    for (_i = 0, predecessorIds_1 = predecessorIds; _i < predecessorIds_1.length; _i++) {
                        id = predecessorIds_1[_i];
                        if (ctx.outputs[id] !== undefined) {
                            merged[id] = ctx.outputs[id];
                        }
                    }
                    return [2 /*return*/, { output: merged }];
                });
            });
        };
        return AggregateExecutor_1;
    }());
    __setFunctionName(_classThis, "AggregateExecutor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AggregateExecutor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AggregateExecutor = _classThis;
}();
exports.AggregateExecutor = AggregateExecutor;
/**
 * Notify node: pushes the current run state to an external webhook (Slack,
 * DingTalk, Feishu, custom service...). Delivery is best-effort - a failed
 * notification reports `delivered: false` instead of failing the whole run.
 */
var NotifyExecutor = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var NotifyExecutor = _classThis = /** @class */ (function () {
        function NotifyExecutor_1(config) {
            this.config = config;
            this.type = 'notify';
        }
        NotifyExecutor_1.prototype.execute = function (node, ctx) {
            return __awaiter(this, void 0, void 0, function () {
                var data, url, method, timeout, body, interpolated, controller, timer, onCancel, response, error_3, detail;
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                return __generator(this, function (_l) {
                    switch (_l.label) {
                        case 0:
                            data = (_a = node.data) !== null && _a !== void 0 ? _a : {};
                            url = String((_c = (0, template_util_1.interpolate)(String((_b = data.webhookUrl) !== null && _b !== void 0 ? _b : ''), ctx)) !== null && _c !== void 0 ? _c : '');
                            if (!url) {
                                throw new Error('Notify node: webhookUrl is required');
                            }
                            method = String((_d = data.method) !== null && _d !== void 0 ? _d : 'POST').toUpperCase();
                            timeout = Number(this.config.get('HTTP_NODE_TIMEOUT', 15000));
                            if (method !== 'GET' && method !== 'HEAD' && data.payload !== undefined && data.payload !== '') {
                                interpolated = typeof data.payload === 'string'
                                    ? (0, template_util_1.interpolate)(String(data.payload), ctx)
                                    : (0, template_util_1.interpolateDeep)(data.payload, ctx);
                                body =
                                    typeof interpolated === 'object'
                                        ? JSON.stringify(interpolated)
                                        : String(interpolated !== null && interpolated !== void 0 ? interpolated : '');
                            }
                            controller = new AbortController();
                            timer = setTimeout(function () { return controller.abort(); }, timeout);
                            onCancel = function () { return controller.abort(); };
                            (_e = ctx.signal) === null || _e === void 0 ? void 0 : _e.addEventListener('abort', onCancel, { once: true });
                            _l.label = 1;
                        case 1:
                            _l.trys.push([1, 3, 4, 5]);
                            return [4 /*yield*/, fetch(url, {
                                    method: method,
                                    headers: { 'Content-Type': 'application/json' },
                                    body: body,
                                    signal: controller.signal,
                                })];
                        case 2:
                            response = _l.sent();
                            return [2 /*return*/, { output: { status: response.status, delivered: response.ok } }];
                        case 3:
                            error_3 = _l.sent();
                            if ((error_3 === null || error_3 === void 0 ? void 0 : error_3.name) === 'AbortError') {
                                if ((_f = ctx.signal) === null || _f === void 0 ? void 0 : _f.aborted)
                                    throw new engine_types_1.ExecutionCancelledError();
                                return [2 /*return*/, {
                                        output: { status: 0, delivered: false, error: "Timed out after ".concat(timeout, "ms") },
                                    }];
                            }
                            detail = (_j = (_h = (_g = error_3 === null || error_3 === void 0 ? void 0 : error_3.cause) === null || _g === void 0 ? void 0 : _g.message) !== null && _h !== void 0 ? _h : error_3 === null || error_3 === void 0 ? void 0 : error_3.message) !== null && _j !== void 0 ? _j : String(error_3);
                            return [2 /*return*/, { output: { status: 0, delivered: false, error: detail } }];
                        case 4:
                            clearTimeout(timer);
                            (_k = ctx.signal) === null || _k === void 0 ? void 0 : _k.removeEventListener('abort', onCancel);
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        return NotifyExecutor_1;
    }());
    __setFunctionName(_classThis, "NotifyExecutor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NotifyExecutor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NotifyExecutor = _classThis;
}();
exports.NotifyExecutor = NotifyExecutor;
