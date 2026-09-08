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
exports.DebugSessionService = exports.DebugSession = void 0;
var common_1 = require("@nestjs/common");
var vm = require("vm");
var engine_types_1 = require("./engine.types");
var template_util_1 = require("./template.util");
/** Evaluate a debug breakpoint expression in the same sandbox style as condition nodes. */
function evaluateBreakpointCondition(expression, node, ctx) {
    var _a, _b;
    var trimmed = expression.trim();
    if (!trimmed)
        return true;
    try {
        var resolved = String((_a = (0, template_util_1.interpolate)(trimmed, ctx)) !== null && _a !== void 0 ? _a : 'false');
        var sandbox = {
            input: ctx.input,
            nodes: ctx.outputs,
            variables: ctx.variables,
            current: { id: node.id, type: node.type, data: (_b = node.data) !== null && _b !== void 0 ? _b : {} },
        };
        var context = vm.createContext(sandbox, {
            codeGeneration: { strings: false, wasm: false },
        });
        return Boolean(new vm.Script("(".concat(resolved, ")")).runInContext(context, { timeout: 1000 }));
    }
    catch (_c) {
        return false;
    }
}
/**
 * Interactive control state for one debug run.
 *
 * The engine calls `beforeNode` ahead of every node execution. When the run is
 * single-stepping or the node carries a breakpoint, the session emits a
 * `debug.paused` event (with a full variable snapshot for the monitor) and then
 * blocks on a promise "gate" until the user issues step / continue / stop over
 * the debug REST API. This yields classic debugger semantics without touching
 * the topological scheduler: the run simply awaits between nodes.
 */
