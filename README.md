<div align="center">

<img src="https://img.shields.io/badge/HireEdge-AI%20Interview%20Platform-6366f1?style=for-the-badge&logo=sparkles&logoColor=white" alt="HireEdge" />

# 🚀 HireEdge

### AI-Powered Interview Preparation & Career Growth Platform

*Practice smarter. Interview better. Get hired faster.*

[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![OpenAI](https://img.shields.io/badge/OpenAI-Responses%20API-412991?style=flat-square&logo=openai&logoColor=white)](https://developers.openai.com/api/)

</div>

---

## 📌 About HireEdge

**HireEdge** is a full-stack AI-powered interview preparation platform designed to help job seekers practice mock interviews, receive instant AI feedback, and track their performance — all in one place.

Whether you're a fresher entering the job market or an experienced professional switching roles, HireEdge gives you the **competitive edge** you need to crack any interview.

---

## ✨ Features

- 🎙️ **AI Mock Interviews** — Typed or voice answers with role-specific feedback
- 🧭 **Evidence-Based Role Fit** — Match breakdown, strengths, missing keywords, and skill gaps
- 📈 **Persistent Progress** — Saved review state, completed roadmap tasks, sessions, and coaching scores
- 🧠 **Answer Coaching** — Relevance, accuracy, structure, evidence, and communication rubrics
- 📊 **Performance Reports** — Detailed feedback and scoring after every session
- 🔐 **Secure Authentication** — JWT-based login/register with token blacklisting
- 👤 **User Dashboard** — Track your interview history and progress
- 📱 **Responsive Design** — Works seamlessly on desktop and mobile
- ⚡ **Fast & Modern UI** — Built with React + Vite for blazing-fast performance

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Vite, SCSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| AI Engine | OpenAI Responses API · Groq automatic fallback · Structured Outputs |
| Auth | JWT (JSON Web Tokens) |
| Styling | SCSS Modules |

---

## 📁 Project Structure

```
HireEdge/
├── Frontend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/          # Login, Register components
│   │   │   └── interview/     # Interview flow & context
│   │   ├── style/             # Global SCSS styles
│   │   ├── App.jsx
│   │   └── app.routes.jsx
│   ├── .env
│   └── package.json
│
└── Backend/
    ├── src/
    │   ├── controllers/       # auth & interview controllers
    │   ├── routes/            # API routes
    │   ├── models/            # MongoDB schemas
    │   ├── services/          # OpenAI report, coaching, and ATS resume service
    │   └── config/            # DB config
    ├── server.js
    ├── .env
    └── package.json
```

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have installed:
- [Node.js](https://nodejs.org/) (v18 or above)
- [MongoDB](https://www.mongodb.com/try/download/community) (local) or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- An [OpenAI API key](https://platform.openai.com/api-keys) with API billing enabled

---

### 🔧 Installation & Setup

#### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/HireEdge.git
cd HireEdge
```

#### 2. Setup Backend

```bash
cd Backend
npm install
```

Create a `.env` file inside `Backend/`:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/hireedge
JWT_SECRET=your_super_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-5.4-nano
GROQ_API_KEY=your_groq_fallback_key_here
GROQ_MODEL=openai/gpt-oss-20b
FRONTEND_URL=http://localhost:5173
```

Keep `OPENAI_API_KEY` in `Backend/.env` only. Never add it to the frontend, prefix it with `VITE_`, commit it to Git, or paste it into a public issue.

Start the backend server:

```bash
npm start
```

You should see:
```
Server is running on port 3000
Connected to Database ✅
```

#### 3. Setup Frontend

Open a new terminal:

```bash
cd Frontend
npm install
```

Create a `.env` file inside `Frontend/`:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

Visit: **http://localhost:5173** 🎉

---

## 🌐 API Endpoints

### Auth Routes (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | Login user, returns JWT |
| POST | `/logout` | Logout & blacklist token |
| GET | `/profile` | Get user profile (protected) |
| PUT | `/profile` | Update user profile (protected) |

### Interview Routes (`/api/interview`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/start` | Start a new AI interview session |
| POST | `/answer` | Submit answer, get AI feedback |
| GET | `/report/:id` | Get interview report |
| GET | `/reports` | Get all user reports |
| DELETE | `/report/:id` | Delete a specific report |
| PATCH | `/report/:id/progress` | Save reviewed questions and roadmap tasks |
| POST | `/report/:id/sessions` | Start a mock interview session |
| POST | `/sessions/:id/answers` | Submit and score a practice answer |
| POST | `/sessions/:id/complete` | Complete a practice session |
| GET | `/progress` | Get user progress and skill analytics |

---

## 🔮 Upcoming Features

- [ ] 🤖 AI Chatbot for career guidance
- [ ] 💼 Job finder & recommendations
- [ ] 📝 Resume analyzer
- [ ] Editable resume workspace with before/after comparison
- [ ] Job application tracker and reminders
- [ ] Privacy-controlled shareable reports

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Ashif Rza**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ashifrza/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat-square&logo=github&logoColor=white)](https://github.com/ASHIFRZA18)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by Ashif Rza &nbsp;|&nbsp; ⭐ Star this repo if you found it helpful!

</div>
