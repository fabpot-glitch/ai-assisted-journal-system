# 📓 AI-Assisted Journal System

A full-stack nature wellness journal powered by AI emotion analysis. Write about your nature experiences and let AI understand your emotions, track your mood over time, and gain insights into your wellness journey.

![Status](https://img.shields.io/badge/Status-Live-brightgreen)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![AI](https://img.shields.io/badge/AI-Groq%20LLaMA-orange)

---

## 🌐 Live Demo

| | URL |
|---|---|
| 🎨 **Frontend** | [ai-assisted-journal-system-sigma.vercel.app](https://ai-assisted-journal-system-sigma.vercel.app) |
| ⚙️ **Backend API** | [ai-assisted-journal-system-production-4cde.up.railway.app](https://ai-assisted-journal-system-production-4cde.up.railway.app) |
| 🏥 **Health Check** | [/health](https://ai-assisted-journal-system-production-4cde.up.railway.app/health) |

---

## ✨ Features

- 🔐 **User Authentication** — Register and login with username/password
- ✍️ **Journal Writing** — Write entries with nature ambience themes
- 🤖 **AI Emotion Analysis** — Powered by Groq LLaMA 3.1 for instant emotion detection
- ⚡ **Streaming Analysis** — Real-time streaming AI responses
- 📊 **Insights Dashboard** — Emotion distribution charts, mood timeline, writing streaks
- 🔍 **Search & Filter** — Search entries by text or filter by emotion
- 🗑️ **Delete Entries** — With confirmation modal
- 💾 **Smart Caching** — API response caching for faster repeated analysis
- 🌿 **Nature Themes** — Forest, Ocean, Mountain, Rain, Desert, Meadow ambiences

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI Framework |
| Vite | Build Tool |
| Vercel | Deployment |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | Web Framework |
| Groq API (LLaMA 3.1) | AI Emotion Analysis |
| JSON File Database | Data Storage |
| express-rate-limit | Rate Limiting |
| node-cache | Response Caching |
| Railway | Deployment |

---

## 📁 Project Structure

```
ai-journal-system/
├── frontend/
│   ├── src/
│   │   └── App.jsx          # Main React application
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── backend/
    ├── routes/
    │   ├── journal.js        # Journal API routes
    │   └── auth.js           # Authentication routes
    ├── services/
    │   ├── llmService.js     # Groq AI integration
    │   └── cacheService.js   # Response caching
    ├── middleware/
    │   └── rateLimiter.js    # Rate limiting
    ├── db/
    │   └── database.js       # JSON file database
    ├── server.js             # Express server entry point
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Groq API key (free at [console.groq.com](https://console.groq.com))

### 1. Clone the repository
```bash
git clone https://github.com/fabpot-glitch/ai-assisted-journal-system.git
cd ai-assisted-journal-system/ai-journal-system
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:
```env
GROQ_API_KEY=your_groq_api_key_here
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Start the backend:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Open in browser
```
http://localhost:3000
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/user/:userId` | Get user info |

### Journal
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/journal` | Create journal entry |
| GET | `/api/journal/:userId` | Get all entries for user |
| DELETE | `/api/journal/:entryId` | Delete an entry |
| POST | `/api/journal/analyze` | Analyze text emotion |
| POST | `/api/journal/analyze-entry/:entryId` | Analyze saved entry |
| GET | `/api/journal/insights/:userId` | Get user insights |
| GET | `/api/journal/cache/stats` | Cache statistics |
| GET | `/health` | Health check |

---

## 🎭 Emotion Analysis

The AI analyzes journal text and returns:

```json
{
  "emotion": "calm",
  "keywords": ["peaceful", "nature", "forest", "breathing", "stillness"],
  "summary": "The writer experiences a deep sense of tranquility during their forest walk."
}
```

---

## 🌍 Deployment

### Frontend — Vercel
- Framework: Vite
- Root Directory: `ai-journal-system/frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

### Backend — Railway
- Root Directory: `ai-journal-system/backend`
- Start Command: `node server.js`
- Environment Variables: `GROQ_API_KEY`, `NODE_ENV`, `FRONTEND_URL`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*🌿 Take a moment for yourself. Write. Reflect. Grow.*
