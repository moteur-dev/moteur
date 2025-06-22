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
exports.listEntriesCommand = listEntriesCommand;
exports.getEntryCommand = getEntryCommand;
exports.createEntryCommand = createEntryCommand;
exports.patchEntryCommand = patchEntryCommand;
exports.deleteEntryCommand = deleteEntryCommand;
exports.validateEntryCommand = validateEntryCommand;
exports.validateAllEntriesCommand = validateAllEntriesCommand;
var inquirer_1 = require("inquirer");
var entries_js_1 = require("@moteur/core/entries.js");
var models_js_1 = require("@moteur/core/models.js");
var resolveInputData_js_1 = require("../utils/resolveInputData.js");
var editJsonInEditor_js_1 = require("../utils/editJsonInEditor.js");
var projectSelectPrompt_js_1 = require("../utils/projectSelectPrompt.js");
var renderCliField_js_1 = require("../field-renderers/renderCliField.js");
var modelSelectPrompt_js_1 = require("../utils/modelSelectPrompt.js");
var entrySelectPrompt_js_1 = require("../utils/entrySelectPrompt.js");
var validateEntry_js_1 = require("@moteur/core/validators/validateEntry.js");
var auth_js_1 = require("../utils/auth.js");
var CommandRegistry_js_1 = require("@moteur/core/registry/CommandRegistry.js");
var entriesMenu_js_1 = require("../menu/entriesMenu.js");
function listEntriesCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user, entries;
        return __generator(this, function (_a) {
            user = (0, auth_js_1.cliLoadUser)();
            entries = (0, entries_js_1.listEntries)(user, args.projectId, args.model);
            if (entries.length === 0) {
                if (!args.quiet) {
                    console.log('📂 No entries found for this model.');
                }
                return [2 /*return*/];
            }
            if (args.json)
                return [2 /*return*/, console.log(JSON.stringify(entries, null, 2))];
            if (!args.quiet) {
                console.log("\uD83D\uDCC1 Entries for model \"".concat(args.model, "\" in project \"").concat(args.projectId, "\":"));
                entries.forEach(function (e) { return console.log("- ".concat(e.id)); });
            }
            return [2 /*return*/];
        });
    });
}
function getEntryCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user, entry;
        return __generator(this, function (_a) {
            user = (0, auth_js_1.cliLoadUser)();
            entry = (0, entries_js_1.getEntry)(user, args.projectId, args.model, args.id);
            if (args.json)
                return [2 /*return*/, console.log(JSON.stringify(entry, null, 2))];
            if (!args.quiet) {
                console.log("\uD83D\uDCC1 Entry \"".concat(args.id, "\" in model \"").concat(args.model, "\":"));
                console.log(entry);
            }
            return [2 /*return*/];
        });
    });
}
function createEntryCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user, _a, _b, modelSchema, editMode, entry, skeletonEntry, edited, entryId, _i, _c, _d, key, fieldSchema, _e, _f, created;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    user = (0, auth_js_1.cliLoadUser)();
                    if (!!args.projectId) return [3 /*break*/, 2];
                    _a = args;
                    return [4 /*yield*/, (0, projectSelectPrompt_js_1.projectSelectPrompt)(user)];
                case 1:
                    _a.projectId = _g.sent();
                    _g.label = 2;
                case 2:
                    if (!!args.model) return [3 /*break*/, 4];
                    _b = args;
                    return [4 /*yield*/, (0, modelSelectPrompt_js_1.modelSelectPrompt)(user, args.projectId)];
                case 3:
                    _b.model = _g.sent();
                    _g.label = 4;
                case 4:
                    if (!args.projectId || !args.model) {
                        console.error('❌ Project ID and model are required to create an entry.');
                        return [2 /*return*/];
                    }
                    modelSchema = (0, models_js_1.getModelSchema)(user, args.projectId, args.model);
                    return [4 /*yield*/, inquirer_1.default.prompt({
                            type: 'list',
                            name: 'editMode',
                            message: 'How would you like to create the entry?',
                            choices: [
                                { name: '📝 Interactive prompts', value: 'interactive' },
                                { name: '🗂️  JSON editor', value: 'json' }
                            ]
                        })];
                case 5:
                    editMode = (_g.sent()).editMode;
                    entry = {
                        type: args.model,
                        data: {},
                        meta: {},
                        options: {}
                    };
                    if (!(editMode === 'json')) return [3 /*break*/, 7];
                    skeletonEntry = {
                        id: '',
                        type: args.model,
                        data: Object.keys(modelSchema.fields).reduce(function (acc, key) {
                            acc[key] = null; // or sensible defaults
                            return acc;
                        }, {}),
                        meta: {},
                        options: {}
                    };
                    return [4 /*yield*/, (0, editJsonInEditor_js_1.editJsonInEditor)(skeletonEntry, 'New Entry JSON')];
                case 6:
                    edited = _g.sent();
                    if (!edited) {
                        console.log('❌ Entry creation cancelled.');
                        return [2 /*return*/];
                    }
                    entry = edited;
                    return [3 /*break*/, 12];
                case 7: return [4 /*yield*/, inquirer_1.default.prompt({
                        type: 'input',
                        name: 'entryId',
                        message: 'Enter entry ID:',
                        validate: function (input) { return input.trim() !== '' || 'Entry ID cannot be empty.'; }
                    })];
                case 8:
                    entryId = (_g.sent()).entryId;
                    entry.id = entryId;
                    entry.data = entry.data || {};
                    _i = 0, _c = Object.entries(modelSchema.fields);
                    _g.label = 9;
                case 9:
                    if (!(_i < _c.length)) return [3 /*break*/, 12];
                    _d = _c[_i], key = _d[0], fieldSchema = _d[1];
                    console.log("\n\uD83D\uDD8A\uFE0F Field: ".concat(key, " (").concat(fieldSchema.type, ")"));
                    _e = entry.data;
                    _f = key;
                    return [4 /*yield*/, (0, renderCliField_js_1.renderCliField)(fieldSchema.type, fieldSchema)];
                case 10:
                    _e[_f] = _g.sent();
                    _g.label = 11;
                case 11:
                    _i++;
                    return [3 /*break*/, 9];
                case 12:
                    created = (0, entries_js_1.createEntry)(user, args.projectId, args.model, entry);
                    if (!args.quiet) {
                        console.log("\u2705 Created entry \"".concat(created.id, "\" in model \"").concat(args.model, "\" and project \"").concat(args.projectId, "\"."));
                    }
                    return [2 /*return*/, created];
            }
        });
    });
}
function patchEntryCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user, _a, _b, entry, patch_1, updated_1, schema, patch, _i, _c, _d, key, fieldSchema, currentValue, value, updated;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    user = (0, auth_js_1.cliLoadUser)();
                    if (!!args.projectId) return [3 /*break*/, 2];
                    _a = args;
                    return [4 /*yield*/, (0, projectSelectPrompt_js_1.projectSelectPrompt)(user)];
                case 1:
                    _a.projectId = _e.sent();
                    _e.label = 2;
                case 2:
                    if (!!args.model) return [3 /*break*/, 4];
                    _b = args;
                    return [4 /*yield*/, (0, modelSelectPrompt_js_1.modelSelectPrompt)(user, args.projectId)];
                case 3:
                    _b.model = _e.sent();
                    _e.label = 4;
                case 4:
                    if (!args.projectId || !args.model) {
                        console.error('❌ Project ID and model are required to create an entry.');
                        return [2 /*return*/];
                    }
                    if (!args.id) {
                        console.error('❌ Entry ID is required to patch an entry.');
                        return [2 /*return*/];
                    }
                    entry = (0, entries_js_1.getEntry)(user, args.projectId, args.model, args.id);
                    if (!(args.file || args.data)) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, resolveInputData_js_1.resolveInputData)({
                            file: args.file,
                            data: args.data,
                            interactiveFields: []
                        })];
                case 5:
                    patch_1 = _e.sent();
                    updated_1 = (0, entries_js_1.updateEntry)(user, args.projectId, args.model, args.id, patch_1);
                    if (!args.quiet) {
                        console.log("\uD83D\uDD27 Patched entry \"".concat(args.id, "\" in model \"").concat(args.model, "\" and project \"").concat(args.projectId, "\"."));
                    }
                    return [2 /*return*/, updated_1];
                case 6:
                    schema = (0, models_js_1.getModelSchema)(user, args.projectId, args.model);
                    patch = {};
                    patch.data = entry.data || {};
                    console.log('\n⚙️  Edit fields for the entry (press enter to keep existing values):\n');
                    _i = 0, _c = Object.entries(schema.fields);
                    _e.label = 7;
                case 7:
                    if (!(_i < _c.length)) return [3 /*break*/, 10];
                    _d = _c[_i], key = _d[0], fieldSchema = _d[1];
                    currentValue = entry.data[key];
                    return [4 /*yield*/, (0, renderCliField_js_1.renderCliField)(fieldSchema.type, fieldSchema, currentValue)];
                case 8:
                    value = _e.sent();
                    patch.data[key] = value;
                    _e.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 7];
                case 10:
                    updated = (0, entries_js_1.updateEntry)(user, args.projectId, args.model, args.id, patch);
                    if (!args.quiet) {
                        console.log("\uD83D\uDD27 Patched entry \"".concat(args.id, "\" in model \"").concat(args.model, "\" and project \"").concat(args.projectId, "\"."));
                    }
                    return [2 /*return*/, updated];
            }
        });
    });
}
function deleteEntryCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
            user = (0, auth_js_1.cliLoadUser)();
            (0, entries_js_1.deleteEntry)(user, args.projectId, args.model, args.id);
            if (!args.quiet) {
                console.log("\uD83D\uDDD1\uFE0F Moved entry \"".concat(args.id, "\" to trash in model \"").concat(args.model, "\" and project \"").concat(args.projectId, "\"."));
            }
            return [2 /*return*/];
        });
    });
}
function validateEntryCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    user = (0, auth_js_1.cliLoadUser)();
                    if (!!args.projectId) return [3 /*break*/, 2];
                    _a = args;
                    return [4 /*yield*/, (0, projectSelectPrompt_js_1.projectSelectPrompt)(user)];
                case 1:
                    _a.projectId = _d.sent();
                    _d.label = 2;
                case 2:
                    if (!!args.model) return [3 /*break*/, 4];
                    _b = args;
                    return [4 /*yield*/, (0, modelSelectPrompt_js_1.modelSelectPrompt)(user, args.projectId)];
                case 3:
                    _b.model = _d.sent();
                    _d.label = 4;
                case 4:
                    if (!!args.id) return [3 /*break*/, 6];
                    _c = args;
                    return [4 /*yield*/, (0, entrySelectPrompt_js_1.entrySelectPrompt)(user, args.projectId, args.model)];
                case 5:
                    _c.id = _d.sent();
                    _d.label = 6;
                case 6:
                    if (!args.projectId || !args.model || !args.id) {
                        console.error('❌ Project ID and model are required to create an entry.');
                        return [2 /*return*/];
                    }
                    return [2 /*return*/, validateSingleEntry(args)];
            }
        });
    });
}
function validateAllEntriesCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user, _a, _b;
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
                    if (!!args.model) return [3 /*break*/, 4];
                    _b = args;
                    return [4 /*yield*/, (0, modelSelectPrompt_js_1.modelSelectPrompt)(user, args.projectId)];
                case 3:
                    _b.model = _c.sent();
                    _c.label = 4;
                case 4:
                    if (!args.projectId || !args.model) {
                        throw new Error('❌ Project ID and model are required to create an entry.');
                    }
                    return [2 /*return*/, validateAllEntries(args)];
            }
        });
    });
}
function validateSingleEntry(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user, entry, modelSchema, validationResult;
        return __generator(this, function (_a) {
            user = (0, auth_js_1.cliLoadUser)();
            entry = (0, entries_js_1.getEntry)(user, args.projectId, args.model, args.id);
            if (!entry) {
                throw new Error("\u274C Entry \"".concat(args.id, "\" not found in model \"").concat(args.model, "\" and project \"").concat(args.projectId, "\"."));
            }
            modelSchema = (0, models_js_1.getModelSchema)(user, args.projectId, args.model);
            if (!modelSchema) {
                throw new Error("\u274C Model schema \"".concat(args.model, "\" not found in project \"").concat(args.projectId, "\"."));
            }
            validationResult = (0, validateEntry_js_1.validateEntry)(entry, modelSchema);
            if (validationResult.valid) {
                if (!args.quiet) {
                    console.log('✅ Entry is valid!');
                }
            }
            else {
                console.log('❌ Validation errors:');
                validationResult.issues.forEach(function (e) {
                    console.log("- ".concat(e.path, ": ").concat(e.message));
                });
            }
            if (args.json) {
                console.log(JSON.stringify(validationResult, null, 2));
            }
            return [2 /*return*/, validationResult];
        });
    });
}
function validateAllEntries(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user, modelSchema, entries, validationResults, allValid;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = (0, auth_js_1.cliLoadUser)();
                    modelSchema = (0, models_js_1.getModelSchema)(user, args.projectId, args.model);
                    if (!modelSchema) {
                        throw new Error("\u274C Model schema \"".concat(args.model, "\" not found in project \"").concat(args.projectId, "\"."));
                    }
                    entries = (0, entries_js_1.listEntries)(user, args.projectId, args.model);
                    if (entries.length === 0) {
                        console.log('📂 No entries found for this model.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, Promise.all(entries.map(function (entry) { return (0, validateEntry_js_1.validateEntry)(entry, modelSchema); }))];
                case 1:
                    validationResults = _a.sent();
                    allValid = validationResults.every(function (result) { return result.valid; });
                    if (allValid) {
                        console.log('✅ All entries are valid!');
                    }
                    if (args.json) {
                        console.log(JSON.stringify(validationResults, null, 2));
                    }
                    return [2 /*return*/, validationResults];
            }
        });
    });
}
CommandRegistry_js_1.cliRegistry.register('entries', {
    name: '',
    description: 'Interactive entries menu',
    action: function (opts) { return __awaiter(void 0, void 0, void 0, function () {
        var projectId, model;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    projectId = opts.projectId;
                    model = opts.model;
                    return [4 /*yield*/, (0, entriesMenu_js_1.showEntriesMenu)(projectId, model)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }
});
// entries list
CommandRegistry_js_1.cliRegistry.register('entries', {
    name: 'list',
    description: 'List all entries for a model',
    action: listEntriesCommand
});
// entries get
CommandRegistry_js_1.cliRegistry.register('entries', {
    name: 'get',
    description: 'Get a single entry',
    action: getEntryCommand
});
// entries create
CommandRegistry_js_1.cliRegistry.register('entries', {
    name: 'create',
    description: 'Create a new entry',
    action: createEntryCommand
});
// entries patch
CommandRegistry_js_1.cliRegistry.register('entries', {
    name: 'patch',
    description: 'Update an existing entry',
    action: patchEntryCommand
});
// entries delete
CommandRegistry_js_1.cliRegistry.register('entries', {
    name: 'delete',
    description: 'Delete an entry',
    action: deleteEntryCommand
});
// entries validate (single)
CommandRegistry_js_1.cliRegistry.register('entries', {
    name: 'validate',
    description: 'Validate an entry or all entries',
    action: function (opts) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!opts.id) return [3 /*break*/, 2];
                    return [4 /*yield*/, validateEntryCommand(opts)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, validateAllEntriesCommand(opts)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); }
});
