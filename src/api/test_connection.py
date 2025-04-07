#!/usr/bin/env python3
"""
Script to test the API connection from your mobile app to the server.
This simulates what the React Native app is trying to do.
"""

import requests
import os
import sys
from pathlib import Path

# API URL (should match what's in your geminiClient.js)
SERVER_URL = "http://192.168.53.66:8000"

def check_health():
    """Test the health endpoint."""
    try:
        response = requests.get(f"{SERVER_URL}/api/health")
        print(f"Health check status: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error checking health: {e}")
        return False

def test_analysis():
    """Test image analysis endpoint with a test image."""
    
    # Find a test image
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = Path(script_dir).parent.parent
    test_images_dir = os.path.join(project_root, "scripts", "test-images")
    
    # Create test image directory if it doesn't exist
    os.makedirs(test_images_dir, exist_ok=True)
    
    # Try to find a test image
    test_image = None
    if os.path.exists(test_images_dir):
        for file in os.listdir(test_images_dir):
            if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                test_image = os.path.join(test_images_dir, file)
                break
    
    if not test_image:
        print("No test image found. Creating a simple test image...")
        
        try:
            # Try to create a simple test image
            from PIL import Image, ImageDraw
            
            test_image = os.path.join(test_images_dir, "test_image.jpg")
            img = Image.new('RGB', (500, 500), color = (73, 109, 137))
            d = ImageDraw.Draw(img)
            d.rectangle([(100, 100), (400, 400)], fill=(128, 0, 0))
            img.save(test_image)
            print(f"Created test image: {test_image}")
        except Exception as e:
            print(f"Could not create test image: {e}")
            return False
    
    # Send the image to the API
    try:
        print(f"Sending test image {test_image} to {SERVER_URL}/api/analyze")
        with open(test_image, 'rb') as f:
            files = {'file': (os.path.basename(test_image), f, 'image/jpeg')}
            response = requests.post(f"{SERVER_URL}/api/analyze", files=files)
        
        print(f"Analysis status: {response.status_code}")
        print(f"Response headers: {response.headers}")
        print(f"Response: {response.text[:1000]}")  # Limit output to first 1000 chars
        
        return response.status_code == 200
    except Exception as e:
        print(f"Error during analysis: {e}")
        return False

def main():
    """Run the connection tests."""
    print("=" * 50)
    print("Testing API Connection")
    print("=" * 50)
    
    print("\nChecking server health...")
    health_ok = check_health()
    
    if health_ok:
        print("\nServer is healthy!")
    else:
        print("\nServer health check failed. Make sure the server is running and accessible.")
        print(f"Expected URL: {SERVER_URL}/api/health")
    
    print("\nTesting image analysis...")
    analysis_ok = test_analysis()
    
    if analysis_ok:
        print("\nImage analysis successful!")
    else:
        print("\nImage analysis failed. Check server logs for more details.")
    
    print("\nTest summary:")
    print(f"Health check: {'✅' if health_ok else '❌'}")
    print(f"Image analysis: {'✅' if analysis_ok else '❌'}")
    
    print("\nIf tests are failing:")
    print("1. Make sure the server is running with: npm run api-server")
    print("2. Check the server IP address in both this script and geminiClient.js")
    print("3. Ensure your device and computer are on the same network")
    print("4. Check any firewall settings that might block connections")
    
    return health_ok and analysis_ok

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)