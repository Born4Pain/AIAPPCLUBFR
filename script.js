let pyodideReady = false;
let pyodide;
let isRunning = false;

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded. Initializing application...');
    setupFileInput();
    setupHeroButton();
    
    // Start loading Pyodide
    initializePyodide();
});

// Setup file input handling
function setupFileInput() {
    const fileInput = document.getElementById('fileInput');
    const fileName = document.getElementById('fileName');
    const runButton = document.getElementById('runButton');
    
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        
        if (file) {
            // Validate file extension
            if (!file.name.toLowerCase().endsWith('.py')) {
                fileName.textContent = 'Error: Only Python (.py) files are supported';
                fileName.style.color = '#ff3b30';
                runButton.disabled = true;
                showToast('Please select a valid Python file (.py)', 'error');
                return;
            }
            
            // File is valid
            fileName.textContent = file.name;
            fileName.style.color = '';
            runButton.disabled = false;
            
            // If Pyodide isn't ready yet, show a message
            if (!pyodideReady) {
                showToast('Python environment is still loading...', 'info');
            }
        } else {
            fileName.textContent = '';
            runButton.disabled = true;
        }
    });
}

// Setup hero button functionality
function setupHeroButton() {
    const heroButton = document.querySelector('.hero-button');
    if (heroButton) {
        heroButton.addEventListener('click', function() {
            const appsSection = document.getElementById('apps');
            if (appsSection) {
                appsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    
    const icon = document.createElement('i');
    
    switch (type) {
        case 'success':
            icon.className = 'fas fa-check-circle';
            break;
        case 'error':
            icon.className = 'fas fa-exclamation-circle';
            break;
        case 'info':
        default:
            icon.className = 'fas fa-info-circle';
    }
    
    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(textSpan);
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Animate out after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}

// Initialize Pyodide
async function initializePyodide() {
    const outputDiv = document.getElementById('output');
    
    if (outputDiv) {
        outputDiv.innerHTML = `<div class="loading-indicator">
            <div class="spinner"></div>
            <p>Loading Python environment...</p>
            <p class="loading-subtitle">This may take a few moments</p>
        </div>`;
    }
    
    try {
        console.log('Loading Pyodide...');
        pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
        });
        
        await setupPyodideEnvironment();
        
        pyodideReady = true;
        console.log('Pyodide loaded successfully');
        
        if (outputDiv) {
            outputDiv.innerHTML = `<div class="success-message">
                <i class="fas fa-check-circle"></i>
                Python environment loaded successfully. Ready to run apps!
            </div>`;
        }
        
        showToast('Python environment ready!', 'success');
    } catch (error) {
        console.error('Pyodide load error:', error);
        
        if (outputDiv) {
            outputDiv.innerHTML = `<div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                Error loading Python environment: ${error.message}
                <p>Please refresh the page to try again.</p>
            </div>`;
        }
        
        showToast('Failed to load Python environment', 'error');
    }
}

// Setup Pyodide environment
async function setupPyodideEnvironment() {
    await pyodide.runPythonAsync(`
        import sys
        import js
        
        class OutputRedirect:
            def __init__(self):
                self.buffer = ""
            
            def write(self, text):
                self.buffer += text
                js.document.getElementById("output").innerHTML = self.buffer.replace('\\n', '<br>')
            
            def flush(self):
                pass
        
        sys.stdout = OutputRedirect()
        sys.stderr = OutputRedirect()
        
        print("Python environment initialized.")
    `);
}

// Run a sample app
async function runSample(scriptName) {
    if (isRunning) {
        showToast('An app is already running', 'info');
        return;
    }
    
    if (!pyodideReady) {
        showToast('Python environment is still loading, please wait...', 'info');
        return;
    }
    
    isRunning = true;
    const outputDiv = document.getElementById('output');
    const buttons = document.querySelectorAll(`.app-button[onclick*='${scriptName}']`);
    
    // Add loading state to the button
    buttons.forEach(button => {
        button.classList.add('loading');
    });
    
    outputDiv.innerHTML = `<div class="terminal-output">
        <p>Running ${scriptName}...</p>
        <div class="typing-animation"></div>
    </div>`;
    
    try {
        console.log(`Running sample: ${scriptName}`);
        
        // Demo sample code for different apps
        let scriptText = '';
        
        if (scriptName === 'chatbot.py') {
            scriptText = `
import time
import random

responses = [
    "Hello! How can I assist you today?",
    "I'm an AI assistant. What would you like to know?",
    "That's an interesting question!",
    "I can help with information, answer questions, or just chat.",
    "Let me think about that...",
    "I'm designed to be helpful, harmless, and honest.",
    "I don't have personal opinions, but I can provide information."
]

def get_response(message):
    # Simple demo to simulate response generation
    time.sleep(0.8)  # Simulate thinking time
    return random.choice(responses)

print("<div class='chat-message bot'>Hello! I'm your AI assistant. How can I help you today?</div>")
time.sleep(1)

user_messages = [
    "Hello there!",
    "What can you do?",
    "Tell me a joke"
]

for message in user_messages:
    time.sleep(1)
    print(f"<div class='chat-message user'>{message}</div>")
    time.sleep(1.2)
    
    if message.lower() == "tell me a joke":
        print("<div class='chat-message bot'>Why don't scientists trust atoms? Because they make up everything!</div>")
    else:
        response = get_response(message)
        print(f"<div class='chat-message bot'>{response}</div>")

print("<div class='success-message'>Demo completed! You can try with your own prompts by uploading a Python script.</div>")
            `;
        } else if (scriptName === 'imagegen.py') {
            scriptText = `
import time
import random

def generate_ascii_art():
    art_options = [
"""
   /\\
  /  \\
 /____\\
/      \\
""",
"""
   .--.
  |o_o |
  |:_/ |
 //   \\ \\
(|     | )
/'\\_   _/\`\\
\\___)=(___/
""",
"""
  _____
 /     \\
| () () |
 \\  ^  /
  |||||
""",
"""
  /\\_/\\
 ( o.o )
  > ^ <
"""
    ]
    return random.choice(art_options)

print("<div class='generation-step'>Starting image generation process...</div>")
time.sleep(1)

print("<div class='generation-step'>Analyzing parameters and initializing model...</div>")
time.sleep(1.2)

print("<div class='generation-step'>Generating image (this would connect to an image generation API in a real app)...</div>")
time.sleep(1.5)

print("<div class='success-message'>Image generated successfully!</div>")
time.sleep(0.5)

ascii_art = generate_ascii_art()
print(f"<pre class='ascii-art'>{ascii_art}</pre>")

print("<div class='image-url'>In a real app, an actual image would be generated and displayed here.</div>")
print("<div class='image-url'>Image URL: https://example.com/generated-image-" + str(random.randint(1000, 9999)) + ".jpg</div>")
            `;
        } else if (scriptName === 'summarizer.py') {
            scriptText = `
import time
import random

sample_text = """
Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans. 
AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of achieving its goals.
The term "artificial intelligence" had previously been used to describe machines that mimic and display "human" cognitive skills that are associated with the human mind, such as "learning" and "problem-solving". 
This definition has since been rejected by major AI researchers who now describe AI in terms of rationality and acting rationally, which does not limit how intelligence can be articulated.
AI applications include advanced web search engines (e.g., Google), recommendation systems (used by YouTube, Amazon, and Netflix), understanding human speech (such as Siri and Alexa), self-driving cars (e.g., Waymo), 
generative or creative tools (ChatGPT and AI art), automated decision-making, and competing at the highest level in strategic game systems (such as chess and Go).
"""

def simulate_summarization(text, compression_rate=0.3):
    # This is a very simplified simulation of text summarization
    words = text.split()
    total_words = len(words)
    summary_length = int(total_words * compression_rate)
    
    # In a real summarizer, we would use NLP techniques
    # Here we'll just take sentences from the beginning, middle and end
    beginning = " ".join(words[:summary_length//3])
    middle_start = total_words//2 - summary_length//6
    middle = " ".join(words[middle_start:middle_start + summary_length//3])
    end_start = total_words - summary_length//3
    end = " ".join(words[end_start:])
    
    return f"{beginning}... {middle}... {end}"

print("<div class='generation-step'>Starting text summarization process...</div>")
time.sleep(0.8)

print("<div class='generation-step'>Analyzing text structure and content...</div>")
time.sleep(1)

print("<div class='text-content'><strong>Original text:</strong></div>")
print(f"<div class='text-content original-text'>{sample_text}</div>")
print(f"<div class='text-stats'>Original length: {len(sample_text.split())} words</div>")

print("<div class='generation-step'>Generating summary...</div>")
time.sleep(1.5)

summary = simulate_summarization(sample_text)
print("<div class='text-content'><strong>Summary:</strong></div>")
print(f"<div class='text-content summary-text'>{summary}</div>")
print(f"<div class='text-stats'>Summary length: {len(summary.split())} words</div>")
print(f"<div class='text-stats'>Compression ratio: {len(summary.split()) / len(sample_text.split()):.2f}</div>")

print("<div class='success-message'>Summarization completed successfully!</div>")
            `;
        }
        
        // Execute the script
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulated delay for UX
        const result = await pyodide.runPythonAsync(scriptText);
        
        if (result) {
            outputDiv.innerHTML += `<div class="result-value">${result}</div>`;
        }
    } catch (error) {
        console.error(`Error running sample ${scriptName}:`, error);
        outputDiv.innerHTML = `<div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            Error executing ${scriptName}: ${error.message}
        </div>`;
        
        showToast(`Failed to run ${scriptName}`, 'error');
    } finally {
        isRunning = false;
        
        // Remove loading state
        buttons.forEach(button => {
            button.classList.remove('loading');
        });
    }
}

// Run custom code from file upload
async function runCode() {
    if (isRunning) {
        showToast('An app is already running', 'info');
        return;
    }
    
    if (!pyodideReady) {
        showToast('Python environment is still loading, please wait...', 'info');
        return;
    }
    
    const fileInput = document.getElementById('fileInput');
    const outputDiv = document.getElementById('output');
    const runButton = document.getElementById('runButton');
    
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        showToast('Please select a Python file to run', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    
    // Validate file type again for security
    if (!file.name.toLowerCase().endsWith('.py')) {
        outputDiv.innerHTML = `<div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            Error: Only Python (.py) files are supported
        </div>`;
        showToast('Invalid file type', 'error');
        return;
    }
    
    isRunning = true;
    runButton.classList.add('loading');
    
    outputDiv.innerHTML = `<div class="terminal-output">
        <p>Running ${file.name}...</p>
        <div class="typing-animation"></div>
    </div>`;
    
    try {
        console.log(`Running custom script: ${file.name}`);
        
        // Read the file
        const code = await file.text();
        
        // Add a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Execute the Python code
        const result = await pyodide.runPythonAsync(code);
        
        if (result) {
            outputDiv.innerHTML += `<div class="result-value">${result}</div>`;
        }
        
        outputDiv.innerHTML += `<div class="success-message">
            <i class="fas fa-check-circle"></i>
            Execution completed successfully.
        </div>`;
        
        showToast('Script executed successfully', 'success');
    } catch (error) {
        console.error('Script execution error:', error);
        
        outputDiv.innerHTML = `<div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            Error executing ${file.name}:<br>
            ${error.message}
        </div>`;
        
        showToast('Script execution failed', 'error');
    } finally {
        isRunning = false;
        runButton.classList.remove('loading');
    }
}

// Clear the output console
function clearOutput() {
    const outputDiv = document.getElementById('output');
    if (outputDiv) {
        outputDiv.innerHTML = 'Upload or select an app to see the output...';
    }
}

// Add styles for toast and other dynamic elements
(function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Toast Notifications */
        .toast-message {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 1000;
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            max-width: 90%;
        }
        
        .toast-message.show {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        
        .toast-success {
            background-color: rgba(52, 199, 89, 0.9);
        }
        
        .toast-error {
            background-color: rgba(255, 59, 48, 0.9);
        }
        
        .toast-info {
            background-color: rgba(0, 122, 255, 0.9);
        }
        
        /* Loading Indicators */
        .loading-indicator {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            text-align: center;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(0, 113, 227, 0.2);
            border-radius: 50%;
            border-top-color: #0071e3;
            animation: spin 1s linear infinite;
            margin-bottom: 15px;
        }
        
        .loading-subtitle {
            font-size: 14px;
            color: #6e6e73;
            margin-top: 5px;
        }
        
        /* Terminal-like output */
        .terminal-output {
            background-color: #2a2a2a;
            color: #f8f8f8;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            line-height: 1.6;
        }
        
        .typing-animation {
            display: inline-block;
            width: 10px;
            height: 20px;
            background-color: #f8f8f8;
            margin-left: 5px;
            animation: blink 1s infinite;
        }
        
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
        
        /* Chat UI for chatbot app */
        .chat-message {
            margin: 10px 0;
            padding: 10px 15px;
            border-radius: 18px;
            max-width: 80%;
            animation: fadeIn 0.3s ease-out;
        }
        
        .chat-message.bot {
            background-color: #f0f0f0;
            color: #1d1d1f;
            border-bottom-left-radius: 4px;
            align-self: flex-start;
            margin-right: auto;
        }
        
        .chat-message.user {
            background-color: #0071e3;
            color: white;
            border-bottom-right-radius: 4px;
            align-self: flex-end;
            margin-left: auto;
            text-align: right;
        }
        
        /* Image Generator UI */
        .generation-step {
            margin: 10px 0;
            padding: 5px 0;
            color: #6e6e73;
            animation: fadeIn 0.5s ease-out;
        }
        
        .ascii-art {
            background-color: #f0f0f0;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            white-space: pre;
            font-family: monospace;
            text-align: center;
            animation: scaleIn 0.5s ease-out;
        }
        
        .image-url {
            font-size: 14px;
            color: #6e6e73;
            margin: 5px 0;
        }
        
        /* Summarizer UI */
        .text-content {
            margin: 10px 0;
            line-height: 1.6;
        }
        
        .original-text, .summary-text {
            background-color: #f0f0f0;
            padding: 15px;
            border-radius: 8px;
            font-size: 14px;
            margin: 10px 0;
        }
        
        .summary-text {
            background-color: #e8f4fc;
            border-left: 4px solid #0071e3;
        }
        
        .text-stats {
            font-size: 14px;
            color: #6e6e73;
            margin: 5px 0;
        }
        
        /* Success and Error Messages */
        .success-message, .error-message {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 15px;
            border-radius: 8px;
            margin: 15px 0;
            animation: fadeIn 0.5s ease-out;
        }
        
        .success-message {
            background-color: rgba(52, 199, 89, 0.1);
            color: #34c759;
            border-left: 4px solid #34c759;
        }
        
        .error-message {
            background-color: rgba(255, 59, 48, 0.1);
            color: #ff3b30;
            border-left: 4px solid #ff3b30;
        }
        
        /* Animations */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    
    document.head.appendChild(style);
})(); 