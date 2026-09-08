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
exports.TriggersService = void 0;
var common_1 = require("@nestjs/common");
var crypto_1 = require("crypto");
var cron_util_1 = require("./cron.util");
/** Heartbeat interval: short enough to never miss a minute boundary. */
var TICK_MS = 20000;
/** Sliding window used by the webhook rate limiter. */
var RATE_WINDOW_MS = 60000;
var TriggersService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var TriggersService = _classThis = /** @class */ (function () {
        function TriggersService_1(repo, workflows, engine, queue, config) {
            this.repo = repo;
            this.workflows = workflows;
            this.engine = engine;
            this.queue = queue;
            this.config = config;
            this.logger = new common_1.Logger(TriggersService.name);
            this.timer = null;
            /** trigger id -> last fired minute key, guards against double firing. */
            this.firedMinutes = new Map();
            /** token -> recent call timestamps, for the sliding-window rate limiter. */
            this.rateBuckets = new Map();
            this.ticking = false;
        }
        TriggersService_1.prototype.onModuleInit = function () {
            var _this = this;
            var _a, _b;
            if (this.config.get('SCHEDULER_ENABLED', 'true') === 'false') {
                this.logger.warn('Cron scheduler disabled via SCHEDULER_ENABLED=false');
                return;
            }
            this.timer = setInterval(function () { return void _this.tick(); }, TICK_MS);
            // Node keeps running for HTTP anyway; unref avoids holding the loop in tests.
            (_b = (_a = this.timer).unref) === null || _b === void 0 ? void 0 : _b.call(_a);
            this.logger.log("Cron scheduler started (heartbeat ".concat(TICK_MS / 1000, "s)"));
        };
        TriggersService_1.prototype.onModuleDestroy = function () {
            if (this.timer)
                clearInterval(this.timer);
            this.timer = null;
        };
        // ---------------------------------------------------------------- CRUD
        TriggersService_1.prototype.findByWorkflow = function (workflowId, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var triggers;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.assertWorkflowAccess(workflowId, ownerId)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.repo.find({
                                    where: { workflowId: workflowId, ownerId: ownerId },
                                    order: { createdAt: 'ASC' },
                                })];
                        case 2:
                            triggers = _a.sent();
                            return [2 /*return*/, triggers.map(function (trigger) { return _this.toView(trigger); })];
                    }
                });
            });
        };
        TriggersService_1.prototype.create = function (dto, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var trigger, saved;
                var _a, _b, _c, _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0: return [4 /*yield*/, this.assertWorkflowAccess(dto.workflowId, ownerId)];
                        case 1:
                            _f.sent();
                            if (dto.type === 'cron') {
                                this.assertValidCron(dto.cronExpression);
                            }
                            trigger = this.repo.create({
                                workflowId: dto.workflowId,
                                ownerId: ownerId,
                                type: dto.type,
                                name: ((_a = dto.name) === null || _a === void 0 ? void 0 : _a.trim()) || (dto.type === 'cron' ? 'Schedule' : 'Webhook'),
                                token: dto.type === 'webhook' ? this.generateToken() : null,
                                cronExpression: dto.type === 'cron' ? ((_b = dto.cronExpression) !== null && _b !== void 0 ? _b : '').trim() : '',
                                secret: dto.type === 'webhook' && dto.requireSignature ? this.generateSecret() : null,
                                async: (_c = dto.async) !== null && _c !== void 0 ? _c : false,
                                payload: (_d = dto.payload) !== null && _d !== void 0 ? _d : null,
                                enabled: (_e = dto.enabled) !== null && _e !== void 0 ? _e : true,
                            });
                            return [4 /*yield*/, this.repo.save(trigger)];
                        case 2:
                            saved = _f.sent();
                            // The secret is revealed exactly once, at creation time.
                            return [2 /*return*/, this.toView(saved, { revealSecret: true })];
                    }
                });
            });
        };
        TriggersService_1.prototype.update = function (id, dto, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var trigger, revealSecret, saved;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOwned(id, ownerId)];
                        case 1:
                            trigger = _a.sent();
                            if (dto.name !== undefined)
                                trigger.name = dto.name.trim();
                            if (dto.payload !== undefined)
                                trigger.payload = dto.payload;
                            if (dto.enabled !== undefined)
                                trigger.enabled = dto.enabled;
                            if (dto.async !== undefined)
                                trigger.async = dto.async;
                            if (dto.cronExpression !== undefined) {
                                if (trigger.type !== 'cron') {
                                    throw new common_1.BadRequestException('Only schedule triggers accept a cron expression');
                                }
                                this.assertValidCron(dto.cronExpression);
                                trigger.cronExpression = dto.cronExpression.trim();
                            }
                            revealSecret = false;
                            if (dto.requireSignature !== undefined) {
                                if (trigger.type !== 'webhook') {
                                    throw new common_1.BadRequestException('Only webhook triggers support signature verification');
                                }
                                if (dto.requireSignature) {
                                    trigger.secret = this.generateSecret();
                                    revealSecret = true;
                                }
                                else {
                                    trigger.secret = null;
                                }
                            }
                            // Re-arm: a re-configured trigger may legitimately fire in the same minute.
                            this.firedMinutes.delete(trigger.id);
                            return [4 /*yield*/, this.repo.save(trigger)];
                        case 2:
                            saved = _a.sent();
                            return [2 /*return*/, this.toView(saved, { revealSecret: revealSecret })];
                    }
                });
            });
        };
        TriggersService_1.prototype.remove = function (id, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var trigger;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOwned(id, ownerId)];
                        case 1:
                            trigger = _a.sent();
                            this.firedMinutes.delete(trigger.id);
                            return [4 /*yield*/, this.repo.remove(trigger)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Issues a fresh secret so a leaked webhook URL can be revoked. */
        TriggersService_1.prototype.rotateToken = function (id, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var trigger, saved;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOwned(id, ownerId)];
                        case 1:
                            trigger = _a.sent();
                            if (trigger.type !== 'webhook') {
                                throw new common_1.BadRequestException('Only webhook triggers have a token');
                            }
                            trigger.token = this.generateToken();
                            return [4 /*yield*/, this.repo.save(trigger)];
                        case 2:
                            saved = _a.sent();
                            return [2 /*return*/, this.toView(saved)];
                    }
                });
            });
        };
        /** Deletes every trigger of a workflow — called when the workflow is removed. */
        TriggersService_1.prototype.removeByWorkflow = function (workflowId) {
            return __awaiter(this, void 0, void 0, function () {
                var triggers;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.repo.find({ where: { workflowId: workflowId } })];
                        case 1:
                            triggers = _a.sent();
                            triggers.forEach(function (trigger) { return _this.firedMinutes.delete(trigger.id); });
                            if (!triggers.length) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.repo.remove(triggers)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        // ------------------------------------------------------------- Webhook
        /**
         * Runs the workflow behind a webhook token. Intentionally returns 404 for
         * both unknown and disabled tokens so probing cannot enumerate hooks.
         */
        TriggersService_1.prototype.invokeWebhook = function (token, request) {
            return __awaiter(this, void 0, void 0, function () {
                var trigger, workflow, input, execution_1, execution;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.repo.findOneBy({ token: token })];
                        case 1:
                            trigger = _b.sent();
                            if (!trigger || trigger.type !== 'webhook' || !trigger.enabled) {
                                throw new common_1.NotFoundException('Webhook not found');
                            }
                            // Rate limit before any further work so a flood is cheap to reject.
                            this.enforceRateLimit(token);
                            this.verifySignature(trigger, request);
                            return [4 /*yield*/, this.workflows.findOneBy({ id: trigger.workflowId })];
                        case 2:
                            workflow = _b.sent();
                            if (!!workflow) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.repo.remove(trigger)];
                        case 3:
                            _b.sent();
                            throw new common_1.NotFoundException('Webhook not found');
                        case 4:
                            input = (_a = request.body) !== null && _a !== void 0 ? _a : {};
                            if (!trigger.async) return [3 /*break*/, 7];
                            return [4 /*yield*/, this.queue.enqueue(workflow, input, {
                                    triggerType: 'webhook',
                                    triggerId: trigger.id,
                                })];
                        case 5:
                            execution_1 = _b.sent();
                            trigger.triggerCount += 1;
                            trigger.lastTriggeredAt = new Date();
                            return [4 /*yield*/, this.repo.save(trigger)];
                        case 6:
                            _b.sent();
                            return [2 /*return*/, {
                                    executionId: execution_1.id,
                                    status: execution_1.status,
                                    queued: true,
                                }];
                        case 7: return [4 /*yield*/, this.engine.run(workflow, input, {
                                triggerType: 'webhook',
                                triggerId: trigger.id,
                            })];
                        case 8:
                            execution = _b.sent();
                            return [4 /*yield*/, this.recordFire(trigger, execution.status, execution.error)];
                        case 9:
                            _b.sent();
                            return [2 /*return*/, {
                                    executionId: execution.id,
                                    status: execution.status,
                                    output: execution.output,
                                    error: execution.error,
                                    durationMs: execution.durationMs,
                                }];
                    }
                });
            });
        };
        /**
         * Sliding-window limiter, per token, entirely in memory.
         * Good enough for the single-process deployment model and costs nothing;
         * a shared store would be required only once the API is horizontally scaled.
         */
        TriggersService_1.prototype.enforceRateLimit = function (token) {
            var _a;
            var limit = Number(this.config.get('WEBHOOK_RATE_LIMIT', 60));
            if (limit <= 0)
                return;
            var now = Date.now();
            var recent = ((_a = this.rateBuckets.get(token)) !== null && _a !== void 0 ? _a : []).filter(function (at) { return now - at < RATE_WINDOW_MS; });
            if (recent.length >= limit) {
                var retryAfter = Math.ceil((RATE_WINDOW_MS - (now - recent[0])) / 1000);
                throw new common_1.HttpException({
                    statusCode: common_1.HttpStatus.TOO_MANY_REQUESTS,
                    message: "Rate limit exceeded: max ".concat(limit, " calls per minute"),
                    retryAfter: retryAfter,
                }, common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            recent.push(now);
            this.rateBuckets.set(token, recent);
            // Opportunistic cleanup so idle tokens do not linger in memory.
            if (this.rateBuckets.size > 500) {
                for (var _i = 0, _b = this.rateBuckets; _i < _b.length; _i++) {
                    var _c = _b[_i], key = _c[0], stamps = _c[1];
                    if (!stamps.some(function (at) { return now - at < RATE_WINDOW_MS; }))
                        this.rateBuckets.delete(key);
                }
            }
        };
        /** Verifies `X-ZCL-Flow-Signature: sha256=<hex>` over the raw body. */
        TriggersService_1.prototype.verifySignature = function (trigger, request) {
            var _a, _b;
            if (!trigger.secret)
                return;
            var provided = ((_a = request.signature) !== null && _a !== void 0 ? _a : '').trim();
            if (!provided) {
                throw new common_1.UnauthorizedException('Missing X-ZCL-Flow-Signature header');
            }
            var payload = request.rawBody !== undefined && request.rawBody !== null
                ? request.rawBody
                : JSON.stringify((_b = request.body) !== null && _b !== void 0 ? _b : {});
            var expected = (0, crypto_1.createHmac)('sha256', trigger.secret)
                .update(payload)
                .digest('hex');
            var normalised = provided.replace(/^sha256=/i, '');
            var a = Buffer.from(normalised, 'utf8');
            var b = Buffer.from(expected, 'utf8');
            // Length must match before timingSafeEqual, which throws on mismatch.
            if (a.length !== b.length || !(0, crypto_1.timingSafeEqual)(a, b)) {
                throw new common_1.UnauthorizedException('Invalid webhook signature');
            }
        };
        // ----------------------------------------------------------- Scheduler
        /** Manually fires a trigger, used by the "test" button in the editor. */
        TriggersService_1.prototype.fireNow = function (id, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var trigger, workflow, execution;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.findOwned(id, ownerId)];
                        case 1:
                            trigger = _b.sent();
                            return [4 /*yield*/, this.workflows.findOneBy({ id: trigger.workflowId })];
                        case 2:
                            workflow = _b.sent();
                            if (!workflow)
                                throw new common_1.NotFoundException('Workflow not found');
                            return [4 /*yield*/, this.engine.run(workflow, (_a = trigger.payload) !== null && _a !== void 0 ? _a : {}, {
                                    triggerType: trigger.type,
                                    triggerId: trigger.id,
                                })];
                        case 3:
                            execution = _b.sent();
                            return [4 /*yield*/, this.recordFire(trigger, execution.status, execution.error)];
                        case 4:
                            _b.sent();
                            return [2 /*return*/, execution];
                    }
                });
            });
        };
        /**
         * One scheduler heartbeat: fires every enabled cron trigger whose expression
         * matches the current minute and that has not already fired in it.
         */
        TriggersService_1.prototype.tick = function () {
            return __awaiter(this, void 0, void 0, function () {
                var now, minuteKey, triggers, _i, triggers_1, trigger, matches, error_1, error_2;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (this.ticking)
                                return [2 /*return*/];
                            this.ticking = true;
                            now = new Date();
                            minuteKey = "".concat(now.getFullYear(), "-").concat(now.getMonth(), "-").concat(now.getDate(), "T").concat(now.getHours(), ":").concat(now.getMinutes());
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 11, 12, 13]);
                            return [4 /*yield*/, this.repo.find({ where: { type: 'cron', enabled: true } })];
                        case 2:
                            triggers = _c.sent();
                            _i = 0, triggers_1 = triggers;
                            _c.label = 3;
                        case 3:
                            if (!(_i < triggers_1.length)) return [3 /*break*/, 10];
                            trigger = triggers_1[_i];
                            if (this.firedMinutes.get(trigger.id) === minuteKey)
                                return [3 /*break*/, 9];
                            matches = false;
                            _c.label = 4;
                        case 4:
                            _c.trys.push([4, 5, , 7]);
                            matches = (0, cron_util_1.cronMatches)((0, cron_util_1.parseCron)(trigger.cronExpression), now);
                            return [3 /*break*/, 7];
                        case 5:
                            error_1 = _c.sent();
                            this.logger.warn("Trigger ".concat(trigger.id, " has an invalid cron expression and was disabled: ").concat(error_1 === null || error_1 === void 0 ? void 0 : error_1.message));
                            trigger.enabled = false;
                            trigger.lastStatus = 'failed';
                            trigger.lastError = String((_a = error_1 === null || error_1 === void 0 ? void 0 : error_1.message) !== null && _a !== void 0 ? _a : error_1);
                            return [4 /*yield*/, this.repo.save(trigger)];
                        case 6:
                            _c.sent();
                            return [3 /*break*/, 9];
                        case 7:
                            if (!matches)
                                return [3 /*break*/, 9];
                            this.firedMinutes.set(trigger.id, minuteKey);
                            return [4 /*yield*/, this.runScheduled(trigger)];
                        case 8:
                            _c.sent();
                            _c.label = 9;
                        case 9:
                            _i++;
                            return [3 /*break*/, 3];
                        case 10:
                            this.pruneFiredMinutes(minuteKey);
                            return [3 /*break*/, 13];
                        case 11:
                            error_2 = _c.sent();
                            this.logger.error("Scheduler tick failed: ".concat((_b = error_2 === null || error_2 === void 0 ? void 0 : error_2.message) !== null && _b !== void 0 ? _b : error_2));
                            return [3 /*break*/, 13];
                        case 12:
                            this.ticking = false;
                            return [7 /*endfinally*/];
                        case 13: return [2 /*return*/];
                    }
                });
            });
        };
        TriggersService_1.prototype.runScheduled = function (trigger) {
            return __awaiter(this, void 0, void 0, function () {
                var workflow, execution, error_3;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, this.workflows.findOneBy({ id: trigger.workflowId })];
                        case 1:
                            workflow = _d.sent();
                            if (!!workflow) return [3 /*break*/, 3];
                            this.logger.warn("Removing orphan trigger ".concat(trigger.id, ": workflow no longer exists"));
                            return [4 /*yield*/, this.repo.remove(trigger)];
                        case 2:
                            _d.sent();
                            return [2 /*return*/];
                        case 3:
                            _d.trys.push([3, 6, , 8]);
                            return [4 /*yield*/, this.engine.run(workflow, (_a = trigger.payload) !== null && _a !== void 0 ? _a : {}, {
                                    triggerType: 'cron',
                                    triggerId: trigger.id,
                                })];
                        case 4:
                            execution = _d.sent();
                            return [4 /*yield*/, this.recordFire(trigger, execution.status, execution.error)];
                        case 5:
                            _d.sent();
                            this.logger.log("Trigger ".concat(trigger.name || trigger.id, " fired workflow \"").concat(workflow.name, "\" -> ").concat(execution.status));
                            return [3 /*break*/, 8];
                        case 6:
                            error_3 = _d.sent();
                            return [4 /*yield*/, this.recordFire(trigger, 'failed', String((_b = error_3 === null || error_3 === void 0 ? void 0 : error_3.message) !== null && _b !== void 0 ? _b : error_3))];
                        case 7:
                            _d.sent();
                            this.logger.error("Trigger ".concat(trigger.id, " failed: ").concat((_c = error_3 === null || error_3 === void 0 ? void 0 : error_3.message) !== null && _c !== void 0 ? _c : error_3));
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        };
        /** Drops memo entries from previous minutes so the map cannot grow forever. */
        TriggersService_1.prototype.pruneFiredMinutes = function (currentKey) {
            for (var _i = 0, _a = this.firedMinutes; _i < _a.length; _i++) {
                var _b = _a[_i], id = _b[0], key = _b[1];
                if (key !== currentKey)
                    this.firedMinutes.delete(id);
            }
        };
        TriggersService_1.prototype.recordFire = function (trigger, status, error) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            trigger.triggerCount += 1;
                            trigger.lastTriggeredAt = new Date();
                            trigger.lastStatus = status === 'success' ? 'success' : 'failed';
                            trigger.lastError = status === 'success' ? null : (error !== null && error !== void 0 ? error : null);
                            return [4 /*yield*/, this.repo.save(trigger)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        // ------------------------------------------------------------- Helpers
        TriggersService_1.prototype.findOwned = function (id, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var trigger;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.repo.findOneBy({ id: id })];
                        case 1:
                            trigger = _a.sent();
                            if (!trigger)
                                throw new common_1.NotFoundException("Trigger ".concat(id, " not found"));
                            if (trigger.ownerId !== ownerId) {
                                throw new common_1.ForbiddenException('You do not have access to this trigger');
                            }
                            return [2 /*return*/, trigger];
                    }
                });
            });
        };
        TriggersService_1.prototype.assertWorkflowAccess = function (workflowId, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var workflow;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.workflows.findOneBy({ id: workflowId })];
                        case 1:
                            workflow = _a.sent();
                            if (!workflow)
                                throw new common_1.NotFoundException("Workflow ".concat(workflowId, " not found"));
                            if (workflow.ownerId !== ownerId) {
                                throw new common_1.ForbiddenException('You do not have access to this workflow');
                            }
                            return [2 /*return*/, workflow];
                    }
                });
            });
        };
        TriggersService_1.prototype.assertValidCron = function (expression) {
            var _a;
            try {
                (0, cron_util_1.parseCron)(expression !== null && expression !== void 0 ? expression : '');
            }
            catch (error) {
                throw new common_1.BadRequestException(String((_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : error));
            }
        };
        TriggersService_1.prototype.generateToken = function () {
            return (0, crypto_1.randomBytes)(24).toString('base64url');
        };
        /** HMAC signing secret; hex so it is safe to paste into any client. */
        TriggersService_1.prototype.generateSecret = function () {
            return (0, crypto_1.randomBytes)(32).toString('hex');
        };
        TriggersService_1.prototype.toView = function (trigger, options) {
            var _a, _b;
            if (options === void 0) { options = {}; }
            var nextRunAt = null;
            if (trigger.type === 'cron' && trigger.enabled) {
                try {
                    nextRunAt = (_b = (_a = (0, cron_util_1.nextCronRun)((0, cron_util_1.parseCron)(trigger.cronExpression))) === null || _a === void 0 ? void 0 : _a.toISOString()) !== null && _b !== void 0 ? _b : null;
                }
                catch (_c) {
                    nextRunAt = null;
                }
            }
            return __assign({ id: trigger.id, workflowId: trigger.workflowId, type: trigger.type, name: trigger.name, cronExpression: trigger.cronExpression, payload: trigger.payload, enabled: trigger.enabled, async: trigger.async, triggerCount: trigger.triggerCount, lastStatus: trigger.lastStatus, lastTriggeredAt: trigger.lastTriggeredAt, lastError: trigger.lastError, createdAt: trigger.createdAt, webhookPath: trigger.token ? "/api/hooks/".concat(trigger.token) : null, nextRunAt: nextRunAt, signatureRequired: Boolean(trigger.secret) }, (options.revealSecret && trigger.secret ? { secret: trigger.secret } : {}));
        };
        return TriggersService_1;
    }());
    __setFunctionName(_classThis, "TriggersService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TriggersService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TriggersService = _classThis;
}();
exports.TriggersService = TriggersService;
