"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mentorController_1 = require("../controllers/mentorController");
const router = express_1.default.Router();
router.get('/', mentorController_1.getMentors);
router.get('/:id', mentorController_1.getMentorById);
router.get('/:id/slots', mentorController_1.getMentorSlots);
exports.default = router;