var DebugSession = /** @class */ (function () {
    function DebugSession(executionId, ownerId, config) {
        var _a, _b, _c, _d;
        this.executionId = executionId;
        this.ownerId = ownerId;
        this.breakpoints = new Set();
        this.conditions = new Map();
        this.mocks = new Map();
        this.gate = null;
        this.stopped = false;
        this.pausedNodeId = null;
        this.stepCount = 0;
        this.lastSnapshot = null;
        for (var _i = 0, _e = (_a = config.breakpoints) !== null && _a !== void 0 ? _a : []; _i < _e.length; _i++) {
            var id = _e[_i];
            this.breakpoints.add(id);
        }
        for (var _f = 0, _g = Object.entries((_b = config.conditions) !== null && _b !== void 0 ? _b : {}); _f < _g.length; _f++) {
            var _h = _g[_f], nodeId = _h[0], expression = _h[1];
            if (expression.trim())
                this.conditions.set(nodeId, expression);
        }
        for (var _j = 0, _k = Object.entries((_c = config.mocks) !== null && _c !== void 0 ? _c : {}); _j < _k.length; _j++) {
            var _l = _k[_j], nodeId = _l[0], mock = _l[1];
            this.mocks.set(nodeId, mock);
        }
        this.stepRequested = (_d = config.pauseOnStart) !== null && _d !== void 0 ? _d : true;
    }
    /** Captures the observable state of the run for the variable monitor. */
    DebugSession.prototype.snapshot = function (ctx) {
        return {
            input: __assign({}, ctx.input),
            variables: __assign({}, ctx.variables),
            outputs: __assign({}, ctx.outputs),
        };
    };
    /**
     * Pauses before `node` when stepping or on a breakpoint, blocking until the
     * user resumes. Throws when the run has been stopped so the engine unwinds
     * into the `cancelled` status.
     */
    DebugSession.prototype.beforeNode = function (node, ctx, emit) {
        return __awaiter(this, void 0, void 0, function () {
            var condition, breakpointMatched, shouldPause;
            var _this = this;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.stopped)
                            throw new engine_types_1.ExecutionCancelledError('Debug run stopped');
                        condition = this.conditions.get(node.id);
                        breakpointMatched = this.breakpoints.has(node.id) && (!condition || evaluateBreakpointCondition(condition, node, ctx));
                        shouldPause = this.stepRequested || breakpointMatched;
                        if (!shouldPause)
                            return [2 /*return*/];
                        this.pausedNodeId = node.id;
                        this.stepCount += 1;
                        this.lastSnapshot = this.snapshot(ctx);
                        emit('debug.paused', {
                            nodeId: node.id,
                            nodeType: node.type,
                            title: String((_b = (_a = node.data) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : node.id),
                            step: this.stepCount,
                            snapshot: this.lastSnapshot,
                        });
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                _this.gate = { resolve: resolve, reject: reject };
                            })];
                    case 1:
                        _c.sent();
                        this.gate = null;
                        if (this.stopped)
                            throw new engine_types_1.ExecutionCancelledError('Debug run stopped');
                        this.pausedNodeId = null;
                        emit('debug.resumed', { nodeId: node.id });
                        return [2 /*return*/];
                }
            });
        });
    };
    DebugSession.prototype.getMock = function (nodeId) {
        return this.mocks.get(nodeId);
    };
    /** Executes exactly one more node, then pauses again. */
    DebugSession.prototype.step = function () {
        var _a;
        this.stepRequested = true;
        (_a = this.gate) === null || _a === void 0 ? void 0 : _a.resolve();
    };
    /** Runs freely until the next breakpoint (or the end). */
    DebugSession.prototype.continueRun = function () {
        var _a;
        this.stepRequested = false;
        (_a = this.gate) === null || _a === void 0 ? void 0 : _a.resolve();
    };
    /**
     * Aborts a paused run by rejecting the gate. The engine maps the resulting
     * ExecutionCancelledError to the `cancelled` status. The debug controller
     * additionally aborts the queue signal so an in-flight (non-paused) node is
     * interrupted too.
     */
    DebugSession.prototype.stop = function () {
        var _a;
        this.stopped = true;
        (_a = this.gate) === null || _a === void 0 ? void 0 : _a.reject(new engine_types_1.ExecutionCancelledError('Debug run stopped'));
    };
    /** Live-updates breakpoints / mocks while a run is in flight. */
    DebugSession.prototype.update = function (config) {
        if (config.breakpoints) {
            this.breakpoints.clear();
            for (var _i = 0, _a = config.breakpoints; _i < _a.length; _i++) {
                var id = _a[_i];
                this.breakpoints.add(id);
            }
        }
        if (config.conditions) {
            this.conditions.clear();
            for (var _b = 0, _c = Object.entries(config.conditions); _b < _c.length; _b++) {
                var _d = _c[_b], nodeId = _d[0], expression = _d[1];
                if (expression.trim())
                    this.conditions.set(nodeId, expression);
            }
        }
        if (config.mocks) {
            this.mocks.clear();
            for (var _e = 0, _f = Object.entries(config.mocks); _e < _f.length; _e++) {
                var _g = _f[_e], nodeId = _g[0], mock = _g[1];
                this.mocks.set(nodeId, mock);
            }
        }
    };
    DebugSession.prototype.getState = function () {
        return {
            executionId: this.executionId,
            pausedNodeId: this.pausedNodeId,
            step: this.stepCount,
            breakpoints: __spreadArray([], this.breakpoints, true),
            conditions: Object.fromEntries(this.conditions),
            mocks: Object.fromEntries(this.mocks),
            snapshot: this.lastSnapshot,
            stopped: this.stopped,
        };
    };
    return DebugSession;
}());
exports.DebugSession = DebugSession;
/**
 * Registry of live debug sessions keyed by execution id. Sessions are created
 * by the engine when a debug run starts and removed when it finishes, so a
 * missing entry simply means "not a debug run (or already done)".
 */
var DebugSessionService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var DebugSessionService = _classThis = /** @class */ (function () {
        function DebugSessionService_1() {
            this.sessions = new Map();
        }
        DebugSessionService_1.prototype.create = function (executionId, ownerId, config) {
            var session = new DebugSession(executionId, ownerId, config);
            this.sessions.set(executionId, session);
            return session;
        };
        DebugSessionService_1.prototype.get = function (executionId) {
            return this.sessions.get(executionId);
        };
        DebugSessionService_1.prototype.remove = function (executionId) {
            this.sessions.delete(executionId);
        };
        return DebugSessionService_1;
    }());
    __setFunctionName(_classThis, "DebugSessionService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DebugSessionService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DebugSessionService = _classThis;
}();
exports.DebugSessionService = DebugSessionService;
