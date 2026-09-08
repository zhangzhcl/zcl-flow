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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTriggerDto = exports.CreateTriggerDto = void 0;
var class_validator_1 = require("class-validator");
var CreateTriggerDto = function () {
    var _a;
    var _workflowId_decorators;
    var _workflowId_initializers = [];
    var _workflowId_extraInitializers = [];
    var _type_decorators;
    var _type_initializers = [];
    var _type_extraInitializers = [];
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _cronExpression_decorators;
    var _cronExpression_initializers = [];
    var _cronExpression_extraInitializers = [];
    var _payload_decorators;
    var _payload_initializers = [];
    var _payload_extraInitializers = [];
    var _enabled_decorators;
    var _enabled_initializers = [];
    var _enabled_extraInitializers = [];
    var _async_decorators;
    var _async_initializers = [];
    var _async_extraInitializers = [];
    var _requireSignature_decorators;
    var _requireSignature_initializers = [];
    var _requireSignature_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateTriggerDto() {
                this.workflowId = __runInitializers(this, _workflowId_initializers, void 0);
                this.type = (__runInitializers(this, _workflowId_extraInitializers), __runInitializers(this, _type_initializers, void 0));
                this.name = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _name_initializers, void 0));
                /** Required when `type === 'cron'`. */
                this.cronExpression = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _cronExpression_initializers, void 0));
                this.payload = (__runInitializers(this, _cronExpression_extraInitializers), __runInitializers(this, _payload_initializers, void 0));
                this.enabled = (__runInitializers(this, _payload_extraInitializers), __runInitializers(this, _enabled_initializers, void 0));
                /** Queue the run instead of executing it inside the webhook request. */
                this.async = (__runInitializers(this, _enabled_extraInitializers), __runInitializers(this, _async_initializers, void 0));
                /** Generate an HMAC signing secret for this webhook. */
                this.requireSignature = (__runInitializers(this, _async_extraInitializers), __runInitializers(this, _requireSignature_initializers, void 0));
                __runInitializers(this, _requireSignature_extraInitializers);
            }
            return CreateTriggerDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _workflowId_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _type_decorators = [(0, class_validator_1.IsIn)(['webhook', 'cron'])];
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)(), (0, class_validator_1.MaxLength)(120)];
            _cronExpression_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _payload_decorators = [(0, class_validator_1.IsObject)(), (0, class_validator_1.IsOptional)()];
            _enabled_decorators = [(0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _async_decorators = [(0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _requireSignature_decorators = [(0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _workflowId_decorators, { kind: "field", name: "workflowId", static: false, private: false, access: { has: function (obj) { return "workflowId" in obj; }, get: function (obj) { return obj.workflowId; }, set: function (obj, value) { obj.workflowId = value; } }, metadata: _metadata }, _workflowId_initializers, _workflowId_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _cronExpression_decorators, { kind: "field", name: "cronExpression", static: false, private: false, access: { has: function (obj) { return "cronExpression" in obj; }, get: function (obj) { return obj.cronExpression; }, set: function (obj, value) { obj.cronExpression = value; } }, metadata: _metadata }, _cronExpression_initializers, _cronExpression_extraInitializers);
            __esDecorate(null, null, _payload_decorators, { kind: "field", name: "payload", static: false, private: false, access: { has: function (obj) { return "payload" in obj; }, get: function (obj) { return obj.payload; }, set: function (obj, value) { obj.payload = value; } }, metadata: _metadata }, _payload_initializers, _payload_extraInitializers);
            __esDecorate(null, null, _enabled_decorators, { kind: "field", name: "enabled", static: false, private: false, access: { has: function (obj) { return "enabled" in obj; }, get: function (obj) { return obj.enabled; }, set: function (obj, value) { obj.enabled = value; } }, metadata: _metadata }, _enabled_initializers, _enabled_extraInitializers);
            __esDecorate(null, null, _async_decorators, { kind: "field", name: "async", static: false, private: false, access: { has: function (obj) { return "async" in obj; }, get: function (obj) { return obj.async; }, set: function (obj, value) { obj.async = value; } }, metadata: _metadata }, _async_initializers, _async_extraInitializers);
            __esDecorate(null, null, _requireSignature_decorators, { kind: "field", name: "requireSignature", static: false, private: false, access: { has: function (obj) { return "requireSignature" in obj; }, get: function (obj) { return obj.requireSignature; }, set: function (obj, value) { obj.requireSignature = value; } }, metadata: _metadata }, _requireSignature_initializers, _requireSignature_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateTriggerDto = CreateTriggerDto;
var UpdateTriggerDto = function () {
    var _a;
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _cronExpression_decorators;
    var _cronExpression_initializers = [];
    var _cronExpression_extraInitializers = [];
    var _payload_decorators;
    var _payload_initializers = [];
    var _payload_extraInitializers = [];
    var _enabled_decorators;
    var _enabled_initializers = [];
    var _enabled_extraInitializers = [];
    var _async_decorators;
    var _async_initializers = [];
    var _async_extraInitializers = [];
    var _requireSignature_decorators;
    var _requireSignature_initializers = [];
    var _requireSignature_extraInitializers = [];
    return _a = /** @class */ (function () {
            function UpdateTriggerDto() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.cronExpression = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _cronExpression_initializers, void 0));
                this.payload = (__runInitializers(this, _cronExpression_extraInitializers), __runInitializers(this, _payload_initializers, void 0));
                this.enabled = (__runInitializers(this, _payload_extraInitializers), __runInitializers(this, _enabled_initializers, void 0));
                this.async = (__runInitializers(this, _enabled_extraInitializers), __runInitializers(this, _async_initializers, void 0));
                /** true issues a new secret, false clears it. */
                this.requireSignature = (__runInitializers(this, _async_extraInitializers), __runInitializers(this, _requireSignature_initializers, void 0));
                __runInitializers(this, _requireSignature_extraInitializers);
            }
            return UpdateTriggerDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)(), (0, class_validator_1.MaxLength)(120)];
            _cronExpression_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _payload_decorators = [(0, class_validator_1.IsObject)(), (0, class_validator_1.IsOptional)()];
            _enabled_decorators = [(0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _async_decorators = [(0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _requireSignature_decorators = [(0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _cronExpression_decorators, { kind: "field", name: "cronExpression", static: false, private: false, access: { has: function (obj) { return "cronExpression" in obj; }, get: function (obj) { return obj.cronExpression; }, set: function (obj, value) { obj.cronExpression = value; } }, metadata: _metadata }, _cronExpression_initializers, _cronExpression_extraInitializers);
            __esDecorate(null, null, _payload_decorators, { kind: "field", name: "payload", static: false, private: false, access: { has: function (obj) { return "payload" in obj; }, get: function (obj) { return obj.payload; }, set: function (obj, value) { obj.payload = value; } }, metadata: _metadata }, _payload_initializers, _payload_extraInitializers);
            __esDecorate(null, null, _enabled_decorators, { kind: "field", name: "enabled", static: false, private: false, access: { has: function (obj) { return "enabled" in obj; }, get: function (obj) { return obj.enabled; }, set: function (obj, value) { obj.enabled = value; } }, metadata: _metadata }, _enabled_initializers, _enabled_extraInitializers);
            __esDecorate(null, null, _async_decorators, { kind: "field", name: "async", static: false, private: false, access: { has: function (obj) { return "async" in obj; }, get: function (obj) { return obj.async; }, set: function (obj, value) { obj.async = value; } }, metadata: _metadata }, _async_initializers, _async_extraInitializers);
            __esDecorate(null, null, _requireSignature_decorators, { kind: "field", name: "requireSignature", static: false, private: false, access: { has: function (obj) { return "requireSignature" in obj; }, get: function (obj) { return obj.requireSignature; }, set: function (obj, value) { obj.requireSignature = value; } }, metadata: _metadata }, _requireSignature_initializers, _requireSignature_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UpdateTriggerDto = UpdateTriggerDto;
