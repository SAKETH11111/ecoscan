"""
Test script for the EcoScan API.
This script sends a test image to the API to verify functionality.
"""

import os
import requests
import json
import sys
from pathlib import Path

# Ensure we have test images directory
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = Path(SCRIPT_DIR).parent.parent
TEST_IMAGES_DIR = os.path.join(PROJECT_ROOT, "scripts", "test-images")

def test_analyze_endpoint(image_path, api_url="http://localhost:8000"):
    """Test the /api/analyze endpoint with a sample image."""
    
    print(f"Testing API with image: {image_path}")
    
    # Ensure the image exists
    if not os.path.exists(image_path):
        print(f"Error: Image not found at {image_path}")
        return
    
    try:
        # Upload the image to the API
        with open(image_path, "rb") as image_file:
            files = {"file": (os.path.basename(image_path), image_file, "image/jpeg")}
            response = requests.post(f"{api_url}/api/analyze", files=files)
        
        # Check response
        if response.status_code == 200:
            print("✅ API request successful!")
            result = response.json()
            print("\nResult:")
            print(json.dumps(result, indent=2))
            
            # Verify fields
            required_fields = ["itemName", "recyclable", "category", "instructions", "impact"]
            missing_fields = [field for field in required_fields if field not in result]
            
            if missing_fields:
                print(f"\n⚠️ Warning: Response missing required fields: {', '.join(missing_fields)}")
            else:
                print("\n✅ Response contains all required fields")
                
            return result
            
        else:
            print(f"❌ API request failed with status code {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing API: {str(e)}")

def main():
    """Run the test script."""
    # Check if an image path was provided
    if len(sys.argv) > 1:
        test_image = sys.argv[1]
    else:
        # Use the first image in the test images directory
        if os.path.exists(TEST_IMAGES_DIR):
            test_images = [f for f in os.listdir(TEST_IMAGES_DIR) 
                          if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
            if test_images:
                test_image = os.path.join(TEST_IMAGES_DIR, test_images[0])
            else:
                print(f"No test images found in {TEST_IMAGES_DIR}")
                print("Please provide an image path as an argument: python test_api.py /path/to/image.jpg")
                return
        else:
            print(f"Test images directory not found: {TEST_IMAGES_DIR}")
            print("Please provide an image path as an argument: python test_api.py /path/to/image.jpg")
            return
    
    test_analyze_endpoint(test_image)

if __name__ == "__main__":
    main()