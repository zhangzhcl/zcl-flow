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
exports.AppModule = void 0;
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
var core_1 = require("@nestjs/core");
var typeorm_1 = require("@nestjs/typeorm");
var path_1 = require("path");
var fs_1 = require("fs");
var workflows_module_1 = require("./workflows/workflows.module");
var executions_module_1 = require("./executions/executions.module");
var engine_module_1 = require("./engine/engine.module");
var models_module_1 = require("./models/models.module");
var auth_module_1 = require("./auth/auth.module");
var events_module_1 = require("./events/events.module");
var triggers_module_1 = require("./triggers/triggers.module");
var ai_module_1 = require("./ai/ai.module");
var agents_module_1 = require("./agents/agents.module");
var auth_guard_1 = require("./auth/auth.guard");
var workflow_entity_1 = require("./workflows/workflow.entity");
var execution_entity_1 = require("./executions/execution.entity");
var node_execution_entity_1 = require("./executions/node-execution.entity");
var model_config_entity_1 = require("./models/model-config.entity");
var user_entity_1 = require("./auth/user.entity");
var trigger_entity_1 = require("./triggers/trigger.entity");
var agent_entity_1 = require("./agents/agent.entity");
var AppModule = function () {
    var _classDecorators = [(0, common_1.Module)({
            imports: [
                config_1.ConfigModule.forRoot({ isGlobal: true }),
                typeorm_1.TypeOrmModule.forRootAsync({
                    inject: [config_1.ConfigService],
                    useFactory: function (config) {
                        var raw = config.get('DATABASE_PATH', 'data/zcl-flow.sqlite');
                        var dbPath = (0, path_1.isAbsolute)(raw) ? raw : (0, path_1.join)(process.cwd(), raw);
                        (0, fs_1.mkdirSync)((0, path_1.dirname)(dbPath), { recursive: true });
                        return {
                            type: 'better-sqlite3',
                            database: dbPath,
                            entities: [
                                workflow_entity_1.WorkflowEntity,
                                execution_entity_1.ExecutionEntity,
                                node_execution_entity_1.NodeExecutionEntity,
                                model_config_entity_1.ModelConfigEntity,
                                user_entity_1.UserEntity,
                                trigger_entity_1.TriggerEntity,
                                agent_entity_1.AgentEntity,
                                agent_entity_1.AgentConversationEntity,
                                agent_entity_1.AgentMessageEntity,
                            ],
                            synchronize: true,
                        };
                    },
                }),
                events_module_1.EventsModule,
                auth_module_1.AuthModule,
                workflows_module_1.WorkflowsModule,
                executions_module_1.ExecutionsModule,
                engine_module_1.EngineModule,
                models_module_1.ModelsModule,
                triggers_module_1.TriggersModule,
                ai_module_1.AiModule,
                agents_module_1.AgentsModule,
            ],
            providers: [
                // Every route requires a valid bearer token unless marked @Public().
                { provide: core_1.APP_GUARD, useClass: auth_guard_1.AuthGuard },
            ],
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AppModule = _classThis = /** @class */ (function () {
        function AppModule_1() {
        }
        return AppModule_1;
    }());
    __setFunctionName(_classThis, "AppModule");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AppModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AppModule = _classThis;
}();
exports.AppModule = AppModule;
