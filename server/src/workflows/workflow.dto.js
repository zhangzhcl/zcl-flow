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
exports.ImportWorkflowDto = exports.RunWorkflowDto = exports.UpdateWorkflowDto = exports.CreateWorkflowDto = void 0;
var class_validator_1 = require("class-validator");
var CreateWorkflowDto = function () {
    var _a;
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _definition_decorators;
    var _definition_initializers = [];
    var _definition_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateWorkflowDto() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.description = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _description_initializers, void 0));
                this.definition = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _definition_initializers, void 0));
                __runInitializers(this, _definition_extraInitializers);
            }
            return CreateWorkflowDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.MaxLength)(120)];
            _description_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _definition_decorators = [(0, class_validator_1.IsObject)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _definition_decorators, { kind: "field", name: "definition", static: false, private: false, access: { has: function (obj) { return "definition" in obj; }, get: function (obj) { return obj.definition; }, set: function (obj, value) { obj.definition = value; } }, metadata: _metadata }, _definition_initializers, _definition_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateWorkflowDto = CreateWorkflowDto;
var UpdateWorkflowDto = function () {
    var _a;
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _definition_decorators;
    var _definition_initializers = [];
    var _definition_extraInitializers = [];
    return _a = /** @class */ (function () {
            function UpdateWorkflowDto() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.description = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _description_initializers, void 0));
                this.definition = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _definition_initializers, void 0));
                __runInitializers(this, _definition_extraInitializers);
            }
            return UpdateWorkflowDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)(), (0, class_validator_1.MaxLength)(120)];
            _description_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _definition_decorators = [(0, class_validator_1.IsObject)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _definition_decorators, { kind: "field", name: "definition", static: false, private: false, access: { has: function (obj) { return "definition" in obj; }, get: function (obj) { return obj.definition; }, set: function (obj, value) { obj.definition = value; } }, metadata: _metadata }, _definition_initializers, _definition_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UpdateWorkflowDto = UpdateWorkflowDto;
var RunWorkflowDto = function () {
    var _a;
    var _input_decorators;
    var _input_initializers = [];
    var _input_extraInitializers = [];
    var _async_decorators;
    var _async_initializers = [];
    var _async_extraInitializers = [];
    var _debug_decorators;
    var _debug_initializers = [];
    var _debug_extraInitializers = [];
    return _a = /** @class */ (function () {
            function RunWorkflowDto() {
                this.input = __runInitializers(this, _input_initializers, void 0);
                /**
                 * Queue the run and return immediately with a `queued` execution.
                 * Progress is then followed over the SSE stream.
                 */
                this.async = (__runInitializers(this, _input_extraInitializers), __runInitializers(this, _async_initializers, void 0));
                /**
                 * Interactive debug options (breakpoints / mocks / pauseOnStart). When
                 * present the run is always queued and driven over the debug REST API.
                 */
                this.debug = (__runInitializers(this, _async_extraInitializers), __runInitializers(this, _debug_initializers, void 0));
                __runInitializers(this, _debug_extraInitializers);
            }
            return RunWorkflowDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _input_decorators = [(0, class_validator_1.IsObject)(), (0, class_validator_1.IsOptional)()];
            _async_decorators = [(0, class_validator_1.IsBoolean)(), (0, class_validator_1.IsOptional)()];
            _debug_decorators = [(0, class_validator_1.IsObject)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _input_decorators, { kind: "field", name: "input", static: false, private: false, access: { has: function (obj) { return "input" in obj; }, get: function (obj) { return obj.input; }, set: function (obj, value) { obj.input = value; } }, metadata: _metadata }, _input_initializers, _input_extraInitializers);
            __esDecorate(null, null, _async_decorators, { kind: "field", name: "async", static: false, private: false, access: { has: function (obj) { return "async" in obj; }, get: function (obj) { return obj.async; }, set: function (obj, value) { obj.async = value; } }, metadata: _metadata }, _async_initializers, _async_extraInitializers);
            __esDecorate(null, null, _debug_decorators, { kind: "field", name: "debug", static: false, private: false, access: { has: function (obj) { return "debug" in obj; }, get: function (obj) { return obj.debug; }, set: function (obj, value) { obj.debug = value; } }, metadata: _metadata }, _debug_initializers, _debug_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.RunWorkflowDto = RunWorkflowDto;
var ImportWorkflowDto = function () {
    var _a;
    var _format_decorators;
    var _format_initializers = [];
    var _format_extraInitializers = [];
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _definition_decorators;
    var _definition_initializers = [];
    var _definition_extraInitializers = [];
    return _a = /** @class */ (function () {
            function ImportWorkflowDto() {
                this.format = __runInitializers(this, _format_initializers, void 0);
                this.name = (__runInitializers(this, _format_extraInitializers), __runInitializers(this, _name_initializers, void 0));
                this.description = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _description_initializers, void 0));
                this.definition = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _definition_initializers, void 0));
                __runInitializers(this, _definition_extraInitializers);
            }
            return ImportWorkflowDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _format_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.MaxLength)(120)];
            _description_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _definition_decorators = [(0, class_validator_1.IsObject)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _format_decorators, { kind: "field", name: "format", static: false, private: false, access: { has: function (obj) { return "format" in obj; }, get: function (obj) { return obj.format; }, set: function (obj, value) { obj.format = value; } }, metadata: _metadata }, _format_initializers, _format_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _definition_decorators, { kind: "field", name: "definition", static: false, private: false, access: { has: function (obj) { return "definition" in obj; }, get: function (obj) { return obj.definition; }, set: function (obj, value) { obj.definition = value; } }, metadata: _metadata }, _definition_initializers, _definition_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.ImportWorkflowDto = ImportWorkflowDto;
