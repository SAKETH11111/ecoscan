# EcoScan: Premium Minimalist Recycling Assistant

EcoScan is a sophisticated, visually refined mobile application built with Expo and React Native that helps users properly recycle items and track their sustainability impact through an elegant, minimalist interface.

## Premium Design Features

- **Sophisticated Minimalism**: Clean, uncluttered UI with strategic use of whitespace, refined typography, and subtle depth
- **Advanced Animations**: Micro-interactions, seamless transitions, and physical feedback using React Native Reanimated
- **Tactile Feedback**: Haptic responses for meaningful interactions using Expo Haptics
- **Custom Components**: Carefully crafted reusable UI elements with animation capabilities
- **Refined Typography**: Perfect typographic hierarchy and spacing with a sophisticated type system
- **Premium Color System**: Monochromatic base with strategic accent colors and proper dark mode support

## Core Features

### Elegant Onboarding Experience
- Animated illustrations with parallax effects
- Smooth transitions between steps
- Progress indicators with micro-animations

### Camera Scanning Feature
- Dynamic scanning guides with animations
- High-tech scanning animation overlay
- Expanding result cards with micro-interactions
- Haptic feedback on successful scans

### Impact Dashboard
- Animated data visualizations
- Smooth entry animations for statistics
- Expanding/collapsing sections with transitions
- Celebration animations for achievements

### Resources Map
- Premium custom-styled map experience
- Location cards with smooth animations
- Gesture controls for map navigation
- Location pulse animations

### Community Features
- Animated leaderboard with personalization
- Challenge cards with interactive elements
- Tab transitions with spring physics
- Progress indicators with custom animations

## Technology Stack

- **Expo & React Native**: Core framework
- **TypeScript**: Type safety and improved developer experience
- **React Navigation**: Navigation with custom transitions
- **React Native Reanimated**: Advanced animations
- **React Native Gesture Handler**: Gesture control
- **Expo Haptics**: Tactile feedback
- **React Native Maps**: Location services
- **Context API**: State management
- **Custom Animation Hooks**: Reusable animation logic
- **Python**: For Gemini API integration

## Code Structure

- `src/screens/` - Main app screens with premium animations
- `src/components/` - Reusable UI components
- `src/components/UI/` - Core UI elements with animation capabilities
- `src/components/map/` - Custom map components
- `src/navigation/` - Navigation setup with custom tab bar
- `src/hooks/` - Custom animation hooks and utility hooks
- `src/context/` - Theme and app state context providers
- `src/utils/` - Utility functions and theme definitions
- `src/api/` - API services for external integrations

## Premium Design System

The app features a comprehensive design system with:

- **Color Palette**: Sophisticated monochromatic scheme with accent colors
- **Typography System**: Refined type hierarchy with perfect spacing
- **Spacing System**: Consistent spacing throughout the app
- **Animation Timing**: Carefully calibrated timing for natural feel
- **Elevation System**: Subtle shadows and depth through layering
- **Interaction Patterns**: Consistent feedback and behavior

## Getting Started

### Prerequisites

Before running the app, you'll need to configure the following API keys:

1. **Gemini API Key**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Google Maps API Key** (optional): For location services

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Create a `.env` file in the root directory with your API keys:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   GOOGLE_MAPS_API_KEY_IOS=your_google_maps_api_key_ios
   GOOGLE_MAPS_API_KEY_ANDROID=your_google_maps_api_key_android
   ```

### Python Gemini API Integration

The app uses a Python backend for the Gemini API integration. To set up the Python backend:

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the Python Gemini API server:
   ```bash
   python scripts/gemini_api_server.py
   ```

3. Test the integration:
   ```bash
   python scripts/test_integration.py --image-path path/to/your/image.jpg
   ```

### Running the App

1. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

2. Run on iOS:
   ```bash
   npm run ios
   # or
   yarn ios
   ```

3. Run on Android:
   ```bash
   npm run android
   # or
   yarn android
   ```

## Design Philosophy

EcoScan embodies sophisticated minimalism through:

- **Intentional Reduction**: Removing all unnecessary elements
- **Progressive Disclosure**: Revealing features as needed
- **Contextual Feedback**: Providing feedback at the right moment
- **Natural Motion**: Using animations that feel physical and intuitive
- **Visual Hierarchy**: Guiding the user through careful design decisions
- **Thoughtful Spacing**: Using whitespace as a design element

## Developer Notes

### Shadow Implementation

When implementing shadows in combination with LinearGradient:
- Never apply shadow properties directly to LinearGradient components
- Instead, wrap the LinearGradient in a View with a solid background color and apply shadows to that View
- Example:
  ```jsx
  // Correct approach
  <View style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, backgroundColor: '#FFF' }}>
    <LinearGradient colors={['#FFF', '#EEE']}>
      <Text>Content</Text>
    </LinearGradient>
  </View>
  
  // Incorrect approach - will cause warnings
  <LinearGradient 
    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 } }}
    colors={['#FFF', '#EEE']}>
    <Text>Content</Text>
  </LinearGradient>
  ```

## License

This project is licensed under the MIT License

## Python Gemini API Integration

The app uses a Python-based Gemini API for image analysis. The integration:

- Analyzes photos taken with the camera or selected from the gallery
- Returns detailed information about the item's recyclability
- Provides proper recycling instructions based on the material
- Calculates environmental impact metrics (CO2 and water saved)
- Features robust error handling with fallback to example data
- Implements caching to reduce API usage for similar items
- Optimizes images before sending to the API for better performance

## Setup

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Python 3.8 or later
- Expo CLI

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ecoscan.git
cd ecoscan
```

2. Install JavaScript dependencies:

```bash
npm install
# or
yarn install
```

3. Install Python dependencies:

```bash
pip install -r requirements.txt
```

4. Set up your Gemini API key:

Create a `.env` file in the root directory of the project with the following content:

```
GEMINI_API_KEY=your_gemini_api_key
```

Replace `your_gemini_api_key` with your actual Gemini API key.

## Running the App

### Start the Python Gemini API Server

First, start the Python Gemini API server:

```bash
python scripts/gemini_api_server.py
```

This will start a local HTTP server on port 8000 that the React Native app will use to communicate with the Gemini API.

### Start the React Native App

```bash
npm start
# or
yarn start
```

This will start the Expo development server. You can then run the app on an emulator or physical device using the Expo Go app.

## Project Structure

- `src/` - React Native source code
  - `api/` - API clients and services
    - `geminiClient.js` - React Native client for the Python Gemini API server
  - `components/` - React Native components
  - `screens/` - React Native screens
  - `navigation/` - React Navigation configuration
  - `theme/` - Theme configuration
  - `utils/` - Utility functions
- `scripts/` - Python scripts
  - `gemini_api_server.py` - Python HTTP server for the Gemini API
  - `test_gemini_api.py` - Test script for the Gemini API
- `requirements.txt` - Python dependencies

## Testing

### Testing the Gemini API

You can test the Gemini API integration using the provided test script:

```bash
python scripts/test_gemini_api.py path/to/your/image.jpg
```

This will analyze the image and print the recycling information.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- Google Gemini API for providing the image analysis capabilities
- Expo for the React Native development framework
- React Navigation for the navigation library