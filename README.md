
---

```markdown
# SkillBridge Backend

This is the **Node.js + Express backend** for SkillBridge — supporting APIs for mentorship sessions, AI learning paths, summaries, and coding challenges.

---

##  Features
- REST API with Express.js
- MongoDB database
- JWT authentication
- Role-based access control (mentor/mentee/admin)
- AI endpoints:
  - Learning Path Generator
  - Session Summary
  - Coding Challenge Generator

---

## ⚙️ Setup

### 1. Clone Repo
```bash
git clone https://github.com/your-username/skillbridge-backend.git
cd skillbridge-backend
### 2. Install Dependencies
npm install

###3. Configure Environment Variables

Create .env:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key

CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

###4. Run Locally
npm run dev

Backend will run at http://localhost:5000.
