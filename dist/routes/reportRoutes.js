"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reportController_1 = require("../controllers/reportController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.route('/')
    .post(authMiddleware_1.protect, reportController_1.createReport)
    .get(authMiddleware_1.protect, authMiddleware_1.admin, reportController_1.getReports);
router.route('/:id')
    .put(authMiddleware_1.protect, authMiddleware_1.admin, reportController_1.updateReportStatus);
exports.default = router;
