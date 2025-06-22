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
exports.showProjectsMenu = showProjectsMenu;
var inquirer_1 = require("inquirer");
var projects_js_1 = require("@moteur/core/projects.js");
var projectMenu_js_1 = require("./projectMenu.js");
var showWelcomeBanner_js_1 = require("../utils/showWelcomeBanner.js");
var project_js_1 = require("../commands/project.js");
var auth_js_1 = require("../utils/auth.js");
function showProjectsMenu() {
    return __awaiter(this, void 0, void 0, function () {
        var user, projects, choices, selectedProject, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = (0, auth_js_1.cliLoadUser)();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    (0, showWelcomeBanner_js_1.showWelcomeBanner)();
                    return [4 /*yield*/, (0, projects_js_1.listProjects)(user)];
                case 2:
                    projects = _a.sent();
                    choices = projects.map(function (p) { return ({ name: p.label, value: p.id }); });
                    choices.push({ name: '➕ Create new project', value: '__create' }, { name: '⬅️ Back', value: '__back' });
                    return [4 /*yield*/, inquirer_1.default.prompt([
                            {
                                type: 'list',
                                name: 'selectedProject',
                                message: 'Select a project:',
                                choices: choices
                            }
                        ])];
                case 3:
                    selectedProject = (_a.sent()).selectedProject;
                    if (selectedProject === '__back')
                        return [2 /*return*/];
                    if (!(selectedProject === '__create')) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, project_js_1.createProjectCommand)({})];
                case 4:
                    _a.sent();
                    return [2 /*return*/, showProjectsMenu()]; // show the list again after creating
                case 5: return [4 /*yield*/, (0, projectMenu_js_1.showProjectMenu)(selectedProject)];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    err_1 = _a.sent();
                    if (err_1 instanceof Error && err_1.name === 'ExitPromptError') {
                        console.log('\n👋 Goodbye!'); // noop; silence this error
                    }
                    else {
                        console.error('\n❌ Error:', err_1);
                    }
                    process.exit(1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
