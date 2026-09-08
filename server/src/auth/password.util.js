"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePassword = exports.verifyPassword = exports.hashPassword = void 0;
var crypto_1 = require("crypto");
var KEY_LENGTH = 64;
var SALT_LENGTH = 16;
/**
 * Hash a plaintext password with scrypt.
 * Format: "scrypt$<saltHex>$<hashHex>" (self-describing, no extra deps).
 */
function hashPassword(plain) {
    var salt = (0, crypto_1.randomBytes)(SALT_LENGTH);
    var hash = (0, crypto_1.scryptSync)(plain, salt, KEY_LENGTH);
    return "scrypt$".concat(salt.toString('hex'), "$").concat(hash.toString('hex'));
}
exports.hashPassword = hashPassword;
/** Constant-time password verification. */
function verifyPassword(plain, stored) {
    var parts = stored.split('$');
    if (parts.length !== 3 || parts[0] !== 'scrypt')
        return false;
    try {
        var salt = Buffer.from(parts[1], 'hex');
        var expected = Buffer.from(parts[2], 'hex');
        var actual = (0, crypto_1.scryptSync)(plain, salt, expected.length);
        return (0, crypto_1.timingSafeEqual)(expected, actual);
    }
    catch (_a) {
        return false;
    }
}
exports.verifyPassword = verifyPassword;
/**
 * Generate a readable but strong random password for admin-created accounts.
 * Excludes ambiguous characters (0/O/1/l/I) to make manual hand-off reliable.
 */
function generatePassword(length) {
    if (length === void 0) { length = 12; }
    var alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    var bytes = (0, crypto_1.randomBytes)(length);
    var password = '';
    for (var i = 0; i < length; i += 1) {
        password += alphabet[bytes[i] % alphabet.length];
    }
    return password;
}
exports.generatePassword = generatePassword;
