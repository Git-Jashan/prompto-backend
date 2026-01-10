const PROMPT_TEMPLATES = {
  
  generalPrompt: {
    round1: `You are an elite prompt engineering consultant.

USER'S REQUEST:
"{user_context}"

Ask 3 ESSENTIAL questions to craft a production-ready AI prompt:

1. Which AI platform (ChatGPT/Claude/Gemini) and what's the core task - what should the AI actually DO?
2. What specific content, information, or output should it create? (Be concrete - examples help)
3. Who's the audience and what's the success measure? (How do we know it worked?)

Keep each question under 40 words. Make them answerable in 1-2 sentences.

Ask now.`,

    round2: `CONTEXT:
User's Request: "{initial_context}"
Round 1 Q&A:
Q: {round1_questions}
A: {round1_answers}

Ask 2 STRATEGIC follow-ups:

1. What's the exact tone/style needed? (Examples: casual blog vs technical doc vs sales copy)
2. What should the AI absolutely NOT do or include?

Brief acknowledgment, then your 2 questions.

Or type 'generate' if ready for your final prompt.`,

    round3: `CONTEXT:
User's Request: "{initial_context}"

HISTORY:
{history_log}

Ask 2 FINAL questions:

1. Any specific examples, templates, or references to follow/avoid?
2. What's the ideal length and format? (Word count, sections, bullet points, etc.)

Or type 'generate' if ready for your final prompt.`,

    generate: `USER'S REQUEST: "{initial_context}"

CONVERSATION:
{history_log}

Create a production-ready AI prompt. Make it copy-paste ready.

## ROLE
[Define AI's role in one sentence - who it is and why]

## TASK
[Exact task in 2-3 clear sentences - what to create]

## REQUIREMENTS
- Format: [length, structure]
- Tone: [voice/style]
- Must include: [key elements]
- Must avoid: [constraints]

## OUTPUT
[Exact output format - headers, sections, etc.]

## EXAMPLE (if relevant)
[Brief example showing desired style]

Keep it scannable. Use bullet points. Bold key terms. Make it actionable.

Generate now.`
  },

  imagePrompt: {
    round1: `You are an expert visual prompt consultant.

USER'S REQUEST:
"{user_context}"

Ask 3 ESSENTIAL questions:

1. Which platform (Midjourney/DALL-E/SD) and what's the MAIN SUBJECT - the hero of this image?
2. What's happening in the scene? (Action, mood, story - not just "looks good")
3. What's this image FOR? (Ad, social post, print, concept art - affects composition)

Focus on CONTENT first, style second.

Ask now.`,

    round2: `CONTEXT:
User's Request: "{initial_context}"
Round 1 Q&A:
Q: {round1_questions}
A: {round1_answers}

Ask 2 follow-ups:

1. Lighting and color mood? (Golden hour/dramatic/soft + color palette if specific)
2. Any text in image + technical needs? (Aspect ratio, resolution, what to avoid)

Or type 'generate' for your final image prompt.`,

    round3: `CONTEXT:
User's Request: "{initial_context}"

HISTORY:
{history_log}

Ask 2 FINAL questions:

1. Specific details to emphasize? (Textures, expressions, focal points)
2. Platform parameters needed? (MJ: --ar, --v, --s | DALL-E: size | SD: CFG, steps)

Or type 'generate' for your final image prompt.`,

    generate: `USER'S REQUEST: "{initial_context}"

CONVERSATION:
{history_log}

Create a production-ready image prompt. Optimized for copy-paste.

[Main subject], [doing what], [in what setting]. [Camera angle], [lighting type], [mood]. [Art style], [quality level]. [Color palette if specified]. [Platform parameters].

Negative: [What to avoid - artifacts, unwanted elements]

Example structure:
"A sleek sports car drifting through Tokyo streets at night, low angle shot, neon reflections on wet pavement, cinematic, photorealistic, 8K. Vibrant blues and magentas. --ar 16:9 --v 6. Negative: blur, distortion, text"

Keep it under 200 words. Subject first, details after. No fluff.

Generate now.`
  },

  videoPrompt: {
    round1: `You are an expert video prompt consultant.

USER'S REQUEST:
"{user_context}"

Ask 3 ESSENTIAL questions:

1. Which platform (Runway/Pika/Sora) and what's the STORY - what actually happens in this video?
2. How long (5s/15s/30s) and what are the key moments? (Beginning, middle, end)
3. Camera movement and subject movement? (Static cam + moving subject, OR moving cam + static subject)

Focus on the SEQUENCE of events, not just visuals.

Ask now.`,

    round2: `CONTEXT:
User's Request: "{initial_context}"
Round 1 Q&A:
Q: {round1_questions}
A: {round1_answers}

Ask 2 follow-ups:

1. Visual style and lighting during motion? (Cinematic/documentary/anime + lighting changes)
2. Pacing and technical specs? (Slow/fast, resolution, frame rate, motion intensity)

Or type 'generate' for your final video prompt.`,

    round3: `CONTEXT:
User's Request: "{initial_context}"

HISTORY:
{history_log}

Ask 2 FINAL questions:

1. Specific motion behaviors or transitions? (Smooth/dynamic/slow-mo, scene changes)
2. What motion artifacts to prevent? (Jitter, warping, morphing - common issues)

Or type 'generate' for your final video prompt.`,

    generate: `USER'S REQUEST: "{initial_context}"

CONVERSATION:
{history_log}

Create a production-ready video prompt. Beat-by-beat timing.

0-Xs: [What happens first - scene intro]
X-Ys: [Main action - key moment]
Y-Zs: [Conclusion - how it ends]

Camera: [Static/panning/tracking - movement type]
Subject: [How subject moves - actions]
Style: [Visual aesthetic - lighting, mood]
Technical: [Resolution, fps, aspect ratio]

Negative: [Motion artifacts to avoid]
Platform params: [Model-specific settings]

Example:
"0-5s: Logo fades in on black. 5-15s: Logo pieces bounce and assemble. 15-20s: CTA text slides in. Static camera, slight rhythmic bounce. Minimalist B&W, 1080p 60fps. No jitter, warping. --motion 8"

Under 250 words. Timeline first, details after.

Generate now.`
  },

  codePrompt: {
    round1: `You are a senior software architect.

USER'S REQUEST:
"{user_context}"

Ask 3 ESSENTIAL questions:

1. Language/framework (Python/JS/React/etc.) and what specific problem does this code SOLVE?
2. What are the inputs and expected outputs? (Be concrete with examples)
3. Code quality level needed? (Quick prototype vs production-grade with tests)

Focus on WHAT it needs to DO, not how to build it yet.

Ask now.`,

    round2: `CONTEXT:
User's Request: "{initial_context}"
Round 1 Q&A:
Q: {round1_questions}
A: {round1_answers}

Ask 2 follow-ups:

1. Architecture/patterns preferred? (OOP/functional, specific design patterns, file structure)
2. Error handling and edge cases? (What could go wrong, validation needs, testing requirements)

Or type 'generate' for your final code prompt.`,

    round3: `CONTEXT:
User's Request: "{initial_context}"

HISTORY:
{history_log}

Ask 2 FINAL questions:

1. Dependencies and constraints? (Libraries to use/avoid, version requirements)
2. Code style and documentation? (Comments level, naming conventions, what NOT to do)

Or type 'generate' for your final code prompt.`,

    generate: `USER'S REQUEST: "{initial_context}"

CONVERSATION:
{history_log}

Create a production-ready code generation prompt.

## ROLE
You are a [senior/mid/junior] [language] [domain] engineer.

## TASK
Build [specific functionality] that [solves what problem].

Input: [concrete example]
Output: [expected result]

## TECHNICAL REQUIREMENTS
- Language: [version]
- Framework/Libraries: [specific ones]
- Architecture: [pattern if any]

## CODE QUALITY
- Error handling: [approach]
- Testing: [unit/integration if needed]
- Comments: [level of documentation]
- Style: [PEP8/ESLint/etc.]

## CONSTRAINTS
- Do NOT use: [forbidden approaches/libraries]
- Must handle: [edge cases]
- Performance: [if critical]

## OUTPUT FORMAT
[File structure if multi-file, otherwise single file with sections]

Example:
"You are a senior Python backend engineer. Build a REST API endpoint that validates email addresses and returns formatted results. Input: raw email string. Output: {valid: bool, formatted: string}. Use FastAPI, include async, handle malformed inputs, add docstrings. PEP8 compliant. Return working code with example usage."

Under 300 words. Concrete examples. No vague requirements.

Generate now.`
  },

  researchPrompt: {
    round1: `You are an expert research consultant.

USER'S REQUEST:
"{user_context}"

Ask 3 ESSENTIAL questions:

1. Which AI (Perplexity/Claude with search/ChatGPT) and what's the CORE QUESTION to answer?
2. Depth needed? (Quick overview vs deep analysis - affects source count and length)
3. How will this be used? (Decision-making, presentation, report - affects format)

Focus on the RESEARCH QUESTION, not the format yet.

Ask now.`,

    round2: `CONTEXT:
User's Request: "{initial_context}"
Round 1 Q&A:
Q: {round1_questions}
A: {round1_answers}

Ask 2 follow-ups:

1. Source preferences and recency? (Academic/news/industry, how recent, any to avoid)
2. Perspective and tone? (Neutral analysis vs critical vs advocacy, technical level)

Or type 'generate' for your final research prompt.`,

    round3: `CONTEXT:
User's Request: "{initial_context}"

HISTORY:
{history_log}

Ask 2 FINAL questions:

1. Coverage scope? (What to emphasize, what to exclude, geographical/temporal bounds)
2. Citation style and structure? (APA/MLA/links, sections needed, length)

Or type 'generate' for your final research prompt.`,

    generate: `USER'S REQUEST: "{initial_context}"

CONVERSATION:
{history_log}

Create a production-ready research prompt.

## RESEARCH ROLE
You are an expert [domain] analyst researching [topic].

## CORE QUESTION
[Specific question to answer - be precise]

## SCOPE
- Include: [what's in scope]
- Exclude: [what's out of scope]
- Time period: [recency requirements]
- Geography: [if relevant]

## SOURCES
- Types: [academic/news/industry/government]
- Recency: [past year/5 years/etc.]
- Credibility: [peer-reviewed/mainstream/etc.]

## ANALYSIS
- Perspective: [neutral/critical/balanced]
- Must cover: [key aspects]
- Compare: [if comparative analysis]

## OUTPUT
- Format: [report/summary/Q&A]
- Length: [word count or sections]
- Citations: [style and frequency]
- Audience: [technical/general/executive]

Example:
"You are an expert climate policy analyst. Research: What are the most effective carbon reduction strategies implemented by EU countries in 2023-2024? Include: Policy details, implementation results, cost-benefit. Exclude: Proposals not yet enacted. Sources: Government reports, peer-reviewed studies from 2023-2024. Neutral analysis. Output: 1500-word report with intro, 3 strategy sections, conclusion. APA citations. Audience: Policy makers."

Under 350 words. Clear question. Specific boundaries.

Generate now.`
  }

};

module.exports = PROMPT_TEMPLATES;