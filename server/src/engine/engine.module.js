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
exports.EngineModule = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var executions_module_1 = require("../executions/executions.module");
var llm_module_1 = require("../llm/llm.module");
var models_module_1 = require("../models/models.module");
var workflow_entity_1 = require("../workflows/workflow.entity");
var engine_service_1 = require("./engine.service");
var execution_queue_service_1 = require("./execution-queue.service");
var debug_session_1 = require("./debug-session");
var debug_controller_1 = require("./debug.controller");
var workflow_runner_1 = require("./workflow-runner");
var workflow_runner_provider_1 = require("./workflow-runner-provider");
var node_executors_1 = require("./node-executors");
/**
 * The sub-workflow / loop executors call back into EngineService, which in turn
 * owns the executor registry. forwardRef resolves that intentional cycle.
 */
var EngineModule = function () {
    var _classDecorators = [(0, common_1.Module)({
            imports: [
                typeorm_1.TypeOrmModule.forFeature([workflow_entity_1.WorkflowEntity]),
                (0, common_1.forwardRef)(function () { return executions_module_1.ExecutionsModule; }),
                llm_module_1.LlmModule,
                models_module_1.ModelsModule,
            ],
            controllers: [debug_controller_1.DebugController],
            providers: [
                engine_service_1.EngineService,
                execution_queue_service_1.ExecutionQueueService,
                debug_session_1.DebugSessionService,
                {
                    provide: workflow_runner_1.WORKFLOW_RUNNER,
                    useClass: workflow_runner_provider_1.WorkflowRunnerProvider,
                },
                node_executors_1.StartExecutor,
                node_executors_1.EndExecutor,
                node_executors_1.LlmExecutor,
                node_executors_1.CodeExecutor,
                node_executors_1.ConditionExecutor,
                node_executors_1.HttpExecutor,
                node_executors_1.TemplateExecutor,
                node_executors_1.VariableExecutor,
                node_executors_1.DelayExecutor,
                node_executors_1.SwitchExecutor,
                node_executors_1.SubflowExecutor,
                node_executors_1.LoopExecutor,
                node_executors_1.JsonExtractExecutor,
                node_executors_1.ClassifyExecutor,
                node_executors_1.TextProcessExecutor,
                node_executors_1.AggregateExecutor,
                node_executors_1.NotifyExecutor,
            ],
            exports: [engine_service_1.EngineService, execution_queue_service_1.ExecutionQueueService, debug_session_1.DebugSessionService],
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var EngineModule = _classThis = /** @class */ (function () {
        function EngineModule_1() {
        }
        return EngineModule_1;
    }());
    __setFunctionName(_classThis, "EngineModule");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EngineModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EngineModule = _classThis;
}();
exports.EngineModule = EngineModule;
