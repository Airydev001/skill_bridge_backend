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
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
function listModels() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Access the model via the API directly if SDK doesn't have listModels helper exposed easily on the main class
            // Actually the SDK doesn't expose listModels on the top level class in all versions.
            // Let's try to just use a known working model or try to fetch it via fetch if needed.
            // But wait, the error message said "Call ListModels". 
            // Let's try to just use the model we think works and print it.
            // Actually, let's try to use the `getGenerativeModel` and see if we can probe it.
            // Better approach: Use the API key to make a raw REST call to list models.
            const key = process.env.GEMINI_API_KEY;
            if (!key) {
                console.error("No API Key found");
                return;
            }
            const response = yield fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
            const data = yield response.json();
            if (data.models) {
                console.log("Available Models:");
                data.models.forEach((m) => {
                    console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
                });
            }
            else {
                console.log("No models found or error:", data);
            }
        }
        catch (error) {
            console.error("Error listing models:", error);
        }
    });
}
listModels();
