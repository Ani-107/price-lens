# PriceLens AI 🚀

> **AI-powered pricing strategy analysis from customer interview transcripts**

PriceLens AI uses advanced CrewAI agents to analyze customer interviews and generate comprehensive pricing strategies, including willingness-to-pay analysis, risk assessment, and validation roadmaps.

## ✨ Features

- **🤖 Multi-Agent Analysis**: Two specialized AI agents work together to extract insights and generate strategies
- **📊 Comprehensive Reports**: Get detailed analysis including:
  - Market signals and competitive intelligence
  - Willingness-to-pay (WTP) estimation
  - Customer segmentation
  - Pricing strategy recommendations
  - Risk assessment with confidence scores
  - Validation roadmap with actionable experiments
- **💾 Analysis History**: Automatically saves your analyses for quick reference
- **📥 Export Options**: Export reports as Markdown, copy to clipboard, or print
- **🎨 Modern UI**: Beautiful, responsive interface with dark mode
- **⚡ Fast & Efficient**: Optimized pipeline with rate limiting and error handling
- **🔒 Production Ready**: Health checks, logging, and comprehensive error handling

## 🏗️ Architecture

### Backend (FastAPI + CrewAI)

- **`api.py`**: FastAPI server with REST endpoints
  - `/health` - Health check endpoint
  - `/analyze` - Analyze transcript from JSON
  - `/analyze-file` - Analyze transcript from file upload
- **`pricelens_pipeline.py`**: CrewAI pipeline with specialized agents
  - **Market Analyst**: Extracts signals and analyzes WTP
  - **Pricing Strategist**: Develops strategy and validation plans

### Frontend (Next.js + React)

- Modern React application with TypeScript
- Real-time analysis with loading states
- Local storage for analysis history
- Export and sharing capabilities

## 📋 Prerequisites

- **Python** 3.10 or higher
- **Node.js** 18 or higher
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Ani-107/price-lens.git
cd price-lens
```

### 2. Configure Environment Variables

#### Backend Configuration

Create a `.env` file in the root directory (or set system environment variables):

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional
OPENAI_MODEL_NAME=gpt-4o-mini
OPENAI_TEMPERATURE=0.2
PORT=8000
HOST=0.0.0.0
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

#### Frontend Configuration

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 3. Install Dependencies

#### Backend

```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Frontend

```bash
cd frontend
npm install
```

### 4. Run the Application

#### Start Backend (Terminal 1)

```bash
# From project root
python api.py
```

Backend will run on `http://localhost:8000`

#### Start Frontend (Terminal 2)

```bash
# From frontend directory
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

### 5. Use the Application

1. Open `http://localhost:3000` in your browser
2. Paste a customer interview transcript or upload a `.txt` file
3. Select your product type and business stage
4. Click "Generate Expert Report"
5. View your comprehensive pricing analysis!

## 📖 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### API Endpoints

#### `GET /health`
Health check endpoint. Returns API status and configuration.

**Response:**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "timestamp": "2024-01-01T00:00:00",
  "openai_configured": true
}
```

#### `POST /analyze`
Analyze a transcript from JSON payload.

**Request:**
```json
{
  "transcript": "Customer interview transcript text...",
  "product_type": "SaaS",
  "stage": "Pre-revenue"
}
```

**Response:**
```json
{
  "result": "# Pricing Strategy Report\n\n...",
  "timestamp": "2024-01-01T00:00:00",
  "product_type": "SaaS",
  "stage": "Pre-revenue",
  "transcript_length": 1234
}
```

#### `POST /analyze-file`
Analyze a transcript from uploaded file.

**Request:** `multipart/form-data`
- `file`: Text file (.txt, .md)
- `product_type`: (optional) Product type
- `stage`: (optional) Business stage

## 🎯 Usage Examples

### Example Transcript

```
Interviewer: How much do you pay for pricing tools?
Founder: We pay $50/month but it is too cheap for what we get. 
We would pay $150/month if it integrated with our CRM. The current 
solution doesn't solve our main pain point which is manual data entry.
We spend 10 hours a week on this, and our time is worth at least $100/hour.
```

### Product Types

- `SaaS` - Software as a Service
- `E-commerce` - Online retail
- `B2B` - Business to Business
- `B2C` - Business to Consumer
- `Marketplace` - Multi-sided platform
- `Hardware` - Physical products
- `Other` - Custom product type

### Business Stages

- `Pre-revenue` - Before first sale
- `Early-stage` - Initial customers
- `Growth` - Scaling phase
- `Scale` - Rapid expansion
- `Mature` - Established business

## 🔧 Configuration

### Model Selection

Change the OpenAI model by setting `OPENAI_MODEL_NAME`:

```bash
# Use GPT-4 for higher quality (more expensive)
OPENAI_MODEL_NAME=gpt-4

# Use GPT-4o-mini for faster/cheaper (default)
OPENAI_MODEL_NAME=gpt-4o-mini
```

### Temperature Control

Adjust creativity/consistency:

```bash
# Lower = more consistent (default: 0.2)
OPENAI_TEMPERATURE=0.2

# Higher = more creative
OPENAI_TEMPERATURE=0.7
```

## 🛠️ Development

### Project Structure

```
price-lens/
├── api.py                 # FastAPI backend server
├── pricelens_pipeline.py  # CrewAI pipeline
├── requirements.txt       # Python dependencies
├── env.example           # Environment variable template
├── README.md             # This file
└── frontend/             # Next.js frontend
    ├── app/
    │   ├── page.tsx      # Main page
    │   ├── layout.tsx    # Root layout
    │   └── globals.css   # Global styles
    ├── package.json      # Node dependencies
    └── .env.local        # Frontend env vars
```

### Running Tests

```bash
# Backend health check
curl http://localhost:8000/health

# Test analysis endpoint
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"transcript": "Test transcript here..."}'
```

## 🐛 Troubleshooting

### Backend Issues

**Problem**: `OPENAI_API_KEY is required`
- **Solution**: Set your OpenAI API key in `.env` or environment variables

**Problem**: `Analysis failed: ...`
- **Solution**: Check API key is valid and has credits. Check logs for details.

**Problem**: Port 8000 already in use
- **Solution**: Change port with `PORT=8001 python api.py`

### Frontend Issues

**Problem**: Cannot connect to backend
- **Solution**: Ensure backend is running and `NEXT_PUBLIC_API_BASE_URL` is correct

**Problem**: CORS errors
- **Solution**: Update `ALLOWED_ORIGINS` in backend `.env` to include your frontend URL

## 📝 Notes

- The pipeline is **non-interactive**: if `OPENAI_API_KEY` is missing, it throws a clear error (important for server deployments)
- Analysis history is stored in browser localStorage (limited to last 10 analyses)
- File uploads support `.txt` and `.md` files (UTF-8 encoded)
- The pipeline uses sequential agent processing for optimal results

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [CrewAI](https://github.com/joaomdmoura/crewAI)
- Powered by [OpenAI](https://openai.com)
- Frontend built with [Next.js](https://nextjs.org)

---

**Made with ❤️ for founders who move fast**



