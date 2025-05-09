# Agora Video Call Application

A web-based video calling application built using the Agora RTC SDK and styled with Tailwind CSS, designed specifically for testing video calls when an additional participant is needed. 

## Prerequisites

Before using this application, you'll need:

1. An Agora account (Sign up at [https://www.agora.io](https://www.agora.io))
2. An Agora project with:
   - App ID
   - Channel name
   - Token

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Using the Application

1. **Join a Video Call**
   - Enter your Agora App ID in the "App ID" field
   - Enter a Channel Name (this can be any string to identify your call room)
   - If your project uses authentication, enter the Token
   - Click "Join Call" to start the video session

2. **During the Call**
   - Your local video will appear in the bottom-right corner
   - Remote participants' videos will appear in the main video container
   - The application automatically handles multiple participants joining and leaving

3. **End the Call**
   - Click the "Leave Call" button to end your session
   - You'll be returned to the join form where you can start a new call

## Features

- Real-time video and audio communication
- Support for multiple participants
- Responsive design with Tailwind CSS
- Simple and intuitive user interface
- Error handling for failed connections
- Picture-in-picture style local video preview

## Technical Details

The application is built with:
- Vite (Build tool)
- Agora RTC SDK (Video calling functionality)
- Tailwind CSS (Styling)
- Vanilla JavaScript (Core logic)

## Project Structure

```
├── index.html           # Main HTML file
├── main.js             # Core application logic
├── style.css           # Global styles and Tailwind imports
├── tailwind.config.js  # Tailwind configuration
└── package.json        # Project dependencies
```