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
exports.showStructuresMenu = showStructuresMenu;
var inquirer_1 = require("inquirer");
var structures_js_1 = require("../commands/structures.js");
var showWelcomeBanner_js_1 = require("../utils/showWelcomeBanner.js");
var projectSelectPrompt_js_1 = require("../utils/projectSelectPrompt.js");
var auth_js_1 = require("../utils/auth.js");
function showStructuresMenu(project) {
    return __awaiter(this, void 0, void 0, function () {
        var user, action, _a, structureId, structureId;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    user = (0, auth_js_1.cliLoadUser)();
                    (0, showWelcomeBanner_js_1.showWelcomeBanner)();
                    if (!!project) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, projectSelectPrompt_js_1.projectSelectPrompt)(user)];
                case 1:
                    project = _b.sent();
                    _b.label = 2;
                case 2:
                    console.clear();
                    (0, showWelcomeBanner_js_1.showWelcomeBanner)();
                    console.log("\n\uD83D\uDCC1 Structure Management for Project: ".concat(project));
                    return [4 /*yield*/, inquirer_1.default.prompt([
                            {
                                type: 'list',
                                name: 'action',
                                message: 'Choose an action:',
                                choices: [
                                    { name: '📁 List structures', value: 'list' },
                                    { name: '➕ Create a new structure', value: 'create' },
                                    { name: '🔧 Edit a structure', value: 'edit' },
                                    { name: '🗑️ Delete a structure', value: 'delete' },
                                    new inquirer_1.default.Separator(),
                                    { name: '🔙 Back to project menu', value: 'back' }
                                ]
                            }
                        ])];
                case 3:
                    action = (_b.sent()).action;
                    _a = action;
                    switch (_a) {
                        case 'list': return [3 /*break*/, 4];
                        case 'create': return [3 /*break*/, 6];
                        case 'edit': return [3 /*break*/, 7];
                        case 'delete': return [3 /*break*/, 9];
                        case 'back': return [3 /*break*/, 11];
                    }
                    return [3 /*break*/, 12];
                case 4: return [4 /*yield*/, (0, structures_js_1.listStructuresCommand)({ project: project })];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 12];
                case 6: 
                //await createStructureCommand( { project: project });
                return [3 /*break*/, 12];
                case 7: return [4 /*yield*/, inquirer_1.default.prompt({
                        type: 'input',
                        name: 'structureId',
                        message: 'Enter the structure ID to edit:'
                    })];
                case 8:
                    structureId = (_b.sent()).structureId;
                    //await patchStructureCommand({ project: project, id: structureId });
                    return [3 /*break*/, 12];
                case 9: return [4 /*yield*/, inquirer_1.default.prompt({
                        type: 'input',
                        name: 'structureId',
                        message: 'Enter the structure ID to delete:'
                    })];
                case 10:
                    structureId = (_b.sent()).structureId;
                    //await deleteStructureCommand({ project: project, id: structureId });
                    return [3 /*break*/, 12];
                case 11: return [2 /*return*/];
                case 12: return [4 /*yield*/, inquirer_1.default.prompt([
                        { type: 'input', name: 'continue', message: 'Press Enter to continue...' }
                    ])];
                case 13:
                    _b.sent();
                    return [4 /*yield*/, showStructuresMenu(project)];
                case 14:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
