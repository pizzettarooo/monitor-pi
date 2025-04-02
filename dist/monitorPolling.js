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
var supabase_js_1 = require("@supabase/supabase-js");
require("dotenv/config");
var node_fetch_1 = require("node-fetch");
var SUPABASE_URL = process.env.SUPABASE_URL;
var SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
var WALLET_ADDRESS = process.env.WALLET_ADDRESS;
var LAST_TIMESTAMP_KEY = 'last_transaction_ts';
var supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
function getTransactions() {
    return __awaiter(this, void 0, void 0, function () {
        var url, res, json;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://api.mainnet.minepi.com/transactions?account=".concat(WALLET_ADDRESS, "&limit=10");
                    return [4 /*yield*/, (0, node_fetch_1.default)(url)];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    json = _a.sent();
                    return [2 /*return*/, json._embedded.records];
            }
        });
    });
}
function getLastTimestamp() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('system')
                        .select('value')
                        .eq('key', LAST_TIMESTAMP_KEY)
                        .single()];
                case 1:
                    _a = _c.sent(), data = _a.data, error = _a.error;
                    return [2 /*return*/, error ? null : (_b = data === null || data === void 0 ? void 0 : data.value) !== null && _b !== void 0 ? _b : null];
            }
        });
    });
}
function setLastTimestamp(timestamp) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('system')
                        .upsert({ key: LAST_TIMESTAMP_KEY, value: timestamp }, { onConflict: 'key' })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function creditUser(wallet, amount) {
    return __awaiter(this, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('profiles') // CAMBIATO DA users
                        .select('id, credits')
                        .eq('wallet', wallet)
                        .single()];
                case 1:
                    user = (_a.sent()).data;
                    if (!user)
                        return [2 /*return*/];
                    return [4 /*yield*/, supabase.from('transactions').insert({
                            id: crypto.randomUUID(),
                            user_id: user.id,
                            amount: amount,
                            type: 'deposit'
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, supabase
                            .from('profiles') // CAMBIATO DA users
                            .update({ credits: user.credits + amount })
                            .eq('id', user.id)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var lastTS, txs, _i, _a, tx, amount, sender, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 10, , 11]);
                    return [4 /*yield*/, getLastTimestamp()];
                case 1:
                    lastTS = _b.sent();
                    return [4 /*yield*/, getTransactions()];
                case 2:
                    txs = _b.sent();
                    _i = 0, _a = txs.reverse();
                    _b.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 9];
                    tx = _a[_i];
                    if (lastTS && tx.created_at <= lastTS)
                        return [3 /*break*/, 8];
                    amount = parseFloat(tx.amount || '0');
                    if (!(isNaN(amount) || amount <= 0)) return [3 /*break*/, 5];
                    console.warn("\u26A0\uFE0F Importo non valido da ".concat(tx.source_account, " (").concat(tx.amount, ")"));
                    return [4 /*yield*/, setLastTimestamp(tx.created_at)];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 8];
                case 5:
                    sender = tx.source_account;
                    console.log("\u2705 Nuova transazione da ".concat(sender, " (").concat(amount, " Pi)"));
                    return [4 /*yield*/, creditUser(sender, Math.floor(amount))];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, setLastTimestamp(tx.created_at)];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 3];
                case 9: return [3 /*break*/, 11];
                case 10:
                    err_1 = _b.sent();
                    console.error("❌ Errore:", err_1);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
// Loop ogni 20s
console.log("🚀 Monitor attivo: controllo ogni 20 secondi...");
setInterval(main, 20000);
main();
