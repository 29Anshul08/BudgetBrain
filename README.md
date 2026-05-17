# 🧠 BudgetBrain — AI-Powered Personal Finance Tracker

<div align="center">

![BudgetBrain](https://img.shields.io/badge/BudgetBrain-AI%20Finance%20Tracker-7c3aed?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Gemini](https://img.shields.io/badge/Google-Gemini%20AI-4285F4?style=flat-square&logo=google)

**A modern, full-stack, AI-powered personal finance tracker with premium fintech UI design.**

</div>

---

## ✨ Features

### Core Features
- 🔐 **JWT Authentication** — Secure signup/login with bcrypt password hashing
- 📊 **Smart Dashboard** — Balance, income, expenses, savings rate, health score
- 💰 **Transaction Management** — Full CRUD with search, filters, categories, pagination
- 📈 **Budget Tracking** — Monthly budgets with progress bars, alerts, and overspending notifications
- 📉 **Advanced Analytics** — Interactive charts (Area, Pie, Bar) with Recharts
- 📤 **Export Reports** — Download transactions as CSV
- 🌙 **Dark/Light Mode** — Beautiful theme toggle with smooth transitions

### 🤖 AI Features (Google Gemini)
- 🧠 **AI Spending Analyzer** — Pattern recognition and spending insights
- 📋 **Smart Budget Planner** — AI-recommended budget allocations (50/30/20 rule)
- 💬 **AI Chat Assistant** — Conversational financial advisor chatbot
- 📊 **Monthly AI Report** — Comprehensive financial summary with grades
- 🔮 **Spending Predictions** — ML-powered future spending forecasts
- 🔍 **Anomaly Detection** — Unusual expense flagging

### 🎨 Premium UI/UX
- ✨ Glassmorphism effects with backdrop blur
- 🎨 Gradient cards with ambient glow
- 🎭 Framer Motion animations throughout
- 📱 Mobile-first responsive design
- 🏗️ Collapsible sidebar navigation
- 💀 Animated loading skeletons
- 🫧 Beautiful empty states
- 🎯 Floating action buttons

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS 4, Framer Motion |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT + bcryptjs |
| **Charts** | Recharts |
| **AI Engine** | Google Gemini 1.5 Flash |
| **State** | React Context API |
| **HTTP** | Axios |
| **Styling** | Tailwind CSS + Custom CSS Variables |

---

## 📁 Project Structure

```
BudgetBrain/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Sidebar, Layout
│   │   │   └── ui/            # GlassCard, LoadingSkeleton, EmptyState
│   │   ├── context/           # AuthContext, ThemeContext
│   │   ├── pages/             # All page components
│   │   ├── services/          # API client (Axios)
│   │   ├── utils/             # Formatters, constants
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css          # Design system
│   ├── index.html
│   └── vite.config.js
│
├── server/                    # Express Backend
│   ├── config/                # Database config
│   ├── controllers/           # Route handlers
│   ├── middleware/             # Auth, error handling
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API routes
│   ├── services/              # Gemini AI service
│   └── utils/                 # Seed data
│
├── .env.example               # Environment variables template
├── package.json               # Root monorepo scripts
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API Key

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/budgetbrain.git
cd budgetbrain
npm run install:all
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/budgetbrain
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=30d
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```

### 3. Seed Demo Data

```bash
npm run seed
```

This creates a demo user with 6 months of realistic transaction data.

### 4. Run Development Server

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### 5. Login

```
Email: demo@budgetbrain.com
Password: demo123456
```

---

## 🔑 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List (with filters) |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/transactions/categories/list` | Get categories |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets` | List budgets |
| POST | `/api/budgets` | Create budget |
| PUT | `/api/budgets/:id` | Update budget |
| DELETE | `/api/budgets/:id` | Delete budget |
| GET | `/api/budgets/alerts` | Get budget alerts |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Full dashboard data |

### AI (Gemini)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/insights` | AI spending insights |
| GET | `/api/ai/budget-plan` | AI budget planner |
| POST | `/api/ai/chat` | AI chat assistant |
| GET | `/api/ai/monthly-report` | AI monthly report |
| GET | `/api/ai/predict` | Spending predictions |
| GET | `/api/ai/anomalies` | Anomaly detection |

---

## 📱 Screenshots

### Dashboard
Premium dashboard with stats, charts, health score, and AI insights.

### AI Chat Assistant
Conversational financial advisor powered by Google Gemini.

### Transactions
Full CRUD with search, filters, and CSV export.

### Analytics
Interactive charts with AI predictions and anomaly detection.

---

## 🔒 Security

- Passwords hashed with bcrypt (12 salt rounds)
- JWT token authentication
- Rate limiting (100 requests/15 min)
- Helmet security headers
- CORS configured
- Input validation with express-validator
- MongoDB injection prevention

---

## 📦 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy dist/ to Vercel
```

### Backend (Railway/Render)
```bash
cd server
# Deploy to Railway, Render, or any Node.js host
# Set environment variables
```

### MongoDB (Atlas)
Use MongoDB Atlas for production database.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and create a Pull Request

---

## 📄 License

MIT License — feel free to use this project for learning, hackathons, and portfolios.

---

<div align="center">

**Built with 💜 by BudgetBrain Team**

*Star ⭐ this repo if you found it helpful!*

</div>
