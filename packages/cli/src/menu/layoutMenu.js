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
exports.addBlockToLayout = addBlockToLayout;
exports.showLayoutMenu = showLayoutMenu;
// src/cli/menu/layoutMenu.ts
var inquirer_1 = require("inquirer");
var layouts_1 = require("@moteur/core/layouts");
var renderCliField_1 = require("../field-renderers/renderCliField");
var blocks_1 = require("@moteur/core/blocks");
var auth_1 = require("../utils/auth");
function addBlockToLayout(projectId, layoutId) {
    return __awaiter(this, void 0, void 0, function () {
        var user, blockTypes, selectedType, schema, newBlock, _i, _a, _b, key, fieldSchema, _c, _d, configureOptions, _e, _f, _g, key, optionSchema, _h, _j, layout;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    user = (0, auth_1.cliLoadUser)();
                    return [4 /*yield*/, (0, blocks_1.listBlocks)()];
                case 1:
                    blockTypes = _k.sent();
                    return [4 /*yield*/, inquirer_1.default.prompt({
                            type: 'list',
                            name: 'selectedType',
                            message: 'Select block type to add:',
                            choices: Object.keys(blockTypes).map(function (type) { return ({
                                name: "".concat(blockTypes[type].label, " (").concat(type, ")"),
                                value: type
                            }); })
                        })];
                case 2:
                    selectedType = (_k.sent()).selectedType;
                    console.log("\n\uD83D\uDCDD You selected: ".concat(selectedType, " block type."));
                    schema = blockTypes[selectedType];
                    newBlock = {
                        type: selectedType,
                        fields: {}
                    };
                    console.log('\n⚙️  Please fill in the fields for this block:');
                    _i = 0, _a = Object.entries(schema.fields);
                    _k.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    _b = _a[_i], key = _b[0], fieldSchema = _b[1];
                    _c = newBlock.fields;
                    _d = key;
                    return [4 /*yield*/, (0, renderCliField_1.renderCliField)(fieldSchema.type, fieldSchema)];
                case 4:
                    _c[_d] = _k.sent();
                    _k.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    if (!schema.optionsSchema) return [3 /*break*/, 11];
                    return [4 /*yield*/, inquirer_1.default.prompt({
                            type: 'confirm',
                            name: 'configureOptions',
                            message: 'Would you like to configure advanced block options?',
                            default: false
                        })];
                case 7:
                    configureOptions = (_k.sent()).configureOptions;
                    if (!configureOptions) return [3 /*break*/, 11];
                    console.log('\n⚙️  Please fill in the advanced options:');
                    _e = 0, _f = Object.entries(schema.optionsSchema);
                    _k.label = 8;
                case 8:
                    if (!(_e < _f.length)) return [3 /*break*/, 11];
                    _g = _f[_e], key = _g[0], optionSchema = _g[1];
                    console.log("\n\uD83D\uDEE0\uFE0F  Option: ".concat(key, " (").concat(optionSchema.type, ")"));
                    _h = newBlock.options;
                    _j = key;
                    return [4 /*yield*/, (0, renderCliField_1.renderCliField)(optionSchema.type, optionSchema)];
                case 9:
                    _h[_j] = _k.sent();
                    _k.label = 10;
                case 10:
                    _e++;
                    return [3 /*break*/, 8];
                case 11: return [4 /*yield*/, (0, layouts_1.getLayout)(user, projectId, layoutId)];
                case 12:
                    layout = _k.sent();
                    layout.blocks.push(newBlock);
                    return [4 /*yield*/, (0, layouts_1.updateLayout)(user, projectId, layoutId, layout)];
                case 13:
                    _k.sent();
                    console.log('\n✅ Block added successfully!');
                    return [2 /*return*/];
            }
        });
    });
}
function showLayoutMenu(args) {
    return __awaiter(this, void 0, void 0, function () {
        var user, layout, layoutAction, _a, newLabel;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    user = (0, auth_1.cliLoadUser)();
                    return [4 /*yield*/, (0, layouts_1.getLayout)(user, args.projectId, args.layoutId)];
                case 1:
                    layout = _b.sent();
                    console.clear();
                    console.log("\n\uD83D\uDCDD Editing Layout: ".concat(layout.label || args.layoutId));
                    return [4 /*yield*/, inquirer_1.default.prompt([
                            {
                                type: 'list',
                                name: 'layoutAction',
                                message: 'Choose an action for this layout:',
                                choices: [
                                    { name: '✏️ Rename layout', value: 'rename' },
                                    { name: '➕ Add a block', value: 'add' },
                                    { name: '🧩 Edit existing blocks', value: 'edit' },
                                    { name: '🗑️ Remove a block', value: 'remove' },
                                    { name: '🔃 Reorder blocks', value: 'reorder' },
                                    new inquirer_1.default.Separator(),
                                    { name: '⬅️ Back to project menu', value: 'back' }
                                ]
                            }
                        ])];
                case 2:
                    layoutAction = (_b.sent()).layoutAction;
                    _a = layoutAction;
                    switch (_a) {
                        case 'rename': return [3 /*break*/, 3];
                        case 'add': return [3 /*break*/, 6];
                        case 'edit': return [3 /*break*/, 8];
                        case 'remove': return [3 /*break*/, 9];
                        case 'reorder': return [3 /*break*/, 10];
                        case 'back': return [3 /*break*/, 11];
                    }
                    return [3 /*break*/, 12];
                case 3: return [4 /*yield*/, inquirer_1.default.prompt({
                        type: 'input',
                        name: 'newLabel',
                        message: 'Enter new layout label:',
                        default: layout.label
                    })];
                case 4:
                    newLabel = (_b.sent()).newLabel;
                    layout.label = newLabel;
                    return [4 /*yield*/, (0, layouts_1.updateLayout)(user, args.projectId, args.layoutId, layout)];
                case 5:
                    _b.sent();
                    console.log('\n✅ Layout renamed successfully.');
                    return [3 /*break*/, 12];
                case 6: return [4 /*yield*/, addBlockToLayout(args.projectId, args.layoutId)];
                case 7:
                    _b.sent();
                    return [3 /*break*/, 12];
                case 8:
                    {
                        // TODO: Select block to edit and prompt via renderCliField.
                        console.log('\n[TODO] Edit block logic.');
                        return [3 /*break*/, 12];
                    }
                    _b.label = 9;
                case 9:
                    {
                        // TODO: Select block to remove.
                        console.log('\n[TODO] Remove block logic.');
                        return [3 /*break*/, 12];
                    }
                    _b.label = 10;
                case 10:
                    {
                        // TODO: Implement reordering logic (multi-select reorder?).
                        console.log('\n[TODO] Reorder blocks logic.');
                        return [3 /*break*/, 12];
                    }
                    _b.label = 11;
                case 11: return [2 /*return*/];
                case 12:
                    console.log('\n');
                    return [4 /*yield*/, inquirer_1.default.prompt([
                            { type: 'input', name: 'continue', message: 'Press Enter to return to layout menu...' }
                        ])];
                case 13:
                    _b.sent();
                    return [4 /*yield*/, showLayoutMenu({ projectId: args.projectId, layoutId: args.layoutId })];
                case 14:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
