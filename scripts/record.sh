#!/bin/bash

# Install dependencies
npm install puppeteer@19.0.0 puppeteer-screen-recorder@3.0.6

# Run the recording script
node record-demo.js

# Move the video to the public folder
mkdir -p web/public
mv demo.mp4 web/public/demo.mp4

echo "Recording complete! Video has been moved to web/public/demo.mp4" 