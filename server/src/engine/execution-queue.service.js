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
exports.ExecutionQueueService = void 0;
var common_1 = require("@nestjs/common");
/**
 * Bounded queue for asynchronous workflow runs.
 *
 * A synchronous `POST /run` holds an HTTP connection for the whole duration of
 * the workflow, which breaks down as soon as a run takes minutes (LLM chains,
 * loops). Callers now get an execution id immediately and follow progress over
 * the SSE stream. Concurrency is capped so a burst of webhooks cannot exhaust
 * the process.
 */
var ExecutionQueueService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ExecutionQueueService = _classThis = /** @class */ (function () {
        function ExecutionQueueService_1(engine, executions, events, config) {
            this.engine = engine;
            this.executions = executions;
            this.events = events;
            this.config = config;
            this.logger = new common_1.Logger(ExecutionQueueService.name);
            this.queue = [];
            /** executionId -> abort controller of a queued or running execution. */
            this.controllers = new Map();
            this.active = 0;
        }
        ExecutionQueueService_1.prototype.onModuleDestroy = function () {
            for (var _i = 0, _a = this.controllers.values(); _i < _a.length; _i++) {
                var controller = _a[_i];
                controller.abort();
            }
            this.controllers.clear();
        };
        Object.defineProperty(ExecutionQueueService_1.prototype, "concurrency", {
            get: function () {
                return Math.max(1, Number(this.config.get('MAX_CONCURRENT_RUNS', 4)));
            },
            enumerable: false,
            configurable: true
        });
        /** Queues a run and returns the `queued` execution row straight away. */
        ExecutionQueueService_1.prototype.enqueue = function (workflow_1, input_1) {
            return __awaiter(this, arguments, void 0, function (workflow, input, options) {
                var execution, controller, snapshot;
                var _this = this;
                if (options === void 0) { options = {}; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.engine.createPendingExecution(workflow, input, options)];
                        case 1:
                            execution = _a.sent();
                            controller = new AbortController();
                            this.controllers.set(execution.id, controller);
                            this.queue.push({
                                execution: execution,
                                workflow: workflow,
                                input: input,
                                options: __assign(__assign({}, options), { signal: controller.signal, execution: execution }),
                            });
                            this.events.emit({
                                type: 'execution.started',
                                ownerId: workflow.ownerId,
                                workflowId: workflow.id,
                                executionId: execution.id,
                                payload: { status: 'queued', triggerType: execution.triggerType, input: input },
                            });
                            snapshot = __assign({}, execution);
                            // setImmediate (not a bare `void`) so the HTTP response is serialised first.
                            setImmediate(function () { return void _this.drain(); });
                            return [2 /*return*/, snapshot];
                    }
                });
            });
        };
        /**
         * Cancels a queued or running execution.
         * Returns false when the execution is unknown to this process (already done).
         */
        ExecutionQueueService_1.prototype.cancel = function (executionId) {
            return __awaiter(this, void 0, void 0, function () {
                var controller, index, item;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            controller = this.controllers.get(executionId);
                            if (!controller)
                                return [2 /*return*/, false];
                            controller.abort();
                            index = this.queue.findIndex(function (item) { return item.execution.id === executionId; });
                            if (!(index >= 0)) return [3 /*break*/, 2];
                            item = this.queue.splice(index, 1)[0];
                            this.controllers.delete(executionId);
                            item.execution.status = 'cancelled';
                            item.execution.error = 'Execution cancelled before it started';
                            item.execution.finishedAt = new Date();
                            return [4 /*yield*/, this.executions.updateExecution(item.execution)];
                        case 1:
                            _a.sent();
                            this.events.emit({
                                type: 'execution.finished',
                                ownerId: item.workflow.ownerId,
                                workflowId: item.workflow.id,
                                executionId: executionId,
                                payload: { status: 'cancelled' },
                            });
                            _a.label = 2;
                        case 2: return [2 /*return*/, true];
                    }
                });
            });
        };
        /** True while the execution is queued or running in this process. */
        ExecutionQueueService_1.prototype.isActive = function (executionId) {
            return this.controllers.has(executionId);
        };
        Object.defineProperty(ExecutionQueueService_1.prototype, "stats", {
            get: function () {
                return { queued: this.queue.length, running: this.active, concurrency: this.concurrency };
            },
            enumerable: false,
            configurable: true
        });
        /** Starts as many queued runs as the concurrency budget allows. */
        ExecutionQueueService_1.prototype.drain = function () {
            return __awaiter(this, void 0, void 0, function () {
                var item;
                return __generator(this, function (_a) {
                    while (this.active < this.concurrency && this.queue.length > 0) {
                        item = this.queue.shift();
                        this.active += 1;
                        void this.execute(item);
                    }
                    return [2 /*return*/];
                });
            });
        };
        ExecutionQueueService_1.prototype.execute = function (item) {
            return __awaiter(this, void 0, void 0, function () {
                var error_1;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, 3, 4]);
                            return [4 /*yield*/, this.engine.run(item.workflow, item.input, item.options)];
                        case 1:
                            _b.sent();
                            return [3 /*break*/, 4];
                        case 2:
                            error_1 = _b.sent();
                            // The engine already persists failures; this only catches infrastructure
                            // level surprises so the worker slot is never leaked.
                            this.logger.error("Queued execution ".concat(item.execution.id, " crashed: ").concat((_a = error_1 === null || error_1 === void 0 ? void 0 : error_1.message) !== null && _a !== void 0 ? _a : error_1));
                            return [3 /*break*/, 4];
                        case 3:
                            this.controllers.delete(item.execution.id);
                            this.active -= 1;
                            void this.drain();
                            return [7 /*endfinally*/];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        return ExecutionQueueService_1;
    }());
    __setFunctionName(_classThis, "ExecutionQueueService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ExecutionQueueService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ExecutionQueueService = _classThis;
}();
exports.ExecutionQueueService = ExecutionQueueService;
