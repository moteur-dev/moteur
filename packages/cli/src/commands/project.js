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
exports.listProjectsCommand = listProjectsCommand;
exports.getProjectCommand = getProjectCommand;
exports.createProjectCommand = createProjectCommand;
exports.patchProjectCommand = patchProjectCommand;
exports.patchProjectJSONCommand = patchProjectJSONCommand;
exports.deleteProjectCommand = deleteProjectCommand;
var projects_1 = require("@moteur/core/projects");
var resolveInputData_1 = require("../utils/resolveInputData");
var editJsonInEditor_1 = require("../utils/editJsonInEditor");
var Project_1 = require("@moteur/types/Project");
var renderCliField_1 = require("../field-renderers/renderCliField");
var projectSelectPrompt_1 = require("../utils/projectSelectPrompt");
var auth_1 = require("../utils/auth");
var CommandRegistry_1 = require("@moteur/core/registry/CommandRegistry");
var projectsMenu_1 = require("../menu/projectsMenu");
function listProjectsCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user, projects;
        return __generator(this, function (_a) {
            user = (0, auth_1.cliLoadUser)();
            projects = (0, projects_1.listProjects)(user);
            if (projects.length === 0) {
                if (!args.quiet) {
                    console.log("\uD83D\uDCC2 No projects found.");
                }
                return [2 /*return*/];
            }
            if (args.json)
                return [2 /*return*/, console.log(JSON.stringify(projects, null, 2))];
            if (!args.quiet) {
                console.log("\uD83D\uDCC1 Projects:");
                projects.forEach(function (p) { return console.log("- ".concat(p.id, " (").concat(p.label, ")")); });
            }
            return [2 /*return*/];
        });
    });
}
function getProjectCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user, _a, project;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    user = (0, auth_1.cliLoadUser)();
                    if (!!args.id) return [3 /*break*/, 2];
                    _a = args;
                    return [4 /*yield*/, (0, projectSelectPrompt_1.projectSelectPrompt)(user)];
                case 1:
                    _a.id = _b.sent();
                    _b.label = 2;
                case 2:
                    project = (0, projects_1.getProject)(user, args.id);
                    if (args.json)
                        return [2 /*return*/, console.log(JSON.stringify(project, null, 2))];
                    if (!args.quiet) {
                        console.log("\uD83D\uDCC1 Project \"".concat(args.id, "\":"));
                        console.log(project);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function createProjectCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user, adminUser, nonInteractiveMode, project, _i, _a, key, fieldSchema, value, created;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    user = (0, auth_1.cliLoadUser)();
                    console.log(user);
                    adminUser = (0, auth_1.cliRequireRole)('admin');
                    console.log("\uD83D\uDD11 Authenticated as admin: ".concat(adminUser.email, "\n"));
                    nonInteractiveMode = !!(args.file || args.data);
                    project = {};
                    if (!nonInteractiveMode) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, resolveInputData_1.resolveInputData)({
                            file: args.file,
                            data: args.data,
                            interactiveFields: []
                        })];
                case 1:
                    project = _b.sent();
                    return [3 /*break*/, 6];
                case 2:
                    _i = 0, _a = Object.keys(Project_1.projectSchemaFields);
                    _b.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    key = _a[_i];
                    fieldSchema = Project_1.projectSchemaFields[key];
                    return [4 /*yield*/, (0, renderCliField_1.renderCliField)(fieldSchema.type, fieldSchema)];
                case 4:
                    value = _b.sent();
                    project[key] = value;
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    created = (0, projects_1.createProject)(user, project);
                    if (args.json) {
                        return [2 /*return*/, console.log(JSON.stringify(created, null, 2))];
                    }
                    if (!args.quiet) {
                        console.log("\u2705 Created project");
                    }
                    return [2 /*return*/, created];
            }
        });
    });
}
function patchProjectCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user, adminUser, _a, patch, nonInteractiveMode, _i, _b, key, fieldSchema, value, updated;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    user = (0, auth_1.cliLoadUser)();
                    adminUser = (0, auth_1.cliRequireRole)('admin');
                    console.log("\uD83D\uDD11 Authenticated as admin: ".concat(adminUser.email, "\n"));
                    if (!!args.id) return [3 /*break*/, 2];
                    _a = args;
                    return [4 /*yield*/, (0, projectSelectPrompt_1.projectSelectPrompt)(user)];
                case 1:
                    _a.id = _c.sent();
                    _c.label = 2;
                case 2:
                    patch = {};
                    nonInteractiveMode = !!(args.file || args.data);
                    if (!nonInteractiveMode) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, resolveInputData_1.resolveInputData)({
                            file: args.file,
                            data: args.data,
                            interactiveFields: ['label']
                        })];
                case 3:
                    patch = _c.sent();
                    return [3 /*break*/, 8];
                case 4:
                    _i = 0, _b = Object.keys(Project_1.projectSchemaFields);
                    _c.label = 5;
                case 5:
                    if (!(_i < _b.length)) return [3 /*break*/, 8];
                    key = _b[_i];
                    fieldSchema = Project_1.projectSchemaFields[key];
                    return [4 /*yield*/, (0, renderCliField_1.renderCliField)(fieldSchema.type, fieldSchema)];
                case 6:
                    value = _c.sent();
                    patch[key] = value;
                    _c.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8:
                    updated = (0, projects_1.updateProject)(user, args.id, patch);
                    if (!args.quiet) {
                        console.log("\uD83D\uDD27 Patched project \"".concat(args.id, "\""));
                    }
                    return [2 /*return*/, updated];
            }
        });
    });
}
function patchProjectJSONCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user, project, edited, updated;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = (0, auth_1.cliLoadUser)();
                    project = (0, projects_1.getProject)(user, args.projectId);
                    return [4 /*yield*/, (0, editJsonInEditor_1.editJsonInEditor)(project, 'Project Settings')];
                case 1:
                    edited = _a.sent();
                    if (edited) {
                        updated = (0, projects_1.updateProject)(user, args.projectId, edited);
                        if (!args.quiet) {
                            console.log("\u2705 Project \"".concat(args.projectId, "\" updated via JSON editor."));
                        }
                        return [2 /*return*/, updated];
                    }
                    else {
                        if (!args.quiet) {
                            console.log('❌ Edit cancelled or invalid JSON.');
                        }
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function deleteProjectCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
            user = (0, auth_1.cliLoadUser)();
            (0, projects_1.deleteProject)(user, args.id);
            if (!args.quiet) {
                console.log("\uD83D\uDDD1\uFE0F Moved project \"".concat(args.id, "\" to trash"));
            }
            return [2 /*return*/];
        });
    });
}
CommandRegistry_1.cliRegistry.register('projects', {
    name: '', // default when you run `moteur projects`
    description: 'Interactive projects menu',
    action: function (opts) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, projectsMenu_1.showProjectsMenu)()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }
});
CommandRegistry_1.cliRegistry.register('projects', {
    name: 'list',
    description: 'List all projects',
    action: listProjectsCommand
});
CommandRegistry_1.cliRegistry.register('projects', {
    name: 'get',
    description: 'Get one project by id',
    action: getProjectCommand
});
CommandRegistry_1.cliRegistry.register('projects', {
    name: 'create',
    description: 'Create a new project',
    action: createProjectCommand
});
CommandRegistry_1.cliRegistry.register('projects', {
    name: 'patch',
    description: 'Update an existing project',
    action: patchProjectCommand
});
CommandRegistry_1.cliRegistry.register('projects', {
    name: 'edit-json',
    description: 'Edit project JSON in your editor',
    action: patchProjectJSONCommand
});
CommandRegistry_1.cliRegistry.register('projects', {
    name: 'delete',
    description: 'Delete (trash) a project',
    action: deleteProjectCommand
});
