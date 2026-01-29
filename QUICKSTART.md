# PriceLens AI - Quick Start Guide 🚀

Get up and running in 5 minutes!

## Prerequisites Check

- ✅ Python 3.10+ installed
- ✅ Node.js 18+ installed  
- ✅ OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Step 1: Clone & Setup (2 minutes)

### Option A: Automated Setup (Recommended)

**Windows:**
```bash
setup.bat
```

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

### Option B: Manual Setup

```bash
# 1. Install Python dependencies
python -m venv venv
venv\Scripts\activate  # Windows
# OR
source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt

# 2. Install Frontend dependencies
cd frontend
npm install
cd ..
```

## Step 2: Configure (1 minute)

1. **Backend**: Create `.env` file in root:
```bash
OPENAI_API_KEY=your_actual_api_key_here
```

2. **Frontend**: Create `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Step 3: Run (2 minutes)

### Terminal 1 - Backend:
```bash
python api.py
```
✅ Backend running at `http://localhost:8000`

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```
✅ Frontend running at `http://localhost:3000`

## Step 4: Use It!

1. Open `http://localhost:3000`
2. Paste a customer interview transcript
3. Select product type and stage
4. Click "Generate Expert Report"
5. Get your pricing strategy! 🎉

## Example Transcript

Try this sample:

```
Interviewer: How much do you pay for pricing tools?
Founder: We pay $50/month but it is too cheap for what we get. 
We would pay $150/month if it integrated with our CRM. The current 
solution doesn't solve our main pain point which is manual data entry.
We spend 10 hours a week on this, and our time is worth at least $100/hour.
```

## Troubleshooting

**Backend won't start?**
- Check Python version: `python --version` (need 3.10+)
- Check API key is set in `.env`
- Check port 8000 is available

**Frontend won't connect?**
- Ensure backend is running
- Check `NEXT_PUBLIC_API_BASE_URL` in `frontend/.env.local`
- Check browser console for errors

**Analysis fails?**
- Verify OpenAI API key is valid and has credits
- Check backend logs for error details
- Ensure transcript is at least 10 characters

## Next Steps

- 📖 Read the full [README.md](README.md) for detailed docs
- 🔧 Check [API Documentation](http://localhost:8000/docs) when backend is running
- 🤝 See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

Happy analyzing! 🎯

