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
exports.UsersService = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("typeorm");
var user_entity_1 = require("./user.entity");
var password_util_1 = require("./password.util");
var UsersService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var UsersService = _classThis = /** @class */ (function () {
        function UsersService_1(repo) {
            this.repo = repo;
        }
        UsersService_1.prototype.findAll = function () {
            return __awaiter(this, void 0, void 0, function () {
                var users;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.repo.find({ order: { createdAt: 'ASC' } })];
                        case 1:
                            users = _a.sent();
                            return [2 /*return*/, users.map(user_entity_1.toUserView)];
                    }
                });
            });
        };
        UsersService_1.prototype.findEntity = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.repo.findOneBy({ id: id })];
                        case 1:
                            user = _a.sent();
                            if (!user)
                                throw new common_1.NotFoundException("User ".concat(id, " not found"));
                            return [2 /*return*/, user];
                    }
                });
            });
        };
        /** Create an account; generates a strong password when none is supplied. */
        UsersService_1.prototype.create = function (dto) {
            return __awaiter(this, void 0, void 0, function () {
                var username, existing, password, user;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            username = dto.username.trim().toLowerCase();
                            return [4 /*yield*/, this.repo.findOneBy({ username: username })];
                        case 1:
                            existing = _d.sent();
                            if (existing) {
                                throw new common_1.ConflictException("Username \"".concat(username, "\" is already taken"));
                            }
                            password = ((_a = dto.password) === null || _a === void 0 ? void 0 : _a.trim()) || (0, password_util_1.generatePassword)(12);
                            return [4 /*yield*/, this.repo.save(this.repo.create({
                                    username: username,
                                    displayName: ((_b = dto.displayName) === null || _b === void 0 ? void 0 : _b.trim()) || username,
                                    role: (_c = dto.role) !== null && _c !== void 0 ? _c : 'user',
                                    passwordHash: (0, password_util_1.hashPassword)(password),
                                    enabled: true,
                                    mustChangePassword: !dto.password,
                                }))];
                        case 2:
                            user = _d.sent();
                            return [2 /*return*/, { user: (0, user_entity_1.toUserView)(user), password: password }];
                    }
                });
            });
        };
        UsersService_1.prototype.update = function (id, dto, actorId) {
            return __awaiter(this, void 0, void 0, function () {
                var user, _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, this.findEntity(id)];
                        case 1:
                            user = _d.sent();
                            if (dto.displayName !== undefined)
                                user.displayName = dto.displayName.trim();
                            if (!(dto.role !== undefined && dto.role !== user.role)) return [3 /*break*/, 4];
                            if (user.id === actorId) {
                                throw new common_1.BadRequestException('You cannot change your own role');
                            }
                            _a = user.role === 'admin';
                            if (!_a) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.countOtherAdmins(user.id)];
                        case 2:
                            _a = (_d.sent()) === 0;
                            _d.label = 3;
                        case 3:
                            if (_a) {
                                throw new common_1.BadRequestException('At least one administrator must remain');
                            }
                            user.role = dto.role;
                            _d.label = 4;
                        case 4:
                            if (!(dto.enabled !== undefined && dto.enabled !== user.enabled)) return [3 /*break*/, 7];
                            if (user.id === actorId) {
                                throw new common_1.BadRequestException('You cannot disable your own account');
                            }
                            _b = !dto.enabled && user.role === 'admin';
                            if (!_b) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.countOtherAdmins(user.id)];
                        case 5:
                            _b = (_d.sent()) === 0;
                            _d.label = 6;
                        case 6:
                            if (_b) {
                                throw new common_1.BadRequestException('At least one administrator must remain');
                            }
                            user.enabled = dto.enabled;
                            _d.label = 7;
                        case 7:
                            _c = user_entity_1.toUserView;
                            return [4 /*yield*/, this.repo.save(user)];
                        case 8: return [2 /*return*/, _c.apply(void 0, [_d.sent()])];
                    }
                });
            });
        };
        /** Issue a fresh random password for an account. */
        UsersService_1.prototype.resetPassword = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var user, password, _a;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.findEntity(id)];
                        case 1:
                            user = _c.sent();
                            password = (0, password_util_1.generatePassword)(12);
                            user.passwordHash = (0, password_util_1.hashPassword)(password);
                            user.mustChangePassword = true;
                            _b = {};
                            _a = user_entity_1.toUserView;
                            return [4 /*yield*/, this.repo.save(user)];
                        case 2: return [2 /*return*/, (_b.user = _a.apply(void 0, [_c.sent()]), _b.password = password, _b)];
                    }
                });
            });
        };
        UsersService_1.prototype.remove = function (id, actorId) {
            return __awaiter(this, void 0, void 0, function () {
                var user, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.findEntity(id)];
                        case 1:
                            user = _b.sent();
                            if (user.id === actorId) {
                                throw new common_1.BadRequestException('You cannot delete your own account');
                            }
                            _a = user.role === 'admin';
                            if (!_a) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.countOtherAdmins(user.id)];
                        case 2:
                            _a = (_b.sent()) === 0;
                            _b.label = 3;
                        case 3:
                            if (_a) {
                                throw new common_1.BadRequestException('At least one administrator must remain');
                            }
                            return [4 /*yield*/, this.repo.remove(user)];
                        case 4:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        UsersService_1.prototype.countOtherAdmins = function (excludeId) {
            return this.repo.count({ where: { role: 'admin', enabled: true, id: (0, typeorm_1.Not)(excludeId) } });
        };
        return UsersService_1;
    }());
    __setFunctionName(_classThis, "UsersService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UsersService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UsersService = _classThis;
}();
exports.UsersService = UsersService;
