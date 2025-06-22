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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
exports.loginCommand = loginCommand;
exports.logoutCommand = logoutCommand;
exports.createUserCommand = createUserCommand;
var inquirer_1 = require("inquirer");
var fs_1 = require("fs");
var path_1 = require("path");
var bcrypt_1 = require("bcrypt");
var auth_js_1 = require("@moteur/core/auth.js");
var users_js_1 = require("@moteur/core/users.js");
var CommandRegistry_1 = require("@moteur/core/registry/CommandRegistry");
var authMenu_1 = require("../menu/authMenu");
var TOKEN_FILE = path_1.default.resolve(process.env.HOME || process.env.USERPROFILE || '.', '.moteur-cli-token.json');
function loginCommand() {
    return __awaiter(this, void 0, void 0, function () {
        var email, password, token, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, inquirer_1.default.prompt([{ type: 'input', name: 'email', message: 'Email:' }])];
                case 1:
                    email = (_a.sent()).email;
                    return [4 /*yield*/, inquirer_1.default.prompt([
                            { type: 'password', name: 'password', message: 'Password:' }
                        ])];
                case 2:
                    password = (_a.sent()).password;
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, auth_js_1.loginUser)(email, password)];
                case 4:
                    token = _a.sent();
                    fs_1.default.writeFileSync(TOKEN_FILE, JSON.stringify({ token: token }, null, 2));
                    console.log('✅ Login successful! Token saved.');
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _a.sent();
                    console.error("\u274C Login failed: ".concat(err_1 instanceof Error ? err_1.message : String(err_1)));
                    process.exit(1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function logoutCommand() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (fs_1.default.existsSync(TOKEN_FILE)) {
                fs_1.default.unlinkSync(TOKEN_FILE);
                console.log('✅ Logout successful! Token removed.');
            }
            else {
                console.log('⚠️ No active session found. Nothing to log out.');
            }
            return [2 /*return*/];
        });
    });
}
function createUserCommand() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, email, password, passwordHash, user;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, inquirer_1.default.prompt([
                        { type: 'input', name: 'email', message: 'Email:' },
                        { type: 'password', name: 'password', message: 'Password:', mask: '*' }
                    ])];
                case 1:
                    _a = _b.sent(), email = _a.email, password = _a.password;
                    return [4 /*yield*/, bcrypt_1.default.hash(password, 10)];
                case 2:
                    passwordHash = _b.sent();
                    user = {
                        id: email.split('@')[0], // Just a quick default ID
                        isActive: true,
                        email: email,
                        passwordHash: passwordHash,
                        roles: ['admin'], // Or empty array if you prefer
                        projects: [] // No projects assigned by default
                    };
                    try {
                        (0, users_js_1.createUser)(user);
                        console.log("\u2705 User \"".concat(email, "\" created successfully!"));
                    }
                    catch (err) {
                        console.error("\u274C Failed to create user: ".concat(err instanceof Error ? err.message : String(err)));
                        process.exit(1);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
CommandRegistry_1.cliRegistry.register('auth', {
    name: '',
    description: 'Interactive auth menu',
    action: function (opts) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, authMenu_1.showAuthMenu)()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }
});
// Register each subcommand:
CommandRegistry_1.cliRegistry.register('auth', {
    name: 'login',
    description: 'Log in and save JWT token',
    action: loginCommand
});
CommandRegistry_1.cliRegistry.register('auth', {
    name: 'logout',
    description: 'Log out and remove JWT token',
    action: logoutCommand
});
CommandRegistry_1.cliRegistry.register('auth', {
    name: 'create-user',
    description: 'Create a new user',
    action: createUserCommand
});
