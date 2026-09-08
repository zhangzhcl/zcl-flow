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
exports.TriggerEntity = void 0;
var typeorm_1 = require("typeorm");
/**
 * An automation entry point for a workflow.
 *
 * - `webhook`: exposes `POST /api/hooks/:token`, callable without a session.
 * - `cron`: fired by the in-process scheduler on a minute heartbeat.
 */
var TriggerEntity = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('triggers')];
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
    var _type_decorators;
    var _type_initializers = [];
    var _type_extraInitializers = [];
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _token_decorators;
    var _token_initializers = [];
    var _token_extraInitializers = [];
    var _cronExpression_decorators;
    var _cronExpression_initializers = [];
    var _cronExpression_extraInitializers = [];
    var _secret_decorators;
    var _secret_initializers = [];
    var _secret_extraInitializers = [];
    var _async_decorators;
    var _async_initializers = [];
    var _async_extraInitializers = [];
    var _payload_decorators;
    var _payload_initializers = [];
    var _payload_extraInitializers = [];
    var _enabled_decorators;
    var _enabled_initializers = [];
    var _enabled_extraInitializers = [];
    var _triggerCount_decorators;
    var _triggerCount_initializers = [];
    var _triggerCount_extraInitializers = [];
    var _lastStatus_decorators;
    var _lastStatus_initializers = [];
    var _lastStatus_extraInitializers = [];
    var _lastTriggeredAt_decorators;
    var _lastTriggeredAt_initializers = [];
    var _lastTriggeredAt_extraInitializers = [];
    var _lastError_decorators;
    var _lastError_initializers = [];
    var _lastError_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var TriggerEntity = _classThis = /** @class */ (function () {
        function TriggerEntity_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.workflowId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _workflowId_initializers, void 0));
            this.ownerId = (__runInitializers(this, _workflowId_extraInitializers), __runInitializers(this, _ownerId_initializers, void 0));
            this.type = (__runInitializers(this, _ownerId_extraInitializers), __runInitializers(this, _type_initializers, void 0));
            this.name = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _name_initializers, void 0));
            /** Secret path segment for webhooks. Empty for cron triggers. */
            this.token = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _token_initializers, void 0));
            /** 5-field cron expression. Empty for webhook triggers. */
            this.cronExpression = (__runInitializers(this, _token_extraInitializers), __runInitializers(this, _cronExpression_initializers, void 0));
            /**
             * Optional HMAC-SHA256 shared secret for webhooks. When set, callers must
             * send `X-ZCL-Flow-Signature: sha256=<hex>` over the raw request body.
             */
            this.secret = (__runInitializers(this, _cronExpression_extraInitializers), __runInitializers(this, _secret_initializers, void 0));
            /**
             * Queue the run instead of executing it inside the request.
             * Recommended for long workflows so the caller is not kept waiting.
             */
            this.async = (__runInitializers(this, _secret_extraInitializers), __runInitializers(this, _async_initializers, void 0));
            /** Static input payload used by cron runs (webhooks use the request body). */
            this.payload = (__runInitializers(this, _async_extraInitializers), __runInitializers(this, _payload_initializers, void 0));
            this.enabled = (__runInitializers(this, _payload_extraInitializers), __runInitializers(this, _enabled_initializers, void 0));
            this.triggerCount = (__runInitializers(this, _enabled_extraInitializers), __runInitializers(this, _triggerCount_initializers, void 0));
            this.lastStatus = (__runInitializers(this, _triggerCount_extraInitializers), __runInitializers(this, _lastStatus_initializers, void 0));
            this.lastTriggeredAt = (__runInitializers(this, _lastStatus_extraInitializers), __runInitializers(this, _lastTriggeredAt_initializers, void 0));
            this.lastError = (__runInitializers(this, _lastTriggeredAt_extraInitializers), __runInitializers(this, _lastError_initializers, void 0));
            this.createdAt = (__runInitializers(this, _lastError_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            __runInitializers(this, _updatedAt_extraInitializers);
        }
        return TriggerEntity_1;
    }());
    __setFunctionName(_classThis, "TriggerEntity");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _workflowId_decorators = [(0, typeorm_1.Index)(), (0, typeorm_1.Column)({ type: 'varchar' })];
        _ownerId_decorators = [(0, typeorm_1.Index)(), (0, typeorm_1.Column)({ type: 'varchar', default: '' })];
        _type_decorators = [(0, typeorm_1.Column)({ type: 'varchar', default: 'webhook' })];
        _name_decorators = [(0, typeorm_1.Column)({ type: 'varchar', length: 120, default: '' })];
        _token_decorators = [(0, typeorm_1.Index)({ unique: true }), (0, typeorm_1.Column)({ type: 'varchar', nullable: true })];
        _cronExpression_decorators = [(0, typeorm_1.Column)({ type: 'varchar', default: '' })];
        _secret_decorators = [(0, typeorm_1.Column)({ type: 'varchar', nullable: true })];
        _async_decorators = [(0, typeorm_1.Column)({ type: 'boolean', default: false })];
        _payload_decorators = [(0, typeorm_1.Column)({ type: 'simple-json', nullable: true })];
        _enabled_decorators = [(0, typeorm_1.Column)({ type: 'boolean', default: true })];
        _triggerCount_decorators = [(0, typeorm_1.Column)({ type: 'integer', default: 0 })];
        _lastStatus_decorators = [(0, typeorm_1.Column)({ type: 'varchar', default: 'idle' })];
        _lastTriggeredAt_decorators = [(0, typeorm_1.Column)({ type: 'datetime', nullable: true })];
        _lastError_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _workflowId_decorators, { kind: "field", name: "workflowId", static: false, private: false, access: { has: function (obj) { return "workflowId" in obj; }, get: function (obj) { return obj.workflowId; }, set: function (obj, value) { obj.workflowId = value; } }, metadata: _metadata }, _workflowId_initializers, _workflowId_extraInitializers);
        __esDecorate(null, null, _ownerId_decorators, { kind: "field", name: "ownerId", static: false, private: false, access: { has: function (obj) { return "ownerId" in obj; }, get: function (obj) { return obj.ownerId; }, set: function (obj, value) { obj.ownerId = value; } }, metadata: _metadata }, _ownerId_initializers, _ownerId_extraInitializers);
        __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
        __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
        __esDecorate(null, null, _token_decorators, { kind: "field", name: "token", static: false, private: false, access: { has: function (obj) { return "token" in obj; }, get: function (obj) { return obj.token; }, set: function (obj, value) { obj.token = value; } }, metadata: _metadata }, _token_initializers, _token_extraInitializers);
        __esDecorate(null, null, _cronExpression_decorators, { kind: "field", name: "cronExpression", static: false, private: false, access: { has: function (obj) { return "cronExpression" in obj; }, get: function (obj) { return obj.cronExpression; }, set: function (obj, value) { obj.cronExpression = value; } }, metadata: _metadata }, _cronExpression_initializers, _cronExpression_extraInitializers);
        __esDecorate(null, null, _secret_decorators, { kind: "field", name: "secret", static: false, private: false, access: { has: function (obj) { return "secret" in obj; }, get: function (obj) { return obj.secret; }, set: function (obj, value) { obj.secret = value; } }, metadata: _metadata }, _secret_initializers, _secret_extraInitializers);
        __esDecorate(null, null, _async_decorators, { kind: "field", name: "async", static: false, private: false, access: { has: function (obj) { return "async" in obj; }, get: function (obj) { return obj.async; }, set: function (obj, value) { obj.async = value; } }, metadata: _metadata }, _async_initializers, _async_extraInitializers);
        __esDecorate(null, null, _payload_decorators, { kind: "field", name: "payload", static: false, private: false, access: { has: function (obj) { return "payload" in obj; }, get: function (obj) { return obj.payload; }, set: function (obj, value) { obj.payload = value; } }, metadata: _metadata }, _payload_initializers, _payload_extraInitializers);
        __esDecorate(null, null, _enabled_decorators, { kind: "field", name: "enabled", static: false, private: false, access: { has: function (obj) { return "enabled" in obj; }, get: function (obj) { return obj.enabled; }, set: function (obj, value) { obj.enabled = value; } }, metadata: _metadata }, _enabled_initializers, _enabled_extraInitializers);
        __esDecorate(null, null, _triggerCount_decorators, { kind: "field", name: "triggerCount", static: false, private: false, access: { has: function (obj) { return "triggerCount" in obj; }, get: function (obj) { return obj.triggerCount; }, set: function (obj, value) { obj.triggerCount = value; } }, metadata: _metadata }, _triggerCount_initializers, _triggerCount_extraInitializers);
        __esDecorate(null, null, _lastStatus_decorators, { kind: "field", name: "lastStatus", static: false, private: false, access: { has: function (obj) { return "lastStatus" in obj; }, get: function (obj) { return obj.lastStatus; }, set: function (obj, value) { obj.lastStatus = value; } }, metadata: _metadata }, _lastStatus_initializers, _lastStatus_extraInitializers);
        __esDecorate(null, null, _lastTriggeredAt_decorators, { kind: "field", name: "lastTriggeredAt", static: false, private: false, access: { has: function (obj) { return "lastTriggeredAt" in obj; }, get: function (obj) { return obj.lastTriggeredAt; }, set: function (obj, value) { obj.lastTriggeredAt = value; } }, metadata: _metadata }, _lastTriggeredAt_initializers, _lastTriggeredAt_extraInitializers);
        __esDecorate(null, null, _lastError_decorators, { kind: "field", name: "lastError", static: false, private: false, access: { has: function (obj) { return "lastError" in obj; }, get: function (obj) { return obj.lastError; }, set: function (obj, value) { obj.lastError = value; } }, metadata: _metadata }, _lastError_initializers, _lastError_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TriggerEntity = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TriggerEntity = _classThis;
}();
exports.TriggerEntity = TriggerEntity;
