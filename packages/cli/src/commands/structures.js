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
exports.listStructuresCommand = listStructuresCommand;
exports.getStructureCommand = getStructureCommand;
exports.createStructureCommand = createStructureCommand;
exports.patchStructureCommand = patchStructureCommand;
exports.deleteStructureCommand = deleteStructureCommand;
var structures_js_1 = require("@moteur/core/structures.js");
var resolveInputData_js_1 = require("../utils/resolveInputData.js");
var CommandRegistry_js_1 = require("@moteur/core/registry/CommandRegistry.js");
var structuresMenu_js_1 = require("../menu/structuresMenu.js");
var auth_js_1 = require("../utils/auth.js");
var projectSelectPrompt_js_1 = require("../utils/projectSelectPrompt.js");
function listStructuresCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var structures;
        return __generator(this, function (_a) {
            structures = (0, structures_js_1.listStructures)(args.project);
            if (args.json) {
                console.log(JSON.stringify(structures, null, 2));
            }
            else if (!args.quiet) {
                console.log("\uD83D\uDCD0 Structures".concat(args.project ? " in project \"".concat(args.project, "\"") : '', ":"));
                Object.entries(structures).forEach(function (_a) {
                    var id = _a[0], s = _a[1];
                    console.log("- ".concat(id, " (").concat(s.label, ")"));
                });
            }
            return [2 /*return*/];
        });
    });
}
function getStructureCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var structure;
        return __generator(this, function (_a) {
            structure = (0, structures_js_1.getStructure)(args.id, args.project);
            if (args.json) {
                console.log(JSON.stringify(structure, null, 2));
            }
            else if (!args.quiet) {
                console.log("\uD83D\uDCD0 ".concat(structure.type, ": ").concat(structure.label));
                console.log("Fields: ".concat(Object.keys(structure.fields).join(', ')));
            }
            return [2 /*return*/];
        });
    });
}
function createStructureCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var input, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, resolveInputData_js_1.resolveInputData)({
                        file: args.file,
                        data: args.data,
                        interactiveFields: ['type', 'label']
                    })];
                case 1:
                    input = _a.sent();
                    result = (0, structures_js_1.createStructure)(args.project, input);
                    if (!args.quiet) {
                        console.log("\u2705 Created structure \"".concat(result.type, "\" in project \"").concat(args.project, "\""));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function patchStructureCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var patch, updated;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, resolveInputData_js_1.resolveInputData)({
                        file: args.file,
                        data: args.data,
                        interactiveFields: ['label']
                    })];
                case 1:
                    patch = _a.sent();
                    updated = (0, structures_js_1.updateStructure)(args.project, args.id, patch);
                    if (!args.quiet) {
                        console.log("\u2705 Updated structure \"".concat(args.id, "\" in project \"").concat(args.project, "\""));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function deleteStructureCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            (0, structures_js_1.deleteStructure)(args.project, args.id);
            if (!args.quiet) {
                console.log("\uD83D\uDDD1\uFE0F Moved structure \"".concat(args.id, "\" to trash in project \"").concat(args.project, "\""));
            }
            return [2 /*return*/];
        });
    });
}
CommandRegistry_js_1.cliRegistry.register('structures', {
    name: '',
    description: 'Interactive structures menu',
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
                    return [4 /*yield*/, (0, structuresMenu_js_1.showStructuresMenu)(projectId)];
                case 4:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); }
});
// structures list
CommandRegistry_js_1.cliRegistry.register('structures', {
    name: 'list',
    description: 'List all structures in a project',
    action: listStructuresCommand
});
// structures get
CommandRegistry_js_1.cliRegistry.register('structures', {
    name: 'get',
    description: 'Get a single structure schema',
    action: getStructureCommand
});
// structures create
CommandRegistry_js_1.cliRegistry.register('structures', {
    name: 'create',
    description: 'Create a new structure schema',
    action: createStructureCommand
});
// structures patch
CommandRegistry_js_1.cliRegistry.register('structures', {
    name: 'patch',
    description: 'Update an existing structure schema',
    action: patchStructureCommand
});
// structures delete
CommandRegistry_js_1.cliRegistry.register('structures', {
    name: 'delete',
    description: 'Delete a structure schema',
    action: deleteStructureCommand
});
