// State management
let words = [];
let currentWordIndex = 0;
let correctCount = 0;
let incorrectCount = 0;
let usedIndices = new Set();
let sessionStartTime = null;
let timerInterval = null;
let incorrectWords = [];
let retryQueue = []; // Words to retry within next 5 words
let wordsUntilRetry = 0; // Counter for when to insert retry word

// DOM elements
const csvFile = document.getElementById('csvFile');
const loadBtn = document.getElementById('loadBtn');
const uploadSection = document.getElementById('uploadSection');
const practiceSection = document.getElementById('practiceSection');
const playBtn = document.getElementById('playBtn');
const playSentenceBtn = document.getElementById('playSentenceBtn');
const userInput = document.getElementById('userInput');
const submitBtn = document.getElementById('submitBtn');
const nextBtn = document.getElementById('nextBtn');
const skipBtn = document.getElementById('skipBtn');
const resetBtn = document.getElementById('resetBtn');
const feedback = document.getElementById('feedback');
const currentWordSpan = document.getElementById('currentWord');
const totalWordsSpan = document.getElementById('totalWords');
const correctSpan = document.getElementById('correct');
const incorrectSpan = document.getElementById('incorrect');
const voiceOption = document.getElementById('voiceOption');
const sessionTimer = document.getElementById('sessionTimer');
const showDefBtn = document.getElementById('showDefBtn');
const hintBox = document.getElementById('hintBox');
const viewIncorrectBtn = document.getElementById('viewIncorrectBtn');
const incorrectModal = document.getElementById('incorrectModal');
const closeModal = document.getElementById('closeModal');
const incorrectList = document.getElementById('incorrectList');
const copyIncorrectBtn = document.getElementById('copyIncorrectBtn');

// Event listeners
loadBtn.addEventListener('click', loadCSV);
playBtn.addEventListener('click', speakWord);
playSentenceBtn.addEventListener('click', speakSentence);
submitBtn.addEventListener('click', checkSpelling);
nextBtn.addEventListener('click', nextWord);
skipBtn.addEventListener('click', skipWord);
resetBtn.addEventListener('click', resetApp);
showDefBtn.addEventListener('click', showDefinition);
viewIncorrectBtn.addEventListener('click', showIncorrectWords);
closeModal.addEventListener('click', hideIncorrectWords);
copyIncorrectBtn.addEventListener('click', copyIncorrectWords);

// Allow Enter key to submit
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkSpelling();
    }
});

// Auto-play word when voice is changed
voiceOption.addEventListener('change', () => {
    // Only play if we have words loaded
    if (words.length > 0) {
        speakWord();
    }
});

// Load CSV file
function loadCSV() {
    const file = csvFile.files[0];
    if (!file) {
        alert('Please select a CSV file first!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        parseCSV(content);
    };
    reader.readAsText(file);
}

// Parse CSV content
function parseCSV(content) {
    // Split by newlines and commas, filter empty strings
    const allWords = content
        .split(/[\n,]/)
        .map(word => word.trim())
        .filter(word => word.length > 0);

    if (allWords.length === 0) {
        alert('No words found in the CSV file!');
        return;
    }

    words = allWords;
    totalWordsSpan.textContent = words.length;
    
    // Hide upload section and show practice section
    uploadSection.classList.add('hidden');
    practiceSection.classList.remove('hidden');
    
    // Start the session timer
    startTimer();
    
    // Start with first random word
    selectRandomWord();
    speakWord();
}

// Select a random word that hasn't been used
function selectRandomWord() {
    // Check if we should use a word from retry queue
    if (retryQueue.length > 0 && wordsUntilRetry <= 0) {
        // Pick a random word from retry queue
        const retryIndex = Math.floor(Math.random() * retryQueue.length);
        const wordToRetry = retryQueue[retryIndex];
        
        // Find the index of this word in the words array
        currentWordIndex = words.findIndex(w => w.toLowerCase() === wordToRetry.toLowerCase());
        
        // Remove from retry queue
        retryQueue.splice(retryIndex, 1);
        
        // Reset counter for next retry (1-5 words from now)
        wordsUntilRetry = Math.floor(Math.random() * 5) + 1;
        
        return;
    }
    
    // Decrement retry counter
    if (wordsUntilRetry > 0) {
        wordsUntilRetry--;
    }
    
    // If all words have been used, reset
    if (usedIndices.size >= words.length) {
        usedIndices.clear();
        alert('You\'ve practiced all words! Starting over...');
    }

    // Find an unused word
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * words.length);
    } while (usedIndices.has(randomIndex));

    currentWordIndex = randomIndex;
    usedIndices.add(randomIndex);
    currentWordSpan.textContent = usedIndices.size;
}

