// record-demo.js
const puppeteer = require("puppeteer");
const { PuppeteerScreenRecorder } = require("puppeteer-screen-recorder");
const path = require("path");

(async () => {
  console.log("Starting recording process...");
  
  try {
    // Launch headful so you can see it record
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log("Creating new page...");
    const page = await browser.newPage();

    // Set viewport to 720p
    console.log("Setting viewport...");
    await page.setViewport({ width: 1280, height: 720 });

    // Navigate to your app
    console.log("Navigating to localhost:3000...");
    await page.goto("http://localhost:3000", { 
      waitUntil: "networkidle0",
      timeout: 60000 
    });

    // Configure and start recorder
    console.log("Configuring recorder...");
    const recorder = new PuppeteerScreenRecorder(page, {
      followNewTab: true,
      fps: 30,
      videoFrame: {
        width: 1280,
        height: 720,
      },
      autopad: {
        color: "black",
      },
    });

    const outputPath = path.resolve(__dirname, "demo.mp4");
    console.log("⏺ Recording to", outputPath);
    await recorder.start(outputPath);

    // Record for 15 seconds (15000 ms)
    console.log("Recording for 15 seconds...");
    await page.waitForTimeout(15000);

    // Stop recording and close
    console.log("Stopping recording...");
    await recorder.stop();
    
    console.log("Closing browser...");
    await browser.close();
    
    console.log("✅ Done! Your demo is saved at demo.mp4");
  } catch (err) {
    console.error("Error during recording:");
    console.error(err);
    process.exit(1);
  }
})();