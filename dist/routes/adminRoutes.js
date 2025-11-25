"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Middleware to check for admin role
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    }
    else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};
router.use(authMiddleware_1.protect);
router.use(admin);
router.get('/stats', adminController_1.getAdminStats);
router.get('/users', adminController_1.getAllUsers);
router.get('/reports', adminController_1.getReports);
router.patch('/reports/:id', adminController_1.updateReportStatus);
exports.default = router;
