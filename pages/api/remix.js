// pages/api/wikik.js
import { v4 as uuidv4 } from 'uuid';

/**
 * Format-specific guidelines for different visualization libraries
 */
const getFormatGuidelines = (format) => {
  const guidelines = {
    'p5js': `
For p5.js visualization:
- Create a complete sketch with both setup() and draw() functions
- Use clear and meaningful variable names for better readability
- Add explanatory comments to clarify key functions and logic.
- Implement appropriate user interactions (mouse/keyboard)
- Use color effectively to highlight important elements
- Include animation that demonstrates dynamic principles
- Set the canvas size is appropriate (recommended: 400x400 pixels)
- Add visual indicators that explain what's happening
- Containing a valid p5.js code snippet
- Generated code should not have any errors make it valid code`,

'threejs': `
For three.js visualization:
-containing a valid three.js code snippet
-give the working code without any imports
-for postion use geometry.attributes.position instead of geometry.vertices`,


    'd3js': `
For D3.js visualization:
- Create a complete visualization with appropriate SVG elements to represent data effectively
- Use scales and axes appropriately when displaying data
- Implement interactions that reveal additional information
- Use color effectively to distinguish data categories
- Add transitions to show changes over time or between states
- Include appropriate labels or a legend to improve clarity and usability
- Ensure the visualization is self-explanatory`,

    'mermaidjs': `
For Mermaid.js diagram:
- Choose the most suitable diagram type for the concept (flowchart, sequence, class, state, etc.)
- Use clear and concise node labels to improve readability
- Organize nodes logically to show relationships or processes
- Use directional arrows to show flow,transistions or dependencies
- Include a clear starting point in process-based diagrams
- Keep the diagram focused on key elements (avoid excessive detail)
- Use comments to explain complex relationships if necessary
- Give only code without any \`\`\`mermaid\`\`\`"
     `

  };

  return guidelines[format] || 'Create an educational visualization that clearly demonstrates the concept.';
};
const extractAndParseJSON = (text) => {
  try {
    // First attempt: Try to parse directly if the response is already valid JSON
    try {
      return JSON.parse(text);
    } catch (e) {
      // If direct parsing fails, try to extract JSON from the text
      console.log("Direct JSON parsing failed, trying to extract JSON");
    }
    
    // Second attempt: Find JSON using regex
    const jsonRegex = /\{[\s\S]*\}/; // Match anything between curly braces including newlines
    const match = text.match(jsonRegex);
    
    if (match) {
      // Try to parse the extracted JSON
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        console.log("Extracted JSON is invalid, attempting to fix");
        // If the extracted JSON is still invalid, try to fix common issues
      }
    }
    
    // Third attempt: Fix common JSON issues and try again
    // 1. Replace unescaped quotes within string literals
    let fixedText = text.replace(/:"((?:[^"\\]|\\.)*)"/g, function(match) {
      // Replace any unescaped quotes within the JSON string with escaped quotes
      return match.replace(/(?<!\\)"/g, '\\"');
    });
    
    // 2. Try to extract with the fixed text
    const fixedMatch = fixedText.match(jsonRegex);
    if (fixedMatch) {
      try {
        return JSON.parse(fixedMatch[0]);
      } catch (e) {
        console.log("Fixed JSON is still invalid, using fallback extraction");
      }
    }
    
    // Fallback: Extract key-value pairs manually
    return extractKeyValuePairs(text);
    
  } catch (error) {
    console.error("JSON extraction and parsing failed:", error);
    // Return a structured error response
    return {
      error: "Failed to parse response",
      errorDetails: error.message,
      rawResponse: text.substring(0, 500) + "..." // Include part of the raw response for debugging
    };
  }
};

/**
 * Manual extraction of key-value pairs from response
 * Useful when JSON is malformed but structure is still evident
 */
