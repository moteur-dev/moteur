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
exports.showSystemSettingsMenu = showSystemSettingsMenu;
// src/cli/menu/menus/systemSettingsMenu.ts
var inquirer_1 = require("inquirer");
var blocks_1 = require("@moteur/core/blocks");
var table_1 = require("table");
var FieldRegistry_js_1 = require("@moteur/core/registry/FieldRegistry.js");
function showSystemSettingsMenu() {
    return __awaiter(this, void 0, void 0, function () {
        var settingChoice, _a, fields, _i, _b, field, fieldTable, _c, _d, _e, key, def, optionTable, _f, _g, _h, key, opt, blocks, _j, _k, block;
        var _l;
        return __generator(this, function (_m) {
            switch (_m.label) {
                case 0:
                    console.clear();
                    console.log('\n🛠  System Settings');
                    return [4 /*yield*/, inquirer_1.default.prompt([
                            {
                                type: 'list',
                                name: 'settingChoice',
                                message: 'Choose an option:',
                                choices: [
                                    { name: '📦 List available field types', value: 'fields' },
                                    { name: '📦 List available block types', value: 'blocks' },
                                    new inquirer_1.default.Separator(),
                                    { name: '⬅️ Back to main menu', value: 'back' }
                                ]
                            }
                        ])];
                case 1:
                    settingChoice = (_m.sent()).settingChoice;
                    _a = settingChoice;
                    switch (_a) {
                        case 'fields': return [3 /*break*/, 2];
                        case 'blocks': return [3 /*break*/, 3];
                        case 'back': return [3 /*break*/, 5];
                    }
                    return [3 /*break*/, 6];
                case 2:
                    {
                        fields = FieldRegistry_js_1.default.all();
                        console.log('\nAvailable field types:\n');
                        for (_i = 0, _b = Object.values(fields); _i < _b.length; _i++) {
                            field = _b[_i];
                            console.log("- ".concat(field.type, ": ").concat(field.label));
                            if (field.description)
                                console.log("  \uD83D\uDCDD ".concat(field.description));
                            if (field.fields) {
                                console.log("  \uD83E\uDDE9 Fields:");
                                fieldTable = [['Name', 'Type', 'Required']];
                                for (_c = 0, _d = Object.entries(field.fields); _c < _d.length; _c++) {
                                    _e = _d[_c], key = _e[0], def = _e[1];
                                    fieldTable.push([key, def.type, ((_l = def.options) === null || _l === void 0 ? void 0 : _l.required) ? 'Yes' : 'No']);
                                }
                                console.log((0, table_1.table)(fieldTable));
                            }
                            if (field.options) {
                                console.log("  \u2699\uFE0F Options:");
                                optionTable = [['Name', 'Type', 'Default', 'Description']];
                                for (_f = 0, _g = Object.entries(field.options); _f < _g.length; _f++) {
                                    _h = _g[_f], key = _h[0], opt = _h[1];
                                    optionTable.push([
                                        key,
                                        opt.type,
                                        opt.default !== undefined ? String(opt.default) : '',
                                        opt.description || ''
                                    ]);
                                }
                                console.log((0, table_1.table)(optionTable));
                            }
                            console.log('');
                        }
                        return [3 /*break*/, 6];
                    }
                    _m.label = 3;
                case 3: return [4 /*yield*/, (0, blocks_1.listBlocks)()];
                case 4:
                    blocks = _m.sent();
                    console.log('\nAvailable block types:\n');
                    for (_j = 0, _k = Object.values(blocks); _j < _k.length; _j++) {
                        block = _k[_j];
                        console.log("- ".concat(block.type, ": ").concat(block.label));
                        if (block.description)
                            console.log("  \uD83D\uDCDD ".concat(block.description));
                        console.log('');
                    }
                    return [3 /*break*/, 6];
                case 5: return [2 /*return*/];
                case 6:
                    console.log('\n');
                    return [4 /*yield*/, inquirer_1.default.prompt([
                            { type: 'input', name: 'continue', message: 'Press Enter to return to menu...' }
                        ])];
                case 7:
                    _m.sent();
                    return [4 /*yield*/, showSystemSettingsMenu()];
                case 8:
                    _m.sent();
                    return [2 /*return*/];
            }
        });
    });
}
