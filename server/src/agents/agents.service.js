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
exports.AgentsService = void 0;
var common_1 = require("@nestjs/common");
var AgentsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AgentsService = _classThis = /** @class */ (function () {
        function AgentsService_1(agents, conversations, messages, workflows, engine) {
            this.agents = agents;
            this.conversations = conversations;
            this.messages = messages;
            this.workflows = workflows;
            this.engine = engine;
        }
        AgentsService_1.prototype.findAll = function (ownerId) {
            return this.agents.find({ where: { ownerId: ownerId }, order: { updatedAt: 'DESC' } });
        };
        AgentsService_1.prototype.findOne = function (id, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var agent;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.agents.findOneBy({ id: id })];
                        case 1:
                            agent = _a.sent();
                            if (!agent)
                                throw new common_1.NotFoundException("Agent ".concat(id, " not found"));
                            if (agent.ownerId !== ownerId)
                                throw new common_1.ForbiddenException('You do not have access to this agent');
                            return [2 /*return*/, agent];
                    }
                });
            });
        };
        AgentsService_1.prototype.create = function (dto, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var workflow, agent;
                var _a, _b, _c, _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0: return [4 /*yield*/, this.workflows.findOne(dto.workflowId, ownerId)];
                        case 1:
                            workflow = _f.sent();
                            agent = this.agents.create({
                                ownerId: ownerId,
                                workflowId: workflow.id,
                                name: ((_a = dto.name) === null || _a === void 0 ? void 0 : _a.trim()) || workflow.name,
                                description: (_c = (_b = dto.description) !== null && _b !== void 0 ? _b : workflow.description) !== null && _c !== void 0 ? _c : '',
                                systemPrompt: (_d = dto.systemPrompt) !== null && _d !== void 0 ? _d : '',
                                status: (_e = dto.status) !== null && _e !== void 0 ? _e : 'published',
                            });
                            return [2 /*return*/, this.agents.save(agent)];
                    }
                });
            });
        };
        AgentsService_1.prototype.update = function (id, dto, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var agent;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id, ownerId)];
                        case 1:
                            agent = _a.sent();
                            if (dto.name !== undefined)
                                agent.name = dto.name;
                            if (dto.description !== undefined)
                                agent.description = dto.description;
                            if (dto.systemPrompt !== undefined)
                                agent.systemPrompt = dto.systemPrompt;
                            if (dto.status !== undefined)
                                agent.status = dto.status;
                            return [2 /*return*/, this.agents.save(agent)];
                    }
                });
            });
        };
        AgentsService_1.prototype.remove = function (id, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var agent, conversations, _i, conversations_1, conversation;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id, ownerId)];
                        case 1:
                            agent = _a.sent();
                            return [4 /*yield*/, this.conversations.find({ where: { agentId: agent.id, ownerId: ownerId } })];
                        case 2:
                            conversations = _a.sent();
                            _i = 0, conversations_1 = conversations;
                            _a.label = 3;
                        case 3:
                            if (!(_i < conversations_1.length)) return [3 /*break*/, 6];
                            conversation = conversations_1[_i];
                            return [4 /*yield*/, this.messages.delete({ conversationId: conversation.id })];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5:
                            _i++;
                            return [3 /*break*/, 3];
                        case 6:
                            if (!conversations.length) return [3 /*break*/, 8];
                            return [4 /*yield*/, this.conversations.remove(conversations)];
                        case 7:
                            _a.sent();
                            _a.label = 8;
                        case 8: return [4 /*yield*/, this.agents.remove(agent)];
                        case 9:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        AgentsService_1.prototype.listConversations = function (agentId, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(agentId, ownerId)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, this.conversations.find({ where: { agentId: agentId, ownerId: ownerId }, order: { updatedAt: 'DESC' } })];
                    }
                });
            });
        };
        AgentsService_1.prototype.createConversation = function (agentId, dto, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var conversation;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.findOne(agentId, ownerId)];
                        case 1:
                            _b.sent();
                            conversation = this.conversations.create({
                                ownerId: ownerId,
                                agentId: agentId,
                                title: ((_a = dto.title) === null || _a === void 0 ? void 0 : _a.trim()) || 'New conversation',
                            });
                            return [2 /*return*/, this.conversations.save(conversation)];
                    }
                });
            });
        };
        AgentsService_1.prototype.getConversation = function (agentId, conversationId, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var conversation, messages;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(agentId, ownerId)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.conversations.findOneBy({ id: conversationId })];
                        case 2:
                            conversation = _a.sent();
                            if (!conversation || conversation.agentId !== agentId || conversation.ownerId !== ownerId) {
                                throw new common_1.NotFoundException('Conversation not found');
                            }
                            return [4 /*yield*/, this.messages.find({
                                    where: { conversationId: conversationId },
                                    order: { createdAt: 'ASC' },
                                })];
                        case 3:
                            messages = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, conversation), { messages: messages })];
                    }
                });
            });
        };
        AgentsService_1.prototype.chat = function (agentId, dto, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var agent, workflow, conversation, _a, historyBefore, userMessage, execution, reply, assistantMessage;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.findOne(agentId, ownerId)];
                        case 1:
                            agent = _b.sent();
                            if (agent.status !== 'published')
                                throw new common_1.ForbiddenException('Agent is not published');
                            return [4 /*yield*/, this.workflows.findOne(agent.workflowId, ownerId)];
                        case 2:
                            workflow = _b.sent();
                            if (!dto.conversationId) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.conversations.findOneBy({ id: dto.conversationId })];
                        case 3:
                            _a = _b.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            _a = null;
                            _b.label = 5;
                        case 5:
                            conversation = _a;
                            if (conversation && (conversation.agentId !== agent.id || conversation.ownerId !== ownerId)) {
                                throw new common_1.NotFoundException('Conversation not found');
                            }
                            if (!!conversation) return [3 /*break*/, 7];
                            return [4 /*yield*/, this.createConversation(agent.id, { title: this.titleFromMessage(dto.message) }, ownerId)];
                        case 6:
                            conversation = _b.sent();
                            _b.label = 7;
                        case 7: return [4 /*yield*/, this.messages.find({
                                where: { conversationId: conversation.id },
                                order: { createdAt: 'ASC' },
                            })];
                        case 8:
                            historyBefore = _b.sent();
                            return [4 /*yield*/, this.messages.save(this.messages.create({
                                    conversationId: conversation.id,
                                    role: 'user',
                                    content: dto.message,
                                    metadata: null,
                                }))];
                        case 9:
                            userMessage = _b.sent();
                            return [4 /*yield*/, this.engine.run(workflow, {
                                    message: dto.message,
                                    input: dto.message,
                                    conversationId: conversation.id,
                                    agent: { id: agent.id, name: agent.name, systemPrompt: agent.systemPrompt },
                                    history: historyBefore.map(function (item) { return ({ role: item.role, content: item.content }); }),
                                })];
                        case 10:
                            execution = _b.sent();
                            reply = this.extractReply(execution.output, execution.error);
                            return [4 /*yield*/, this.messages.save(this.messages.create({
                                    conversationId: conversation.id,
                                    role: 'assistant',
                                    content: reply,
                                    metadata: { executionId: execution.id, status: execution.status },
                                }))];
                        case 11:
                            assistantMessage = _b.sent();
                            conversation.updatedAt = new Date();
                            return [4 /*yield*/, this.conversations.save(conversation)];
                        case 12:
                            _b.sent();
                            return [2 /*return*/, { conversationId: conversation.id, userMessage: userMessage, assistantMessage: assistantMessage, execution: execution }];
                    }
                });
            });
        };
        AgentsService_1.prototype.titleFromMessage = function (message) {
            var compact = message.replace(/\s+/g, ' ').trim();
            return compact.slice(0, 40) || 'New conversation';
        };
        AgentsService_1.prototype.extractReply = function (output, error) {
            var _a, _b;
            if (error)
                return this.formatWorkflowFailure(error);
            if (!output)
                return '';
            var value = (_b = (_a = output.reply) !== null && _a !== void 0 ? _a : output.text) !== null && _b !== void 0 ? _b : output.result;
            if (value == null)
                return JSON.stringify(output, null, 2);
            return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
        };
        AgentsService_1.prototype.formatWorkflowFailure = function (error) {
            if (error.includes('LLM request timed out')) {
                return "Workflow failed: ".concat(error, "\n\nSuggestion: The model provider responded too slowly. You can retry this message, simplify the workflow prompt, or increase LLM_TIMEOUT in server/.env for slower providers such as DeepSeek.");
            }
            return "Workflow failed: ".concat(error);
        };
        return AgentsService_1;
    }());
    __setFunctionName(_classThis, "AgentsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AgentsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AgentsService = _classThis;
}();
exports.AgentsService = AgentsService;
