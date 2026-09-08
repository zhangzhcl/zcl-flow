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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionsService = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("typeorm");
var execution_entity_1 = require("./execution.entity");
var ExecutionsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ExecutionsService = _classThis = /** @class */ (function () {
        function ExecutionsService_1(executions, nodeExecutions) {
            this.executions = executions;
            this.nodeExecutions = nodeExecutions;
            this.logger = new common_1.Logger(ExecutionsService.name);
        }
        ExecutionsService_1.prototype.onModuleInit = function () {
            return __awaiter(this, void 0, void 0, function () {
                var orphans;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.reconcileOrphans()];
                        case 1:
                            orphans = _a.sent();
                            if (orphans) {
                                this.logger.warn("Marked ".concat(orphans, " interrupted execution(s) as failed on startup"));
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Top-level runs of a workflow. Sub-workflow runs are excluded so the history
         * list stays readable; they are reachable by drilling into the parent.
         */
        ExecutionsService_1.prototype.findByWorkflow = function (workflowId, ownerId) {
            return this.executions.find({
                where: { workflowId: workflowId, ownerId: ownerId, parentExecutionId: (0, typeorm_1.IsNull)() },
                order: { startedAt: 'DESC' },
                take: 50,
            });
        };
        ExecutionsService_1.prototype.findOneWithNodes = function (id, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var execution, nodes;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.executions.findOneBy({ id: id })];
                        case 1:
                            execution = _a.sent();
                            if (!execution) {
                                throw new common_1.NotFoundException("Execution ".concat(id, " not found"));
                            }
                            if (ownerId !== undefined && execution.ownerId !== ownerId) {
                                throw new common_1.ForbiddenException('You do not have access to this execution');
                            }
                            return [4 /*yield*/, this.nodeExecutions.find({
                                    where: { executionId: id },
                                    order: { startedAt: 'ASC' },
                                })];
                        case 2:
                            nodes = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, execution), { nodes: nodes })];
                    }
                });
            });
        };
        /** Child runs spawned by sub-workflow / loop nodes of one execution. */
        ExecutionsService_1.prototype.findChildren = function (parentExecutionId, ownerId) {
            return this.executions.find({
                where: { parentExecutionId: parentExecutionId, ownerId: ownerId },
                order: { startedAt: 'ASC' },
                take: 200,
            });
        };
        ExecutionsService_1.prototype.createExecution = function (data) {
            return this.executions.save(this.executions.create(data));
        };
        ExecutionsService_1.prototype.updateExecution = function (execution) {
            return this.executions.save(execution);
        };
        ExecutionsService_1.prototype.createNodeExecution = function (data) {
            return this.nodeExecutions.save(this.nodeExecutions.create(data));
        };
        /** Loads an execution for cancellation, enforcing ownership. */
        ExecutionsService_1.prototype.findOwned = function (id, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var execution;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.executions.findOneBy({ id: id })];
                        case 1:
                            execution = _a.sent();
                            if (!execution) {
                                throw new common_1.NotFoundException("Execution ".concat(id, " not found"));
                            }
                            if (execution.ownerId !== ownerId) {
                                throw new common_1.ForbiddenException('You do not have access to this execution');
                            }
                            return [2 /*return*/, execution];
                    }
                });
            });
        };
        /**
         * Marks runs left in a non-terminal state by an unclean shutdown as failed.
         * Called on boot: without it those rows would spin forever in the UI.
         */
        ExecutionsService_1.prototype.reconcileOrphans = function () {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.executions
                                .createQueryBuilder()
                                .update(execution_entity_1.ExecutionEntity)
                                .set({
                                status: 'failed',
                                error: 'Interrupted: the server restarted while this run was in progress',
                                finishedAt: function () { return 'CURRENT_TIMESTAMP'; },
                            })
                                .where('status IN (:...states)', { states: ['queued', 'running'] })
                                .execute()];
                        case 1:
                            result = _b.sent();
                            return [2 /*return*/, (_a = result.affected) !== null && _a !== void 0 ? _a : 0];
                    }
                });
            });
        };
        return ExecutionsService_1;
    }());
    __setFunctionName(_classThis, "ExecutionsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ExecutionsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ExecutionsService = _classThis;
}();
exports.ExecutionsService = ExecutionsService;
