"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sessionController_1 = require("../controllers/sessionController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
router.post('/', sessionController_1.createSession);
router.get('/', sessionController_1.getSessions);
router.get('/:id', sessionController_1.getSessionById);
router.patch('/:id', sessionController_1.updateSession);
router.post('/:id/analyze', sessionController_1.forceSessionSummary);
exports.default = router;
