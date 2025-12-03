"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sessionController_1 = require("../controllers/sessionController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.route('/').post(authMiddleware_1.protect, sessionController_1.createSession).get(authMiddleware_1.protect, sessionController_1.getSessions);
router.route('/:id').get(authMiddleware_1.protect, sessionController_1.getSessionById).patch(authMiddleware_1.protect, sessionController_1.updateSession);
router.route('/:id/analyze').post(authMiddleware_1.protect, sessionController_1.forceSessionSummary);
router.route('/:id/start').post(authMiddleware_1.protect, sessionController_1.startSession);
exports.default = router;