// Text-to-speech
function speakWord() {
    const word = words[currentWordIndex];
    const utterance = new SpeechSynthesisUtterance(word);
    
    // Get available voices and select based on user preference
    const voices = speechSynthesis.getVoices();
    const selectedVoice = voiceOption.value;
    
    let preferredVoice;
    
    if (selectedVoice === 'male') {
        // Use Samantha with higher pitch for clearer male-like voice
        preferredVoice = voices.find(voice => 
            voice.lang.startsWith('en-US') && 
            voice.name.includes('Samantha')
        ) || voices.find(voice => 
            voice.lang.startsWith('en-US') && 
            (voice.name.includes('Tom') ||
             voice.name.includes('Ralph'))
        ) || voices.find(voice => 
            voice.lang.startsWith('en-US') && 
            !voice.name.includes('Female') &&
            !voice.name.includes('Daniel') &&
            !voice.name.includes('Fred') &&
            !voice.name.includes('Google') &&
            !voice.name.includes('Alex') &&
            (voice.name.includes('Premium') ||
             voice.name.includes('Enhanced'))
        );
    } else if (selectedVoice === 'female') {
        // Prefer high-quality female English voices
        preferredVoice = voices.find(voice => 
            voice.lang.startsWith('en-US') && 
            (voice.name.includes('Samantha') ||
             voice.name.includes('Enhanced') || 
             voice.name.includes('Premium') || 
             voice.name.includes('Female'))
        ) || voices.find(voice => 
            voice.lang.startsWith('en') && 
            (voice.name.includes('Female') ||
             voice.name.includes('Google'))
        );
    } else if (selectedVoice === 'uk') {
        // UK English voices
        preferredVoice = voices.find(voice => 
            (voice.lang.startsWith('en-GB') || voice.name.includes('UK') || voice.name.includes('British')) &&
            (voice.name.includes('Daniel') ||
             voice.name.includes('Kate') ||
             voice.name.includes('Oliver') ||
             voice.name.includes('Serena'))
        ) || voices.find(voice => 
            voice.lang.startsWith('en-GB') || voice.name.includes('UK')
        );
    } else if (selectedVoice === 'clear') {
        // Extra clear - prefer premium voices, exclude Alex
        preferredVoice = voices.find(voice => 
            voice.lang.startsWith('en-US') &&
            voice.name.includes('Samantha')
        ) || voices.find(voice => 
            voice.lang.startsWith('en') &&
            !voice.name.includes('Alex') &&
            (voice.name.includes('Premium') ||
             voice.name.includes('Enhanced'))
        ) || voices.find(voice => 
            voice.lang.startsWith('en-US') &&
            !voice.name.includes('Alex')
        );
    } else if (selectedVoice === 'alternative') {
        // Alternative voices - different from primary choices
        preferredVoice = voices.find(voice => 
            voice.lang.startsWith('en') &&
            (voice.name.includes('Victoria') ||
             voice.name.includes('Karen') ||
             voice.name.includes('Veena') ||
             voice.name.includes('Fiona') ||
             voice.name.includes('Moira'))
        ) || voices.find(voice => 
            voice.lang.startsWith('en-AU') || voice.lang.startsWith('en-IE')
        );
    }
    
    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }
    
    // Adjust rate and pitch based on voice selection
    if (selectedVoice === 'clear') {
        utterance.rate = 0.45;
        utterance.pitch = 1;
    } else if (selectedVoice === 'male') {
        utterance.rate = 0.7;
        utterance.pitch = 1.5;
    } else {
        utterance.rate = 0.7;
        utterance.pitch = 1;
    }
    utterance.volume = 1;
    utterance.lang = 'en-US';
    
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

