document.addEventListener('DOMContentLoaded', () => {
    // Load saved book and page from local storage
    const savedBook = localStorage.getItem('bookTitle');
    const savedPage = localStorage.getItem('currentPage');
    const savedFinished = localStorage.getItem('finishedBook') === 'true';
    
    if (savedBook) document.getElementById('bookTitle').value = savedBook;
    if (savedPage) document.getElementById('currentPage').value = savedPage;
    if (savedFinished) document.getElementById('finishedBook').checked = savedFinished;

    // Form submission
    document.getElementById('bookForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
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
            console.log("Sending request to function...");
            // Call our serverless function
            const response = await fetch('/.netlify/functions/askClaude', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bookTitle,
                    currentPage,
                    question,
                    finishedBook
                }),
            });
            
            console.log("Response status:", response.status);
            const data = await response.json();
            console.log("Response data:", data);
            
            // Display the response
            const responseDiv = document.getElementById('response');
            if (data.error) {
                responseDiv.innerHTML = `<strong>Error:</strong> ${data.error}`;
            } else {
                responseDiv.innerHTML = `<strong>Q: ${question}</strong><hr>${data.answer || "No answer provided"}`;
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
