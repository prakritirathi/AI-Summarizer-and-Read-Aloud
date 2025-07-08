# 🔊 Chrome Extension: AI Voice Assistant for the Visually Impaired

## 🧠 Overview

This Chrome Extension is designed to help *visually impaired, blind, and dyslexic users* access and understand web content independently. It summarizes webpage content using *Gemini API* and reads it aloud via the *Web Speech API*. Users can also choose summary formats and copy the content with keyboard shortcuts.

## 🛠️ Built With

- *JavaScript*
- *Gemini API* – For summarization
- *Web Speech API* – For reading aloud
- *Chrome Extension APIs*

## Features

- 📖 *Summarize Web Content*  
  Choose from:
  - Brief Summary
  - Bullet Points
  - Detailed Summary

- *Text-to-Speech Reading*  
  Webpage content is read aloud using the browser’s native speech engine.

- *Keyboard Shortcuts* 
  - Space – Start/Stop voice input
  - 1 – Get Brief Summary
  - 2 – Get Detailed Summary
  - 3 – Get Bullet Point Summary
  - Tab – Copy Summary to Clipboard

- 🔗 *Cross-Platform Integration*  
  Shared login with our web app. Copied summaries are saved to the user’s online profile automatically.

##  Login System

The extension includes a secure login screen. Users log in with the same credentials used on our website, ensuring *sync between saved summaries* and their personal document hub.

## Project Structure
chrome-extension/
├── manifest.json
├── popup.html
├── popup.js
├── background.js
├── content.js
├── styles.css
└── icons/
##  How to Use

1. Clone or download this repository.
2. Go to chrome://extensions in your Chrome browser.
3. Enable *Developer Mode*.
4. Click on *Load unpacked* and select the chrome-extension/ folder.
5. Click the extension icon to open it.
6. Use voice or keyboard commands to interact.

## Future Scope

- Integrate voice assistant with more controls.
- Add YouTube and Google Docs summarization support.
- Allow offline access and more language options.

## Designed For

- Blind and visually impaired individuals  
- Dyslexic users  
- Students, professionals, or seniors who benefit from voice-first navigation
