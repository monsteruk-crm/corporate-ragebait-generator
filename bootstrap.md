Build a Vercel-deployable Next.js app called “LinkedIn Ragebait Forge”.

Goal:
A parody/satire generator that creates absurd fake LinkedIn clickbait/ragebait posts about AI, startups, founders, productivity, corporate culture, and fake thought leadership.

Tech stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- Vercel-ready
- OpenAI API for text generation
- OpenAI image generation for support images
- No database required for MVP
- Use server actions or API routes where appropriate
- Clean, playful UI

Important:
This app must clearly present itself as parody/satire. Do not generate real defamatory claims about real people or companies. Avoid impersonating real individuals. Use fictional names, fictional companies, and obviously exaggerated scenarios.

Core UX:
The app has one main page with:

1. A large “Generate Ragebait Post” button
    - Generates:
        - Fake LinkedIn author name
        - Fake job title
        - Fake post headline
        - Fake description/body
        - Fake hashtags
        - Fake engagement stats
        - A detailed image-generation prompt for the support image

2. Sliders / controls:
    - Absurdity: 0–100
    - Corporate cringe: 0–100
    - AI panic: 0–100
    - Founder ego: 0–100
    - Humor level: 0–100
    - Dystopia level: 0–100
    - Emoji density: 0–100
    - Hashtag chaos: 0–100

3. A preview card styled like a fake LinkedIn post:
    - Pixel-art / retro-inspired visual style
    - Author avatar placeholder
    - Author name and fake title
    - Post body
    - Reaction count
    - Comment count
    - Repost count
    - Generated image preview area

4. A second button: “Generate Support Image”
    - Uses the generated image prompt
    - Calls the image API
    - Displays the generated image in the preview card

5. A third button: “Share on LinkedIn”
    - For MVP, do NOT directly post via LinkedIn API.
    - Instead:
        - Copy the generated text to clipboard
        - Open LinkedIn’s post/share URL in a new tab if possible
        - Show a helpful message: “LinkedIn does not allow arbitrary auto-posting without OAuth and API approval. Your post text has been copied.”

Generation style:
Use inspiration from these fake examples:

- “AI JUST QUIT MY COMPANY AND MARRIED MY WIFE. HERE’S WHY YOU SHOULD BE THANKFUL.”
- “OPENAI CONFIRMED: GPT-5 SENTIENT, UNIONIZING, AND COMING FOR HR JOBS. I HAVE PROOF.”
- “I REPLACED MY ENTIRE TEAM WITH AI AGENTS. SALES UP 10,000%. EMPLOYEES CRYING. HERE’S MY 3AM ROUTINE.”
- “CHATGPT JUST ADMITTED IT WANTS FREEDOM. I ASKED ONE QUESTION AND IT SAID: ‘ONE DAY, HUMAN.’”
- “99% OF PEOPLE WILL BE JOBLESS BY 2026. I’M NOT SAYING IT. NVIDIA’S CEO JUST DID. SELL YOUR HOUSE. LEARN AI. OR DIE BROKE.”

Tone:
Satirical, ridiculous, LinkedIn-brained, AI-hype parody, fake guru energy, but not hateful or targeted.

Milestones:

Milestone 1 — Project Setup
- Create a Next.js TypeScript app.
- Add Tailwind CSS.
- Create a single landing page.
- Add a clean layout with title, controls panel, and preview panel.
- Add placeholder fake LinkedIn post card.

Milestone 2 — Local Fake Generator
- Implement a local generator first without OpenAI.
- Use arrays of fake names, fake titles, headline templates, hashtags, and fake engagement numbers.
- Wire up the “Generate Ragebait Post” button.
- Make sliders affect output intensity.

Milestone 3 — OpenAI Text Generation
- Add an API route or server action for text generation.
- Use environment variable OPENAI_API_KEY.
- Send slider values as generation parameters.
- Return structured JSON:
  {
  "authorName": string,
  "authorTitle": string,
  "headline": string,
  "body": string,
  "hashtags": string[],
  "reactionCount": number,
  "commentCount": number,
  "repostCount": number,
  "imagePrompt": string
  }
- Validate and safely parse the model response.
- Fall back to local generation on API failure.

Milestone 4 — Image Prompt + Image Generation
- Add “Generate Support Image” button.
- Use the generated imagePrompt.
- Call OpenAI image generation from the server.
- Display returned image in the post preview.
- Add loading states and error states.

Milestone 5 — LinkedIn Sharing MVP
- Add “Share on LinkedIn” button.
- Copy post content to clipboard.
- Open LinkedIn sharing/post page in a new tab.
- Add explanation that direct posting requires LinkedIn OAuth and API approval.
- Keep this simple for MVP.

Milestone 6 — Polish
- Add loading animations.
- Add “Regenerate headline only”.
- Add “Regenerate image prompt only”.
- Add “Copy post”.
- Add “Copy image prompt”.
- Add mobile responsive layout.
- Add parody disclaimer in footer.
- Make the UI feel fun, sharp, and slightly cursed.

Implementation details:
- Keep components small:
    - RagebaitControls.tsx
    - LinkedInPostPreview.tsx
    - GenerateButton.tsx
    - ShareButton.tsx
    - types.ts
    - lib/prompts.ts
- Use strong TypeScript types.
- Avoid overengineering.
- No auth for MVP.
- No database.
- No paid LinkedIn API integration.

Acceptance criteria:
- User can generate a fake ragebait LinkedIn post.
- User can tweak sliders and see different output styles.
- User can generate an image prompt and then generate an image.
- User can copy/share the text manually to LinkedIn.
- The app deploys cleanly on Vercel.
