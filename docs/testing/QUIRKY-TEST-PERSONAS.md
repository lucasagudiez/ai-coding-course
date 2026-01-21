# Quirky Test Personas for Evaluation System

These 3 test personas have intentionally weird/unique answers to verify that ChatGPT provides HIGHLY PERSONALIZED responses, not generic templates.

## Persona 1: The Fire-Juggling Marine Biologist

**Name:** Dr. Oceana "Splash" Martinez

**Background:** Professional (Marine Biologist)

**Coding Experience:** Tried tutorials before

**AI Tools Used:** None

**Primary Goal:** Build my own product/startup

**Why applying now:**
"I've been studying octopuses for 8 years and realized they're basically nature's AI - they solve problems creatively without following rigid rules. I need to build an app that helps divers identify marine species in real-time using their phone camera underwater. Traditional coding bootcamps take too long and I'm between research grants right now. Plus, AI coding feels philosophically aligned with how octopuses think."

**Dream Project:**
"An underwater species identification app that works in real-time. Divers point their camera at a fish/coral/creature and the app instantly tells them what it is, if it's dangerous, and fun facts. It needs to work offline because there's no WiFi 60 feet underwater. Would use the phone's camera + AI vision models. Could save lives (venomous species warnings) and help with citizen science data collection."

**Unique Skill/Hobby:**
"I can juggle fire torches while riding a unicycle. Started doing it at beach parties in grad school to decompress from dissertation stress. Now I perform at marine conservation fundraisers. The concentration required for fire juggling is similar to debugging code - one mistake and everything goes wrong, but when it works it's magical."

**Expected ChatGPT Response Quality:**
- MUST reference the octopus/AI philosophical connection
- MUST mention the underwater camera app specifically
- MUST connect fire juggling to coding skills (concentration, precision, practice)
- Should be excited about the marine conservation angle
- Should suggest relevant projects (computer vision, offline-first apps, wildlife databases)
- Should NOT be generic about "your professional experience"

---

## Persona 2: The Retired Magician Who Bakes Sourdough

**Name:** Marcus "The Mystifier" Chen

**Background:** Career-changer (was a professional magician for 15 years)

**Coding Experience:** Never written code

**AI Tools Used:** GPT-4 / Codex (for writing card trick explanations)

**Primary Goal:** Start freelancing

**Why applying now:**
"I retired from stage magic last year after my Vegas show ended. Now I bake sourdough bread and sell it at farmers markets, but I want to build apps for magicians - inventory management for props, trick idea generators, booking systems. Magic taught me that perception is reality, and coding with AI feels like the same principle: you don't need to know every spell (syntax), you just need to know what illusion (outcome) you want. I'm 47 and don't have time for a 4-year CS degree."

**Dream Project:**
"A 'Magic Trick Generator' app where magicians input what props they have (cards, coins, rope, etc.) and it suggests original trick ideas they haven't thought of. Would use AI to combine classic principles in new ways. Also needs a social feature where magicians can share their versions anonymously (the magic code says you never reveal secrets publicly, but magicians share privately). Think of it as 'GitHub for magic tricks' but with proper secrecy controls."

**Unique Skill/Hobby:**
"I make award-winning sourdough bread. I've been maintaining the same starter culture for 11 years - it's basically a living organism I feed daily. The patience and timing required for sourdough (knowing when to fold, when to proof, reading subtle signs) is exactly what I imagine coding requires. Also, both involve troubleshooting failed batches and learning from mistakes."

**Expected ChatGPT Response Quality:**
- MUST mention the "perception is reality" / magic metaphor
- MUST reference the Magic Trick Generator GitHub-style app
- MUST connect sourdough patience to coding/learning process
- Should acknowledge his age as an asset (maturity, focus) not a barrier
- Should suggest relevant projects (AI content generation, social platforms with privacy, inventory systems)
- Should NOT use generic "career changer" language

---

## Persona 3: The Competitive Speed Cuber Who Raises Pigeons

**Name:** Sarah "Sub-10" Rodriguez

**Background:** Student (Mathematics & Philosophy double major)

**Coding Experience:** Know basics (took intro CS class)

