# Medicare Vision AI

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

A comprehensive healthcare management system powered by AI, featuring voice assistant, meal planning, prescription tracking, and blood report analysis.

## Features

- 🎤 **Voice Assistant** - Interactive voice commands for medication queries and meal planning
- 💊 **Prescription Management** - Track medications with OCR-based prescription scanning
- 🩸 **Blood Report Analysis** - Upload and analyze blood test reports with AI-powered insights
- 🍽️ **AI Meal Planning** - Generate personalized meal plans from patient reports using Gemini AI
- 📧 **Guardian Notifications** - Email alerts to caregivers
- 📊 **Health Dashboard** - Comprehensive health monitoring and activity tracking
- 🔐 **Secure Authentication** - JWT-based user authentication

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js, Express
- **Database**: SQLite (better-sqlite3)
- **AI/ML**: Google Gemini AI, Tesseract.js (OCR)
- **Authentication**: JWT, bcryptjs
- **File Processing**: Multer, Sharp (PDF/image processing)

## Prerequisites

- Node.js (v20.x or higher recommended)
- npm or yarn
- Gemini API Key (for AI features)
- Resend API Key (optional, for email features)

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd medicare-vision-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your API keys:
```env
GEMINI_API_KEY=your_gemini_api_key_here
RESEND_API_KEY=your_resend_api_key_here (optional)
JWT_SECRET=your_jwt_secret_here
```

4. Start the development servers:
```bash
# Start both frontend and backend
npm run dev:all

# Or start them separately:
npm run dev:server  # Backend on port 3001
npm run dev         # Frontend on port 4000
```

5. Open your browser:
- Frontend: http://localhost:4000
- Backend API: http://localhost:3001

## Project Structure

```
medicare-vision-ai/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── views/              # Page views
│   ├── services/           # API service layers
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript type definitions
├── routes/                 # Backend API routes
├── services/               # Backend services (OCR, email, etc.)
├── config/                 # Configuration files
├── middleware/             # Express middleware
└── uploads/                # User uploaded files
```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `GET /api/me` - Get current user profile

### Prescriptions
- `GET /api/prescriptions` - Get user prescriptions
- `POST /api/prescriptions` - Add new prescription
- `POST /api/prescriptions/upload` - Upload prescription image (OCR)
- `DELETE /api/prescriptions/:id` - Delete prescription

### Blood Reports
- `GET /api/blood-reports` - Get user blood reports
- `POST /api/blood-reports/upload` - Upload blood report (PDF/image)
- `DELETE /api/blood-reports/:id` - Delete blood report

### Meal Plans
- `POST /api/meal-plans/generate` - Generate meal plan from patient report

## Usage

### Voice Assistant
1. Navigate to Voice Assistant section
2. Click the microphone button
3. Ask questions like:
   - "What tablets do I need to take today?"
   - "What are my remaining tablets?"
   - "What can I eat today?"
   - "Help"

### Meal Planning
1. Go to Meal Planner section
2. Upload a patient report (PDF or image)
3. AI will analyze the report and generate a personalized meal plan

### Prescription Management
1. Add prescriptions manually or upload prescription images
2. OCR will extract medication details automatically
3. Track medication intake with voice commands

## Environment Variables

See `.env.local.example` for all available environment variables.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Google Gemini AI for intelligent meal planning and analysis
- Tesseract.js for OCR capabilities
- All contributors and testers
