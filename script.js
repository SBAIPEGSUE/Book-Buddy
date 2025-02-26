document.addEventListener('DOMContentLoaded', () => {
    // Load saved book and page from local storage
    const savedBook = localStorage.getItem('bookTitle');
    const savedPage = localStorage.getItem('currentPage');
    const savedFinished = localStorage.getItem('finishedBook') === 'true';
    
    if (savedBook) document.getElementById('bookTitle').value = savedBook;
    if (savedPage) document.getElementById('currentPage').value = savedPage;
    if (savedFinished) document.getElementById('finishedBook').checked = savedFinished;

    // Prompt for API key if not provided
    let apiKey = localStorage.getItem('claude_api_key');
    if (!apiKey) {
        apiKey = prompt("Please enter your Claude API key to use this app:");
        if (apiKey) {
            localStorage.setItem('claude_api_key', apiKey);
        }
    }

    // Form submission
    document.getElementById('bookForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get current API key
        apiKey = localStorage.getItem('claude_api_key');
        if (!apiKey) {
            alert("You need to provide a Claude API key to use this app.");
            apiKey = prompt("Please enter your Claude API key:");
            if (apiKey) {
                localStorage.setItem('claude_api_key', apiKey);
            } else {
                return;
            }
        }
        
        const bookTitle = document.getElementById('bookTitle').value;
        const currentPage = document.getElementById('currentPage').value;
        const question = document.getElementById('question').value;
        const finishedBook = document.getElementById('finishedBook').checked;
        
        // Save to local storage
        localStorage.setItem('bookTitle', bookTitle);
        localStorage.setItem('currentPage', currentPage);
        localStorage.setItem('finishedBook', finishedBook);
        
        // Show loading indicator
        document.getElementById('loading').style.display = 'inline-block';
        document.getElementById('response').style.display = 'none';
        
        try {
            // Build system prompt
            const systemPrompt = finishedBook 
                ? `User has finished reading "${bookTitle}". Discuss any aspect.`
                : `User is reading "${bookTitle}" on page ${currentPage}. No spoilers past this page.`;
            
            // Create a response element
            const responseDiv = document.getElementById('response');
            responseDiv.innerHTML = `<strong>Q: ${question}</strong><hr>
            <p>Thinking about "${bookTitle}" (Page ${currentPage})...</p>
            <p>Because of browser security restrictions (CORS), we can't call Claude directly from a website.</p>
            <p>For a complete app, you would need to:</p>
            <ol>
                <li>Set up a proper Netlify function</li>
                <li>Use a backend service</li>
                <li>Or create an app with a different architecture</li>
            </ol>
            <p>Try this system prompt with Claude directly:</p>
            <pre>${systemPrompt}</pre>
            <p>And then ask your question: "${question}"</p>`;
            responseDiv.style.display = 'block';
        } catch (error) {
            console.error('Error details:', error);
            document.getElementById('response').innerHTML = `Error: ${error.message}. Please check console for details.`;
            document.getElementById('response').style.display = 'block';
        } finally {
            // Hide loading indicator
            document.getElementById('loading').style.display = 'none';
        }
    });
});
