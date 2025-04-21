import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a prompt for generating multiple-choice questions using just the summary
 */
const createEnhancedMcqPrompt = (summary) => {
  return `You are an expert educational assessment creator specializing in creating high-quality multiple-choice questions for learning platforms. Your task is to create questions based on the following educational content.

CONCEPT: Extract from the ${summary}

KEY PRINCIPLES:
Extract key principles from the ${summary}

LEARNING OBJECTIVES:
Create appropriate learning objectives based on the ${summary}

SUMMARY:
${summary}

ASSESSMENT REQUIREMENTS:
1. Create 5 multiple-choice questions that directly align with the learning objectives
2. Each question should have 4 options (A, B, C, D) with only one correct answer
3. Questions should assess different cognitive levels according to Bloom's Taxonomy:
   - Knowledge/Recall (1 question)
   - Comprehension/Understanding (1-2 questions)
   - Application/Analysis (1-2 questions)
   - Evaluation/Synthesis (1 question if appropriate for the topic)
4. Include a brief explanation for why the correct answer is right
5. Ensure questions test conceptual understanding rather than mere factual recall
6. Make questions appropriate for high school or undergraduate students
7. Include at least one question that tests the ability to interpret the visualization

OUTPUT FORMAT:
Return your response as a valid JSON object with the following structure. Do not include any explanation or text outside this JSON structure:

{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation for why the answer is correct",
      "bloomsLevel": "Knowledge/Comprehension/Application/Analysis/Evaluation/Synthesis",
      "relatedLearningObjective": "The specific learning objective this question addresses"
    }
  ]
}`;
};

/**
 * Calls Claude API
 */
const callClaudeAPI = async (prompt,apiKeyFormate) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKeyFormate,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 4096,
        temperature: 0.3,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Claude API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    // Extract and parse JSON from the AI response
    try {
      const jsonMatch = data.content[0].text.match(/({[\s\S]*})/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return {
        error: "Failed to parse JSON from response",
        rawResponse: data.content[0].text
      };
    } catch (err) {
      return {
        error: "Error parsing JSON",
        rawResponse: data.content[0].text
      };
    }

  } catch (error) {
    console.error("Error calling Claude API:", error);
    return { error: error.message };
  }
};

/**
 * Next.js API Route Handler
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { summary,apiKeyFormate=process.env.ANTHROPIC_API_KEY } = req.body;

  if (!summary) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameter: summary'
    });
  }

  const requestId = uuidv4();
  console.log(`MCQ Request ${requestId} started`);

  try {
    const prompt = createEnhancedMcqPrompt(summary);
    const startTime = Date.now();
    const result = await callClaudeAPI(prompt,apiKeyFormate);
    const endTime = Date.now();

    console.log(`MCQ Request ${requestId} completed in ${endTime - startTime}ms`);

    if (result.error) {
      return res.status(500).json({
        success: false,
        error: result.error,
        details: result.rawResponse || null
      });
    }

    return res.status(200).json({
      success: true,
      mcq: result
    });

  } catch (error) {
    console.error('Error in handler:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