**AI Tools Used:** Cursor, Claude, v0.dev

**Primary Goal:** Get a tech job

**Why applying now:**
"I graduate in May and all the tech internships want 'real projects', not just coursework. My university's CS classes focus on theory and algorithms, but nobody teaches how to actually build and ship products. I need a fast-track to having a portfolio that shows I can build real apps. I solve Rubik's cubes in under 10 seconds competitively (I'm ranked in top 100 nationally), which means I can learn complex pattern recognition fast. AI coding seems like pattern recognition at scale."

**Dream Project:**
"A 'Speedcubing AI Coach' that watches video of your solves and gives you personalized feedback on where you're losing time. Would use computer vision to track cube movements frame-by-frame, then compare to optimal algorithms. Right now coaches charge $100/hour for this analysis. An AI version could help thousands of cubers improve faster. It needs real-time video processing and a massive algorithm database. Would be revolutionary for the community."

**Unique Skill/Hobby:**
"I raise racing pigeons on my parents' farm. We have 47 pigeons and I've been training them since I was 12. They can fly 500+ miles and find their way home using Earth's magnetic field and the sun. The pattern recognition and spatial awareness required to train pigeons successfully (reading weather, understanding navigation, breeding for specific traits) is way more complex than people think. Plus, it taught me patience and systems thinking."

**Expected ChatGPT Response Quality:**
- MUST reference speed cubing and pattern recognition skills
- MUST mention the Speedcubing AI Coach with computer vision
- MUST connect pigeon racing to systems thinking / spatial reasoning
- Should acknowledge her existing AI tool experience as a head start
- Should suggest relevant projects (computer vision apps, real-time video processing, coaching/feedback systems)
- Should emphasize she's already ahead of most students
- Should NOT be generic about "student advantage"

---

## Testing Checklist

For each persona, verify the ChatGPT evaluation response:

✅ **Specificity Test:** Does it mention their actual dream project by name/concept?

✅ **Unique Skill Integration:** Does it connect their weird hobby to coding in a meaningful way?

✅ **Motivation Echo:** Does it quote or meaningfully paraphrase their actual motivation?

✅ **Non-Generic Language:** Does it avoid phrases like "your professional background" or "your career goals" and instead use specific details?

✅ **Project Recommendations:** Are the recommended projects relevant to THEIR specific interests, not generic?

✅ **Testimonial Match:** Is the matched testimonial from someone with a similar quirky background?

✅ **Human Feel:** Would a human reading this think "wow, someone actually read my application" or "this feels like a template"?

---

## How to Test

1. **Start Server:**
```bash
cd server/
node app.js
```

2. **Open Application Form:**
```
http://localhost:8888/application/?name=Dr.%20Oceana%20Martinez&email=oceana@test.com
```

3. **Fill Form with Persona 1 Data** (copy/paste from above)

4. **Submit and Watch Evaluation Page** (should take 10+ seconds)

5. **Screenshot the Results** and verify against checklist

6. **Repeat for Personas 2 and 3**

7. **Compare Results:**
   - Are all 3 evaluations DIFFERENT?
   - Does each feel custom-written for that person?
   - Would you pay $10 for this quality of feedback?

---

## Success Criteria

❌ **FAIL:** Generic responses like "Your professional experience will help you succeed"

✅ **PASS:** Specific responses like "Your octopus research background gives you a unique mental model for AI thinking - both involve creative problem-solving without rigid rules"

❌ **FAIL:** All 3 personas get similar project recommendations

✅ **PASS:** Marine biologist gets computer vision projects, magician gets content generation projects, speed cuber gets real-time video processing projects

❌ **FAIL:** Unique skills are ignored or mentioned but not connected to coding

✅ **PASS:** "Your fire juggling demonstrates the same precision and practice mindset that makes great developers - both require intense focus and learning from failures"

---

## Why This Matters

The $10 application fee needs to feel worth it. Generic LLM responses feel cheap. Personalized responses that show "someone actually read my application" feel premium.

This level of personalization is what converts applicants from "maybe" to "yes, I'll pay $580 to join this program."
