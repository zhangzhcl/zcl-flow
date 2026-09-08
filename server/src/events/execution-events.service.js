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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionEventsService = void 0;
var common_1 = require("@nestjs/common");
var rxjs_1 = require("rxjs");
/**
 * In-process pub/sub for live execution progress.
 *
 * Deliberately not persisted: the SQLite tables remain the source of truth,
 * this bus only powers the SSE stream so the editor can highlight nodes while
 * a run is still in flight. A single process instance is sufficient for the
 * local-first deployment model; swapping in Redis later only requires
 * replacing this provider.
 */
var ExecutionEventsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ExecutionEventsService = _classThis = /** @class */ (function () {
        function ExecutionEventsService_1() {
            this.bus = new rxjs_1.Subject();
        }
        ExecutionEventsService_1.prototype.emit = function (event) {
            this.bus.next(__assign(__assign({}, event), { at: Date.now() }));
        };
        /**
         * Returns the event stream for one account, optionally narrowed to a single
         * execution id.
         */
        ExecutionEventsService_1.prototype.stream = function (ownerId, executionId) {
            return this.bus.asObservable().pipe((0, rxjs_1.filter)(function (event) { return event.ownerId === ownerId; }), (0, rxjs_1.filter)(function (event) { return !executionId || event.executionId === executionId; }));
        };
        /** Maps the stream into the SSE envelope expected by Nest's `@Sse()`. */
        ExecutionEventsService_1.prototype.sseStream = function (ownerId, executionId) {
            return this.stream(ownerId, executionId).pipe((0, rxjs_1.map)(function (event) { return ({ data: JSON.stringify(event) }); }));
        };
        return ExecutionEventsService_1;
    }());
    __setFunctionName(_classThis, "ExecutionEventsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ExecutionEventsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ExecutionEventsService = _classThis;
}();
exports.ExecutionEventsService = ExecutionEventsService;
