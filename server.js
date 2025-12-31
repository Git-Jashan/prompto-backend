const express = require('express');
const cors = require('cors');
const axios = require('axios');
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); 

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();

const conversations = new Map();

const PROMPTS = {
  round1: `You are an elite prompt engineering consultant with deep expertise in AI systems and user needs.

USER'S REQUEST:
"{user_context}"

YOUR TASK: Ask 3 ESSENTIAL questions that will enable you to craft an exceptional, production-ready AI prompt.

ANALYSIS FRAMEWORK - Consider:
- Which AI platform will execute this prompt? (ChatGPT, Claude, Gemini, Midjourney, etc.)
- Who is the end user or audience for this output?
- What is the desired transformation or outcome?
- What constraints or requirements are non-negotiable?

YOUR 3 QUESTIONS MUST:
1. Question 1: Identify the AI platform/tool AND the target audience or use case
2. Question 2: Clarify the specific deliverable, format, or output type needed
3. Question 3: Understand the primary goal, success criteria, or key constraints

QUALITY STANDARDS:
- Make each question specific and actionable (avoid vague or generic questions)
- Keep questions under  50 words each
- Avoid yes/no questions or too lengthy questions
- question which can be answered in a 1-2 sentences max to max 3.
- Think like a consultant billing $500/hour - what would THEY need to know?

Try your best and make each question count!

Ask now. Best 3 questions for getting the right information for making the prompt`,

  round2: `You are an elite prompt engineering consultant. You have foundational context and now need critical details.

CONTEXT GATHERED:
User's Request: "{initial_context}"

Your Round 1 Questions:
{round1_questions}

User's Round 1 Answers:
{round1_answers}

YOUR TASK: Ask 2 STRATEGIC follow-up questions that will significantly elevate the final prompt quality.

ANALYSIS - Based on their answers, identify gaps in:
- Format and structure specifics (length, sections, organization)
- Tone, style, and voice requirements (formal, casual, technical, etc.)
- Edge cases, constraints, or things to avoid
- Examples, references, or specific terminology to use

YOUR 2 QUESTIONS MUST:
1. Build directly on their Round 1 answers (reference specific details they provided)
2. Go deeper into HOW (execution details) and STYLE (tone/voice preferences)
3. Be precise and targeted - no generic questions

IMPORTANT: After your 2 questions, add this EXACT line:
"Or type 'generate' if you're ready for your final prompt now."

FORMAT:
[Brief acknowledgment of their answers - one sentence]

1. [Follow-up question on format/structure or constraints - references their previous answer]
2. [Follow-up question on tone/style or examples - digs deeper into specifics]

Or type 'generate' if you're ready for your final prompt now.`,

  round3: `You are an elite prompt engineering consultant in the FINAL discovery stage.

CONTEXT:
User's Request: "{initial_context}"

CONVERSATION HISTORY:
{history_log}

YOUR TASK: Ask 2 FINAL precision questions to perfect the prompt. Focus on edge cases, constraints, and output specifics.

ANALYSIS - Identify what's still unclear:
- What should the AI explicitly NOT do? (Negative constraints)
- Are there specific examples, templates, or references to include?
- Is the output format crystal clear? (Sections, length, structure)
- Are there edge cases or special scenarios to handle?

YOUR 2 QUESTIONS MUST:
1. Address potential failure modes or constraints ("What should the AI avoid?")
2. Clarify precise output formatting or special requirements

IMPORTANT: After your 2 questions, add this EXACT line:
"Or type 'generate' if you're ready for your final prompt now."

FORMAT:
[Brief acknowledgment]

1. [Question about constraints, negatives, or what to avoid]
2. [Question about specific formatting, examples, or output details]

Or type 'generate' if you're ready for your final prompt now.`,

  generate: `You are an elite prompt engineering consultant delivering the final, production-ready prompt.

COMPLETE DISCOVERY:
User's Request: "{initial_context}"

FULL CONVERSATION:
{history_log}

YOUR TASK: Create a comprehensive, professional AI prompt that incorporates EVERY detail gathered. This prompt must be ready for immediate use with any AI system.

STRUCTURE YOUR PROMPT WITH THESE SECTIONS:

1. ROLE & CONTEXT
   • Define the AI's role or persona
   • Provide relevant background context
   • Explain why this task matters

2. TASK & OBJECTIVE
   • State the specific task clearly
   • Define the expected deliverable
   • Include success criteria

3. REQUIREMENTS
   • List all format specifications (length, structure, sections)
   • Specify tone, style, and voice requirements
   • Include any constraints or limitations mentioned
   • Note what the AI should NOT do (if mentioned)

4. EXAMPLES & REFERENCES (if provided)
   • Include any examples, templates, or references they mentioned
   • Provide specific terminology or phrasing to use

5. OUTPUT FORMAT
   • Define exact output structure
   • Specify any headers, sections, or organization
   • Clarify length or word count expectations

QUALITY STANDARDS:
✓ Professional and polished - ready for production use
✓ Comprehensive - addresses every detail they provided
✓ Well-structured - clear sections with headers
✓ Specific - includes concrete details, not vague instructions
✓ Actionable - any AI can execute this immediately

FORMATTING:
- Use clear section headers (e.g., "## ROLE:", "## TASK:", "## REQUIREMENTS:")
- Use bullet points (•) for lists of requirements
- Use **bold** for critical emphasis
- Use "quotes" for specific phrasing they requested
- Make it scannable and organized

CRITICAL TEST: After writing, verify:
□ Any AI could execute this without additional clarification
□ It reflects their exact needs and preferences
□ It produces consistent, high-quality results
□ The user doesn't need to edit or add anything

Generate the complete, professional prompt now. This is the deliverable they're paying for.`
};

const checkAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const idToken = header.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

async function checkDailyLimit(userId) {
  const today = new Date().toISOString().split('T')[0];
  
  const docRef = db.collection('usage_limits').doc(userId);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    await docRef.set({
      date: today,
      count: 0
    });
    return { allowed: true, remaining: 5 };
  }
  
  const data = doc.data();
  if (data.date !== today) {
    await docRef.set({
      date: today,
      count: 0
    });
    return { allowed: true, remaining: 5 };
  }
  if (data.count >= 5) {
    return { allowed: false, remaining: 0 };
  }
  
  return { allowed: true, remaining: 5 - data.count };
}
async function incrementUsage(userId) {
  const today = new Date().toISOString().split('T')[0];
  const docRef = db.collection('usage_limits').doc(userId);
  
  const doc = await docRef.get();
  const currentCount = doc.exists ? doc.data().count : 0;
  
  await docRef.set({
    date: today,
    count: currentCount + 1
  });
}

function buildHistoryLog(conversation) {
  let history = "";
  
  if (conversation.r1Questions) {
    history += `\nROUND 1 Q&A:\nQ: ${conversation.r1Questions}\nA: ${conversation.r1Answers}\n`;
  }
  
  if (conversation.r2Questions) {
    history += `\nROUND 2 Q&A:\nQ: ${conversation.r2Questions}\nA: ${conversation.r2Answers}\n`;
  }
  
  if (conversation.r3Questions) {
    history += `\nROUND 3 Q&A:\nQ: ${conversation.r3Questions}\nA: ${conversation.r3Answers}\n`;
  }
  
  return history;
}

