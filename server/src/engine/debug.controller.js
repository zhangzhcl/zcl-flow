"use strict";
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
exports.DebugController = void 0;
var common_1 = require("@nestjs/common");
/**
 * Interactive control surface for debug runs.
 *
 * A debug run is enqueued like any async run; the engine registers a
 * DebugSession for it, and these endpoints drive that session (pause / step /
 * continue / stop / live-update breakpoints and mocks). Routes live under
 * `/executions/:id/debug` and are distinct in depth or literal segment from the
 * ExecutionsController routes, so there is no match conflict.
 */
var DebugController = function () {
    var _classDecorators = [(0, common_1.Controller)('executions')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _state_decorators;
    var _step_decorators;
    var _continueRun_decorators;
    var _stop_decorators;
    var _update_decorators;
    var DebugController = _classThis = /** @class */ (function () {
        function DebugController_1(debugSessions, queue) {
            this.debugSessions = (__runInitializers(this, _instanceExtraInitializers), debugSessions);
            this.queue = queue;
        }
        /** Resolves the caller's session or 404s (unknown / not owned / finished). */
        DebugController_1.prototype.getSession = function (id, user) {
            var session = this.debugSessions.get(id);
            if (!session || session.ownerId !== user.sub) {
                throw new common_1.NotFoundException('No active debug session for this execution');
            }
            return session;
        };
        /** Current pause / breakpoint / mock / snapshot state of the debug run. */
        DebugController_1.prototype.state = function (id, user) {
            return this.getSession(id, user).getState();
        };
        /** Executes exactly one more node, then pauses again. */
        DebugController_1.prototype.step = function (id, user) {
            this.getSession(id, user).step();
            return { ok: true };
        };
        /** Runs freely until the next breakpoint (or the end). */
        DebugController_1.prototype.continueRun = function (id, user) {
            this.getSession(id, user).continueRun();
            return { ok: true };
        };
        /**
         * Stops the debug run. Rejecting the gate unwinds a paused run; aborting the
         * queue signal additionally interrupts a node that is mid-flight.
         */
        DebugController_1.prototype.stop = function (id, user) {
            return __awaiter(this, void 0, void 0, function () {
                var session;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            session = this.getSession(id, user);
                            session.stop();
                            return [4 /*yield*/, this.queue.cancel(id)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, { ok: true }];
                    }
                });
            });
        };
        /** Live-updates breakpoints and mocks while the run is in flight. */
        DebugController_1.prototype.update = function (id, config, user) {
            var session = this.getSession(id, user);
            session.update(config !== null && config !== void 0 ? config : {});
            return session.getState();
        };
        return DebugController_1;
    }());
    __setFunctionName(_classThis, "DebugController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _state_decorators = [(0, common_1.Get)(':id/debug')];
        _step_decorators = [(0, common_1.Post)(':id/debug/step'), (0, common_1.HttpCode)(200)];
        _continueRun_decorators = [(0, common_1.Post)(':id/debug/continue'), (0, common_1.HttpCode)(200)];
        _stop_decorators = [(0, common_1.Post)(':id/debug/stop'), (0, common_1.HttpCode)(200)];
        _update_decorators = [(0, common_1.Patch)(':id/debug')];
        __esDecorate(_classThis, null, _state_decorators, { kind: "method", name: "state", static: false, private: false, access: { has: function (obj) { return "state" in obj; }, get: function (obj) { return obj.state; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _step_decorators, { kind: "method", name: "step", static: false, private: false, access: { has: function (obj) { return "step" in obj; }, get: function (obj) { return obj.step; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _continueRun_decorators, { kind: "method", name: "continueRun", static: false, private: false, access: { has: function (obj) { return "continueRun" in obj; }, get: function (obj) { return obj.continueRun; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _stop_decorators, { kind: "method", name: "stop", static: false, private: false, access: { has: function (obj) { return "stop" in obj; }, get: function (obj) { return obj.stop; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: function (obj) { return "update" in obj; }, get: function (obj) { return obj.update; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DebugController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DebugController = _classThis;
}();
exports.DebugController = DebugController;
