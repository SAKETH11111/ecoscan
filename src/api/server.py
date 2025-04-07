"""
FastAPI server for the EcoScan application.
Provides API endpoints to analyze images using the Gemini model.
"""

import os
import shutil
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
from pydantic import BaseModel
from typing import Dict, Any

from geminiService import analyze_image

# Initialize FastAPI app
app = FastAPI(title="EcoScan API", description="API for the EcoScan recycling assistant")

# Configure CORS to allow requests from the React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Serve static files (uploaded images)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

class ErrorResponse(BaseModel):
    error: str

@app.post("/api/analyze", response_class=JSONResponse)
async def analyze_item(file: UploadFile = File(...)):
    """
    Analyze an uploaded image to determine recyclability.
    
    Args:
        file: The image file to analyze
        
    Returns:
        JSON response with recycling information
    """
    try:
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Get the public URL for the image
        image_url = f"/uploads/{unique_filename}"
            
        # Analyze the image with Gemini
        result = analyze_image(file_path)
        
        # Update image URL to be accessible from the client
        result["scannedImageUrl"] = image_url
        
        return result
        
    except Exception as e:
        # Clean up the file if an error occurs
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
            
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )

@app.get("/api/health")
async def health_check():
    """Health check endpoint to verify API is running."""
    return {"status": "healthy"}

if __name__ == "__main__":
    # Run the server
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)