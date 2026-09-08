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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
var common_1 = require("@nestjs/common");
var EMPTY_STATUS = {
    queued: 0,
    running: 0,
    success: 0,
    failed: 0,
    cancelled: 0,
};
var EMPTY_TRIGGER = {
    manual: 0,
    webhook: 0,
    cron: 0,
};
/** Local `YYYY-MM-DD` key (not UTC, so the chart matches the user's day). */
function dayKey(date) {
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    return "".concat(date.getFullYear(), "-").concat(month, "-").concat(day);
}
/** Nearest-rank percentile over a pre-sorted ascending array. */
function percentile(sorted, fraction) {
    if (!sorted.length)
        return 0;
    var index = Math.min(sorted.length - 1, Math.ceil(fraction * sorted.length) - 1);
    return sorted[Math.max(0, index)];
}
/**
 * Aggregates execution history into an operations dashboard.
 *
 * Rows are aggregated in the process rather than in SQL: the dataset is bounded
 * by both the time window and STATS_MAX_ROWS, and doing it here keeps the
 * percentile logic readable and database-agnostic.
 */
var StatsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var StatsService = _classThis = /** @class */ (function () {
        function StatsService_1(executions, nodeExecutions, config) {
            this.executions = executions;
            this.nodeExecutions = nodeExecutions;
            this.config = config;
        }
        StatsService_1.prototype.compute = function (ownerId_1) {
            return __awaiter(this, arguments, void 0, function (ownerId, options) {
                var days, since, maxRows, query, rows, byStatus, byTrigger, durations, dailyMap, i, date, perWorkflow, _i, rows_1, row, point, usage, finished;
                var _a;
                var _b, _c, _d;
                if (options === void 0) { options = {}; }
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            days = Math.min(Math.max(Number(options.days) || 7, 1), 90);
                            since = new Date();
                            since.setDate(since.getDate() - (days - 1));
                            since.setHours(0, 0, 0, 0);
                            maxRows = Number(this.config.get('STATS_MAX_ROWS', 20000));
                            query = this.executions
                                .createQueryBuilder('execution')
                                .select([
                                'execution.id AS id',
                                'execution.workflowId AS workflowId',
                                'execution.status AS status',
                                'execution.triggerType AS triggerType',
                                'execution.durationMs AS durationMs',
                                'execution.startedAt AS startedAt',
                            ])
                                .where('execution.ownerId = :ownerId', { ownerId: ownerId })
                                // Sub-workflow runs are implementation detail of their parent.
                                .andWhere('execution.parentExecutionId IS NULL')
                                .andWhere('execution.startedAt >= :since', { since: since })
                                .orderBy('execution.startedAt', 'DESC')
                                .limit(maxRows);
                            if (options.workflowId) {
                                query.andWhere('execution.workflowId = :workflowId', { workflowId: options.workflowId });
                            }
                            return [4 /*yield*/, query.getRawMany()];
                        case 1:
                            rows = _e.sent();
                            byStatus = __assign({}, EMPTY_STATUS);
                            byTrigger = __assign({}, EMPTY_TRIGGER);
                            durations = [];
                            dailyMap = new Map();
                            // Pre-seed every day so the chart has no gaps.
                            for (i = 0; i < days; i += 1) {
                                date = new Date(since);
                                date.setDate(since.getDate() + i);
                                dailyMap.set(dayKey(date), { date: dayKey(date), total: 0, success: 0, failed: 0 });
                            }
                            perWorkflow = new Map();
                            for (_i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                                row = rows_1[_i];
                                byStatus[row.status] = ((_b = byStatus[row.status]) !== null && _b !== void 0 ? _b : 0) + 1;
                                byTrigger[row.triggerType] = ((_c = byTrigger[row.triggerType]) !== null && _c !== void 0 ? _c : 0) + 1;
                                if (row.status === 'success' || row.status === 'failed') {
                                    durations.push(Number(row.durationMs) || 0);
                                }
                                point = dailyMap.get(dayKey(new Date(row.startedAt)));
                                if (point) {
                                    point.total += 1;
                                    if (row.status === 'success')
                                        point.success += 1;
                                    if (row.status === 'failed')
                                        point.failed += 1;
                                }
                                usage = (_d = perWorkflow.get(row.workflowId)) !== null && _d !== void 0 ? _d : { runs: 0, failed: 0, totalMs: 0 };
                                usage.runs += 1;
                                if (row.status === 'failed')
                                    usage.failed += 1;
                                usage.totalMs += Number(row.durationMs) || 0;
                                perWorkflow.set(row.workflowId, usage);
                            }
                            durations.sort(function (a, b) { return a - b; });
                            finished = byStatus.success + byStatus.failed;
                            _a = {
                                days: days,
                                total: rows.length,
                                byStatus: byStatus,
                                byTrigger: byTrigger,
                                successRate: finished ? byStatus.success / finished : 0,
                                avgDurationMs: durations.length
                                    ? Math.round(durations.reduce(function (sum, value) { return sum + value; }, 0) / durations.length)
                                    : 0,
                                p50DurationMs: percentile(durations, 0.5),
                                p95DurationMs: percentile(durations, 0.95),
                                daily: __spreadArray([], dailyMap.values(), true)
                            };
                            return [4 /*yield*/, this.topFailingNodes(rows.map(function (row) { return row.id; }))];
                        case 2:
                            _a.topFailingNodes = _e.sent();
                            return [4 /*yield*/, this.topWorkflows(perWorkflow)];
                        case 3: return [2 /*return*/, (_a.topWorkflows = _e.sent(),
                                _a)];
                    }
                });
            });
        };
        /** Node ids that failed most often inside the sampled executions. */
        StatsService_1.prototype.topFailingNodes = function (executionIds) {
            return __awaiter(this, void 0, void 0, function () {
                var CHUNK, tally, i, slice, failures, _i, failures_1, failure, key, entry;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!executionIds.length)
                                return [2 /*return*/, []];
                            CHUNK = 500;
                            tally = new Map();
                            i = 0;
                            _c.label = 1;
                        case 1:
                            if (!(i < executionIds.length)) return [3 /*break*/, 4];
                            slice = executionIds.slice(i, i + CHUNK);
                            return [4 /*yield*/, this.nodeExecutions.find({
                                    where: slice.map(function (executionId) { return ({ executionId: executionId, status: 'failed' }); }),
                                    select: { nodeId: true, nodeType: true, error: true },
                                    take: 5000,
                                })];
                        case 2:
                            failures = _c.sent();
                            for (_i = 0, failures_1 = failures; _i < failures_1.length; _i++) {
                                failure = failures_1[_i];
                                key = "".concat(failure.nodeId, ":").concat(failure.nodeType);
                                entry = (_a = tally.get(key)) !== null && _a !== void 0 ? _a : { nodeId: failure.nodeId, nodeType: failure.nodeType, failures: 0, lastError: null };
                                entry.failures += 1;
                                entry.lastError = (_b = failure.error) !== null && _b !== void 0 ? _b : entry.lastError;
                                tally.set(key, entry);
                            }
                            _c.label = 3;
                        case 3:
                            i += CHUNK;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/, __spreadArray([], tally.values(), true).sort(function (a, b) { return b.failures - a.failures; }).slice(0, 5)];
                    }
                });
            });
        };
        /** Busiest workflows, resolved to their current names. */
        StatsService_1.prototype.topWorkflows = function (perWorkflow) {
            return __awaiter(this, void 0, void 0, function () {
                var ranked, names, found, _i, found_1, row;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            ranked = __spreadArray([], perWorkflow.entries(), true).sort(function (a, b) { return b[1].runs - a[1].runs; })
                                .slice(0, 5);
                            if (!ranked.length)
                                return [2 /*return*/, []];
                            names = new Map();
                            return [4 /*yield*/, this.executions.manager
                                    .createQueryBuilder()
                                    .select(['workflow.id AS id', 'workflow.name AS name'])
                                    .from('workflows', 'workflow')
                                    .where('workflow.id IN (:...ids)', { ids: ranked.map(function (_a) {
                                        var id = _a[0];
                                        return id;
                                    }) })
                                    .getRawMany()];
                        case 1:
                            found = _a.sent();
                            for (_i = 0, found_1 = found; _i < found_1.length; _i++) {
                                row = found_1[_i];
                                names.set(row.id, row.name);
                            }
                            return [2 /*return*/, ranked.map(function (_a) {
                                    var _b;
                                    var workflowId = _a[0], usage = _a[1];
                                    return ({
                                        workflowId: workflowId,
                                        name: (_b = names.get(workflowId)) !== null && _b !== void 0 ? _b : '(deleted)',
                                        runs: usage.runs,
                                        failed: usage.failed,
                                        avgDurationMs: Math.round(usage.totalMs / usage.runs),
                                    });
                                })];
                    }
                });
            });
        };
        /** Ensures the requesting account owns the workflow before scoping stats. */
        StatsService_1.prototype.assertWorkflowOwner = function (workflowId, ownerId) {
            return __awaiter(this, void 0, void 0, function () {
                var found;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.executions.manager
                                .createQueryBuilder()
                                .select('workflow.ownerId', 'ownerId')
                                .from('workflows', 'workflow')
                                .where('workflow.id = :workflowId', { workflowId: workflowId })
                                .getRawOne()];
                        case 1:
                            found = _a.sent();
                            if (found && found.ownerId !== ownerId) {
                                throw new common_1.ForbiddenException('You do not have access to this workflow');
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        return StatsService_1;
    }());
    __setFunctionName(_classThis, "StatsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        StatsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return StatsService = _classThis;
}();
exports.StatsService = StatsService;
