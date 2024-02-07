require('dotenv').config(); // Make sure to require dotenv if you're using environment variables
const { OpenAIApi } = require('openai');

const openai = new OpenAIApi({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is stored in the .env file
});

// Example usage
async function getOpenAIResponse(prompt) {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003", // Update model to the latest available if needed
      prompt: prompt,
      max_tokens: 100,
    });
    console.log(response.data.choices[0].text.trim());
  } catch (error) {
    console.error("Error calling OpenAI:", error);
  }
}
