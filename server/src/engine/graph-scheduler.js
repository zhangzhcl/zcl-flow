"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphScheduler = void 0;
/**
 * Dependency-aware scheduler for a free-layout workflow graph.
 *
 * Why not a plain BFS: with BFS a fan-in node runs as soon as its *first*
 * predecessor completes, so `{{nodes.<other-predecessor>.x}}` interpolates to
 * nothing. This scheduler is a Kahn topological walk instead - a node only runs
 * once every incoming edge has been resolved (either satisfied by an executed
 * predecessor, or pruned because its branch was not taken).
 *
 * Nodes that become ready together form a "wave" and are executed
 * concurrently, bounded by `parallelism`.
 */
var GraphScheduler = /** @class */ (function () {
    function GraphScheduler(document, hooks, options) {
        var _a;
        this.document = document;
        this.hooks = hooks;
        this.options = options;
        this.outEdges = new Map();
        this.pending = new Map();
        /** How many executed predecessors actually fed data into a node. */
        this.liveIncoming = new Map();
        this.settled = new Set();
        this.queued = new Set();
        this.ready = [];
        this.executed = 0;
        this.nodeMap = new Map(document.nodes.map(function (node) { return [node.id, node]; }));
        for (var _i = 0, _b = document.nodes; _i < _b.length; _i++) {
            var node = _b[_i];
            this.outEdges.set(node.id, []);
            this.pending.set(node.id, 0);
            this.liveIncoming.set(node.id, 0);
        }
        for (var _c = 0, _d = document.edges; _c < _d.length; _c++) {
            var edge = _d[_c];
            // Ignore dangling edges left behind by a deleted node.
            if (!this.nodeMap.has(edge.sourceNodeID) || !this.nodeMap.has(edge.targetNodeID))
                continue;
            this.outEdges.get(edge.sourceNodeID).push(edge);
            this.pending.set(edge.targetNodeID, ((_a = this.pending.get(edge.targetNodeID)) !== null && _a !== void 0 ? _a : 0) + 1);
        }
    }
    /** Nodes reachable from the start node, ignoring branch selection. */
    GraphScheduler.prototype.reachableFromStart = function (startId) {
        var _a;
        var seen = new Set([startId]);
        var stack = [startId];
        while (stack.length) {
            var current = stack.pop();
            for (var _i = 0, _b = (_a = this.outEdges.get(current)) !== null && _a !== void 0 ? _a : []; _i < _b.length; _i++) {
                var edge = _b[_i];
                if (!seen.has(edge.targetNodeID)) {
                    seen.add(edge.targetNodeID);
                    stack.push(edge.targetNodeID);
                }
            }
        }
        return seen;
    };
    GraphScheduler.prototype.run = function (startNode) {
        return __awaiter(this, void 0, void 0, function () {
            var reachable, _i, _a, node, _b, _c, node, _d, _e, edge, wave, outcomes, _f, _g, chunk, results, _h, outcomes_1, _j, nodeId, branch, stuck;
            var _this = this;
            var _k, _l, _m;
            return __generator(this, function (_o) {
                switch (_o.label) {
                    case 0:
                        reachable = this.reachableFromStart(startNode.id);
                        _i = 0, _a = this.document.nodes;
                        _o.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        node = _a[_i];
                        if (!!reachable.has(node.id)) return [3 /*break*/, 3];
                        this.settled.add(node.id);
                        return [4 /*yield*/, this.hooks.skip(node, 'unreachable')];
                    case 2:
                        _o.sent();
                        _o.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        // Unreachable predecessors must not keep a reachable node waiting.
                        for (_b = 0, _c = this.document.nodes; _b < _c.length; _b++) {
                            node = _c[_b];
                            if (reachable.has(node.id))
                                continue;
                            for (_d = 0, _e = (_k = this.outEdges.get(node.id)) !== null && _k !== void 0 ? _k : []; _d < _e.length; _d++) {
                                edge = _e[_d];
                                if (reachable.has(edge.targetNodeID))
                                    this.decrement(edge.targetNodeID);
                            }
                        }
                        this.enqueue(startNode.id);
                        _o.label = 5;
                    case 5:
                        if (!this.ready.length) return [3 /*break*/, 14];
                        (_m = (_l = this.hooks).checkpoint) === null || _m === void 0 ? void 0 : _m.call(_l);
                        wave = this.ready;
                        this.ready = [];
                        outcomes = [];
                        _f = 0, _g = chunked(wave, this.options.parallelism);
                        _o.label = 6;
                    case 6:
                        if (!(_f < _g.length)) return [3 /*break*/, 9];
                        chunk = _g[_f];
                        if (this.executed + chunk.length > this.options.maxNodes) {
                            throw new Error("Run aborted: exceeded MAX_NODES_PER_RUN (".concat(this.options.maxNodes, ")"));
                        }
                        return [4 /*yield*/, Promise.all(chunk.map(function (nodeId) { return __awaiter(_this, void 0, void 0, function () {
                                var outcome;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.hooks.execute(this.nodeMap.get(nodeId))];
                                        case 1:
                                            outcome = _a.sent();
                                            return [2 /*return*/, { nodeId: nodeId, branch: outcome.branch }];
                                    }
                                });
                            }); }))];
                    case 7:
                        results = _o.sent();
                        this.executed += chunk.length;
                        outcomes.push.apply(outcomes, results);
                        _o.label = 8;
                    case 8:
                        _f++;
                        return [3 /*break*/, 6];
                    case 9:
                        _h = 0, outcomes_1 = outcomes;
                        _o.label = 10;
                    case 10:
                        if (!(_h < outcomes_1.length)) return [3 /*break*/, 13];
                        _j = outcomes_1[_h], nodeId = _j.nodeId, branch = _j.branch;
                        this.settled.add(nodeId);
                        return [4 /*yield*/, this.resolveEdges(nodeId, branch)];
                    case 11:
                        _o.sent();
                        _o.label = 12;
                    case 12:
                        _h++;
                        return [3 /*break*/, 10];
                    case 13: return [3 /*break*/, 5];
                    case 14:
                        stuck = this.document.nodes.filter(function (node) { return !_this.settled.has(node.id) && reachable.has(node.id); });
                        if (stuck.length) {
                            throw new Error("Workflow contains a cycle: ".concat(stuck.map(function (node) { var _a, _b; return (_b = (_a = node.data) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : node.id; }).join(', ')));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /** Propagates a completed node's outputs along the edges it selected. */
    GraphScheduler.prototype.resolveEdges = function (nodeId, branch) {
        return __awaiter(this, void 0, void 0, function () {
            var outgoing, taken, takenSet, _i, taken_1, edge, _a, outgoing_1, edge, satisfied;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        outgoing = (_b = this.outEdges.get(nodeId)) !== null && _b !== void 0 ? _b : [];
                        taken = branch !== undefined
                            ? outgoing.filter(function (edge) { return !edge.sourcePortID || edge.sourcePortID === branch; })
                            : outgoing;
                        takenSet = new Set(taken);
                        for (_i = 0, taken_1 = taken; _i < taken_1.length; _i++) {
                            edge = taken_1[_i];
                            this.liveIncoming.set(edge.targetNodeID, ((_c = this.liveIncoming.get(edge.targetNodeID)) !== null && _c !== void 0 ? _c : 0) + 1);
                        }
                        _a = 0, outgoing_1 = outgoing;
                        _e.label = 1;
                    case 1:
                        if (!(_a < outgoing_1.length)) return [3 /*break*/, 5];
                        edge = outgoing_1[_a];
                        satisfied = this.decrement(edge.targetNodeID);
                        if (!satisfied)
                            return [3 /*break*/, 4];
                        if (!(((_d = this.liveIncoming.get(edge.targetNodeID)) !== null && _d !== void 0 ? _d : 0) > 0)) return [3 /*break*/, 2];
                        this.enqueue(edge.targetNodeID);
                        return [3 /*break*/, 4];
                    case 2:
                        if (!!takenSet.has(edge)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.prune(edge.targetNodeID)];
                    case 3:
                        _e.sent();
                        _e.label = 4;
                    case 4:
                        _a++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Marks a node as never-running and cascades: its own successors lose one
     * dependency, and any successor left with no live predecessor is pruned too.
     */
    GraphScheduler.prototype.prune = function (nodeId) {
        return __awaiter(this, void 0, void 0, function () {
            var stack, current, _i, _a, edge;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        stack = [nodeId];
                        _d.label = 1;
                    case 1:
                        if (!stack.length) return [3 /*break*/, 3];
                        current = stack.pop();
                        if (this.settled.has(current))
                            return [3 /*break*/, 1];
                        this.settled.add(current);
                        return [4 /*yield*/, this.hooks.skip(this.nodeMap.get(current), 'branch-not-taken')];
                    case 2:
                        _d.sent();
                        for (_i = 0, _a = (_b = this.outEdges.get(current)) !== null && _b !== void 0 ? _b : []; _i < _a.length; _i++) {
                            edge = _a[_i];
                            if (!this.decrement(edge.targetNodeID))
                                continue;
                            if (((_c = this.liveIncoming.get(edge.targetNodeID)) !== null && _c !== void 0 ? _c : 0) > 0) {
                                this.enqueue(edge.targetNodeID);
                            }
                            else {
                                stack.push(edge.targetNodeID);
                            }
                        }
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /** Returns true when the node has no unresolved incoming edge left. */
    GraphScheduler.prototype.decrement = function (nodeId) {
        var _a;
        var next = ((_a = this.pending.get(nodeId)) !== null && _a !== void 0 ? _a : 0) - 1;
        this.pending.set(nodeId, next);
        return next <= 0;
    };
    GraphScheduler.prototype.enqueue = function (nodeId) {
        if (this.settled.has(nodeId) || this.queued.has(nodeId))
            return;
        this.queued.add(nodeId);
        this.ready.push(nodeId);
    };
    return GraphScheduler;
}());
exports.GraphScheduler = GraphScheduler;
/** Splits a list into fixed-size chunks (size >= 1). */
function chunked(items, size) {
    var limit = Math.max(1, Math.floor(size));
    var chunks = [];
    for (var i = 0; i < items.length; i += limit) {
        chunks.push(items.slice(i, i + limit));
    }
    return chunks;
}
