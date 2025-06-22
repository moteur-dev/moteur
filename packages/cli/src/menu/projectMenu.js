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
exports.showProjectMenu = showProjectMenu;
var inquirer_1 = require("inquirer");
var layouts_js_1 = require("@moteur/core/layouts.js");
var layoutMenu_js_1 = require("./layoutMenu.js");
var modelsMenu_js_1 = require("./modelsMenu.js");
var project_js_1 = require("../commands/project.js");
var showWelcomeBanner_js_1 = require("../utils/showWelcomeBanner.js");
var auth_js_1 = require("../utils/auth.js");
function showProjectMenu(projectId) {
    return __awaiter(this, void 0, void 0, function () {
        var user, projectChoice, _a, layouts, choices, selectedLayout, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    user = (0, auth_js_1.cliLoadUser)();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 18, , 19]);
                    (0, showWelcomeBanner_js_1.showWelcomeBanner)();
                    console.log("\n\uD83D\uDD27 Project Context: ".concat(projectId));
                    return [4 /*yield*/, inquirer_1.default.prompt([
                            {
                                type: 'list',
                                name: 'projectChoice',
                                message: 'Choose an action for this project:',
                                choices: [
                                    { name: '📄 View layouts', value: 'layouts' },
                                    { name: '📁 View structures', value: 'structures' },
                                    { name: '📦 View models', value: 'models' },
                                    new inquirer_1.default.Separator(),
                                    { name: '🛠️ Edit project settings (Interactive)', value: 'settings' },
                                    { name: '📝 Edit project settings (JSON)', value: 'settings-json' },
                                    new inquirer_1.default.Separator(),
                                    { name: '⬅️ Back to projects', value: 'back' }
                                ]
                            }
                        ])];
                case 2:
                    projectChoice = (_b.sent()).projectChoice;
                    _a = projectChoice;
                    switch (_a) {
                        case 'layouts': return [3 /*break*/, 3];
                        case 'structures': return [3 /*break*/, 7];
                        case 'models': return [3 /*break*/, 8];
                        case 'settings': return [3 /*break*/, 10];
                        case 'settings-json': return [3 /*break*/, 12];
                        case 'back': return [3 /*break*/, 14];
                    }
                    return [3 /*break*/, 15];
                case 3: return [4 /*yield*/, (0, layouts_js_1.listLayouts)(user, projectId)];
                case 4:
                    layouts = _b.sent();
                    choices = layouts.map(function (p) { return ({ name: p.label, value: p.id }); });
                    choices.push({ name: '➕ Create new layout', value: '__create' }, { name: '🔙 Back', value: '__back' });
                    return [4 /*yield*/, inquirer_1.default.prompt([
                            {
                                type: 'list',
                                name: 'selectedLayout',
                                message: 'Select a layout:',
                                choices: choices
                            }
                        ])];
                case 5:
                    selectedLayout = (_b.sent()).selectedLayout;
                    return [4 /*yield*/, (0, layoutMenu_js_1.showLayoutMenu)({ projectId: projectId, layoutId: selectedLayout })];
                case 6:
                    _b.sent();
                    return [3 /*break*/, 15];
                case 7:
                    {
                        /*const structures = await listStructures(projectId);
                console.log('\n📁 Structures:');
                structures.forEach((structure) => {
                    console.log(`- ${structure.type}: ${structure.label || '(no label)'}`);
                });*/
                        return [3 /*break*/, 15];
                    }
                    _b.label = 8;
                case 8: return [4 /*yield*/, (0, modelsMenu_js_1.showModelSchemasMenu)(projectId)];
                case 9:
                    _b.sent(); // <== Go to the model menu
                    return [3 /*break*/, 15];
                case 10: return [4 /*yield*/, (0, project_js_1.patchProjectCommand)({ id: projectId })];
                case 11:
                    _b.sent();
                    return [3 /*break*/, 15];
                case 12: return [4 /*yield*/, (0, project_js_1.patchProjectJSONCommand)({ projectId: projectId })];
                case 13:
                    _b.sent();
                    return [3 /*break*/, 15];
                case 14: return [2 /*return*/];
                case 15:
                    console.log('\n');
                    return [4 /*yield*/, inquirer_1.default.prompt([
                            { type: 'input', name: 'continue', message: 'Press Enter to return to project menu...' }
                        ])];
                case 16:
                    _b.sent();
                    return [4 /*yield*/, showProjectMenu(projectId)];
                case 17:
                    _b.sent();
                    return [3 /*break*/, 19];
                case 18:
                    err_1 = _b.sent();
                    if (err_1 instanceof Error && err_1.name === 'ExitPromptError') {
                        console.log('\n👋 Goodbye!'); // noop; silence this error
                    }
                    else {
                        console.error('\n❌ Error:', err_1);
                    }
                    process.exit(1);
                    return [3 /*break*/, 19];
                case 19: return [2 /*return*/];
            }
        });
    });
}
