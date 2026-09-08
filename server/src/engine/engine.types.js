"use strict";
/**
 * Shared engine types for workflow graph execution.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertNotCancelled = exports.ExecutionCancelledError = void 0;
/** Thrown when a run is cancelled; mapped to the `cancelled` status. */
var ExecutionCancelledError = /** @class */ (function (_super) {
    __extends(ExecutionCancelledError, _super);
    function ExecutionCancelledError(message) {
        if (message === void 0) { message = 'Execution cancelled'; }
        var _this = _super.call(this, message) || this;
        _this.name = 'ExecutionCancelledError';
        return _this;
    }
    return ExecutionCancelledError;
}(Error));
exports.ExecutionCancelledError = ExecutionCancelledError;
/** Throws if the run has been cancelled. Call before any expensive step. */
function assertNotCancelled(ctx) {
    var _a;
    if ((_a = ctx.signal) === null || _a === void 0 ? void 0 : _a.aborted) {
        throw new ExecutionCancelledError();
    }
}
exports.assertNotCancelled = assertNotCancelled;
