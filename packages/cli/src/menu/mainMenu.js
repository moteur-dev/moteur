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
exports.showMainMenu = showMainMenu;
// src/cli/menu/mainMenu.ts
var inquirer_1 = require("inquirer");
var authMenu_js_1 = require("./authMenu.js");
var projectsMenu_js_1 = require("./projectsMenu.js");
var systemSettingsMenu_js_1 = require("./systemSettingsMenu.js");
var showWelcomeBanner_js_1 = require("../utils/showWelcomeBanner.js");
function showMainMenu() {
    return __awaiter(this, void 0, void 0, function () {
        var mainChoice, _a, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 11, , 12]);
                    console.clear();
                    (0, showWelcomeBanner_js_1.showWelcomeBanner)();
                    return [4 /*yield*/, inquirer_1.default.prompt([
                            {
                                type: 'list',
                                name: 'mainChoice',
                                message: 'What would you like to do?',
                                choices: [
                                    { name: '🔐 Authenticate', value: 'auth' },
                                    { name: '📁 View available projects', value: 'projects' },
                                    { name: '🛠️  System settings', value: 'settings' },
                                    new inquirer_1.default.Separator(),
                                    { name: '❌ Exit', value: 'exit' }
                                ]
                            }
                        ])];
                case 1:
                    mainChoice = (_b.sent()).mainChoice;
                    _a = mainChoice;
                    switch (_a) {
                        case 'auth': return [3 /*break*/, 2];
                        case 'projects': return [3 /*break*/, 4];
                        case 'settings': return [3 /*break*/, 6];
                        case 'exit': return [3 /*break*/, 8];
                    }
                    return [3 /*break*/, 9];
                case 2: return [4 /*yield*/, (0, authMenu_js_1.showAuthMenu)()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 4: return [4 /*yield*/, (0, projectsMenu_js_1.showProjectsMenu)()];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 6: return [4 /*yield*/, (0, systemSettingsMenu_js_1.showSystemSettingsMenu)()];
                case 7:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 8:
                    console.log('\n👋 Goodbye!');
                    process.exit(0);
                    _b.label = 9;
                case 9: 
                // Loop back to main menu
                return [4 /*yield*/, showMainMenu()];
                case 10:
                    // Loop back to main menu
                    _b.sent();
                    return [3 /*break*/, 12];
                case 11:
                    err_1 = _b.sent();
                    if (err_1 instanceof Error && err_1.name === 'ExitPromptError') {
                        console.log('\n👋 Goodbye!'); // noop; silence this error
                    }
                    else {
                        console.error('\n❌ Error:', err_1);
                    }
                    process.exit(1);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    });
}
