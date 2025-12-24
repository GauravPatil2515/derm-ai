# DermAI - AI-Powered Skin Analysis Platform

<div align="center">

![DermAI](https://img.shields.io/badge/DermAI-Skin%20Analysis-pink?style=for-the-badge&logo=health&logoColor=white)

[![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat&logo=python)](https://python.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat&logo=typescript)](https://typescriptlang.org)
[![Flask](https://img.shields.io/badge/Flask-3+-000000?style=flat&logo=flask)](https://flask.palletsprojects.com)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat&logo=firebase)](https://firebase.google.com)

*Advanced AI-powered skin analysis platform combining machine learning with dermatological expertise*

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation)

</div>

---

## 🌟 Features

### Core AI Capabilities
- **🔬 8-Class Skin Condition Detection** - Vision Transformer (ViT) model with 95%+ accuracy
- **🧠 Grad-CAM Visual Explanations** - See which areas influenced the AI's decision
- **💬 AI Chat Assistant** - Real-time dermatology consultations powered by Groq AI
- **📊 Comprehensive Reports** - Detailed analysis with symptoms, treatments, and prevention
- **⚡ Real-time Processing** - Analysis results in under 2 seconds

### User Features
- **🔐 Firebase Authentication** - Secure login with Email/Password and Google Sign-In
- **👤 User Profiles** - Manage account settings and change password
- **📈 Analytics Dashboard** - Track analysis history and trends
- **📱 Mobile Responsive** - Works seamlessly on all devices
- **📥 Export Data** - Download analysis history as CSV or JSON
- **📄 PDF Reports** - Branded, detailed analysis reports

### Detected Conditions
| Category | Conditions |
|----------|------------|
| Bacterial | Cellulitis, Impetigo |
| Fungal | Athlete's Foot, Nail Fungus, Ringworm |
| Parasitic | Creeping Eruption |
| Viral | Chickenpox, Shingles |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- GROQ API Key (for AI chat)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/GauravPatil2515/derm-ai.git
cd derm-ai/project
```

2. **Setup Backend**
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

3. **Configure Environment**
```bash
# Create backend/.env
GROQ_API_KEY=your_groq_api_key_here
```

4. **Setup Frontend**
```bash
cd ..  # Back to project root
npm install
```

5. **Download AI Model**
- Place `advanced_skin_disease_model.pth` in the `project/` directory
- *Model file not included due to size (~300MB)*

6. **Run the Application**
```bash
# Terminal 1 - Backend
cd backend
python app.py

# Terminal 2 - Frontend
npm run dev
```

7. **Access the App**
- Frontend: http://localhost:5176/derm-ai/
- Backend API: http://localhost:5002

---

## 📁 Project Structure

```
project/
├── backend/
│   ├── api/                 # API endpoints
│   │   ├── derm_ai_chat.py  # Groq AI chat
│   │   └── skin_analysis.py # ViT model analysis
│   ├── utils/
│   │   ├── gradcam.py       # Grad-CAM visualization
│   │   └── pdf_generator.py # PDF report generation
│   ├── models/              # Database models
│   ├── app.py               # Flask application
│   └── config.py            # Configuration
│
├── src/
│   ├── components/
│   │   ├── auth/            # Login, Signup, ForgotPassword
│   │   ├── dashboard/       # Dashboard, SkinScan, Analytics
│   │   ├── profile/         # User profile page
│   │   ├── chat/            # AI chat interface
│   │   ├── common/          # Navbar, shared components
│   │   └── ui/              # Reusable UI components
│   ├── lib/
│   │   ├── AuthContext.tsx  # Firebase authentication
│   │   ├── firebase.ts      # Firebase configuration
│   │   └── ServiceContext.tsx # API health monitoring
│   └── App.tsx              # Main application
│
└── public/                  # Static assets
```

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/model-status` | AI model status |
| POST | `/api/analyze` | Analyze skin image |
| GET | `/api/analysis/history` | Get analysis history |
| GET | `/api/analysis/:id` | Get specific analysis |
| GET | `/api/analysis/:id/pdf` | Download PDF report |
| POST | `/api/chat/` | Chat with AI assistant |

---

## 🔐 Authentication

DermAI uses **Firebase Authentication** with support for:
- Email/Password authentication
- Google Sign-In
- Password reset via email

Protected routes require authentication:
- `/dashboard` - Analysis history
- `/scan/:id` - Analysis details
- `/analytics` - Analytics dashboard
- `/profile` - User profile

---

## 🛡️ Security Features

- **Rate Limiting** - Per-user API rate limits using Firebase UID
- **Protected Routes** - Authentication required for sensitive features
- **CORS Protection** - Configured allowed origins
- **File Validation** - Image type and size validation
- **Automatic Cleanup** - Uploaded files deleted after analysis

---

## 📱 Screenshots

### Landing Page
Modern, responsive landing page with live AI chat demo

### Dashboard
View all your skin analyses with filtering and search

### Skin Analysis
Upload images and get instant AI-powered analysis with Grad-CAM explanations

### Analytics
Track your analysis history with charts and export functionality

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is for educational purposes. Please consult healthcare professionals for medical advice.

---

## ⚠️ Disclaimer

**DermAI is NOT a substitute for professional medical diagnosis.** The AI predictions are for informational purposes only. Always consult a certified dermatologist for proper diagnosis and treatment.

---

<div align="center">

Made with ❤️ by [Gaurav Patil](https://github.com/GauravPatil2515)

</div>
