import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || ""
});

export async function commentCode(code: string, language: string): Promise<string> {
  try {
    const prompt = `Please add meaningful comments to the following ${language} code. 
    The comments should explain what the code does, not just repeat what it obviously does. 
    Focus on explaining the purpose, logic, and any complex operations.
    Return only the commented code without any additional explanations.
    
    Code to comment:
    ${code}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a helpful coding assistant that adds meaningful comments to code. Focus on explaining the purpose and logic, not just describing what the code obviously does."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
    });

    return response.choices[0].message.content || code;
  } catch (error) {
    console.error("OpenAI error:", error);
    throw new Error("Failed to comment code using AI");
  }
}
