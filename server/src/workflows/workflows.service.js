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
exports.WorkflowsService = void 0;
var common_1 = require("@nestjs/common");
var WorkflowsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var WorkflowsService = _classThis = /** @class */ (function () {
        function WorkflowsService_1(repo, triggers) {
            this.repo = repo;
            this.triggers = triggers;
        }
        WorkflowsService_1.prototype.findAll = function (ownerId) {
            return this.repo.find({ where: { ownerId: ownerId }, order: { updatedAt: 'DESC' } });
        };
        /** Loads a workflow and enforces ownership. */
        WorkflowsService_1.prototype.findOne = function (id, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var workflow;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.repo.findOneBy({ id: id })];
                        case 1:
                            workflow = _a.sent();
                            if (!workflow) {
                                throw new common_1.NotFoundException("Workflow ".concat(id, " not found"));
                            }
                            if (workflow.ownerId !== ownerId) {
                                throw new common_1.ForbiddenException('You do not have access to this workflow');
                            }
                            return [2 /*return*/, workflow];
                    }
                });
            });
        };
        WorkflowsService_1.prototype.create = function (dto, ownerId) {
            var _a, _b;
            var workflow = this.repo.create({
                ownerId: ownerId,
                name: dto.name,
                description: (_a = dto.description) !== null && _a !== void 0 ? _a : '',
                definition: (_b = dto.definition) !== null && _b !== void 0 ? _b : null,
            });
            return this.repo.save(workflow);
        };
        WorkflowsService_1.prototype.update = function (id, dto, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var workflow;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id, ownerId)];
                        case 1:
                            workflow = _a.sent();
                            if (dto.name !== undefined)
                                workflow.name = dto.name;
                            if (dto.description !== undefined)
                                workflow.description = dto.description;
                            if (dto.definition !== undefined)
                                workflow.definition = dto.definition;
                            return [2 /*return*/, this.repo.save(workflow)];
                    }
                });
            });
        };
        WorkflowsService_1.prototype.remove = function (id, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var workflow, orphans;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id, ownerId)];
                        case 1:
                            workflow = _a.sent();
                            return [4 /*yield*/, this.triggers.find({ where: { workflowId: id } })];
                        case 2:
                            orphans = _a.sent();
                            if (!orphans.length) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.triggers.remove(orphans)];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4: return [4 /*yield*/, this.repo.remove(workflow)];
                        case 5:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Builds the portable JSON envelope for a workflow. */
        WorkflowsService_1.prototype.exportOne = function (id, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var workflow;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id, ownerId)];
                        case 1:
                            workflow = _a.sent();
                            return [2 /*return*/, {
                                    format: 'zcl-flow/workflow',
                                    version: 1,
                                    exportedAt: new Date().toISOString(),
                                    name: workflow.name,
                                    description: workflow.description,
                                    definition: workflow.definition,
                                }];
                    }
                });
            });
        };
        /**
         * Creates a workflow from an exported envelope. Triggers are intentionally
         * not imported: webhook secrets and schedules must be re-issued explicitly.
         */
        WorkflowsService_1.prototype.importOne = function (dto, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var definition, _a;
                var _b;
                var _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            if (dto.format && dto.format !== 'zcl-flow/workflow') {
                                throw new common_1.BadRequestException("Unsupported workflow format \"".concat(dto.format, "\""));
                            }
                            definition = (_c = dto.definition) !== null && _c !== void 0 ? _c : null;
                            if (definition && !Array.isArray(definition.nodes)) {
                                throw new common_1.BadRequestException('Invalid workflow file: "definition.nodes" must be an array');
                            }
                            _a = this.create;
                            _b = {};
                            return [4 /*yield*/, this.uniqueName(dto.name, ownerId)];
                        case 1: return [2 /*return*/, _a.apply(this, [(_b.name = _e.sent(),
                                    _b.description = (_d = dto.description) !== null && _d !== void 0 ? _d : '',
                                    _b.definition = definition !== null && definition !== void 0 ? definition : undefined,
                                    _b), ownerId])];
                    }
                });
            });
        };
        /** Deep-copies a workflow (definition only) under a new name. */
        WorkflowsService_1.prototype.duplicate = function (id, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var source, _a;
                var _b;
                var _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, this.findOne(id, ownerId)];
                        case 1:
                            source = _d.sent();
                            _a = this.create;
                            _b = {};
                            return [4 /*yield*/, this.uniqueName("".concat(source.name, " copy"), ownerId)];
                        case 2: return [2 /*return*/, _a.apply(this, [(_b.name = _d.sent(),
                                    _b.description = source.description,
                                    _b.definition = (_c = source.definition) !== null && _c !== void 0 ? _c : undefined,
                                    _b), ownerId])];
                    }
                });
            });
        };
        /** Appends a numeric suffix until the name is free for this account. */
        WorkflowsService_1.prototype.uniqueName = function (base, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var trimmed, existing, _a, i, candidate;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            trimmed = base.slice(0, 110).trim() || 'Workflow';
                            _a = Set.bind;
                            return [4 /*yield*/, this.repo.find({ where: { ownerId: ownerId }, select: { name: true } })];
                        case 1:
                            existing = new (_a.apply(Set, [void 0, (_b.sent()).map(function (item) { return item.name; })]))();
                            if (!existing.has(trimmed))
                                return [2 /*return*/, trimmed];
                            for (i = 2; i < 1000; i += 1) {
                                candidate = "".concat(trimmed, " ").concat(i);
                                if (!existing.has(candidate))
                                    return [2 /*return*/, candidate];
                            }
                            return [2 /*return*/, "".concat(trimmed, " ").concat(Date.now())];
                    }
                });
            });
        };
        return WorkflowsService_1;
    }());
    __setFunctionName(_classThis, "WorkflowsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WorkflowsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WorkflowsService = _classThis;
}();
exports.WorkflowsService = WorkflowsService;
