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
exports.WorkflowGeneratorService = void 0;
var common_1 = require("@nestjs/common");
var pos = function (x, y) {
    if (y === void 0) { y = 0; }
    return ({ position: { x: x, y: y } });
};
function extractJson(text) {
    var _a;
    var fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    var candidate = (_a = fenced === null || fenced === void 0 ? void 0 : fenced[1]) !== null && _a !== void 0 ? _a : text;
    var start = candidate.indexOf('{');
    var end = candidate.lastIndexOf('}');
    if (start < 0 || end <= start)
        return null;
    try {
        return JSON.parse(candidate.slice(start, end + 1));
    }
    catch (_b) {
        return null;
    }
}
function isValidDraft(value) {
    return (value &&
        typeof value.name === 'string' &&
        value.definition &&
        Array.isArray(value.definition.nodes) &&
        Array.isArray(value.definition.edges));
}
var WorkflowGeneratorService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var WorkflowGeneratorService = _classThis = /** @class */ (function () {
        function WorkflowGeneratorService_1(llm, models) {
            this.llm = llm;
            this.models = models;
        }
        WorkflowGeneratorService_1.prototype.generate = function (prompt) {
            return __awaiter(this, void 0, void 0, function () {
                var config, response, parsed;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.models.resolveConfig()];
                        case 1:
                            config = _b.sent();
                            return [4 /*yield*/, this.llm.complete({
                                    config: config,
                                    temperature: 0.2,
                                    systemPrompt: 'You are a ZCL Flow workflow architect. Return only strict JSON. Do not include markdown.',
                                    prompt: this.buildPrompt(prompt),
                                })];
                        case 2:
                            response = _b.sent();
                            if (!response.mock) {
                                parsed = extractJson(response.text);
                                if (isValidDraft(parsed)) {
                                    return [2 /*return*/, {
                                            name: parsed.name.slice(0, 120),
                                            description: String((_a = parsed.description) !== null && _a !== void 0 ? _a : ''),
                                            definition: parsed.definition,
                                            source: 'ai',
                                            raw: response.text,
                                        }];
                                }
                            }
                            return [2 /*return*/, this.fallback(prompt, response.text)];
                    }
                });
            });
        };
        WorkflowGeneratorService_1.prototype.buildPrompt = function (prompt) {
            return "Generate a ZCL Flow workflow for this requirement:\n".concat(prompt, "\n\nReturn JSON exactly in this shape:\n{\n  \"name\": \"short workflow name\",\n  \"description\": \"what it does\",\n  \"definition\": {\n    \"nodes\": [\n      {\"id\":\"start_0\",\"type\":\"start\",\"meta\":{\"position\":{\"x\":0,\"y\":0}},\"data\":{\"title\":\"Start\"}},\n      {\"id\":\"llm_1\",\"type\":\"llm\",\"meta\":{\"position\":{\"x\":300,\"y\":0}},\"data\":{\"title\":\"LLM\",\"prompt\":\"...\"}},\n      {\"id\":\"end_0\",\"type\":\"end\",\"meta\":{\"position\":{\"x\":600,\"y\":0}},\"data\":{\"title\":\"End\",\"outputs\":{\"reply\":\"{{nodes.llm_1.text}}\"}}}\n    ],\n    \"edges\": [{\"sourceNodeID\":\"start_0\",\"targetNodeID\":\"llm_1\"},{\"sourceNodeID\":\"llm_1\",\"targetNodeID\":\"end_0\"}]\n  }\n}\n\nAllowed node types include start, end, llm, code, condition, switch, template, variable, json, classify, text, aggregate, notify. Use {{input.message}} for chat input. Keep it runnable.");
        };
        WorkflowGeneratorService_1.prototype.fallback = function (prompt, raw) {
            var lower = prompt.toLowerCase();
            if (lower.includes('客服') || lower.includes('工单') || lower.includes('support')) {
                return this.supportDraft(raw);
            }
            if (lower.includes('内容') || lower.includes('文案') || lower.includes('文章') || lower.includes('content')) {
                return this.contentDraft(raw);
            }
            return this.assistantDraft(prompt, raw);
        };
        WorkflowGeneratorService_1.prototype.assistantDraft = function (prompt, raw) {
            return {
                name: 'AI 助手 Agent 工作流',
                description: '接收用户消息，调用默认模型生成回复。',
                source: 'fallback',
                raw: raw,
                definition: {
                    nodes: [
                        { id: 'start_0', type: 'start', meta: pos(0), data: { title: '用户消息' } },
                        {
                            id: 'llm_1',
                            type: 'llm',
                            meta: pos(320),
                            data: {
                                title: '生成回复',
                                systemPrompt: '你是一个可靠的 AI Agent，回答要清晰、简洁、可执行。',
                                prompt: "\u7528\u6237\u9700\u6C42\uFF1A".concat(prompt, "\n\n\u5F53\u524D\u6D88\u606F\uFF1A{{input.message}}\n\n\u5386\u53F2\u4E0A\u4E0B\u6587\uFF1A{{input.history}}"),
                            },
                        },
                        {
                            id: 'end_0',
                            type: 'end',
                            meta: pos(640),
                            data: { title: '回复用户', outputs: { reply: '{{nodes.llm_1.text}}' } },
                        },
                    ],
                    edges: [
                        { sourceNodeID: 'start_0', targetNodeID: 'llm_1' },
                        { sourceNodeID: 'llm_1', targetNodeID: 'end_0' },
                    ],
                },
            };
        };
        WorkflowGeneratorService_1.prototype.supportDraft = function (raw) {
            return {
                name: '客服工单分流 Agent',
                description: '识别用户问题类型，并生成对应客服回复。',
                source: 'fallback',
                raw: raw,
                definition: {
                    nodes: [
                        { id: 'start_0', type: 'start', meta: pos(0), data: { title: '用户问题' } },
                        {
                            id: 'classify_1',
                            type: 'classify',
                            meta: pos(300),
                            data: {
                                title: '意图分类',
                                input: '{{input.message}}',
                                categories: '[{"name":"售前咨询","description":"产品、价格、方案咨询"},{"name":"技术支持","description":"报错、集成、使用问题"},{"name":"投诉反馈","description":"负面反馈、退款、投诉"}]',
                            },
                        },
                        {
                            id: 'llm_1',
                            type: 'llm',
                            meta: pos(600),
                            data: {
                                title: '客服回复',
                                systemPrompt: '你是专业客服，请根据分类给出礼貌、具体、可执行的回复。',
                                prompt: '用户问题：{{input.message}}\n分类结果：{{nodes.classify_1.category}}',
                            },
                        },
                        { id: 'end_0', type: 'end', meta: pos(900), data: { title: '回复', outputs: { reply: '{{nodes.llm_1.text}}', category: '{{nodes.classify_1.category}}' } } },
                    ],
                    edges: [
                        { sourceNodeID: 'start_0', targetNodeID: 'classify_1' },
                        { sourceNodeID: 'classify_1', targetNodeID: 'llm_1' },
                        { sourceNodeID: 'llm_1', targetNodeID: 'end_0' },
                    ],
                },
            };
        };
        WorkflowGeneratorService_1.prototype.contentDraft = function (raw) {
            return {
                name: '内容创作 Agent',
                description: '根据主题生成内容初稿，并做一次润色改写。',
                source: 'fallback',
                raw: raw,
                definition: {
                    nodes: [
                        { id: 'start_0', type: 'start', meta: pos(0), data: { title: '内容需求' } },
                        {
                            id: 'llm_1',
                            type: 'llm',
                            meta: pos(300),
                            data: { title: '生成初稿', prompt: '请围绕以下主题生成一篇结构清晰的内容初稿：{{input.message}}' },
                        },
                        {
                            id: 'text_1',
                            type: 'text',
                            meta: pos(600),
                            data: { title: '润色改写', operation: 'rewrite', input: '{{nodes.llm_1.text}}', instruction: '语言更自然，结构更清晰。' },
                        },
                        { id: 'end_0', type: 'end', meta: pos(900), data: { title: '成稿', outputs: { reply: '{{nodes.text_1.text}}' } } },
                    ],
                    edges: [
                        { sourceNodeID: 'start_0', targetNodeID: 'llm_1' },
                        { sourceNodeID: 'llm_1', targetNodeID: 'text_1' },
                        { sourceNodeID: 'text_1', targetNodeID: 'end_0' },
                    ],
                },
            };
        };
        return WorkflowGeneratorService_1;
    }());
    __setFunctionName(_classThis, "WorkflowGeneratorService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WorkflowGeneratorService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WorkflowGeneratorService = _classThis;
}();
exports.WorkflowGeneratorService = WorkflowGeneratorService;
