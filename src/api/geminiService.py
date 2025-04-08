"""
Gemini API service for EcoScan application.
This module provides functions to analyze images of items using Google's Gemini model
and determine their recyclability status.
"""

import os
import base64
import json
from typing import Dict, Any, Optional, TypedDict, List
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image

# Load environment variables
load_dotenv()

# Configure Gemini API
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set")

genai.configure(api_key=API_KEY)

# Define model
MODEL = "gemini-2.0-flash"

# Define the response schema
class Impact(BaseModel):
    co2Saved: str = Field(description="Amount of CO2 saved by recycling this item")
    waterSaved: str = Field(description="Amount of water saved by recycling this item")

class AlternativeOption(BaseModel):
    option: str = Field(description="Alternative option for handling the item if not recyclable")

class RecyclingTip(BaseModel):
    tip: str = Field(description="General recycling tip relevant to this type of item")

class RecyclingResult(BaseModel):
    itemName: str = Field(description="The name of the scanned item")
    recyclable: bool = Field(description="Whether the item is recyclable")
    category: str = Field(description="The material category (e.g., Plastic, Glass, Paper, Metal)")
    recyclingCode: str = Field(description="The recycling code if applicable (e.g., #1 PET, #2 HDPE)")
    instructions: str = Field(description="Instructions for how to properly recycle or dispose of the item")
    impact: Impact = Field(description="Environmental impact from recycling this item")
    alternativeOptions: List[AlternativeOption] = Field(description="Alternative disposal options if not recyclable")
    recyclingTips: List[RecyclingTip] = Field(description="General recycling tips")

def encode_image(image_path: str) -> str:
    """Encode an image to base64 string."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def resize_image(image_path: str, max_size: int = 4 * 1024 * 1024) -> str:
    """
    Resize image if it's too large for the API.
    Returns the path to the resized image (or original if small enough).
    """
    try:
        # Check file size
        file_size = os.path.getsize(image_path)
        if file_size <= max_size:
            return image_path
        
        # Open and resize image
        with Image.open(image_path) as img:
            # Calculate scaling factor
            scale_factor = (max_size / file_size) ** 0.5
            new_width = int(img.width * scale_factor)
            new_height = int(img.height * scale_factor)
            
            # Resize image
            resized_img = img.resize((new_width, new_height))
            
            # Save to a temporary file
            temp_path = f"{image_path}_resized.jpg"
            resized_img.save(temp_path, quality=85, optimize=True)
            
            return temp_path
    except Exception as e:
        print(f"Error resizing image: {e}")
        # Return original image if resize fails
        return image_path

def analyze_image(image_path: str) -> Dict[str, Any]:
    """
    Analyze an image using Gemini API to determine recyclability.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Dictionary with recycling information
    """
    try:
        # Resize image if needed
        processed_image_path = resize_image(image_path)
        
        # Create Gemini client
        model = genai.GenerativeModel(MODEL)
        
        # Encode the image
        image_b64 = encode_image(processed_image_path)
        
        # Clean up if we created a resized image
        if processed_image_path != image_path:
            try:
                os.remove(processed_image_path)
            except:
                pass
        
        # Prepare prompt with example output
        prompt = """
        Analyze this image and identify the item shown. Then determine if it's recyclable, 
        what material category it belongs to, and provide recycling instructions.
        
        For recyclable items, provide estimated environmental impact metrics.
        
        Be specific about the recycling code for plastics (e.g., #1 PET, #2 HDPE).
        
        Also provide 3 alternative options for disposal if the item is not recyclable,
        and 3 general recycling tips relevant to this type of item.
        
        If you're unsure about the exact item, make your best guess based on visible characteristics.
        
        Here's an example of the expected output format:
        
        ```json
        {
          "itemName": "Plastic Water Bottle",
          "recyclable": true,
          "category": "Plastic",
          "recyclingCode": "#1 PET",
          "instructions": "Empty, rinse, and replace cap before recycling in your curbside bin. Remove label if possible.",
          "impact": {
            "co2Saved": "0.3 kg",
            "waterSaved": "4.8L"
          },
          "alternativeOptions": [
            {"option": "Reuse the bottle for storing homemade beverages"},
            {"option": "Use for DIY crafts or gardening projects"},
            {"option": "Look for brands with recyclable packaging"}
          ],
          "recyclingTips": [
            {"tip": "Always rinse containers before recycling"},
            {"tip": "Check the recycling number on plastic items"},
            {"tip": "Remove caps and labels when required by local guidelines"}
          ]
        }
        ```
        
        Respond ONLY with the JSON object matching the schema.
        """
        
        # Manually define the schema for robust compatibility
        recycling_schema = {
            "type": "OBJECT",
            "properties": {
                "itemName": {"type": "STRING"},
                "recyclable": {"type": "BOOLEAN"},
                "category": {"type": "STRING"},
                "recyclingCode": {"type": "STRING"},
                "instructions": {"type": "STRING"},
                "impact": {
                    "type": "OBJECT",
                    "properties": {
                        "co2Saved": {"type": "STRING"},
                        "waterSaved": {"type": "STRING"}
                    },
                    "required": ["co2Saved", "waterSaved"]
                },
                "alternativeOptions": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "option": {"type": "STRING"}
                        },
                        "required": ["option"]
                    }
                },
                "recyclingTips": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "tip": {"type": "STRING"}
                        },
                        "required": ["tip"]
                    }
                }
            },
            "required": ["itemName", "recyclable", "category", "recyclingCode", "instructions", "impact", "alternativeOptions", "recyclingTips"]
        }

        # Send request to Gemini
        response = model.generate_content(
            contents=[
                {
                    "role": "user",
                    "parts": [
                        {"text": prompt},
                        {"inline_data": {"mime_type": "image/jpeg", "data": image_b64}}
                    ]
                }
            ],
            # Configure response to be JSON based on the manually defined schema
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                response_schema=recycling_schema, # Use the dictionary schema
            )
        )
        
        # Parse the response (already JSON)
        result = json.loads(response.text)
        
        # Add the source image URL
        result["scannedImageUrl"] = image_path
        
        return result
        
    except Exception as e:
        print(f"Error analyzing image: {e}")
        # Return error result
        return {
            "itemName": "Unknown Item",
            "recyclable": False,
            "category": "Unknown",
            "recyclingCode": "",
            "instructions": "Error analyzing image. Please try again.",
            "impact": {
                "co2Saved": "0 kg",
                "waterSaved": "0L"
            },
            "alternativeOptions": [
                {"option": "Check local special waste disposal options"},
                {"option": "Look for brands with recyclable alternatives"},
                {"option": "Consider reusing the item if possible"}
            ],
            "recyclingTips": [
                {"tip": "Always rinse containers before recycling"},
                {"tip": "Check the recycling number on plastic items"},
                {"tip": "Remove caps and labels when required by local guidelines"}
            ],
            "scannedImageUrl": image_path,
            "errorDetails": str(e)
        }