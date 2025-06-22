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
exports.showModelSchemasMenu = showModelSchemasMenu;
// src/cli/menu/modelsMenu.ts
var inquirer_1 = require("inquirer");
var models_1 = require("../commands/models");
var entriesMenu_1 = require("./entriesMenu");
var showWelcomeBanner_1 = require("../utils/showWelcomeBanner");
var projectSelectPrompt_1 = require("../utils/projectSelectPrompt");
var auth_1 = require("../utils/auth");
function showModelSchemasMenu(project) {
    return __awaiter(this, void 0, void 0, function () {
        var user, action, _a, modelId, modelId, modelId;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    user = (0, auth_1.cliLoadUser)();
                    (0, showWelcomeBanner_1.showWelcomeBanner)();
                    if (!!project) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, projectSelectPrompt_1.projectSelectPrompt)(user)];
                case 1:
                    project = _b.sent();
                    _b.label = 2;
                case 2:
                    console.clear();
                    console.log("\n\uD83D\uDCE6 Model Management for Project: ".concat(project));
                    return [4 /*yield*/, inquirer_1.default.prompt([
                            {
                                type: 'list',
                                name: 'action',
                                message: 'Choose an action:',
                                choices: [
                                    { name: '📦 List model schemas', value: 'list' },
                                    { name: '➕ Create a new model schema', value: 'create' },
                                    { name: '🔧 Edit a model schema', value: 'edit' },
                                    { name: '🗑️ Delete a model schema', value: 'delete' },
                                    new inquirer_1.default.Separator(),
                                    { name: '📁 View entries for a model', value: 'entries' },
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
                        case 'edit': return [3 /*break*/, 8];
                        case 'delete': return [3 /*break*/, 11];
                        case 'entries': return [3 /*break*/, 14];
                        case 'back': return [3 /*break*/, 17];
                    }
                    return [3 /*break*/, 18];
                case 4: return [4 /*yield*/, (0, models_1.listModelSchemasCommand)({ projectId: project })];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 18];
                case 6: return [4 /*yield*/, (0, models_1.createModelSchemaCommand)({ projectId: project })];
                case 7:
                    _b.sent();
                    return [3 /*break*/, 18];
                case 8: return [4 /*yield*/, inquirer_1.default.prompt({
                        type: 'input',
                        name: 'modelId',
                        message: 'Enter the model schema ID to edit:'
                    })];
                case 9:
                    modelId = (_b.sent()).modelId;
                    return [4 /*yield*/, (0, models_1.patchModelSchemaCommand)({ projectId: project, id: modelId })];
                case 10:
                    _b.sent();
                    return [3 /*break*/, 18];
                case 11: return [4 /*yield*/, inquirer_1.default.prompt({
                        type: 'input',
                        name: 'modelId',
                        message: 'Enter the model schema ID to delete:'
                    })];
                case 12:
                    modelId = (_b.sent()).modelId;
                    return [4 /*yield*/, (0, models_1.deleteModelSchemaCommand)({ projectId: project, id: modelId })];
                case 13:
                    _b.sent();
                    return [3 /*break*/, 18];
                case 14: return [4 /*yield*/, inquirer_1.default.prompt({
                        type: 'input',
                        name: 'modelId',
                        message: 'Enter the model ID to view entries:'
                    })];
                case 15:
                    modelId = (_b.sent()).modelId;
                    return [4 /*yield*/, (0, entriesMenu_1.showEntriesMenu)(project, modelId)];
                case 16:
                    _b.sent();
                    return [3 /*break*/, 18];
                case 17: return [2 /*return*/];
                case 18: return [4 /*yield*/, inquirer_1.default.prompt([
                        { type: 'input', name: 'continue', message: 'Press Enter to continue...' }
                    ])];
                case 19:
                    _b.sent();
                    return [4 /*yield*/, showModelSchemasMenu(project)];
                case 20:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