const extractKeyValuePairs = (text) => {
  const result = {
    code: "",
    summary: "",
    conceptName: "",
    keyPrinciples: [],
    interactivityNotes: "",
    learningObjectives: []
  };
  
  // Extract the code block - this is usually the most problematic part
  const codeBlockMatch = text.match(/["']code["']\s*:\s*["']([\s\S]*?)["'],/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    result.code = codeBlockMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
  } else {
    // Try alternative code block pattern with triple backticks
    const codeBlockAltMatch = text.match(/["']code["']\s*:\s*["']```(?:javascript|js|html)?\s*([\s\S]*?)```["']/);
    if (codeBlockAltMatch && codeBlockAltMatch[1]) {
      result.code = codeBlockAltMatch[1];
    } else {
      // Last resort - look for code between certain markers
      const codeSection = text.match(/["']code["']\s*:\s*["']([\s\S]*?)["']/);
      if (codeSection && codeSection[1]) {
        result.code = codeSection[1];
      }
    }
  }
  
  // Extract other fields using more straightforward patterns
  const summaryMatch = text.match(/["']summary["']\s*:\s*["']([\s\S]*?)["']/);
  if (summaryMatch && summaryMatch[1]) {
    result.summary = summaryMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
  }
  
  const conceptMatch = text.match(/["']conceptName["']\s*:\s*["']([\s\S]*?)["']/);
  if (conceptMatch && conceptMatch[1]) {
    result.conceptName = conceptMatch[1];
  }
  
  // Extract arrays
  const principlesMatch = text.match(/["']keyPrinciples["']\s*:\s*\[([\s\S]*?)\]/);
  if (principlesMatch && principlesMatch[1]) {
    // Split by commas, but be careful about commas inside quotes
    const principles = principlesMatch[1].split(/,(?=\s*["'])/);
    result.keyPrinciples = principles.map(p => 
      p.trim().replace(/^["']|["']$/g, '')
    ).filter(p => p);
  }
  
  const interactivityMatch = text.match(/["']interactivityNotes["']\s*:\s*["']([\s\S]*?)["']/);
  if (interactivityMatch && interactivityMatch[1]) {
    result.interactivityNotes = interactivityMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
  }
  
  const objectivesMatch = text.match(/["']learningObjectives["']\s*:\s*\[([\s\S]*?)\]/);
  if (objectivesMatch && objectivesMatch[1]) {
    const objectives = objectivesMatch[1].split(/,(?=\s*["'])/);
    result.learningObjectives = objectives.map(o => 
      o.trim().replace(/^["']|["']$/g, '')
    ).filter(o => o);
  }
  
  return result;
};
/**
 * New prompt generator for code review and simulation fixes
 */
const createVisualizationPrompt = (promptex,content, format, existingCode) => {
  
return `
${promptex}
TOPIC CONTENT:
${content}

CURRENT CODE:
${existingCode}

REQUIREMENTS:
1. Analyze the code thoroughly and identify all issues preventing the simulation from displaying
2. Fix any syntax errors, missing imports, or incorrect API usage
3. Ensure the code follows best practices for ${format}
4. Add proper error handling and debugging information
5. Make sure the simulation clearly demonstrates the educational concept
6. Include appropriate user interactions if missing
7. Add comments explaining the fixes and improvements

FORMAT-SPECIFIC REQUIREMENTS:
${getFormatGuidelines(format)}

OUTPUT FORMAT:
Return your response as a valid JSON object with the following structure:

{
  "code": "// Fixed and working code here",
  "summary": "Detailed explanation of the issues found and how they were fixed",
  "conceptName": "The main concept being demonstrated",
  "keyPrinciples": ["Key principle 1", "Key principle 2"],
  "interactivityNotes": "How to interact with the simulation",
  "learningObjectives": ["Learning objective 1", "Learning objective 2"],
  "fixes": ["List of specific fixes made to the code"],
  "debugInfo": "Any additional debugging information or tips"
}`;
};

/**
 * Makes a call to Claude API
 */
const callClaudeAPI = async (prompt,apiKeyFormate, modelName = "claude-3-7-sonnet-20250219") => {
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': `${apiKeyFormate}`,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: modelName,
        max_tokens: 4096,
        temperature: 0.2, // Lower temperature for more consistent outputs
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Claude API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    const rawResponse = data.content[0].text;
    
    // Use our enhanced JSON extraction and parsing
    const parsedResponse = extractAndParseJSON(rawResponse);
    
    // If we detected an error in parsing, add the raw response for debugging
    if (parsedResponse.error) {
      console.error("Error parsing Claude response:", parsedResponse.error);
      console.log("Raw response sample:", rawResponse.substring(0, 500) + "...");
      return {
        error: parsedResponse.error,
        errorDetails: parsedResponse.errorDetails,
        rawResponse: rawResponse
      };
    }
    
    return parsedResponse;
  
  } catch (error) {
    console.error("Error calling Claude API:", error);
    return { error: error.message };
  }
};

/**
 * Extracts content from a Wikipedia URL
 */
const extractWikipediaContent = async (url) => {
  try {
    // Extract page title from URL
    const urlParts = url.split('/');
    const title = urlParts[urlParts.length - 1];
    
    // Use Wikipedia API to get content
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=&explaintext=&titles=${title}&format=json&origin=*`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Wikipedia API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract content from response
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    
    return {
      title: pages[pageId].title,
      content: pages[pageId].extract
    };
  } catch (error) {
    console.error("Error extracting Wikipedia content:", error);
    throw error;
  }
};

/**
 * Main API handler for generating content
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { source,input,format,apiKeyFormate=process.env.ANTHROPIC_API_KEY,existingCode,remixVersion } = req.body;
    
    if (!input || !existingCode || !source) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required parameters: input and existingCode and source" 
      });
    }
    
    const requestId = uuidv4(); // For tracking/debugging
    console.log(`Request ${requestId} started for ${format}`);
    let promptText = '';
    if(remixVersion === "1"){
      promptText = `You are an expert on ${format} visualizations. The current simulation didn't display anything. Please review the code and fix any errors for the topic being simulated.`
      }
      else if(remixVersion === "2"){
        promptText = `You are an expert on ${format} visualizations. The ${existingCode}pretty interesting but the layout isn't quite right. Can you please adjust the boxes and labels to make sure they're laid out.`
      } 
      else if(remixVersion === "3"){
        promptText = `You are an expert on ${format} visualizations.Can you put in inline controls to control key variables and to make this ${existingCode} interactive…`
      }
    
    
    let processedInput = input;
    let wikiTitle = '';
    
    if (source === 'wikipedia' || source === 'image') {
      const wikiData = await extractWikipediaContent(input);
      processedInput = wikiData.content;
      wikiTitle = wikiData.title;
    }



    // Create prompt for code review and fixes
    const prompt = createVisualizationPrompt(promptText,processedInput, format, existingCode);
    
    // Generate response from Claude
    const startTime = Date.now();
    const claudeResponse = await callClaudeAPI(prompt,apiKeyFormate);
    const endTime = Date.now();
    
    console.log(`Request ${requestId} completed in ${endTime - startTime}ms`);
    
    // Handle error in Claude response
    if (claudeResponse.error) {
      return res.status(500).json({
        success: false,
        error: `Error from Claude API: ${claudeResponse.error}`,
        details: claudeResponse.rawResponse || null
      });
    }
    
    // Return the enhanced response
    return res.status(200).json({
      success: true,
      summary: claudeResponse.summary,
      codeOutputs: { [format]: claudeResponse.code },
      concept: {
        name: claudeResponse.conceptName,
        principles: claudeResponse.keyPrinciples
      },
      interactivityNotes: claudeResponse.interactivityNotes || null,
      learningObjectives: claudeResponse.learningObjectives || [],
      fixes: claudeResponse.fixes || [],
      debugInfo: claudeResponse.debugInfo || null
    });
    
  } catch (error) {
    console.error('Error generating content:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
