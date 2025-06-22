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
exports.listModelSchemasCommand = listModelSchemasCommand;
exports.getModelSchemaCommand = getModelSchemaCommand;
exports.createModelSchemaCommand = createModelSchemaCommand;
exports.patchModelSchemaCommand = patchModelSchemaCommand;
exports.deleteModelSchemaCommand = deleteModelSchemaCommand;
var inquirer_1 = require("inquirer");
var models_js_1 = require("@moteur/core/models.js");
var renderCliField_js_1 = require("../field-renderers/renderCliField.js");
require("../field-renderers/index.js");
var editModelSchemaFields_js_1 = require("../utils/editModelSchemaFields.js");
var projectSelectPrompt_js_1 = require("../utils/projectSelectPrompt.js");
var resolveInputData_js_1 = require("../utils/resolveInputData.js");
var Model_js_1 = require("@moteur/types/Model.js");
var auth_js_1 = require("../utils/auth.js");
var CommandRegistry_js_1 = require("@moteur/core/registry/CommandRegistry.js");
var modelsMenu_js_1 = require("../menu/modelsMenu.js");
function listModelSchemasCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user, _a, models;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    user = (0, auth_js_1.cliLoadUser)();
                    if (!!args.projectId) return [3 /*break*/, 2];
                    _a = args;
                    return [4 /*yield*/, (0, projectSelectPrompt_js_1.projectSelectPrompt)(user)];
                case 1:
                    _a.projectId = _b.sent();
                    _b.label = 2;
                case 2:
                    models = (0, models_js_1.listModelSchemas)(user, args.projectId);
                    if (models.length === 0) {
                        if (!args.quiet)
                            console.log("\uD83D\uDCC2 No model schemas found in project \"".concat(args.projectId, "\"."));
                        return [2 /*return*/];
                    }
                    if (args.json) {
                        return [2 /*return*/, console.log(JSON.stringify(models, null, 2))];
                    }
                    if (!args.quiet) {
                        console.log("\uD83D\uDCC1 Model Schemas in project \"".concat(args.projectId, "\":"));
                        models.forEach(function (m) { return console.log("- ".concat(m.id, " (").concat(m.label, ")")); });
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function getModelSchemaCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user, model;
        return __generator(this, function (_a) {
            user = (0, auth_js_1.cliLoadUser)();
            model = (0, models_js_1.getModelSchema)(user, args.projectId, args.id);
            if (args.json) {
                return [2 /*return*/, console.log(JSON.stringify(model, null, 2))];
            }
            if (!args.quiet) {
                console.log("\uD83D\uDCC1 Model Schema \"".concat(args.id, "\":"));
                console.log(model);
            }
            return [2 /*return*/];
        });
    });
}
function createModelSchemaCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user, _a, model, nonInteractiveMode, _i, _b, key, fieldSchema, value, created, editFields;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    user = (0, auth_js_1.cliLoadUser)();
                    if (!!args.projectId) return [3 /*break*/, 2];
                    _a = args;
                    return [4 /*yield*/, (0, projectSelectPrompt_js_1.projectSelectPrompt)(user)];
                case 1:
                    _a.projectId = _c.sent();
                    _c.label = 2;
                case 2:
                    model = {};
                    nonInteractiveMode = !!(args.file || args.data);
                    if (!nonInteractiveMode) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, resolveInputData_js_1.resolveInputData)({
                            file: args.file,
                            data: args.data,
                            interactiveFields: []
                        })];
                case 3:
                    model = _c.sent();
                    return [3 /*break*/, 8];
                case 4:
                    console.log('Please provide the model schema details interactively:');
                    _i = 0, _b = Object.keys(Model_js_1.modelSchemaFields);
                    _c.label = 5;
                case 5:
                    if (!(_i < _b.length)) return [3 /*break*/, 8];
                    key = _b[_i];
                    fieldSchema = Model_js_1.modelSchemaFields[key];
                    return [4 /*yield*/, (0, renderCliField_js_1.renderCliField)(fieldSchema.type, fieldSchema)];
                case 6:
                    value = _c.sent();
                    model[key] = value;
                    _c.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8:
                    // Empty structures for fields & optionsSchema
                    model.fields = {};
                    model.optionsSchema = {};
                    created = (0, models_js_1.createModelSchema)(user, args.projectId, model);
                    if (args.json) {
                        return [2 /*return*/, console.log(JSON.stringify(created, null, 2))];
                    }
                    if (!args.quiet) {
                        console.log("\u2705 Created model schema \"".concat(created.id, "\" in project \"").concat(args.projectId, "\"."));
                    }
                    if (!!nonInteractiveMode) return [3 /*break*/, 11];
                    return [4 /*yield*/, inquirer_1.default.prompt({
                            type: 'confirm',
                            name: 'editFields',
                            message: 'Would you like to add/edit fields now?',
                            default: true
                        })];
                case 9:
                    editFields = (_c.sent()).editFields;
                    if (!editFields) return [3 /*break*/, 11];
                    return [4 /*yield*/, (0, editModelSchemaFields_js_1.editModelSchemaFields)(user, args.projectId, created.id)];
                case 10:
                    _c.sent();
                    _c.label = 11;
                case 11: return [2 /*return*/, created];
            }
        });
    });
}
function patchModelSchemaCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user, _a, patch, updated;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    user = (0, auth_js_1.cliLoadUser)();
                    if (!!args.projectId) return [3 /*break*/, 2];
                    _a = args;
                    return [4 /*yield*/, (0, projectSelectPrompt_js_1.projectSelectPrompt)(user)];
                case 1:
                    _a.projectId = _b.sent();
                    _b.label = 2;
                case 2: return [4 /*yield*/, (0, resolveInputData_js_1.resolveInputData)({
                        file: args.file,
                        data: args.data,
                        interactiveFields: ['label', 'description', 'modelType']
                    })];
                case 3:
                    patch = _b.sent();
                    updated = (0, models_js_1.updateModelSchema)(user, args.projectId, args.id, patch);
                    if (!args.quiet) {
                        console.log("\uD83D\uDD27 Patched model schema \"".concat(args.id, "\" in project \"").concat(args.projectId, "\"."));
                    }
                    if (args.json)
                        return [2 /*return*/, console.log(JSON.stringify(updated, null, 2))];
                    return [2 /*return*/, updated];
            }
        });
    });
}
function deleteModelSchemaCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
            user = (0, auth_js_1.cliLoadUser)();
            (0, models_js_1.deleteModelSchema)(user, args.projectId, args.id);
            if (!args.quiet) {
                console.log("\uD83D\uDDD1\uFE0F Moved model schema \"".concat(args.id, "\" to trash in project \"").concat(args.projectId, "\"."));
            }
            return [2 /*return*/];
        });
    });
}
CommandRegistry_js_1.cliRegistry.register('models', {
    name: '',
    description: 'Interactive models menu',
    action: function (opts) { return __awaiter(void 0, void 0, void 0, function () {
        var user, projectId, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    user = (0, auth_js_1.cliLoadUser)();
                    if (!((_b = opts.projectId) !== null && _b !== void 0)) return [3 /*break*/, 1];
                    _a = _b;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, (0, projectSelectPrompt_js_1.projectSelectPrompt)(user)];
                case 2:
                    _a = (_c.sent());
                    _c.label = 3;
                case 3:
                    projectId = _a;
                    return [4 /*yield*/, (0, modelsMenu_js_1.showModelSchemasMenu)(projectId)];
                case 4:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); }
});
CommandRegistry_js_1.cliRegistry.register('models', {
    name: 'list',
    description: 'List all model schemas',
    action: listModelSchemasCommand
});
CommandRegistry_js_1.cliRegistry.register('models', {
    name: 'get',
    description: 'Get a single model schema',
    action: getModelSchemaCommand
});
CommandRegistry_js_1.cliRegistry.register('models', {
    name: 'create',
    description: 'Create a new model schema',
    action: createModelSchemaCommand
});
CommandRegistry_js_1.cliRegistry.register('models', {
    name: 'patch',
    description: 'Update an existing model schema',
    action: patchModelSchemaCommand
});
CommandRegistry_js_1.cliRegistry.register('models', {
    name: 'delete',
    description: 'Delete a model schema',
    action: deleteModelSchemaCommand
});
