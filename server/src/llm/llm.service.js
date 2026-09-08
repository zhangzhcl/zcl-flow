"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlmService = void 0;
var common_1 = require("@nestjs/common");
/**
 * OpenAI-compatible chat completion client.
 * Provider resolution order: request.config -> environment -> mock.
 * The mock fallback keeps the whole workflow loop runnable without any key.
 */
var LlmService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var LlmService = _classThis = /** @class */ (function () {
        function LlmService_1(config) {
            this.config = config;
            this.logger = new common_1.Logger(LlmService.name);
        }
        /** Provider config from environment variables, or null when no key is set. */
        LlmService_1.prototype.envConfig = function () {
            var apiKey = this.config.get('LLM_API_KEY', '');
            if (!apiKey)
                return null;
            return {
                apiKey: apiKey,
                baseUrl: this.config.get('LLM_BASE_URL', 'https://api.openai.com/v1'),
                model: this.config.get('LLM_MODEL', 'gpt-5-mini'),
            };
        };
        LlmService_1.prototype.complete = function (request) {
            return __awaiter(this, void 0, void 0, function () {
                var provider, model, baseUrl, timeout, temperature, messages, controller, timer, onCancel, response, body, data, text, error_1, detail;
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                return __generator(this, function (_o) {
                    switch (_o.label) {
                        case 0:
                            provider = request.config && request.config.apiKey ? request.config : this.envConfig();
                            model = request.model || (provider === null || provider === void 0 ? void 0 : provider.model) || this.config.get('LLM_MODEL', 'gpt-5-mini');
                            if (!provider) {
                                return [2 /*return*/, this.mockComplete(request, model)];
                            }
                            baseUrl = provider.baseUrl.replace(/\/$/, '');
                            timeout = Number(this.config.get('LLM_TIMEOUT', 120000));
                            temperature = (_b = (_a = request.temperature) !== null && _a !== void 0 ? _a : provider.temperature) !== null && _b !== void 0 ? _b : 0.7;
                            messages = [];
                            if (request.systemPrompt) {
                                messages.push({ role: 'system', content: request.systemPrompt });
                            }
                            messages.push({ role: 'user', content: request.prompt });
                            controller = new AbortController();
                            timer = setTimeout(function () { return controller.abort(); }, timeout);
                            onCancel = function () { return controller.abort(); };
                            (_c = request.signal) === null || _c === void 0 ? void 0 : _c.addEventListener('abort', onCancel, { once: true });
                            _o.label = 1;
                        case 1:
                            _o.trys.push([1, 6, 7, 8]);
                            return [4 /*yield*/, fetch("".concat(baseUrl, "/chat/completions"), {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: "Bearer ".concat(provider.apiKey),
                                    },
                                    body: JSON.stringify({ model: model, messages: messages, temperature: temperature }),
                                    signal: controller.signal,
                                })];
                        case 2:
                            response = _o.sent();
                            if (!!response.ok) return [3 /*break*/, 4];
                            return [4 /*yield*/, response.text()];
                        case 3:
                            body = _o.sent();
                            throw new Error("provider returned ".concat(response.status, " for model \"").concat(model, "\" at ").concat(baseUrl, " - ").concat(body.slice(0, 200)));
                        case 4: return [4 /*yield*/, response.json()];
                        case 5:
                            data = _o.sent();
                            text = (_g = (_f = (_e = (_d = data === null || data === void 0 ? void 0 : data.choices) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.message) === null || _f === void 0 ? void 0 : _f.content) !== null && _g !== void 0 ? _g : '';
                            return [2 /*return*/, { text: text, model: model, mock: false }];
                        case 6:
                            error_1 = _o.sent();
                            if ((error_1 === null || error_1 === void 0 ? void 0 : error_1.name) === 'AbortError') {
                                if ((_h = request.signal) === null || _h === void 0 ? void 0 : _h.aborted) {
                                    throw new Error('LLM request aborted: execution cancelled');
                                }
                                throw new Error("LLM request timed out after ".concat(timeout, "ms (").concat(baseUrl, "). The provider did not respond in time; retry later or increase LLM_TIMEOUT in server/.env for slower models such as DeepSeek."));
                            }
                            detail = (_l = (_k = (_j = error_1 === null || error_1 === void 0 ? void 0 : error_1.cause) === null || _j === void 0 ? void 0 : _j.message) !== null && _k !== void 0 ? _k : error_1 === null || error_1 === void 0 ? void 0 : error_1.message) !== null && _l !== void 0 ? _l : String(error_1);
                            throw new Error("LLM request failed: ".concat(detail, ". Check the base URL / API key of the selected model config (").concat(baseUrl, ")."));
                        case 7:
                            clearTimeout(timer);
                            (_m = request.signal) === null || _m === void 0 ? void 0 : _m.removeEventListener('abort', onCancel);
                            return [7 /*endfinally*/];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        };
        LlmService_1.prototype.mockComplete = function (request, model) {
            this.logger.warn('No LLM provider configured, returning mock completion');
            var preview = request.prompt.slice(0, 200);
            return {
                text: "[mock] This is a simulated LLM response. Configure a model in Settings or set LLM_API_KEY in server/.env.\n\nReceived prompt: ".concat(preview),
                model: "".concat(model, " (mock)"),
                mock: true,
            };
        };
        return LlmService_1;
    }());
    __setFunctionName(_classThis, "LlmService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        LlmService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return LlmService = _classThis;
}();
exports.LlmService = LlmService;
