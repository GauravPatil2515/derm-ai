# DermAI - AI-Powered Skin Analysis

DermAI is an advanced skin analysis application that uses artificial intelligence to help identify and provide information about various skin conditions. The application combines modern web technologies with machine learning to deliver accurate skin assessments and personalized recommendations.

## Features

- AI-powered skin condition analysis
- Real-time chat interface with dermatology AI assistant
- Secure image upload and processing
- Detailed analysis reports
- User-friendly dashboard
- Responsive design

## Tech Stack

### Frontend
- React + TypeScript
- Vite
- TailwindCSS
- React Router
- Lucide Icons

### Backend
- Python Flask
- SQLite
- Groq AI
- PyTorch (for model inference)

## Getting Started

### Prerequisites
- Node.js >= 18
- Python >= 3.10
- pip

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python app.py
```

### Environment Variables
Create a `.env` file in the backend directory with:
```
GROQ_API_KEY=your_groq_api_key
FLASK_ENV=development
FLASK_APP=app.py
```

## Project Structure
```
project/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   └── public/
└── backend/          # Flask backend
    ├── api/
    ├── instance/
    └── static/
```

## Contact
Gaurav Patil - gauravpatil2516@gmail.com

## License
This project is proprietary and not open for public use without permission.
