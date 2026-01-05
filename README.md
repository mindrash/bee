# Spelling Bee Practice App

A web-based spelling practice application with text-to-speech functionality, designed to help users practice and improve their spelling skills.

## Features

- **Text-to-Speech**: Multiple voice options to hear words pronounced clearly
  - US Female Voice
  - US Male Voice (pitch-adjusted for clarity)
  - UK English Voice
  - Extra Clear Voice (slower, deliberate pronunciation)
  - Alternative Voice (Australian/Irish accents)
- **Smart Learning**: Incorrect words are automatically re-presented within the next 1-5 words for reinforcement
- **Word Information**: View definitions, origins, and example sentences for each word
- **Session Tracking**: 
  - Timer to track practice session duration
  - Correct/incorrect counters
  - Complete list of all incorrect words with copy functionality
- **Flexible Word Lists**: Upload your own CSV file or use the included 457-word spelling bee list
- **Audio Controls**: 
  - Play word pronunciation
  - Hear word used in a sentence
  - Show definition as a hint

## Installation

### Option 1: Download ZIP (Easiest)

1. **Download the latest release**
   - Go to [Releases](https://github.com/mindrash/bee/releases/latest)
   - Download the `Source code (zip)` file
   - Extract the ZIP file to a folder on your computer

2. **Open in your browser**
   - Double-click the `index.html` file in the extracted folder
   - Or right-click → Open with → Your web browser

### Option 2: Clone Repository (For Developers)

1. **Clone the repository**
   ```bash
   git clone https://github.com/mindrash/bee.git
   cd bee
   ```

2. **Open in your browser**
   ```bash
   open index.html
   ```
   
   Or simply double-click the `index.html` file in your file manager.

That's it! The app runs entirely in your browser - no server or installation required.

## Usage

### Getting Started

1. **Choose Your Word List**
   - Upload your own CSV file with spelling words, OR
   - Use the default `words.csv` file by clicking "Load Words"

2. **Select a Voice**
   - Choose from 5 different voice options using the dropdown menu
   - The app will automatically play the word when you change voices

3. **Practice**
   - Click "▶ Play Word" to hear the word
   - Click "🔊 Hear in Sentence" to hear it used in context
   - Type your spelling in the input field
   - Press Enter or click "Submit" to check your answer

4. **Get Hints**
   - Click "💡 Show Definition" to see the word's origin and meaning
   - This won't reveal the spelling, just provide context

5. **Review Mistakes**
   - Click "View Incorrect Words" to see all words you've missed
   - Copy the list to paste into an email or document for later review

### CSV File Format

Create a simple CSV file with one word per line or comma-separated:

```
word1
word2
word3
```

Or:

```
word1, word2, word3, word4
```

## Technical Details

- **Built with**: Vanilla HTML, CSS, and JavaScript
- **No dependencies**: Runs entirely in the browser
- **Text-to-Speech**: Uses the Web Speech API (SpeechSynthesis)
- **Browser Compatibility**: Works in modern browsers that support the Speech Synthesis API
  - Chrome (recommended)
  - Safari
  - Edge
  - Firefox (limited voice options)

## File Structure

```
bee/
├── index.html          # Main HTML structure
├── style.css           # Styling and layout
├── script.js           # Core application logic
├── spelling_bee.js     # 457-word database with definitions and origins
├── words.csv           # Default word list
└── README.md          # This file
```

## Features in Detail

### Smart Retry System
When you spell a word incorrectly, it's automatically added to a retry queue and will appear again within the next 1-5 words. This spaced repetition helps reinforce learning.

### Voice Options Explained
- **US Female**: Clear, standard American female voice
- **US Male**: Pitch-adjusted version of high-quality voice for clarity
- **UK English**: British English pronunciation
- **Extra Clear**: Same voice as US Female but 45% slower for maximum clarity
- **Alternative**: Australian or Irish accent options

### Session Timer
Tracks how long you've been practicing to help you monitor study sessions.

## Customization

Want to add your own words with definitions? Edit `spelling_bee.js` following this format:

```javascript
const spellingBeeData = [
    {
        word: "example",
        level: "One Bee",
        origin: "Latin exemplum",
        definition: "A thing characteristic of its kind",
        sentence: "This is an example sentence."
    },
    // Add more words...
];
```

## Browser Requirements

- Modern web browser with JavaScript enabled
- Web Speech API support for text-to-speech
- Clipboard API support for copy functionality (optional)

## Contributing

Feel free to submit issues or pull requests to improve the app!

## License

This project is open source and available for educational purposes.

## Acknowledgments

- Word list and definitions based on common spelling bee competitions
- Uses browser's built-in speech synthesis voices
