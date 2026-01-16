import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const completion = await client.chat.completions.create({
    model: "openai/gpt-oss-20b", // MUST exist in your Groq account
  messages: [
    {
      role: "user",
      content: "Explain the importance of fast language models",
    },
  ],
  temperature: 0.7,
  max_tokens: 300,
});

console.log(completion.choices[0].message.content);
