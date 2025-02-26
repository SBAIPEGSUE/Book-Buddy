// Using require syntax for compatibility
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async function(event, context) {
  try {
    // Parse the incoming request
    const body = JSON.parse(event.body);
    const { bookTitle, currentPage, question, finishedBook } = body;
    
    // Construct the prompt for Claude
    let systemPrompt;
    if (finishedBook) {
      systemPrompt = `The user has finished reading "${bookTitle}". They want to discuss the book with you. Feel free to discuss any aspect of the book including the ending.`;
    } else {
      systemPrompt = `The user is reading "${bookTitle}" and is currently on page ${currentPage}. They have a question about the book. Provide helpful information without revealing any plot points, character developments, or events that happen after page ${currentPage}. Do not mention or allude to future events in any way.`;
    }
    
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
        messages: [
          { role: 'user', content: question }
        ]
      })
    });
    
    const data = await response.json();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ answer: data.content[0].text })
    };
  } catch (error) {
    console.log('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process request' })
    };
  }
};
