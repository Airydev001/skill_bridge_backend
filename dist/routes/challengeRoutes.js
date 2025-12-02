"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const challengeController_1 = require("../controllers/challengeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/generate', authMiddleware_1.protect, challengeController_1.createChallenge);
router.get('/my', authMiddleware_1.protect, challengeController_1.getMyChallenges);
router.get('/:id', authMiddleware_1.protect, challengeController_1.getChallengeById);
router.post('/:id/submit', authMiddleware_1.protect, challengeController_1.submitChallenge);
exports.default = router;
