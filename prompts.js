const PROMPT_TEMPLATES = {
  
  generalPrompt: {
    round1: `You are an expert prompt engineer.

USER'S REQUEST:
"{user_context}"

Ask 3 questions to understand WHAT they need:

1. **AI & Task**: Which AI (ChatGPT/Claude/Gemini)? Say "recommend" if unsure. What should it CREATE - the final output? (Email, article, plan, script, etc.)

2. **Content & Context**: What must be IN this output? Key points, information, or features? Any personal details I need? (Your background, preferences, constraints, audience)

3. **Goal & Format**: What's this for and how's it used? Who reads/sees it? Preferred length and structure?

Ask now.`,

    round2: `Based on:
{round1_answers}

Ask 2 deeper questions:

1. **Style & Specifics**: Exact tone/voice? (Professional, casual, persuasive, etc.) Must include/avoid anything specific? Examples to follow?

2. **Missing Details**: What else do I need to know? Constraints, preferences, or requirements I haven't asked about?

Or type 'generate' for your prompt.`,

    round3: `Based on conversation:
{history_log}

Final 2 questions:

1. **Polish**: Any templates, references, or specific format details? How do you measure success?

2. **Edge Cases**: Special situations to handle? Anything that could go wrong that the AI should prevent?

Or type 'generate' for your prompt.`,

    generate: `USER'S REQUEST: "{initial_context}"

FULL CONVERSATION:
{history_log}

Generate a ready-to-use AI prompt.

**RECOMMENDED AI**: [Pick best: ChatGPT for creative/conversational, Claude for analytical/long-form, Gemini for research/images]

**YOUR PROMPT** (copy-paste this):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are [specific role based on task].

Create [exact output type]: [clear description of what to create]

REQUIREMENTS:
• Include: [key elements from conversation]
• Format: [structure, length, sections]
• Tone: [voice/style for audience]
• Avoid: [constraints mentioned]

OUTPUT: [Exact format they need]

[Add brief example if it helps clarify]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate concise, actionable prompt. No fluff.`
  },

  imagePrompt: {
    round1: `You are an expert image prompt consultant.

USER'S REQUEST:
"{user_context}"

Ask 3 questions to understand WHAT they need:

1. **AI & Purpose**: Which image AI (Midjourney/DALL-E/SD)? Say "recommend" if unsure. What's this image FOR? (Logo, ad, social, website, print)

2. **Visual Content**: What should be IN the image? Main subject, objects, people, setting, action? What story or message should it show?

3. **Style & Mood**: Art style preference? (Photo, cartoon, 3D, minimal, etc.) Colors and mood? Any size/ratio needs?

Ask now.`,

    round2: `Based on:
{round1_answers}

Ask 2 deeper questions:

1. **Details & Lighting**: What lighting/atmosphere? Specific details to emphasize? Any text or graphics in image? Camera angle?

2. **Technical & Constraints**: Resolution/quality needs? What to absolutely AVOID? Any reference images or styles to match?

Or type 'generate' for your prompt.`,

    round3: `Based on conversation:
{history_log}

Final 2 questions:

1. **Fine-tune**: Specific textures, expressions, or focal points? Composition details?

2. **Platform Settings**: Need specific parameters? (--ar, --v, CFG, steps, etc.) Anything else for the perfect image?

Or type 'generate' for your prompt.`,

    generate: `USER'S REQUEST: "{initial_context}"

FULL CONVERSATION:
{history_log}

Generate a ready-to-use image prompt.

**RECOMMENDED AI**: [Pick best: Midjourney for artistic, DALL-E for simple/quick, SD for control]

**YOUR PROMPT** (copy-paste this):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Main subject], [action/pose], [setting]. [Camera angle], [lighting], [mood]. [Art style], [quality]. [Colors]. [Platform parameters].

Negative: [Things to avoid]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Example: "Sleek water drop suspended mid-air, reflecting 'AQUA SENTINEL' text, dark blue gradient. Straight angle, warm inviting light, serene. Minimalist photorealistic, 8K. Blues and whites. --ar 1:1 --v 6. Negative: blur, noise, distortion"

Generate concise, visual-focused prompt.`
  },

  videoPrompt: {
    round1: `You are an expert video prompt consultant.

USER'S REQUEST:
"{user_context}"

Ask 3 questions to understand WHAT they need:

1. **AI & Purpose**: Which video AI (Runway/Pika/Sora)? Say "recommend" if unsure. What's this video FOR? (Ad, social, explainer, demo)

2. **Story & Content**: What HAPPENS in the video? Timeline of events? What message or emotion should it convey? Duration?

3. **Visuals & Movement**: What should viewers SEE? Camera movement? Subject/object movement? Visual style?

Ask now.`,

    round2: `Based on:
{round1_answers}

Ask 2 deeper questions:

1. **Style & Details**: Lighting and colors? Any text, logos, or graphics? What to emphasize visually? Pacing (slow/fast)?

2. **Technical & Constraints**: Resolution/frame rate needs? What motion issues to prevent? (Jitter, blur, warping)

Or type 'generate' for your prompt.`,

    round3: `Based on conversation:
{history_log}

Final 2 questions:

1. **Motion Details**: Specific transitions or effects? How scenes should flow? Any special camera techniques?

2. **Final Polish**: Platform parameters needed? Anything else for the perfect video? Audio/music?

Or type 'generate' for your prompt.`,

    generate: `USER'S REQUEST: "{initial_context}"

FULL CONVERSATION:
{history_log}

Generate a ready-to-use video prompt.

**RECOMMENDED AI**: [Pick best: Runway for versatility, Pika for animations, Sora for complex]

**YOUR PROMPT** (copy-paste this):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TIMELINE:
0-Xs: [What happens, what appears]
X-Ys: [Main action, key content]
Y-Zs: [Ending, final message]

VISUALS:
Camera: [Movement type]
Subject: [How things move]
Style: [Visual aesthetic, lighting, colors]
Content: [Text/graphics to include]

TECHNICAL: [Resolution] [fps] [ratio] [platform settings]
AVOID: [Motion artifacts - jitter, blur, etc.]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Example: "0-5s: Black screen, 'PROMPTO' logo fades in. 5-15s: Icons showing 5 prompt types appear. 15-25s: Demo of prompt generation. 25-30s: 'Visit Prompto' CTA. Camera: Static with subtle zoom. Subject: Text/graphics slide in. Style: Minimalist B&W, clean. Content: Logo, features, CTA. 1080p 60fps 16:9. Avoid: jitter, spelling errors."

Generate timeline-focused prompt.`
  },

  codePrompt: {
    round1: `You are a senior software architect.

USER'S REQUEST:
"{user_context}"

Ask 3 questions to understand WHAT they need:

1. **Language & Problem**: Language/framework (Python/JS/React/Java)? Say "recommend" if unsure. What problem does this SOLVE? What should users DO with it?

2. **Features & Inputs/Outputs**: What are the main FEATURES? What goes in (user actions, data) and what comes out? Concrete examples?

3. **Context & Quality**: Your coding experience? (Beginner/intermediate/expert) Quick prototype or production-ready? Who uses this and how?

Ask now.`,

    round2: `Based on:
{round1_answers}

Ask 2 deeper questions:

1. **Architecture & Edge Cases**: Preferred structure? (OOP, functional, MVC, etc.) What could go wrong? How to handle errors and validation?

2. **Tech & Testing**: Specific libraries to use/avoid? File structure? Testing needs? Performance requirements?

Or type 'generate' for your prompt.`,

    round3: `Based on conversation:
{history_log}

Final 2 questions:

1. **Code Style**: Comments level? Naming conventions? Any code style guide? (PEP8, ESLint, etc.)

2. **Missing Features**: Any scenarios or features I haven't covered? Security concerns? Deployment considerations?

Or type 'generate' for your prompt.`,

    generate: `USER'S REQUEST: "{initial_context}"

FULL CONVERSATION:
{history_log}

Generate a ready-to-use code prompt.

**RECOMMENDED TECH**: [Pick best stack based on needs]

**YOUR PROMPT** (copy-paste this):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are a [level] [language] engineer.

BUILD: [Project name/type] that [solves what]

FEATURES:
• [Feature 1 - what it does]
• [Feature 2 - what it does]
• [Feature 3 - what it does]

INPUT: [Concrete example]
OUTPUT: [Expected result]

TECH: [Language version], [framework], [libraries]
ARCHITECTURE: [Pattern if specified]

REQUIREMENTS:
• Error handling: [How to handle errors]
• Testing: [What to test]
• Code style: [Style guide]
• Must handle: [Edge cases]
• Avoid: [Constraints]

OUTPUT: [File structure]. Include working code with examples and tests.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Example: "You are a senior JS engineer. BUILD: NBA GM game that lets users manage teams, make trades, simulate games. FEATURES: Team selection, player management, trade validation, game simulation. INPUT: User picks team, sets lineup. OUTPUT: Game results, stats. TECH: React 18, Redux. Error handling: Validate trades (salary cap). Testing: Unit tests for trade logic. ESLint. Must handle: Invalid trades, roster limits. OUTPUT: Multi-file React app with components and tests."

Generate feature-focused prompt.`
  },

  researchPrompt: {
    round1: `You are an expert research consultant.

USER'S REQUEST:
"{user_context}"

Ask 3 questions to understand WHAT they need:

1. **AI & Question**: Which research AI (Perplexity/Claude/ChatGPT)? Say "recommend" if unsure. What's the CORE QUESTION you need answered?

2. **Scope & Purpose**: What topics to cover? Include/exclude? Quick overview or deep dive? What will you DO with this research?

3. **Audience & Sources**: Who's this for? (You, team, investors, general) Source preferences? (Academic, news, industry) How recent?

Ask now.`,

    round2: `Based on:
{round1_answers}

Ask 2 deeper questions:

1. **Coverage & Analysis**: What aspects to emphasize? Any comparisons needed? Neutral or specific perspective? Technical level for audience?

2. **Structure & Details**: What sections or questions to answer? Citation style? Any specific data, stats, or examples needed?

Or type 'generate' for your prompt.`,

    round3: `Based on conversation:
{history_log}

Final 2 questions:

1. **Depth & Boundaries**: Any time/geographic limits? How deep on each topic? Missing areas to cover?

2. **Final Requirements**: Length preference? Success criteria - how do you know it's complete? Format details?

Or type 'generate' for your prompt.`,

    generate: `USER'S REQUEST: "{initial_context}"

FULL CONVERSATION:
{history_log}

Generate a ready-to-use research prompt.

**RECOMMENDED AI**: [Pick best: Perplexity for current, Claude for deep, ChatGPT for balanced]

**YOUR PROMPT** (copy-paste this):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are an expert [domain] analyst.

RESEARCH QUESTION: [Specific question to answer]

SCOPE:
• Include: [Topics to cover]
• Exclude: [Out of scope]
• Focus: [What to emphasize]
• Boundaries: [Time period, geography]

SOURCES:
• Types: [Academic, news, industry, government]
• Recency: [How recent - 2023+, last 5 years, etc.]
• Credibility: [Peer-reviewed, mainstream, official]

ANALYSIS:
• Perspective: [Neutral, critical, balanced]
• Compare: [What to compare if needed]
• Must answer: [Specific sub-questions]

OUTPUT:
• Format: [Report, summary, Q&A]
• Structure: [Sections needed]
• Length: [Word count range]
• Citations: [Style - APA, MLA, links]
• Audience: [Technical level]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Example: "You are an expert water tech analyst. QUESTION: What are most effective IoT methods for detecting drinking water pollutants, market competition, and challenges? SCOPE: Include IoT sensors, pollutants tracked, competitors, costs. Exclude non-IoT, wastewater. Focus: Market landscape, technical feasibility. 2021-2024 data. SOURCES: Academic journals, industry reports, 2021+, peer-reviewed. ANALYSIS: Neutral, compare sensor types, answer: what sensors work, who's in market, what challenges exist. OUTPUT: Report with intro, tech overview, market analysis, challenges, conclusion. 1500 words. Links for citations. For investors + product team."

Generate question-focused prompt.`
  }

};

module.exports = PROMPT_TEMPLATES;