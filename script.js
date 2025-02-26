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
            
            // Call Claude API directly
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-sonnet-20240229',
                    max_tokens: 1000,
                    system: systemPrompt,
                    messages: [{ role: 'user', content: question }]
                })
            });
            
            const data = await response.json();
            
            // Display the response
            const responseDiv = document.getElementById('response');
            if (data.error) {
                responseDiv.innerHTML = `<strong>Error:</strong> ${data.error.message || data.error}`;
            } else {
                responseDiv.innerHTML = `<strong>Q: ${question}</strong><hr>${data.content[0].text}`;
            }
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
