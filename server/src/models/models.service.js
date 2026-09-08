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
exports.ModelsService = void 0;
var common_1 = require("@nestjs/common");
var model_config_entity_1 = require("./model-config.entity");
var ModelsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ModelsService = _classThis = /** @class */ (function () {
        function ModelsService_1(repo, llm) {
            this.repo = repo;
            this.llm = llm;
        }
        ModelsService_1.prototype.findAll = function () {
            return __awaiter(this, void 0, void 0, function () {
                var items;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.repo.find({ order: { createdAt: 'ASC' } })];
                        case 1:
                            items = _a.sent();
                            return [2 /*return*/, items.map(model_config_entity_1.toView)];
                    }
                });
            });
        };
        ModelsService_1.prototype.findEntity = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var entity;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.repo.findOneBy({ id: id })];
                        case 1:
                            entity = _a.sent();
                            if (!entity)
                                throw new common_1.NotFoundException("Model config ".concat(id, " not found"));
                            return [2 /*return*/, entity];
                    }
                });
            });
        };
        ModelsService_1.prototype.create = function (dto) {
            return __awaiter(this, void 0, void 0, function () {
                var count, entity, _a;
                var _b, _c, _d, _e, _f;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            if (!dto.isDefault) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.clearDefault()];
                        case 1:
                            _g.sent();
                            _g.label = 2;
                        case 2: return [4 /*yield*/, this.repo.count()];
                        case 3:
                            count = _g.sent();
                            entity = this.repo.create({
                                name: dto.name,
                                model: dto.model,
                                baseUrl: ((_b = dto.baseUrl) === null || _b === void 0 ? void 0 : _b.trim()) || 'https://api.openai.com/v1',
                                apiKey: (_c = dto.apiKey) !== null && _c !== void 0 ? _c : '',
                                temperature: (_d = dto.temperature) !== null && _d !== void 0 ? _d : null,
                                // First config automatically becomes the default.
                                isDefault: (_e = dto.isDefault) !== null && _e !== void 0 ? _e : count === 0,
                                enabled: (_f = dto.enabled) !== null && _f !== void 0 ? _f : true,
                            });
                            _a = model_config_entity_1.toView;
                            return [4 /*yield*/, this.repo.save(entity)];
                        case 4: return [2 /*return*/, _a.apply(void 0, [_g.sent()])];
                    }
                });
            });
        };
        ModelsService_1.prototype.update = function (id, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var entity, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.findEntity(id)];
                        case 1:
                            entity = _b.sent();
                            if (!dto.isDefault) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.clearDefault()];
                        case 2:
                            _b.sent();
                            _b.label = 3;
                        case 3:
                            if (dto.name !== undefined)
                                entity.name = dto.name;
                            if (dto.model !== undefined)
                                entity.model = dto.model;
                            if (dto.baseUrl !== undefined && dto.baseUrl.trim())
                                entity.baseUrl = dto.baseUrl.trim();
                            // Empty apiKey means "keep the existing key".
                            if (dto.apiKey !== undefined && dto.apiKey !== '')
                                entity.apiKey = dto.apiKey;
                            if (dto.temperature !== undefined)
                                entity.temperature = dto.temperature;
                            if (dto.isDefault !== undefined)
                                entity.isDefault = dto.isDefault;
                            if (dto.enabled !== undefined)
                                entity.enabled = dto.enabled;
                            _a = model_config_entity_1.toView;
                            return [4 /*yield*/, this.repo.save(entity)];
                        case 4: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                    }
                });
            });
        };
        ModelsService_1.prototype.remove = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var entity;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findEntity(id)];
                        case 1:
                            entity = _a.sent();
                            return [4 /*yield*/, this.repo.remove(entity)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        ModelsService_1.prototype.setDefault = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var entity, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.findEntity(id)];
                        case 1:
                            entity = _b.sent();
                            return [4 /*yield*/, this.clearDefault()];
                        case 2:
                            _b.sent();
                            entity.isDefault = true;
                            _a = model_config_entity_1.toView;
                            return [4 /*yield*/, this.repo.save(entity)];
                        case 3: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                    }
                });
            });
        };
        ModelsService_1.prototype.clearDefault = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.repo.update({ isDefault: true }, { isDefault: false })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Resolve the provider config used by the LLM executor:
         * explicit config id -> default config -> null (env/mock fallback in LlmService).
         */
        ModelsService_1.prototype.resolveConfig = function (modelConfigId) {
            return __awaiter(this, void 0, void 0, function () {
                var entity;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            entity = null;
                            if (!modelConfigId) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.repo.findOneBy({ id: modelConfigId })];
                        case 1:
                            entity = _a.sent();
                            _a.label = 2;
                        case 2:
                            if (!(!entity || !entity.enabled)) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.repo.findOneBy({ isDefault: true, enabled: true })];
                        case 3:
                            entity = _a.sent();
                            _a.label = 4;
                        case 4:
                            if (!entity || !entity.apiKey)
                                return [2 /*return*/, null];
                            return [2 /*return*/, {
                                    apiKey: entity.apiKey,
                                    baseUrl: entity.baseUrl,
                                    model: entity.model,
                                    temperature: entity.temperature,
                                }];
                    }
                });
            });
        };
        /** Fire a minimal real completion to verify connectivity of a config. */
        ModelsService_1.prototype.testConnection = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var entity, started, response, error_1;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.findEntity(id)];
                        case 1:
                            entity = _b.sent();
                            if (!entity.apiKey) {
                                return [2 /*return*/, { ok: false, error: 'API key is empty' }];
                            }
                            started = Date.now();
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, this.llm.complete({
                                    prompt: 'ping, reply with "pong" only',
                                    config: {
                                        apiKey: entity.apiKey,
                                        baseUrl: entity.baseUrl,
                                        model: entity.model,
                                        temperature: 0,
                                    },
                                })];
                        case 3:
                            response = _b.sent();
                            return [2 /*return*/, {
                                    ok: true,
                                    model: response.model,
                                    latencyMs: Date.now() - started,
                                    text: response.text.slice(0, 100),
                                }];
                        case 4:
                            error_1 = _b.sent();
                            return [2 /*return*/, { ok: false, error: String((_a = error_1 === null || error_1 === void 0 ? void 0 : error_1.message) !== null && _a !== void 0 ? _a : error_1) }];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        return ModelsService_1;
    }());
    __setFunctionName(_classThis, "ModelsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ModelsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ModelsService = _classThis;
}();
exports.ModelsService = ModelsService;
