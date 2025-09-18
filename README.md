# Spordo

Spordo is an AI-powered sports coaching platform that provides real-time feedback on athletic performance using computer vision and generative AI. The project consists of a React-based frontend and a FastAPI backend, leveraging MediaPipe for pose detection and Google Gemini for intelligent feedback.

## Project Structure

```
SPORDO/
├── client/        # Frontend (React, Vite, TailwindCSS)
│   ├── public/    # Static assets (favicons, logo)
│   ├── src/       # React source code
│   ├── ...        # Config files
├── server/        # Backend (FastAPI, Python)
│   ├── analysis/  # Pose analysis logic
│   ├── app.py     # Main API server
│   ├── ...        # Python dependencies
├── README.md      # Project documentation
```

## Tech Stack

- **Frontend:** React, Vite, TailwindCSS, MediaPipe (JS)
- **Backend:** FastAPI, Python, MediaPipe, Google Gemini API, gTTS

## Getting Started

### Prerequisites

- Node.js & npm
- Python 3.10+

### 1. Clone the Repository

```bash
git clone https://github.com/varunrewadi/Spordo.git
cd Spordo
```

### 2. Setup the Frontend

```bash
cd client
npm install
npm run dev
```

The frontend will start on `http://localhost:5173` (default Vite port).

### 3. Setup the Backend

```bash
cd ../server
python3.11 -m venv .venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `server/` directory and add your Gemini API key:

```
GEMINI_API_KEY=your_api_key_here
```

Start the FastAPI server:

```bash
uvicorn app:app --reload
```

The backend will run on `http://localhost:8000`.

### 4. Using the App

Open the frontend in your browser and interact with the sports coach features. The app uses your webcam and provides real-time feedback via audio and text.

## License

MIT
