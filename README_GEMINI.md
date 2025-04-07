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

1. Update the `API_BASE_URL` in the `src/geminiClient.js` file to point to your backend server:
   ```javascript
   const API_BASE_URL = 'http://your-local-ip:8000';
   ```

2. Set `useMockData` to `false` in `src/geminiClient.js` when your server is running:
   ```javascript
   const useMockData = false; // Change this from true to false
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

3. **Network Errors**: Ensure your mobile app can reach the backend server by using the correct IP address in your `.env` file.

4. **Model Limitations**: The Gemini model works best with clear, well-lit images. Poor image quality may result in less accurate analysis.