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
exports.UpdateModelConfigDto = exports.CreateModelConfigDto = void 0;
var class_validator_1 = require("class-validator");
var CreateModelConfigDto = function () {
    var _a;
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _model_decorators;
    var _model_initializers = [];
    var _model_extraInitializers = [];
    var _baseUrl_decorators;
    var _baseUrl_initializers = [];
    var _baseUrl_extraInitializers = [];
    var _apiKey_decorators;
    var _apiKey_initializers = [];
    var _apiKey_extraInitializers = [];
    var _temperature_decorators;
    var _temperature_initializers = [];
    var _temperature_extraInitializers = [];
    var _isDefault_decorators;
    var _isDefault_initializers = [];
    var _isDefault_extraInitializers = [];
    var _enabled_decorators;
    var _enabled_initializers = [];
    var _enabled_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateModelConfigDto() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.model = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _model_initializers, void 0));
                this.baseUrl = (__runInitializers(this, _model_extraInitializers), __runInitializers(this, _baseUrl_initializers, void 0));
                this.apiKey = (__runInitializers(this, _baseUrl_extraInitializers), __runInitializers(this, _apiKey_initializers, void 0));
                this.temperature = (__runInitializers(this, _apiKey_extraInitializers), __runInitializers(this, _temperature_initializers, void 0));
                this.isDefault = (__runInitializers(this, _temperature_extraInitializers), __runInitializers(this, _isDefault_initializers, void 0));
                this.enabled = (__runInitializers(this, _isDefault_extraInitializers), __runInitializers(this, _enabled_initializers, void 0));
                __runInitializers(this, _enabled_extraInitializers);
            }
            return CreateModelConfigDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.MaxLength)(80)];
            _model_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _baseUrl_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _apiKey_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _temperature_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            _isDefault_decorators = [(0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _enabled_decorators = [(0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _model_decorators, { kind: "field", name: "model", static: false, private: false, access: { has: function (obj) { return "model" in obj; }, get: function (obj) { return obj.model; }, set: function (obj, value) { obj.model = value; } }, metadata: _metadata }, _model_initializers, _model_extraInitializers);
            __esDecorate(null, null, _baseUrl_decorators, { kind: "field", name: "baseUrl", static: false, private: false, access: { has: function (obj) { return "baseUrl" in obj; }, get: function (obj) { return obj.baseUrl; }, set: function (obj, value) { obj.baseUrl = value; } }, metadata: _metadata }, _baseUrl_initializers, _baseUrl_extraInitializers);
            __esDecorate(null, null, _apiKey_decorators, { kind: "field", name: "apiKey", static: false, private: false, access: { has: function (obj) { return "apiKey" in obj; }, get: function (obj) { return obj.apiKey; }, set: function (obj, value) { obj.apiKey = value; } }, metadata: _metadata }, _apiKey_initializers, _apiKey_extraInitializers);
            __esDecorate(null, null, _temperature_decorators, { kind: "field", name: "temperature", static: false, private: false, access: { has: function (obj) { return "temperature" in obj; }, get: function (obj) { return obj.temperature; }, set: function (obj, value) { obj.temperature = value; } }, metadata: _metadata }, _temperature_initializers, _temperature_extraInitializers);
            __esDecorate(null, null, _isDefault_decorators, { kind: "field", name: "isDefault", static: false, private: false, access: { has: function (obj) { return "isDefault" in obj; }, get: function (obj) { return obj.isDefault; }, set: function (obj, value) { obj.isDefault = value; } }, metadata: _metadata }, _isDefault_initializers, _isDefault_extraInitializers);
            __esDecorate(null, null, _enabled_decorators, { kind: "field", name: "enabled", static: false, private: false, access: { has: function (obj) { return "enabled" in obj; }, get: function (obj) { return obj.enabled; }, set: function (obj, value) { obj.enabled = value; } }, metadata: _metadata }, _enabled_initializers, _enabled_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateModelConfigDto = CreateModelConfigDto;
var UpdateModelConfigDto = function () {
    var _a;
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _model_decorators;
    var _model_initializers = [];
    var _model_extraInitializers = [];
    var _baseUrl_decorators;
    var _baseUrl_initializers = [];
    var _baseUrl_extraInitializers = [];
    var _apiKey_decorators;
    var _apiKey_initializers = [];
    var _apiKey_extraInitializers = [];
    var _temperature_decorators;
    var _temperature_initializers = [];
    var _temperature_extraInitializers = [];
    var _isDefault_decorators;
    var _isDefault_initializers = [];
    var _isDefault_extraInitializers = [];
    var _enabled_decorators;
    var _enabled_initializers = [];
    var _enabled_extraInitializers = [];
    return _a = /** @class */ (function () {
            function UpdateModelConfigDto() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.model = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _model_initializers, void 0));
                this.baseUrl = (__runInitializers(this, _model_extraInitializers), __runInitializers(this, _baseUrl_initializers, void 0));
                /** Empty string keeps the existing key. */
                this.apiKey = (__runInitializers(this, _baseUrl_extraInitializers), __runInitializers(this, _apiKey_initializers, void 0));
                this.temperature = (__runInitializers(this, _apiKey_extraInitializers), __runInitializers(this, _temperature_initializers, void 0));
                this.isDefault = (__runInitializers(this, _temperature_extraInitializers), __runInitializers(this, _isDefault_initializers, void 0));
                this.enabled = (__runInitializers(this, _isDefault_extraInitializers), __runInitializers(this, _enabled_initializers, void 0));
                __runInitializers(this, _enabled_extraInitializers);
            }
            return UpdateModelConfigDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)(), (0, class_validator_1.MaxLength)(80)];
            _model_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _baseUrl_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _apiKey_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _temperature_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.IsOptional)()];
            _isDefault_decorators = [(0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _enabled_decorators = [(0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _model_decorators, { kind: "field", name: "model", static: false, private: false, access: { has: function (obj) { return "model" in obj; }, get: function (obj) { return obj.model; }, set: function (obj, value) { obj.model = value; } }, metadata: _metadata }, _model_initializers, _model_extraInitializers);
            __esDecorate(null, null, _baseUrl_decorators, { kind: "field", name: "baseUrl", static: false, private: false, access: { has: function (obj) { return "baseUrl" in obj; }, get: function (obj) { return obj.baseUrl; }, set: function (obj, value) { obj.baseUrl = value; } }, metadata: _metadata }, _baseUrl_initializers, _baseUrl_extraInitializers);
            __esDecorate(null, null, _apiKey_decorators, { kind: "field", name: "apiKey", static: false, private: false, access: { has: function (obj) { return "apiKey" in obj; }, get: function (obj) { return obj.apiKey; }, set: function (obj, value) { obj.apiKey = value; } }, metadata: _metadata }, _apiKey_initializers, _apiKey_extraInitializers);
            __esDecorate(null, null, _temperature_decorators, { kind: "field", name: "temperature", static: false, private: false, access: { has: function (obj) { return "temperature" in obj; }, get: function (obj) { return obj.temperature; }, set: function (obj, value) { obj.temperature = value; } }, metadata: _metadata }, _temperature_initializers, _temperature_extraInitializers);
            __esDecorate(null, null, _isDefault_decorators, { kind: "field", name: "isDefault", static: false, private: false, access: { has: function (obj) { return "isDefault" in obj; }, get: function (obj) { return obj.isDefault; }, set: function (obj, value) { obj.isDefault = value; } }, metadata: _metadata }, _isDefault_initializers, _isDefault_extraInitializers);
            __esDecorate(null, null, _enabled_decorators, { kind: "field", name: "enabled", static: false, private: false, access: { has: function (obj) { return "enabled" in obj; }, get: function (obj) { return obj.enabled; }, set: function (obj, value) { obj.enabled = value; } }, metadata: _metadata }, _enabled_initializers, _enabled_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UpdateModelConfigDto = UpdateModelConfigDto;
