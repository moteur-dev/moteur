"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cliLoadAuthToken = cliLoadAuthToken;
exports.cliLoadUser = cliLoadUser;
exports.cliRequireRole = cliRequireRole;
var fs_1 = require("fs");
var path_1 = require("path");
var auth_js_1 = require("@moteur/core/auth.js");
var TOKEN_FILE = path_1.default.resolve(process.env.HOME || process.env.USERPROFILE || '.', '.moteur-cli-token.json');
function cliLoadAuthToken() {
    if (fs_1.default.existsSync(TOKEN_FILE)) {
        return JSON.parse(fs_1.default.readFileSync(TOKEN_FILE, 'utf-8')).token;
    }
    throw new Error('❌ Not authenticated. Please run `cli auth login`.');
}
function cliLoadUser() {
    var token = cliLoadAuthToken();
    if (!token) {
        throw new Error('❌ No authentication token found. Please run `cli auth login`.');
    }
    var user = (0, auth_js_1.verifyJWT)(token);
    if (!user.isActive) {
        throw new Error('❌ User is not active. Please contact support.');
    }
    return user;
}
function cliRequireRole(requiredRole) {
    try {
        var user = cliLoadUser();
        return (0, auth_js_1.requireRole)(user, requiredRole);
    }
    catch (err) {
        throw new Error("\u274C Access denied: ".concat(err instanceof Error ? err.message : err));
    }
}
