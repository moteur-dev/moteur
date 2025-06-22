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
exports.editModelSchemaFields = editModelSchemaFields;
var inquirer_1 = require("inquirer");
var models_js_1 = require("@moteur/core/models.js");
var FieldRegistry_js_1 = require("@moteur/core/registry/FieldRegistry.js");
var renderCliField_js_1 = require("../field-renderers/renderCliField.js");
require("../field-renderers/index.js");
var editJsonInEditor_js_1 = require("./editJsonInEditor.js");
function editModelSchemaFields(user, projectId, modelId) {
    return __awaiter(this, void 0, void 0, function () {
        var modelSchema, availableFields, editing, action, _a, newFieldId, fieldType, useJson, newFieldSchema, fieldToEdit, useJson, updatedField, fieldToRemove;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    modelSchema = (0, models_js_1.getModelSchema)(user, projectId, modelId);
                    availableFields = Object.values(FieldRegistry_js_1.default.all()).map(function (f) { return ({
                        name: "".concat(f.label, " (").concat(f.type, ")"),
                        value: f.type
                    }); });
                    editing = true;
                    _b.label = 1;
                case 1:
                    if (!editing) return [3 /*break*/, 22];
                    console.clear();
                    console.log("\n\uD83D\uDEE0\uFE0F Editing fields for model \"".concat(modelSchema.label, "\" (").concat(modelSchema.id, ")"));
                    if (Object.keys(modelSchema.fields).length === 0) {
                        console.log('\nNo fields yet.');
                    }
                    else {
                        console.log('\nCurrent fields:');
                        Object.entries(modelSchema.fields).forEach(function (_a) {
                            var key = _a[0], field = _a[1];
                            console.log("- ".concat(key, " (").concat(field.type, ")"));
                        });
                    }
                    return [4 /*yield*/, inquirer_1.default.prompt({
                            type: 'list',
                            name: 'action',
                            message: 'Choose an action:',
                            choices: [
                                { name: '➕ Add a field', value: 'add' },
                                { name: '📝 Edit a field', value: 'edit' },
                                { name: '🗑️ Remove a field', value: 'remove' },
                                new inquirer_1.default.Separator(),
                                { name: '✅ Finish editing', value: 'done' }
                            ]
                        })];
                case 2:
                    action = (_b.sent()).action;
                    _a = action;
                    switch (_a) {
                        case 'add': return [3 /*break*/, 3];
                        case 'edit': return [3 /*break*/, 11];
                        case 'remove': return [3 /*break*/, 18];
                        case 'done': return [3 /*break*/, 20];
                    }
                    return [3 /*break*/, 21];
                case 3: return [4 /*yield*/, inquirer_1.default.prompt({
                        type: 'input',
                        name: 'newFieldId',
                        message: 'Enter new field ID:',
                        validate: function (input) { return input.trim() !== '' || 'Field ID cannot be empty.'; }
                    })];
                case 4:
                    newFieldId = (_b.sent()).newFieldId;
                    return [4 /*yield*/, inquirer_1.default.prompt({
                            type: 'list',
                            name: 'fieldType',
                            message: 'Select field type:',
                            choices: availableFields
                        })];
                case 5:
                    fieldType = (_b.sent()).fieldType;
                    return [4 /*yield*/, inquirer_1.default.prompt({
                            type: 'confirm',
                            name: 'useJson',
                            message: 'Edit full field schema as JSON?',
                            default: false
                        })];
                case 6:
                    useJson = (_b.sent()).useJson;
                    newFieldSchema = void 0;
                    if (!useJson) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, editJsonInEditor_js_1.editJsonInEditor)({ id: newFieldId, type: fieldType, label: newFieldId }, "Field \"".concat(newFieldId, "\" schema"))];
                case 7:
                    newFieldSchema = _b.sent();
                    return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, (0, renderCliField_js_1.renderCliField)(fieldType, {
                        type: fieldType,
                        id: newFieldId,
                        label: newFieldId
                    })];
                case 9:
                    newFieldSchema = _b.sent();
                    _b.label = 10;
                case 10:
                    modelSchema.fields[newFieldId] = newFieldSchema;
                    return [3 /*break*/, 21];
                case 11: return [4 /*yield*/, inquirer_1.default.prompt({
                        type: 'list',
                        name: 'fieldToEdit',
                        message: 'Which field to edit?',
                        choices: Object.keys(modelSchema.fields)
                    })];
                case 12:
                    fieldToEdit = (_b.sent()).fieldToEdit;
                    return [4 /*yield*/, inquirer_1.default.prompt({
                            type: 'confirm',
                            name: 'useJson',
                            message: 'Edit full field schema as JSON?',
                            default: false
                        })];
                case 13:
                    useJson = (_b.sent()).useJson;
                    updatedField = void 0;
                    if (!useJson) return [3 /*break*/, 15];
                    return [4 /*yield*/, (0, editJsonInEditor_js_1.editJsonInEditor)(modelSchema.fields[fieldToEdit], "Field \"".concat(fieldToEdit, "\" schema"))];
                case 14:
                    updatedField = _b.sent();
                    return [3 /*break*/, 17];
                case 15: return [4 /*yield*/, (0, renderCliField_js_1.renderCliField)(modelSchema.fields[fieldToEdit].type, modelSchema.fields[fieldToEdit])];
                case 16:
                    updatedField = _b.sent();
                    _b.label = 17;
                case 17:
                    modelSchema.fields[fieldToEdit] = updatedField;
                    return [3 /*break*/, 21];
                case 18: return [4 /*yield*/, inquirer_1.default.prompt({
                        type: 'list',
                        name: 'fieldToRemove',
                        message: 'Which field to remove?',
                        choices: Object.keys(modelSchema.fields)
                    })];
                case 19:
                    fieldToRemove = (_b.sent()).fieldToRemove;
                    delete modelSchema.fields[fieldToRemove];
                    return [3 /*break*/, 21];
                case 20:
                    editing = false;
                    return [3 /*break*/, 21];
                case 21: return [3 /*break*/, 1];
                case 22:
                    // Save updated schema
                    (0, models_js_1.updateModelSchema)(user, projectId, modelId, { fields: modelSchema.fields });
                    console.log('✅ Model schema fields updated!');
                    return [2 /*return*/];
            }
        });
    });
}
