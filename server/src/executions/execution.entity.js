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
exports.ExecutionEntity = void 0;
var typeorm_1 = require("typeorm");
/**
 * A single run of a workflow.
 */
var ExecutionEntity = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('executions')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _workflowId_decorators;
    var _workflowId_initializers = [];
    var _workflowId_extraInitializers = [];
    var _ownerId_decorators;
    var _ownerId_initializers = [];
    var _ownerId_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _triggerType_decorators;
    var _triggerType_initializers = [];
    var _triggerType_extraInitializers = [];
    var _triggerId_decorators;
    var _triggerId_initializers = [];
    var _triggerId_extraInitializers = [];
    var _parentExecutionId_decorators;
    var _parentExecutionId_initializers = [];
    var _parentExecutionId_extraInitializers = [];
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
    var _finishedAt_decorators;
    var _finishedAt_initializers = [];
    var _finishedAt_extraInitializers = [];
    var ExecutionEntity = _classThis = /** @class */ (function () {
        function ExecutionEntity_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.workflowId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _workflowId_initializers, void 0));
            /** Denormalised owner id so execution history can be filtered directly. */
            this.ownerId = (__runInitializers(this, _workflowId_extraInitializers), __runInitializers(this, _ownerId_initializers, void 0));
            this.status = (__runInitializers(this, _ownerId_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            /** How the run was started, so history can distinguish automation from manual tests. */
            this.triggerType = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _triggerType_initializers, void 0));
            /** Trigger that produced the run, when applicable. */
            this.triggerId = (__runInitializers(this, _triggerType_extraInitializers), __runInitializers(this, _triggerId_initializers, void 0));
            /**
             * Parent run when this execution came from a sub-workflow node.
             * The history list only shows top-level runs (null parent).
             */
            this.parentExecutionId = (__runInitializers(this, _triggerId_extraInitializers), __runInitializers(this, _parentExecutionId_initializers, void 0));
            this.input = (__runInitializers(this, _parentExecutionId_extraInitializers), __runInitializers(this, _input_initializers, void 0));
            this.output = (__runInitializers(this, _input_extraInitializers), __runInitializers(this, _output_initializers, void 0));
            this.error = (__runInitializers(this, _output_extraInitializers), __runInitializers(this, _error_initializers, void 0));
            this.durationMs = (__runInitializers(this, _error_extraInitializers), __runInitializers(this, _durationMs_initializers, void 0));
            this.startedAt = (__runInitializers(this, _durationMs_extraInitializers), __runInitializers(this, _startedAt_initializers, void 0));
            this.finishedAt = (__runInitializers(this, _startedAt_extraInitializers), __runInitializers(this, _finishedAt_initializers, void 0));
            __runInitializers(this, _finishedAt_extraInitializers);
        }
        return ExecutionEntity_1;
    }());
    __setFunctionName(_classThis, "ExecutionEntity");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _workflowId_decorators = [(0, typeorm_1.Index)(), (0, typeorm_1.Column)({ type: 'varchar' })];
        _ownerId_decorators = [(0, typeorm_1.Index)(), (0, typeorm_1.Column)({ type: 'varchar', default: '' })];
        _status_decorators = [(0, typeorm_1.Column)({ type: 'varchar', default: 'running' })];
        _triggerType_decorators = [(0, typeorm_1.Column)({ type: 'varchar', default: 'manual' })];
        _triggerId_decorators = [(0, typeorm_1.Column)({ type: 'varchar', nullable: true })];
        _parentExecutionId_decorators = [(0, typeorm_1.Index)(), (0, typeorm_1.Column)({ type: 'varchar', nullable: true })];
        _input_decorators = [(0, typeorm_1.Column)({ type: 'simple-json', nullable: true })];
        _output_decorators = [(0, typeorm_1.Column)({ type: 'simple-json', nullable: true })];
        _error_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _durationMs_decorators = [(0, typeorm_1.Column)({ type: 'integer', default: 0 })];
        _startedAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _finishedAt_decorators = [(0, typeorm_1.Column)({ type: 'datetime', nullable: true })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _workflowId_decorators, { kind: "field", name: "workflowId", static: false, private: false, access: { has: function (obj) { return "workflowId" in obj; }, get: function (obj) { return obj.workflowId; }, set: function (obj, value) { obj.workflowId = value; } }, metadata: _metadata }, _workflowId_initializers, _workflowId_extraInitializers);
        __esDecorate(null, null, _ownerId_decorators, { kind: "field", name: "ownerId", static: false, private: false, access: { has: function (obj) { return "ownerId" in obj; }, get: function (obj) { return obj.ownerId; }, set: function (obj, value) { obj.ownerId = value; } }, metadata: _metadata }, _ownerId_initializers, _ownerId_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _triggerType_decorators, { kind: "field", name: "triggerType", static: false, private: false, access: { has: function (obj) { return "triggerType" in obj; }, get: function (obj) { return obj.triggerType; }, set: function (obj, value) { obj.triggerType = value; } }, metadata: _metadata }, _triggerType_initializers, _triggerType_extraInitializers);
        __esDecorate(null, null, _triggerId_decorators, { kind: "field", name: "triggerId", static: false, private: false, access: { has: function (obj) { return "triggerId" in obj; }, get: function (obj) { return obj.triggerId; }, set: function (obj, value) { obj.triggerId = value; } }, metadata: _metadata }, _triggerId_initializers, _triggerId_extraInitializers);
        __esDecorate(null, null, _parentExecutionId_decorators, { kind: "field", name: "parentExecutionId", static: false, private: false, access: { has: function (obj) { return "parentExecutionId" in obj; }, get: function (obj) { return obj.parentExecutionId; }, set: function (obj, value) { obj.parentExecutionId = value; } }, metadata: _metadata }, _parentExecutionId_initializers, _parentExecutionId_extraInitializers);
        __esDecorate(null, null, _input_decorators, { kind: "field", name: "input", static: false, private: false, access: { has: function (obj) { return "input" in obj; }, get: function (obj) { return obj.input; }, set: function (obj, value) { obj.input = value; } }, metadata: _metadata }, _input_initializers, _input_extraInitializers);
        __esDecorate(null, null, _output_decorators, { kind: "field", name: "output", static: false, private: false, access: { has: function (obj) { return "output" in obj; }, get: function (obj) { return obj.output; }, set: function (obj, value) { obj.output = value; } }, metadata: _metadata }, _output_initializers, _output_extraInitializers);
        __esDecorate(null, null, _error_decorators, { kind: "field", name: "error", static: false, private: false, access: { has: function (obj) { return "error" in obj; }, get: function (obj) { return obj.error; }, set: function (obj, value) { obj.error = value; } }, metadata: _metadata }, _error_initializers, _error_extraInitializers);
        __esDecorate(null, null, _durationMs_decorators, { kind: "field", name: "durationMs", static: false, private: false, access: { has: function (obj) { return "durationMs" in obj; }, get: function (obj) { return obj.durationMs; }, set: function (obj, value) { obj.durationMs = value; } }, metadata: _metadata }, _durationMs_initializers, _durationMs_extraInitializers);
        __esDecorate(null, null, _startedAt_decorators, { kind: "field", name: "startedAt", static: false, private: false, access: { has: function (obj) { return "startedAt" in obj; }, get: function (obj) { return obj.startedAt; }, set: function (obj, value) { obj.startedAt = value; } }, metadata: _metadata }, _startedAt_initializers, _startedAt_extraInitializers);
        __esDecorate(null, null, _finishedAt_decorators, { kind: "field", name: "finishedAt", static: false, private: false, access: { has: function (obj) { return "finishedAt" in obj; }, get: function (obj) { return obj.finishedAt; }, set: function (obj, value) { obj.finishedAt = value; } }, metadata: _metadata }, _finishedAt_initializers, _finishedAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ExecutionEntity = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ExecutionEntity = _classThis;
}();
exports.ExecutionEntity = ExecutionEntity;
