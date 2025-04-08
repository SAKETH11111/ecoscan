# EcoScan - Gemini API Integration

This document describes how the EcoScan app integrates with Google's Gemini API to provide AI-powered recycling analysis.

## Overview

EcoScan uses the Gemini 2.0 Flash model to analyze images of items and determine:
- What the item is
- Whether it's recyclable
- The material category (plastic, glass, paper, metal, etc.)
- Specific recycling code (for plastics)
- Proper recycling or disposal instructions
- Environmental impact metrics for recycled items

## Architecture

The integration follows a client-server architecture:

1. **Mobile App (React Native)**
   - Captures or selects images via `ScanScreen.tsx`
   - Sends images to the backend API via `geminiClient.js`
   - Displays analysis results in `ScanResultCard.tsx`

2. **Backend Server (Python/FastAPI)**
   - Receives images from the mobile app via `server.py`
   - Processes and optimizes images
   - Sends images to Gemini API with appropriate prompts via `geminiService.py`
   - Parses and returns structured results

## Setup Instructions

### Backend Setup

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Obtain a Gemini API key from [Google AI Studio](https://makersuite.google.com/) and add it to the `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the backend server:
   ```bash
   cd src/api
   python server.py
   ```

### Frontend Setup

1. The `API_BASE_URL` in `src/geminiClient.js` is pre-configured to use localhost for simulator testing:
   ```javascript
   const API_BASE_URL = 'http://localhost:8000'; // For simulator testing
   ```
   
   For physical device testing, update to your computer's local IP address:
   ```javascript
   const API_BASE_URL = 'http://192.168.x.x:8000'; // Replace with your actual local IP
   ```

2. The client automatically checks API health and falls back to mock data if needed:
   ```javascript
   try {
     const isServerAvailable = await checkApiHealth();
     useMockData = !isServerAvailable;
   } catch (error) {
     useMockData = true;
   }
   ```

3. Install React Native dependencies:
   ```bash
   npm install
   ```

4. Start the React Native app:
   ```bash
   npm start
   ```

## Testing the API

You can test the Gemini API integration using the provided test script:

```bash
cd src/api
python test_api.py /path/to/test/image.jpg
```

This will send the test image to your local API and display the results.

## API Response Format

The API returns a JSON object with the following structure:

```json
{
  "itemName": "Plastic Bottle",
  "recyclable": true,
  "category": "Plastic",
  "recyclingCode": "#1 PET",
  "instructions": "Rinse the bottle and remove the cap before recycling.",
  "impact": {
    "co2Saved": "0.1 kg",
    "waterSaved": "2L"
  },
  "scannedImageUrl": "/uploads/12345.jpg"
}
```

## Troubleshooting

1. **Image Size Issues**: If you're getting errors with large images, the backend automatically resizes images that exceed 4MB.

2. **API Key Invalid**: Verify your Gemini API key is correct and has access to the Gemini 2.0 Flash model.

3. **Network Errors**: 
   - For simulator testing, use `localhost` as the API URL
   - For physical device testing, use your computer's local IP address (e.g., 192.168.x.x)
   - Ensure your device and computer are on the same network
   - Check firewall settings that might block connections on port 8000

4. **API Connection Timeouts**: The client is configured with a 2-second timeout for health checks to quickly fall back to mock data if needed.

5. **Model Limitations**: The Gemini model works best with clear, well-lit images. Poor image quality may result in less accurate analysis.

## Starting the Server

You can use the included script to start the server:

```bash
# Make script executable (first time only)
chmod +x scripts/start_server.sh

# Run the server
./scripts/start_server.sh
```

This script will:
- Check for a Python virtual environment
- Verify the .env file exists (or create one from .env.example)
- Install required dependencies if needed
- Start the FastAPI server on port 8000