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
exports.EngineService = void 0;
var common_1 = require("@nestjs/common");
var engine_types_1 = require("./engine.types");
var graph_scheduler_1 = require("./graph-scheduler");
/**
 * Workflow execution engine.
 *
 * Traverses the FlowGram document with a dependency-aware scheduler
 * (see GraphScheduler), executing each node with its registered executor and
 * persisting per-node records for full observability.
 */
var EngineService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var EngineService = _classThis = /** @class */ (function () {
        function EngineService_1(config, executionsService, events, debugSessions, startExecutor, endExecutor, llmExecutor, codeExecutor, conditionExecutor, httpExecutor, templateExecutor, variableExecutor, delayExecutor, switchExecutor, subflowExecutor, loopExecutor, jsonExtractExecutor, classifyExecutor, textProcessExecutor, aggregateExecutor, notifyExecutor) {
            this.config = config;
            this.executionsService = executionsService;
            this.events = events;
            this.debugSessions = debugSessions;
            this.logger = new common_1.Logger(EngineService.name);
            this.executors = new Map();
            for (var _i = 0, _a = [
                startExecutor,
                endExecutor,
                llmExecutor,
                codeExecutor,
                conditionExecutor,
                httpExecutor,
                templateExecutor,
                variableExecutor,
                delayExecutor,
                switchExecutor,
                subflowExecutor,
                loopExecutor,
                jsonExtractExecutor,
                classifyExecutor,
                textProcessExecutor,
                aggregateExecutor,
                notifyExecutor,
            ]; _i < _a.length; _i++) {
                var executor = _a[_i];
                this.executors.set(executor.type, executor);
            }
        }
        /** Creates the execution row without running it (used by the async queue). */
        EngineService_1.prototype.createPendingExecution = function (workflow, input, options) {
            var _a, _b, _c;
            if (options === void 0) { options = {}; }
            return this.executionsService.createExecution({
                workflowId: workflow.id,
                ownerId: workflow.ownerId,
                status: 'queued',
                triggerType: (_a = options.triggerType) !== null && _a !== void 0 ? _a : 'manual',
                triggerId: (_b = options.triggerId) !== null && _b !== void 0 ? _b : null,
                parentExecutionId: (_c = options.parentExecutionId) !== null && _c !== void 0 ? _c : null,
                input: input,
            });
        };
        EngineService_1.prototype.run = function (workflow_1, input_1) {
            return __awaiter(this, arguments, void 0, function (workflow, input, options) {
                var startedAt, execution, _a, emit, ctx, session, document_1, _b, error_1;
                var _this = this;
                var _c, _d, _e, _f, _g;
                if (options === void 0) { options = {}; }
                return __generator(this, function (_h) {
                    switch (_h.label) {
                        case 0:
                            startedAt = Date.now();
                            if (!((_c = options.execution) !== null && _c !== void 0)) return [3 /*break*/, 1];
                            _a = _c;
                            return [3 /*break*/, 3];
                        case 1: return [4 /*yield*/, this.createPendingExecution(workflow, input, options)];
                        case 2:
                            _a = (_h.sent());
                            _h.label = 3;
                        case 3:
                            execution = _a;
                            execution.status = 'running';
                            return [4 /*yield*/, this.executionsService.updateExecution(execution)];
                        case 4:
                            _h.sent();
                            emit = function (type, payload) {
                                return _this.events.emit({
                                    type: type,
                                    ownerId: workflow.ownerId,
                                    workflowId: workflow.id,
                                    executionId: execution.id,
                                    payload: payload,
                                });
                            };
                            emit('execution.started', {
                                triggerType: execution.triggerType,
                                parentExecutionId: execution.parentExecutionId,
                                input: input,
                            });
                            ctx = {
                                input: input,
                                outputs: {},
                                variables: {},
                                signal: options.signal,
                                ownerId: workflow.ownerId,
                                depth: (_d = options.depth) !== null && _d !== void 0 ? _d : 0,
                                callStack: __spreadArray(__spreadArray([], ((_e = options.callStack) !== null && _e !== void 0 ? _e : []), true), [workflow.id], false),
                                executionId: execution.id,
                            };
                            session = options.debug
                                ? this.debugSessions.create(execution.id, workflow.ownerId, options.debug)
                                : undefined;
                            _h.label = 5;
                        case 5:
                            _h.trys.push([5, 7, 8, 9]);
                            document_1 = this.parseDocument(workflow.definition);
                            ctx.edges = document_1.edges;
                            _b = execution;
                            return [4 /*yield*/, this.traverse(document_1, ctx, execution.id, emit, session)];
                        case 6:
                            _b.output = _h.sent();
                            execution.status = 'success';
                            return [3 /*break*/, 9];
                        case 7:
                            error_1 = _h.sent();
                            if (error_1 instanceof engine_types_1.ExecutionCancelledError || ((_f = options.signal) === null || _f === void 0 ? void 0 : _f.aborted)) {
                                execution.status = 'cancelled';
                                execution.error = 'Execution cancelled';
                            }
                            else {
                                this.logger.error("Execution ".concat(execution.id, " failed: ").concat(error_1 === null || error_1 === void 0 ? void 0 : error_1.message));
                                execution.status = 'failed';
                                execution.error = String((_g = error_1 === null || error_1 === void 0 ? void 0 : error_1.message) !== null && _g !== void 0 ? _g : error_1);
                            }
                            return [3 /*break*/, 9];
                        case 8:
                            if (session)
                                this.debugSessions.remove(execution.id);
                            return [7 /*endfinally*/];
                        case 9:
                            execution.durationMs = Date.now() - startedAt;
                            execution.finishedAt = new Date();
                            return [4 /*yield*/, this.executionsService.updateExecution(execution)];
                        case 10:
                            _h.sent();
                            emit('execution.finished', {
                                status: execution.status,
                                output: execution.output,
                                error: execution.error,
                                durationMs: execution.durationMs,
                            });
                            return [2 /*return*/, this.executionsService.findOneWithNodes(execution.id)];
                    }
                });
            });
        };
        EngineService_1.prototype.parseDocument = function (definition) {
            var _a, _b;
            var nodes = (_a = definition === null || definition === void 0 ? void 0 : definition.nodes) !== null && _a !== void 0 ? _a : [];
            var edges = (_b = definition === null || definition === void 0 ? void 0 : definition.edges) !== null && _b !== void 0 ? _b : [];
            if (!nodes.length) {
                throw new Error('Workflow definition is empty: add nodes before running');
            }
            if (!nodes.some(function (node) { return node.type === 'start'; })) {
                throw new Error('Workflow must contain a start node');
            }
            return { nodes: nodes, edges: edges };
        };
        EngineService_1.prototype.traverse = function (document, ctx, executionId, emit, session) {
            return __awaiter(this, void 0, void 0, function () {
                var startNode, finalOutput, scheduler;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            startNode = document.nodes.find(function (node) { return node.type === 'start'; });
                            finalOutput = {};
                            scheduler = new graph_scheduler_1.GraphScheduler(document, {
                                checkpoint: function () {
                                    var _a;
                                    if ((_a = ctx.signal) === null || _a === void 0 ? void 0 : _a.aborted)
                                        throw new engine_types_1.ExecutionCancelledError();
                                },
                                execute: function (node) { return __awaiter(_this, void 0, void 0, function () {
                                    var mock, output_1, _a, output, branch;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                if (!session) return [3 /*break*/, 3];
                                                // Pauses here when stepping or on a breakpoint; throws if stopped.
                                                return [4 /*yield*/, session.beforeNode(node, ctx, emit)];
                                            case 1:
                                                // Pauses here when stepping or on a breakpoint; throws if stopped.
                                                _b.sent();
                                                mock = session.getMock(node.id);
                                                if (!mock) return [3 /*break*/, 3];
                                                output_1 = __assign(__assign({}, mock.output), { mock: true });
                                                ctx.outputs[node.id] = output_1;
                                                if (node.type === 'end')
                                                    finalOutput = output_1;
                                                return [4 /*yield*/, this.recordMock(node, mock, output_1, executionId, emit)];
                                            case 2:
                                                _b.sent();
                                                return [2 /*return*/, { branch: mock.branch }];
                                            case 3: return [4 /*yield*/, this.executeNode(node, ctx, executionId, emit)];
                                            case 4:
                                                _a = _b.sent(), output = _a.output, branch = _a.branch;
                                                ctx.outputs[node.id] = output;
                                                if (node.type === 'end')
                                                    finalOutput = output;
                                                return [2 /*return*/, { branch: branch }];
                                        }
                                    });
                                }); },
                                skip: function (node, reason) { return _this.recordSkip(node, reason, executionId, emit); },
                            }, {
                                maxNodes: Number(this.config.get('MAX_NODES_PER_RUN', 100)),
                                // Debug runs are strictly serial so single-stepping is deterministic.
                                parallelism: session ? 1 : Number(this.config.get('MAX_PARALLEL_NODES', 4)),
                            });
                            return [4 /*yield*/, scheduler.run(startNode)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, finalOutput];
                    }
                });
            });
        };
        /** Persists a node whose real executor was bypassed by a debug mock. */
        EngineService_1.prototype.recordMock = function (node, mock, output, executionId, emit) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0: return [4 /*yield*/, this.executionsService.createNodeExecution({
                                executionId: executionId,
                                nodeId: node.id,
                                nodeType: node.type,
                                status: 'success',
                                input: (_a = node.data) !== null && _a !== void 0 ? _a : {},
                                output: output,
                                durationMs: 0,
                            })];
                        case 1:
                            _e.sent();
                            emit('node.finished', {
                                nodeId: node.id,
                                nodeType: node.type,
                                title: String((_c = (_b = node.data) === null || _b === void 0 ? void 0 : _b.title) !== null && _c !== void 0 ? _c : node.id),
                                status: 'success',
                                mock: true,
                                branch: (_d = mock.branch) !== null && _d !== void 0 ? _d : null,
                                output: output,
                                durationMs: 0,
                            });
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Persists a node that never ran (unreachable or on an untaken branch). */
        EngineService_1.prototype.recordSkip = function (node, reason, executionId, emit) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, this.executionsService.createNodeExecution({
                                executionId: executionId,
                                nodeId: node.id,
                                nodeType: node.type,
                                status: 'skipped',
                                input: (_a = node.data) !== null && _a !== void 0 ? _a : {},
                                output: { reason: reason },
                                durationMs: 0,
                            })];
                        case 1:
                            _d.sent();
                            emit('node.finished', {
                                nodeId: node.id,
                                nodeType: node.type,
                                title: String((_c = (_b = node.data) === null || _b === void 0 ? void 0 : _b.title) !== null && _c !== void 0 ? _c : node.id),
                                status: 'skipped',
                                reason: reason,
                                durationMs: 0,
                            });
                            return [2 /*return*/];
                    }
                });
            });
        };
        EngineService_1.prototype.executeNode = function (node, ctx, executionId, emit) {
            return __awaiter(this, void 0, void 0, function () {
                var executor, nodeStarted, title, result, error_2, cancelled, message;
                var _a, _b, _c, _d, _e, _f, _g;
                return __generator(this, function (_h) {
                    switch (_h.label) {
                        case 0:
                            executor = this.executors.get(node.type);
                            nodeStarted = Date.now();
                            title = String((_b = (_a = node.data) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : node.id);
                            if (!!executor) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.executionsService.createNodeExecution({
                                    executionId: executionId,
                                    nodeId: node.id,
                                    nodeType: node.type,
                                    status: 'skipped',
                                    input: (_c = node.data) !== null && _c !== void 0 ? _c : {},
                                    output: { reason: 'no-executor' },
                                    durationMs: 0,
                                })];
                        case 1:
                            _h.sent();
                            emit('node.finished', {
                                nodeId: node.id,
                                nodeType: node.type,
                                title: title,
                                status: 'skipped',
                                reason: 'no-executor',
                                durationMs: 0,
                            });
                            return [2 /*return*/, { output: {}, branch: undefined }];
                        case 2:
                            emit('node.started', { nodeId: node.id, nodeType: node.type, title: title });
                            _h.label = 3;
                        case 3:
                            _h.trys.push([3, 6, , 8]);
                            return [4 /*yield*/, executor.execute(node, ctx)];
                        case 4:
                            result = _h.sent();
                            return [4 /*yield*/, this.executionsService.createNodeExecution({
                                    executionId: executionId,
                                    nodeId: node.id,
                                    nodeType: node.type,
                                    status: 'success',
                                    input: (_d = node.data) !== null && _d !== void 0 ? _d : {},
                                    output: result.output,
                                    durationMs: Date.now() - nodeStarted,
                                })];
                        case 5:
                            _h.sent();
                            emit('node.finished', {
                                nodeId: node.id,
                                nodeType: node.type,
                                title: title,
                                status: 'success',
                                branch: (_e = result.branch) !== null && _e !== void 0 ? _e : null,
                                output: result.output,
                                durationMs: Date.now() - nodeStarted,
                            });
                            return [2 /*return*/, result];
                        case 6:
                            error_2 = _h.sent();
                            cancelled = error_2 instanceof engine_types_1.ExecutionCancelledError;
                            message = String((_f = error_2 === null || error_2 === void 0 ? void 0 : error_2.message) !== null && _f !== void 0 ? _f : error_2);
                            return [4 /*yield*/, this.executionsService.createNodeExecution({
                                    executionId: executionId,
                                    nodeId: node.id,
                                    nodeType: node.type,
                                    status: cancelled ? 'cancelled' : 'failed',
                                    input: (_g = node.data) !== null && _g !== void 0 ? _g : {},
                                    output: null,
                                    error: message,
                                    durationMs: Date.now() - nodeStarted,
                                })];
                        case 7:
                            _h.sent();
                            emit('node.finished', {
                                nodeId: node.id,
                                nodeType: node.type,
                                title: title,
                                status: cancelled ? 'cancelled' : 'failed',
                                error: message,
                                durationMs: Date.now() - nodeStarted,
                            });
                            if (cancelled)
                                throw error_2;
                            throw new Error("Node \"".concat(title, "\" (").concat(node.type, ") failed: ").concat(message));
                        case 8: return [2 /*return*/];
                    }
                });
            });
        };
        return EngineService_1;
    }());
    __setFunctionName(_classThis, "EngineService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EngineService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EngineService = _classThis;
}();
exports.EngineService = EngineService;
