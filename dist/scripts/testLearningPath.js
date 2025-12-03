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
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load env from backend root
const envPath = path_1.default.resolve(__dirname, '../../.env');
console.log("Loading .env from:", envPath);
const result = dotenv_1.default.config({ path: envPath });
if (result.error) {
    console.error("Error loading .env:", result.error);
}
console.log("API Key present:", !!process.env.GEMINI_API_KEY);
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
function testModel(modelName) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`\nTesting model: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName, generationConfig: { responseMimeType: "application/json" } });
            const prompt = `Generate a simple JSON object: { "hello": "world" }`;
            const result = yield model.generateContent(prompt);
            const response = yield result.response;
            console.log(`Success with ${modelName}! Response:`, response.text());
            return true;
        }
        catch (error) {
            console.log(`Failed with ${modelName}:`, error.message);
            return false;
        }
    });
}
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Starting model connectivity test...");
        // Try 1.5 Flash (Most reliable)
        yield testModel("gemini-1.5-flash");
        // Try 1.5 Pro
        yield testModel("gemini-1.5-pro");
        // Try 2.5 Pro
        yield testModel("gemini-2.5-pro");
    });
}
test();
