## Prerequisites

- Python 3.8+
- Node.js 16+ (18 recommended) + npm
- An OpenAI API key (for video classification)

---

## 1) Start the Backend (Terminal 1)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Set your OpenAI API key (required):

```bash
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

Alternatively, create a `.env` file inside `backend/`:

```
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

Run the backend:

```bash
python app.py
```

Backend runs at:

http://localhost:5001

---

## 2) Start the Frontend (Terminal 2)

```bash
cd frontend
npm install
npm start
```

Frontend runs at:

http://localhost:3000

Enjoy exploring SafeNest! 🏠
