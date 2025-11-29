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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
const db_1 = __importDefault(require("../config/db"));
dotenv_1.default.config();
const makeAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1.default)();
    const email = process.argv[2];
    if (!email) {
        console.error('Please provide an email address as an argument.');
        process.exit(1);
    }
    try {
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            console.error('User not found');
            process.exit(1);
        }
        user.role = 'admin';
        yield user.save();
        console.log(`User ${user.name} (${user.email}) is now an Admin.`);
        process.exit(0);
    }
    catch (error) {
        console.error('Error updating user:', error);
        process.exit(1);
    }
});
makeAdmin();
