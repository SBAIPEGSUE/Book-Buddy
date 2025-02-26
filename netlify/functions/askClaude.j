// CommonJS version for compatibility
const fetch = require('node-fetch');

exports.handler = async function(event) {
  try {
    // Parse request
    const body = JSON.parse(event.body);
    const { bookTitle, currentPage, question, finishedBook } = body;
    
    // Build system prompt
    const systemPrompt = finishedBook 
      ? `User has finished reading "${bookTitle}". Discuss any aspect.`
      : `User is reading "${bookTitle}" on page ${currentPage}. No spoilers past this page.`;
    
    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: question }]
      })
    });
    
    // Get Claude's response
    const data = await response.json();
    
    // Return formatted response
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        answer: data.content && data.content[0] ? data.content[0].text : "No answer received" 
      })
    };
  } catch (error) {
    // Better error handling
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `${error.name}: ${error.message}` })
    };
  }
};
