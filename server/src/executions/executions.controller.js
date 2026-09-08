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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
exports.ExecutionsController = void 0;
var common_1 = require("@nestjs/common");
var ExecutionsController = function () {
    var _classDecorators = [(0, common_1.Controller)('executions')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _findByWorkflow_decorators;
    var _stream_decorators;
    var _overview_decorators;
    var _findOne_decorators;
    var _children_decorators;
    var _cancel_decorators;
    var ExecutionsController = _classThis = /** @class */ (function () {
        function ExecutionsController_1(executions, events, stats, queue) {
            this.executions = (__runInitializers(this, _instanceExtraInitializers), executions);
            this.events = events;
            this.stats = stats;
            this.queue = queue;
        }
        ExecutionsController_1.prototype.findByWorkflow = function (workflowId, user) {
            return this.executions.findByWorkflow(workflowId, user.sub);
        };
        /**
         * Server-sent stream of live execution progress for the current account.
         *
         * Declared before `:id` so the literal path wins the route match.
         * EventSource cannot set headers, so the guard also accepts the token via
         * the `access_token` query parameter for this route.
         */
        ExecutionsController_1.prototype.stream = function (user, executionId) {
            return this.events.sseStream(user.sub, executionId);
        };
        /** Operations dashboard data, optionally scoped to a single workflow. */
        ExecutionsController_1.prototype.overview = function (user, days, workflowId) {
            return __awaiter(this, void 0, void 0, function () {
                var stats;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!workflowId) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.stats.assertWorkflowOwner(workflowId, user.sub)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [4 /*yield*/, this.stats.compute(user.sub, {
                                days: days ? Number(days) : undefined,
                                workflowId: workflowId || undefined,
                            })];
                        case 3:
                            stats = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, stats), { queue: this.queue.stats })];
                    }
                });
            });
        };
        ExecutionsController_1.prototype.findOne = function (id, user) {
            return this.executions.findOneWithNodes(id, user.sub);
        };
        /** Child runs created by sub-workflow / loop nodes. */
        ExecutionsController_1.prototype.children = function (id, user) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.executions.findOwned(id, user.sub)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, this.executions.findChildren(id, user.sub)];
                    }
                });
            });
        };
        /** Cancels a queued or running execution. */
        ExecutionsController_1.prototype.cancel = function (id, user) {
            return __awaiter(this, void 0, void 0, function () {
                var execution, cancelled;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.executions.findOwned(id, user.sub)];
                        case 1:
                            execution = _a.sent();
                            if (execution.status !== 'queued' && execution.status !== 'running') {
                                throw new common_1.BadRequestException("Execution already finished with status \"".concat(execution.status, "\""));
                            }
                            return [4 /*yield*/, this.queue.cancel(id)];
                        case 2:
                            cancelled = _a.sent();
                            if (!!cancelled) return [3 /*break*/, 4];
                            // Not tracked here: the row is stale (e.g. left over from a restart).
                            execution.status = 'cancelled';
                            execution.error = 'Execution cancelled';
                            execution.finishedAt = new Date();
                            return [4 /*yield*/, this.executions.updateExecution(execution)];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4: return [2 /*return*/, { id: id, status: 'cancelled' }];
                    }
                });
            });
        };
        return ExecutionsController_1;
    }());
    __setFunctionName(_classThis, "ExecutionsController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _findByWorkflow_decorators = [(0, common_1.Get)()];
        _stream_decorators = [(0, common_1.Sse)('stream')];
        _overview_decorators = [(0, common_1.Get)('stats')];
        _findOne_decorators = [(0, common_1.Get)(':id')];
        _children_decorators = [(0, common_1.Get)(':id/children')];
        _cancel_decorators = [(0, common_1.Post)(':id/cancel'), (0, common_1.HttpCode)(202)];
        __esDecorate(_classThis, null, _findByWorkflow_decorators, { kind: "method", name: "findByWorkflow", static: false, private: false, access: { has: function (obj) { return "findByWorkflow" in obj; }, get: function (obj) { return obj.findByWorkflow; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _stream_decorators, { kind: "method", name: "stream", static: false, private: false, access: { has: function (obj) { return "stream" in obj; }, get: function (obj) { return obj.stream; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _overview_decorators, { kind: "method", name: "overview", static: false, private: false, access: { has: function (obj) { return "overview" in obj; }, get: function (obj) { return obj.overview; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: function (obj) { return "findOne" in obj; }, get: function (obj) { return obj.findOne; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _children_decorators, { kind: "method", name: "children", static: false, private: false, access: { has: function (obj) { return "children" in obj; }, get: function (obj) { return obj.children; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _cancel_decorators, { kind: "method", name: "cancel", static: false, private: false, access: { has: function (obj) { return "cancel" in obj; }, get: function (obj) { return obj.cancel; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ExecutionsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ExecutionsController = _classThis;
}();
exports.ExecutionsController = ExecutionsController;
