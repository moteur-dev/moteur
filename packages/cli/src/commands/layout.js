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
exports.listLayoutsCommand = listLayoutsCommand;
exports.getLayoutCommand = getLayoutCommand;
exports.createLayoutCommand = createLayoutCommand;
exports.patchLayoutCommand = patchLayoutCommand;
exports.deleteLayoutCommand = deleteLayoutCommand;
exports.renderLayoutCommand = renderLayoutCommand;
var inquirer_1 = require("inquirer");
var layouts_js_1 = require("@moteur/core/layouts.js");
var resolveInputData_1 = require("../utils/resolveInputData");
var blocks_1 = require("@moteur/core/blocks");
var auth_1 = require("../utils/auth");
var CommandRegistry_1 = require("@moteur/core/registry/CommandRegistry");
var layoutMenu_1 = require("../menu/layoutMenu");
function listLayoutsCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user, layouts;
        return __generator(this, function (_a) {
            user = (0, auth_1.cliLoadUser)();
            layouts = (0, layouts_js_1.listLayouts)(user, args.projectId);
            if (args.json)
                return [2 /*return*/, console.log(JSON.stringify(layouts, null, 2))];
            if (!args.quiet) {
                console.log("\uD83D\uDCC4 Layouts in project \"".concat(args.projectId, "\":"));
                layouts.forEach(function (l) { return console.log("- ".concat(l.id, " (").concat(l.label, ")")); });
            }
            return [2 /*return*/];
        });
    });
}
function getLayoutCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user, layout;
        return __generator(this, function (_a) {
            user = (0, auth_1.cliLoadUser)();
            layout = (0, layouts_js_1.getLayout)(user, args.projectId, args.id);
            if (args.json)
                return [2 /*return*/, console.log(JSON.stringify(layout, null, 2))];
            if (!args.quiet) {
                console.log("\uD83D\uDCC4 Layout \"".concat(args.id, "\" in project \"").concat(args.projectId, "\":"));
                console.log(layout);
            }
            return [2 /*return*/];
        });
    });
}
function createLayoutCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user, input, layout;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = (0, auth_1.cliLoadUser)();
                    return [4 /*yield*/, (0, resolveInputData_1.resolveInputData)({
                            file: args.file,
                            data: args.data,
                            interactiveFields: ['id', 'label']
                        })];
                case 1:
                    input = _a.sent();
                    layout = {
                        id: input.id,
                        label: input.label,
                        project: args.projectId,
                        blocks: []
                    };
                    return [4 /*yield*/, editLayoutBlocksInteractively(layout, args.projectId, args.quiet)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, layout];
            }
        });
    });
}
function patchLayoutCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user, layout, patch;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    user = (0, auth_1.cliLoadUser)();
                    layout = (0, layouts_js_1.getLayout)(user, args.projectId, args.id);
                    if (!layout)
                        throw new Error("Layout not found: ".concat(args.id));
                    return [4 /*yield*/, (0, resolveInputData_1.resolveInputData)({
                            file: args.file,
                            data: args.data,
                            interactiveFields: ['label']
                        })];
                case 1:
                    patch = _b.sent();
                    layout.label = (_a = patch.label) !== null && _a !== void 0 ? _a : layout.label;
                    return [4 /*yield*/, editLayoutBlocksInteractively(layout, args.projectId, args.quiet)];
                case 2:
                    _b.sent();
                    return [2 /*return*/, layout];
            }
        });
    });
}
function editLayoutBlocksInteractively(layout, projectId, quiet) {
    return __awaiter(this, void 0, void 0, function () {
        var user, blockRegistry, editing, _loop_1, state_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = (0, auth_1.cliLoadUser)();
                    return [4 /*yield*/, (0, blocks_1.listBlocks)()];
                case 1:
                    blockRegistry = _a.sent();
                    editing = true;
                    _loop_1 = function () {
                        var action, blockType, blockSchema, fieldPrompts, fieldAnswers, index, block_1, blockSchema, fieldPrompts, newFields, index, isNew, result;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    console.clear();
                                    console.log("\u270F\uFE0F Editing layout: ".concat(layout === null || layout === void 0 ? void 0 : layout.id, " (").concat(projectId, ")"));
                                    layout === null || layout === void 0 ? void 0 : layout.blocks.forEach(function (b, i) { return console.log("[".concat(i, "] ").concat(b.type)); });
                                    return [4 /*yield*/, inquirer_1.default.prompt([
                                            {
                                                type: 'list',
                                                name: 'action',
                                                message: 'Choose an action:',
                                                choices: [
                                                    { name: '➕ Add block', value: 'add' },
                                                    { name: '✏️ Edit block', value: 'edit' },
                                                    { name: '❌ Remove block', value: 'remove' },
                                                    { name: '💾 Save and exit', value: 'save' }
                                                ]
                                            }
                                        ])];
                                case 1:
                                    action = (_b.sent()).action;
                                    if (!(action === 'add')) return [3 /*break*/, 4];
                                    return [4 /*yield*/, inquirer_1.default.prompt([
                                            {
                                                type: 'list',
                                                name: 'blockType',
                                                message: 'Select block type:',
                                                choices: Object.keys(blockRegistry)
                                            }
                                        ])];
                                case 2:
                                    blockType = (_b.sent()).blockType;
                                    blockSchema = blockRegistry[blockType];
                                    fieldPrompts = Object.entries(blockSchema.fields).map(function (_a) {
                                        var key = _a[0], def = _a[1];
                                        return ({
                                            type: 'input',
                                            name: key,
                                            message: "Enter value for \"".concat(key, "\" (").concat(def.type, ")")
                                        });
                                    });
                                    return [4 /*yield*/, inquirer_1.default.prompt(fieldPrompts)];
                                case 3:
                                    fieldAnswers = _b.sent();
                                    layout === null || layout === void 0 ? void 0 : layout.blocks.push({ type: blockType, data: fieldAnswers });
                                    return [3 /*break*/, 10];
                                case 4:
                                    if (!(action === 'edit')) return [3 /*break*/, 7];
                                    return [4 /*yield*/, inquirer_1.default.prompt([
                                            {
                                                type: 'number',
                                                name: 'index',
                                                message: 'Enter block index to edit:'
                                            }
                                        ])];
                                case 5:
                                    index = (_b.sent()).index;
                                    block_1 = layout === null || layout === void 0 ? void 0 : layout.blocks[index];
                                    if (!block_1) {
                                        console.log('❌ Invalid index');
                                        return [2 /*return*/, "continue"];
                                    }
                                    blockSchema = blockRegistry[block_1.type];
                                    fieldPrompts = Object.entries(blockSchema.fields).map(function (_a) {
                                        var _b, _c;
                                        var key = _a[0], def = _a[1];
                                        return ({
                                            type: 'input',
                                            name: key,
                                            message: "Edit \"".concat(key, "\" (").concat(def.type, "):"),
                                            default: (_c = (_b = block_1.data) === null || _b === void 0 ? void 0 : _b[key]) !== null && _c !== void 0 ? _c : ''
                                        });
                                    });
                                    return [4 /*yield*/, inquirer_1.default.prompt(fieldPrompts)];
                                case 6:
                                    newFields = _b.sent();
                                    layout.blocks[index].data = newFields;
                                    return [3 /*break*/, 10];
                                case 7:
                                    if (!(action === 'remove')) return [3 /*break*/, 9];
                                    return [4 /*yield*/, inquirer_1.default.prompt([
                                            {
                                                type: 'number',
                                                name: 'index',
                                                message: 'Enter block index to remove:'
                                            }
                                        ])];
                                case 8:
                                    index = (_b.sent()).index;
                                    if (layout === null || layout === void 0 ? void 0 : layout.blocks[index]) {
                                        layout === null || layout === void 0 ? void 0 : layout.blocks.splice(index, 1);
                                        console.log("\u2705 Removed block at index ".concat(index));
                                    }
                                    else {
                                        console.log('❌ Invalid index');
                                    }
                                    return [3 /*break*/, 10];
                                case 9:
                                    if (action === 'save') {
                                        isNew = !(0, layouts_js_1.hasLayout)(projectId, layout === null || layout === void 0 ? void 0 : layout.id);
                                        result = isNew
                                            ? (0, layouts_js_1.createLayout)(user, projectId, layout)
                                            : (0, layouts_js_1.updateLayout)(user, projectId, layout === null || layout === void 0 ? void 0 : layout.id, layout);
                                        if (!quiet) {
                                            console.log("\u2705 Layout ".concat(isNew ? 'created' : 'updated', ": ").concat(layout === null || layout === void 0 ? void 0 : layout.id));
                                        }
                                        editing = false;
                                        return [2 /*return*/, { value: result }];
                                    }
                                    _b.label = 10;
                                case 10: return [2 /*return*/];
                            }
                        });
                    };
                    _a.label = 2;
                case 2:
                    if (!editing) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1()];
                case 3:
                    state_1 = _a.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function deleteLayoutCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
            user = (0, auth_1.cliLoadUser)();
            (0, layouts_js_1.deleteLayout)(user, args.projectId, args.id);
            if (!args.quiet) {
                console.log("\uD83D\uDDD1\uFE0F Moved layout \"".concat(args.id, "\" to trash in project \"").concat(args.projectId, "\""));
            }
            return [2 /*return*/];
        });
    });
}
function renderLayoutCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user, layout, inputData;
        return __generator(this, function (_a) {
            user = (0, auth_1.cliLoadUser)();
            layout = (0, layouts_js_1.getLayout)(user, args.projectId, args.id);
            if (!layout) {
                throw new Error("Layout \"".concat(args.id, "\" not found in project \"").concat(args.projectId, "\""));
            }
            inputData = args.data ? JSON.parse(args.data) : {};
            (0, layouts_js_1.renderLayout)(user, layout, 'html', inputData);
            return [2 /*return*/];
        });
    });
}
CommandRegistry_1.cliRegistry.register('layouts', {
    name: '',
    description: 'Interactive layouts menu',
    action: function (opts) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, layoutMenu_1.showLayoutMenu)(opts)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }
});
CommandRegistry_1.cliRegistry.register('layouts', {
    name: 'list',
    description: 'List layouts in a project',
    action: listLayoutsCommand
});
CommandRegistry_1.cliRegistry.register('layouts', {
    name: 'get',
    description: 'Get a single layout',
    action: getLayoutCommand
});
CommandRegistry_1.cliRegistry.register('layouts', {
    name: 'create',
    description: 'Create a new layout',
    action: createLayoutCommand
});
CommandRegistry_1.cliRegistry.register('layouts', {
    name: 'patch',
    description: 'Update an existing layout',
    action: patchLayoutCommand
});
CommandRegistry_1.cliRegistry.register('layouts', {
    name: 'delete',
    description: 'Delete a layout',
    action: deleteLayoutCommand
});
CommandRegistry_1.cliRegistry.register('layouts', {
    name: 'render',
    description: 'Render a layout to HTML',
    action: renderLayoutCommand
});
