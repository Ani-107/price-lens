from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from pricelens_pipeline import run_pricelens_pipeline
import uvicorn

app = FastAPI(title="PriceLens API")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    transcript: str
    product_type: str = "SaaS"
    stage: str = "Pre-revenue"

class AnalysisResponse(BaseModel):
    result: str

@app.post("/analyze", response_model=AnalysisResponse)
def analyze_transcript(request: AnalysisRequest):
    try:
        # Run the AI pipeline
        output = run_pricelens_pipeline(
            transcript_text=request.transcript,
            product_type=request.product_type,
            stage=request.stage
        )
        return AnalysisResponse(result=str(output))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-file", response_model=AnalysisResponse)
def analyze_uploaded_file(file: UploadFile = File(...)):
    try:
        # Check file extension (basic .txt support for now)
        if not file.filename.endswith('.txt'):
            raise HTTPException(status_code=400, detail="Only .txt files are supported currently.")
        
        content = file.read() # Changed from await file.read()
        transcript_text = content.decode("utf-8")
        
        # Run the AI pipeline
        output = run_pricelens_pipeline(
            transcript_text=transcript_text,
            product_type="SaaS",
            stage="Pre-revenue"
        )
        return AnalysisResponse(result=str(output))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, timeout_keep_alive=300)
