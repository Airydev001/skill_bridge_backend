"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const mentorRoutes_1 = __importDefault(require("./routes/mentorRoutes"));
const sessionRoutes_1 = __importDefault(require("./routes/sessionRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
dotenv_1.default.config();
(0, db_1.default)();
const http_1 = __importDefault(require("http"));
const socket_1 = require("./socket");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = (0, socket_1.initSocket)(server);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/mentors', mentorRoutes_1.default);
app.use('/api/sessions', sessionRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
// Serve frontend static files
const path_1 = __importDefault(require("path"));
const frontendPath = path_1.default.join(__dirname, '../../frontend/dist');
app.use(express_1.default.static(frontendPath));
// Handle SPA routing - return index.html for any unknown route
app.get('*all', (req, res) => {
    console.log(`Serving index.html for ${req.path} from ${frontendPath}`);
    res.sendFile(path_1.default.join(frontendPath, 'index.html'), (err) => {
        if (err) {
            console.error("Error sending index.html:", err);
            res.status(500).send("Error loading application.");
        }
    });
});
app.use(errorMiddleware_1.errorHandler);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
