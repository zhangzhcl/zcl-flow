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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeExecutionEntity = void 0;
var typeorm_1 = require("typeorm");
/**
 * Per-node execution record inside a workflow run.
 */
var NodeExecutionEntity = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('node_executions')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _executionId_decorators;
    var _executionId_initializers = [];
    var _executionId_extraInitializers = [];
    var _nodeId_decorators;
    var _nodeId_initializers = [];
    var _nodeId_extraInitializers = [];
    var _nodeType_decorators;
    var _nodeType_initializers = [];
    var _nodeType_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _input_decorators;
    var _input_initializers = [];
    var _input_extraInitializers = [];
    var _output_decorators;
    var _output_initializers = [];
    var _output_extraInitializers = [];
    var _error_decorators;
    var _error_initializers = [];
    var _error_extraInitializers = [];
    var _durationMs_decorators;
    var _durationMs_initializers = [];
    var _durationMs_extraInitializers = [];
    var _startedAt_decorators;
    var _startedAt_initializers = [];
    var _startedAt_extraInitializers = [];
    var NodeExecutionEntity = _classThis = /** @class */ (function () {
        function NodeExecutionEntity_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.executionId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _executionId_initializers, void 0));
            this.nodeId = (__runInitializers(this, _executionId_extraInitializers), __runInitializers(this, _nodeId_initializers, void 0));
            this.nodeType = (__runInitializers(this, _nodeId_extraInitializers), __runInitializers(this, _nodeType_initializers, void 0));
            this.status = (__runInitializers(this, _nodeType_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.input = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _input_initializers, void 0));
            this.output = (__runInitializers(this, _input_extraInitializers), __runInitializers(this, _output_initializers, void 0));
            this.error = (__runInitializers(this, _output_extraInitializers), __runInitializers(this, _error_initializers, void 0));
            this.durationMs = (__runInitializers(this, _error_extraInitializers), __runInitializers(this, _durationMs_initializers, void 0));
            this.startedAt = (__runInitializers(this, _durationMs_extraInitializers), __runInitializers(this, _startedAt_initializers, void 0));
            __runInitializers(this, _startedAt_extraInitializers);
        }
        return NodeExecutionEntity_1;
    }());
    __setFunctionName(_classThis, "NodeExecutionEntity");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _executionId_decorators = [(0, typeorm_1.Index)(), (0, typeorm_1.Column)({ type: 'varchar' })];
        _nodeId_decorators = [(0, typeorm_1.Column)({ type: 'varchar' })];
        _nodeType_decorators = [(0, typeorm_1.Column)({ type: 'varchar' })];
        _status_decorators = [(0, typeorm_1.Column)({ type: 'varchar', default: 'running' })];
        _input_decorators = [(0, typeorm_1.Column)({ type: 'simple-json', nullable: true })];
        _output_decorators = [(0, typeorm_1.Column)({ type: 'simple-json', nullable: true })];
        _error_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _durationMs_decorators = [(0, typeorm_1.Column)({ type: 'integer', default: 0 })];
        _startedAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _executionId_decorators, { kind: "field", name: "executionId", static: false, private: false, access: { has: function (obj) { return "executionId" in obj; }, get: function (obj) { return obj.executionId; }, set: function (obj, value) { obj.executionId = value; } }, metadata: _metadata }, _executionId_initializers, _executionId_extraInitializers);
        __esDecorate(null, null, _nodeId_decorators, { kind: "field", name: "nodeId", static: false, private: false, access: { has: function (obj) { return "nodeId" in obj; }, get: function (obj) { return obj.nodeId; }, set: function (obj, value) { obj.nodeId = value; } }, metadata: _metadata }, _nodeId_initializers, _nodeId_extraInitializers);
        __esDecorate(null, null, _nodeType_decorators, { kind: "field", name: "nodeType", static: false, private: false, access: { has: function (obj) { return "nodeType" in obj; }, get: function (obj) { return obj.nodeType; }, set: function (obj, value) { obj.nodeType = value; } }, metadata: _metadata }, _nodeType_initializers, _nodeType_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _input_decorators, { kind: "field", name: "input", static: false, private: false, access: { has: function (obj) { return "input" in obj; }, get: function (obj) { return obj.input; }, set: function (obj, value) { obj.input = value; } }, metadata: _metadata }, _input_initializers, _input_extraInitializers);
        __esDecorate(null, null, _output_decorators, { kind: "field", name: "output", static: false, private: false, access: { has: function (obj) { return "output" in obj; }, get: function (obj) { return obj.output; }, set: function (obj, value) { obj.output = value; } }, metadata: _metadata }, _output_initializers, _output_extraInitializers);
        __esDecorate(null, null, _error_decorators, { kind: "field", name: "error", static: false, private: false, access: { has: function (obj) { return "error" in obj; }, get: function (obj) { return obj.error; }, set: function (obj, value) { obj.error = value; } }, metadata: _metadata }, _error_initializers, _error_extraInitializers);
        __esDecorate(null, null, _durationMs_decorators, { kind: "field", name: "durationMs", static: false, private: false, access: { has: function (obj) { return "durationMs" in obj; }, get: function (obj) { return obj.durationMs; }, set: function (obj, value) { obj.durationMs = value; } }, metadata: _metadata }, _durationMs_initializers, _durationMs_extraInitializers);
        __esDecorate(null, null, _startedAt_decorators, { kind: "field", name: "startedAt", static: false, private: false, access: { has: function (obj) { return "startedAt" in obj; }, get: function (obj) { return obj.startedAt; }, set: function (obj, value) { obj.startedAt = value; } }, metadata: _metadata }, _startedAt_initializers, _startedAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NodeExecutionEntity = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NodeExecutionEntity = _classThis;
}();
exports.NodeExecutionEntity = NodeExecutionEntity;