// Text-to-speech for sentence
function speakSentence() {
    const currentWord = words[currentWordIndex];
    
    // Get sentence from spellingBeeData
    const wordData = spellingBeeData.find(item => item.word.toLowerCase() === currentWord.toLowerCase());
    const sentence = wordData?.sentence || `${currentWord}.`;
    
    const utterance = new SpeechSynthesisUtterance(sentence);
    
    // Get available voices and select based on user preference
    const voices = speechSynthesis.getVoices();
    const selectedVoice = voiceOption.value;
    
    let preferredVoice;
    
    if (selectedVoice === 'male') {
        // Use Samantha with higher pitch for clearer male-like voice
        preferredVoice = voices.find(voice => 
            voice.lang.startsWith('en-US') && 
            voice.name.includes('Samantha')
        ) || voices.find(voice => 
            voice.lang.startsWith('en-US') && 
            (voice.name.includes('Tom') ||
             voice.name.includes('Ralph'))
        ) || voices.find(voice => 
            voice.lang.startsWith('en-US') && 
            !voice.name.includes('Female') &&
            !voice.name.includes('Daniel') &&
            !voice.name.includes('Fred') &&
            !voice.name.includes('Google') &&
            !voice.name.includes('Alex') &&
            (voice.name.includes('Premium') ||
             voice.name.includes('Enhanced'))
        );
    } else if (selectedVoice === 'female') {
        preferredVoice = voices.find(voice => 
            voice.lang.startsWith('en-US') && 
            (voice.name.includes('Samantha') ||
             voice.name.includes('Enhanced') || 
             voice.name.includes('Premium') || 
             voice.name.includes('Female'))
        ) || voices.find(voice => 
            voice.lang.startsWith('en') && 
            (voice.name.includes('Female') ||
             voice.name.includes('Google'))
        );
    } else if (selectedVoice === 'uk') {
        preferredVoice = voices.find(voice => 
            (voice.lang.startsWith('en-GB') || voice.name.includes('UK') || voice.name.includes('British')) &&
            (voice.name.includes('Daniel') ||
             voice.name.includes('Kate') ||
             voice.name.includes('Oliver') ||
             voice.name.includes('Serena'))
        ) || voices.find(voice => 
            voice.lang.startsWith('en-GB') || voice.name.includes('UK')
        );
    } else if (selectedVoice === 'clear') {
        // Extra clear - prefer premium voices, exclude Alex
        preferredVoice = voices.find(voice => 
            voice.lang.startsWith('en-US') &&
            voice.name.includes('Samantha')
        ) || voices.find(voice => 
            voice.lang.startsWith('en') &&
            !voice.name.includes('Alex') &&
            (voice.name.includes('Premium') ||
             voice.name.includes('Enhanced'))
        ) || voices.find(voice => 
            voice.lang.startsWith('en-US') &&
            !voice.name.includes('Alex')
        );
    } else if (selectedVoice === 'alternative') {
        preferredVoice = voices.find(voice => 
            voice.lang.startsWith('en') &&
            (voice.name.includes('Victoria') ||
             voice.name.includes('Karen') ||
             voice.name.includes('Veena') ||
             voice.name.includes('Fiona') ||
             voice.name.includes('Moira'))
        ) || voices.find(voice => 
            voice.lang.startsWith('en-AU') || voice.lang.startsWith('en-IE')
        );
    }
    
    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }
    
    // Adjust rate and pitch based on voice selection
    if (selectedVoice === 'clear') {
        utterance.rate = 0.45;
        utterance.pitch = 1;
    } else if (selectedVoice === 'male') {
        utterance.rate = 0.7;
        utterance.pitch = 1.5;
    } else {
        utterance.rate = 0.7;
        utterance.pitch = 1;
    }
    utterance.volume = 1;
    utterance.lang = 'en-US';
    
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

// Check spelling
function checkSpelling() {
    const userAnswer = userInput.value.trim().toLowerCase();
    const correctWord = words[currentWordIndex].toLowerCase();

    if (userAnswer === '') {
        return;
    }

    feedback.classList.remove('hidden');
    
    const currentWord = words[currentWordIndex];
    
    // Get definition and origin from spellingBeeData
    const wordData = spellingBeeData.find(item => item.word.toLowerCase() === currentWord.toLowerCase());
    const definition = wordData?.definition || '';
    const origin = wordData?.origin || '';
    
    let extraInfo = '';
    if (origin) {
        extraInfo += `\n\nOrigin: ${origin}`;
    }
    if (definition) {
        extraInfo += `\n\nDefinition: ${definition}`;
    }
    
    if (userAnswer === correctWord) {
        feedback.innerHTML = `✓ Correct! The word is "${currentWord}"${extraInfo}`;
        feedback.className = 'feedback correct';
        correctCount++;
        correctSpan.textContent = correctCount;
    } else {
        feedback.innerHTML = `✗ Incorrect. The correct spelling is "${currentWord}"${extraInfo}`;
        feedback.className = 'feedback incorrect';
        incorrectCount++;
        incorrectSpan.textContent = incorrectCount;
        
        // Track incorrect word
        incorrectWords.push({
            word: currentWord,
            userAnswer: userInput.value.trim(),
            definition: definition,
            origin: origin
        });
        
        // Add to retry queue to practice again within next 5 words
        if (!retryQueue.includes(currentWord)) {
            retryQueue.push(currentWord);
            // Set counter if not already set
            if (wordsUntilRetry === 0) {
                wordsUntilRetry = Math.floor(Math.random() * 5) + 1;
            }
        }
    }

    // Show next button, hide submit
    submitBtn.classList.add('hidden');
    nextBtn.classList.remove('hidden');
    userInput.disabled = true;
}

