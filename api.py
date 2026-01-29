from fastapi import FastAPI, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
import uvicorn
import logging
import os
from contextlib import asynccontextmanager

from pricelens_pipeline import run_pricelens_pipeline

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 PriceLens API starting up...")
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "your_openai_api_key_here":
        logger.warning("⚠️  OPENAI_API_KEY not set. API will fail on analysis requests.")
    else:
        logger.info("✅ OpenAI API key configured")
    yield
    # Shutdown
    logger.info("🛑 PriceLens API shutting down...")

app = FastAPI(
    title="PriceLens AI API",
    description="AI-powered pricing strategy analysis from customer interview transcripts",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class AnalysisRequest(BaseModel):
    transcript: str = Field(..., min_length=10, description="Customer interview transcript text")
    product_type: str = Field(default="SaaS", description="Type of product (SaaS, E-commerce, B2B, etc.)")
    stage: str = Field(default="Pre-revenue", description="Business stage (Pre-revenue, Early-stage, Growth, etc.)")
    
    @validator('transcript')
    def validate_transcript(cls, v):
        if len(v.strip()) < 10:
            raise ValueError('Transcript must be at least 10 characters long')
        return v.strip()

class AnalysisResponse(BaseModel):
    result: str = Field(..., description="Markdown-formatted analysis report")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    product_type: str
    stage: str
    transcript_length: int

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str
    openai_configured: bool

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

# Health Check Endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for monitoring and load balancers"""
    api_key = os.getenv("OPENAI_API_KEY")
    return HealthResponse(
        status="healthy",
        version="2.0.0",
        timestamp=datetime.now().isoformat(),
        openai_configured=bool(api_key and api_key != "your_openai_api_key_here")
    )

# Root endpoint
@app.get("/")
async def root():
    """API root endpoint with basic information"""
    return {
        "name": "PriceLens AI API",
        "version": "2.0.0",
        "status": "operational",
        "endpoints": {
            "health": "/health",
            "analyze": "/analyze",
            "analyze_file": "/analyze-file",
            "docs": "/docs"
        }
    }

# Main Analysis Endpoint
@app.post("/analyze", response_model=AnalysisResponse, status_code=status.HTTP_200_OK)
async def analyze_transcript(request: AnalysisRequest):
    """
    Analyze a customer interview transcript and generate pricing strategy insights.
    
    Returns a comprehensive analysis including:
    - Market signals and willingness-to-pay
    - Pricing strategy recommendations
    - Risk assessment
    - Validation experiments
    """
    try:
        logger.info(f"📊 Starting analysis for {request.product_type} product at {request.stage} stage")
        logger.info(f"📝 Transcript length: {len(request.transcript)} characters")
        
        # Run the AI pipeline
        output = run_pricelens_pipeline(
            transcript_text=request.transcript,
            product_type=request.product_type,
            stage=request.stage
        )
        
        logger.info("✅ Analysis completed successfully")
        
        return AnalysisResponse(
            result=str(output),
            product_type=request.product_type,
            stage=request.stage,
            transcript_length=len(request.transcript)
        )
    except ValueError as e:
        logger.error(f"❌ Validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"❌ Analysis error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )

# File Upload Analysis Endpoint
@app.post("/analyze-file", response_model=AnalysisResponse, status_code=status.HTTP_200_OK)
async def analyze_uploaded_file(
    file: UploadFile = File(...),
    product_type: str = "SaaS",
    stage: str = "Pre-revenue"
):
    """
    Analyze a customer interview transcript from an uploaded file.
    
    Currently supports:
    - .txt files (UTF-8 encoded)
    
    Future support planned for:
    - .docx, .pdf, .md files
    """
    try:
        # Validate file extension
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No filename provided"
            )
        
        allowed_extensions = ['.txt', '.md']
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type '{file_ext}' not supported. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Read and decode file content
        content = await file.read()
        
        try:
            transcript_text = content.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be UTF-8 encoded"
            )
        
        if len(transcript_text.strip()) < 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File content is too short. Please provide a transcript with at least 10 characters."
            )
        
        logger.info(f"📄 Processing file: {file.filename} ({len(transcript_text)} characters)")
        
        # Run the AI pipeline
        output = run_pricelens_pipeline(
            transcript_text=transcript_text,
            product_type=product_type,
            stage=stage
        )
        
        logger.info(f"✅ File analysis completed for {file.filename}")
        
        return AnalysisResponse(
            result=str(output),
            product_type=product_type,
            stage=stage,
            transcript_length=len(transcript_text)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ File analysis error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File analysis failed: {str(e)}"
        )

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"❌ Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "detail": "An unexpected error occurred. Please try again later.",
            "timestamp": datetime.now().isoformat()
        }
    )

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    logger.info(f"🌐 Starting server on {host}:{port}")
    uvicorn.run(
        app,
        host=host,
        port=port,
        timeout_keep_alive=300,
        log_level="info"
    )
