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

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();

const conversations = new Map();

const PROMPT_TEMPLATES = process.env.PROMPT_TEMPLATES_JSON 
  ? JSON.parse(process.env.PROMPT_TEMPLATES_JSON)
  : require('./prompts'); 

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
  const { message, promptType } = req.body;
  const userId = req.user.uid;
  
  if (!message || message.length > 7000) {
    return res.status(400).json({ error: "Message is required or too long" });
  }
  
  if (!conversations.has(userId)) {
    conversations.set(userId, {
      round: 1,
      promptType: promptType,
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
  
  const PROMPTS = PROMPT_TEMPLATES[conversation.promptType] || PROMPT_TEMPLATES.text;
  
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
    console.error("Groq Error:", error.response ? error.response.data : error.message);
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