// Move to next word
function nextWord() {
    selectRandomWord();
    resetInput();
    speakWord();
}

// Skip current word
function skipWord() {
    selectRandomWord();
    resetInput();
    speakWord();
}

// Reset input and UI
function resetInput() {
    userInput.value = '';
    userInput.disabled = false;
    feedback.classList.add('hidden');
    hintBox.classList.add('hidden');
    submitBtn.classList.remove('hidden');
    nextBtn.classList.add('hidden');
    userInput.focus();
}

// Show definition and origin as a hint
function showDefinition() {
    const currentWord = words[currentWordIndex];
    
    // Get definition and origin from spellingBeeData
    const wordData = spellingBeeData.find(item => item.word.toLowerCase() === currentWord.toLowerCase());
    const definition = wordData?.definition || '';
    const origin = wordData?.origin || '';
    
    let hintText = '';
    if (origin) {
        hintText += `Origin: ${origin}`;
    }
    if (definition) {
        if (hintText) hintText += '\n\n';
        hintText += `Definition: ${definition}`;
    }
    
    if (!hintText) {
        hintText = 'No definition or origin available for this word.';
    }
    
    hintBox.textContent = hintText;
    hintBox.classList.remove('hidden');
}

// Show incorrect words modal
function showIncorrectWords() {
    if (incorrectWords.length === 0) {
        alert('No incorrect words yet!');
        return;
    }
    
    let html = '<div class="incorrect-items">';
    incorrectWords.forEach((item, index) => {
        html += `
            <div class="incorrect-item">
                <div class="incorrect-header">
                    <span class="incorrect-number">${index + 1}.</span>
                    <span class="incorrect-word">${item.word}</span>
                    <span class="incorrect-attempt">(You wrote: ${item.userAnswer})</span>
                </div>`;
        
        if (item.origin) {
            html += `<div class="incorrect-detail">Origin: ${item.origin}</div>`;
        }
        if (item.definition) {
            html += `<div class="incorrect-detail">Definition: ${item.definition}</div>`;
        }
        
        html += '</div>';
    });
    html += '</div>';
    
    incorrectList.innerHTML = html;
    incorrectModal.classList.remove('hidden');
}

// Hide incorrect words modal
function hideIncorrectWords() {
    incorrectModal.classList.add('hidden');
}

// Copy incorrect words to clipboard
function copyIncorrectWords() {
    let text = `Incorrect Words (${incorrectWords.length}):\n\n`;
    
    incorrectWords.forEach((item, index) => {
        text += `${index + 1}. ${item.word}\n`;
        text += `   You wrote: ${item.userAnswer}\n`;
        
        if (item.origin) {
            text += `   Origin: ${item.origin}\n`;
        }
        if (item.definition) {
            text += `   Definition: ${item.definition}\n`;
        }
        
        text += '\n';
    });
    
    navigator.clipboard.writeText(text)
        .then(() => {
            // Change button text temporarily to show success
            const originalText = copyIncorrectBtn.innerHTML;
            copyIncorrectBtn.innerHTML = '✔ Copied!';
            copyIncorrectBtn.style.background = '#10b981';
            
            setTimeout(() => {
                copyIncorrectBtn.innerHTML = originalText;
                copyIncorrectBtn.style.background = '';
            }, 2000);
        })
        .catch(err => {
            alert('Failed to copy to clipboard');
            console.error('Copy failed:', err);
        });
}

// Reset entire app
function resetApp() {
    words = [];
    currentWordIndex = 0;
    correctCount = 0;
    incorrectCount = 0;
    usedIndices.clear();
    incorrectWords = [];
    retryQueue = [];
    wordsUntilRetry = 0;
    
    correctSpan.textContent = '0';
    incorrectSpan.textContent = '0';
    currentWordSpan.textContent = '1';
    totalWordsSpan.textContent = '0';
    
    // Stop and reset timer
    stopTimer();
    sessionTimer.textContent = '00:00';
    
    csvFile.value = '';
    
    practiceSection.classList.add('hidden');
    uploadSection.classList.remove('hidden');
    
    resetInput();
}

// Timer functions
function startTimer() {
    sessionStartTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    updateTimer(); // Update immediately
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    sessionTimer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
