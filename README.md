# 🚀 CoFlow – A-Z Hackathon Team Management Platform

**CoFlow** is a full-stack hackathon productivity platform that simplifies team creation, project coordination, and real-time collaboration — all in one place.

## 🧩 Features

- ✅ Create, join, and manage hackathon teams
- 🔐 Authentication and authorization with JWT & cookies
- 💬 Real-time messaging via **Socket.IO**
- 🧑‍💻 Task management and status tracking
- 🧭 Online status indicators
- 🧠 Seen-by indicators for chat
- 💡 Typing indicators
- 🎨 Beautiful responsive UI (Tailwind CSS)
- 🔧 API Documentation via Swagger

---

## 🗂 Project Structure

\`\`\`
hackpilot/
├── backend/
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── services/
│ ├── socket/
│ ├── utils/
│ ├── server.js
│ └── swaggerGen.js
│
└── frontend/
├── app/
├── components/
├── public/
├── store/
├── styles/
├── utils/
└── next.config.mjs
\`\`\`

---

## 🛠 Tech Stack

### Frontend

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Socket.IO Client](https://socket.io/)

### Backend

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB + Mongoose](https://mongoosejs.com/)
- [Socket.IO](https://socket.io/)
- [Swagger](https://swagger.io/)

---

## 🧪 Backend Setup

1. **Navigate to backend:**
   \`\`\`bash
   cd backend
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment configuration:**

   - Copy \`.env.example\` to \`.env\`
   - Add your MongoDB URI, JWT secret, and other env vars

4. **Run the server:**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Access API docs:**
   \`http://localhost:<PORT>/api-docs\`

---

## 🎨 Frontend Setup

1. **Navigate to frontend:**
   \`\`\`bash
   cd frontend
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Setup env file:**

   - Copy \`.env.local.example\` to \`.env.local\`
   - Add \`NEXT_PUBLIC_BACKEND_URL\`

4. **Run the frontend:**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Visit app:**
   \`http://localhost:3000\`

---

## ▶️ Running the Full Stack

In two terminals:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```