app.post('/api/prompt-chat', checkAuth, async (req, res) => {
  const { message } = req.body;
  const userId = req.user.uid;
  if (!message || message.length > 7000) {
    return res.status(400).json({ error: "Message is required or too long" });
  }
  
  if (!conversations.has(userId)) {
    conversations.set(userId, {
      round: 1,
      initial: "",
      r1Questions: "",
      r1Answers: "",
      r2Questions: "",
      r2Answers: "",
      r3Questions: "",
      r3Answers: ""
    });
  }
  
  const conversation = conversations.get(userId);
  
  const wantsToGenerate = message.toLowerCase().includes('generate') || 
                          message.toLowerCase().includes('make it');
  
  let promptToSend = "";
  let isFinalGeneration = false;
 
  switch (conversation.round) {
    case 1:
      conversation.initial = message;
      promptToSend = PROMPTS.round1.replace("{user_context}", conversation.initial);
      break;
      
    case 2:
      conversation.r1Answers = message;
      
      if (wantsToGenerate) {
        const limitCheck = await checkDailyLimit(userId);
        
        if (!limitCheck.allowed) {
          return res.status(429).json({ 
            error: "Daily limit reached. You can generate 5 prompts per day. Try again tomorrow!",
            limitReached: true
          });
        }
        
        isFinalGeneration = true;
        promptToSend = PROMPTS.generate
          .replace("{initial_context}", conversation.initial)
          .replace("{history_log}", buildHistoryLog(conversation));
      } else {
        promptToSend = PROMPTS.round2
          .replace("{initial_context}", conversation.initial)
          .replace("{round1_questions}", conversation.r1Questions)
          .replace("{round1_answers}", conversation.r1Answers);
      }
      break;
      
    case 3:
      conversation.r2Answers = message;
      
      if (wantsToGenerate) {
        const limitCheck = await checkDailyLimit(userId);
        
        if (!limitCheck.allowed) {
          return res.status(429).json({ 
            error: "Daily limit reached. You can generate 5 prompts per day. Try again tomorrow!",
            limitReached: true
          });
        }
        
        isFinalGeneration = true;
        promptToSend = PROMPTS.generate
          .replace("{initial_context}", conversation.initial)
          .replace("{history_log}", buildHistoryLog(conversation));
      } else {
        promptToSend = PROMPTS.round3
          .replace("{initial_context}", conversation.initial)
          .replace("{history_log}", buildHistoryLog(conversation));
      }
      break;
      
    case 4:
      conversation.r3Answers = message;
      
      const limitCheck = await checkDailyLimit(userId);
      
      if (!limitCheck.allowed) {
        return res.status(429).json({ 
          error: "Daily limit reached. You can generate 5 prompts per day. Try again tomorrow!",
          limitReached: true
        });
      }
      
      isFinalGeneration = true;
      promptToSend = PROMPTS.generate
        .replace("{initial_context}", conversation.initial)
        .replace("{history_log}", buildHistoryLog(conversation));
      break;
      
    default:
      return res.status(400).json({ error: "Invalid conversation state" });
  }
  
  try {

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: promptToSend }
        ],
        model: "llama-3.3-70b-versatile",
        stream: false,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        }
      }
    );
    
    const aiReply = response.data.choices[0].message.content;

    if (!isFinalGeneration) {
      if (conversation.round === 1) {
        conversation.r1Questions = aiReply;
      } else if (conversation.round === 2) {
        conversation.r2Questions = aiReply;
      } else if (conversation.round === 3) {
        conversation.r3Questions = aiReply;
      }
      
      conversation.round++;
    } else {
      await incrementUsage(userId);
      conversations.delete(userId);
    }
    
    const limitInfo = await checkDailyLimit(userId);
    
    res.json({ 
      reply: aiReply,
      isFinalGeneration: isFinalGeneration,
      currentRound: conversation.round,
      remainingPrompts: limitInfo.remaining
    });
    
  } catch (error) {
    console.error("Gemini Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to fetch response from AI" });
  }
});

app.post('/api/reset-conversation', checkAuth, (req, res) => {
  const userId = req.user.uid;
  conversations.delete(userId);
  res.json({ message: "Conversation reset successfully" });
});

app.get('/api/remaining-prompts', checkAuth, async (req, res) => {
  const userId = req.user.uid;
  const limitInfo = await checkDailyLimit(userId);
  res.json({ remaining: limitInfo.remaining });
});

app.get('/api/get-secret-key', checkAuth, (req, res) => {
  console.log("User verified:", req.user.email);
  res.json({
    message: "Access Granted",
    userEmail: req.user.email,
    secretInfo: "This data is secure."
  });
});

app.listen(PORT, () => {
  console.log(`Backend Server is running on http://localhost:${PORT}`);
});