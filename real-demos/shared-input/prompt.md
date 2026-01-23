# Task: Build Application Evaluation Page

Build a single-file HTML page (all CSS/JS inline) for a coding bootcamp application evaluation.

## Requirements

SHORT FORM (6 fields only - high conversion):
- Name (text input)
- Email (email input)
- Background (textarea, 2-3 sentences)
- Dream Project (textarea, 2-3 sentences)
- Unique Skill (textarea, 1-2 sentences)
- Biggest Fear (text input, 1 sentence)

## Functionality

1. Pre-fill form with test data:
   - Name: Sarah Chen
   - Email: sarah.chen@test.adavauniversity.org
   - Background: "I'm a 5th grade teacher (8 years) but want to transition to ed-tech. I've seen too many students with dyslexia struggle with terrible learning apps."
   - Dream Project: "A reading app for dyslexic students with adjustable fonts, text-to-speech, and progress tracking for teachers."
   - Unique Skill: "I've designed 500+ individualized lesson plans for students with learning disabilities. I know what makes content accessible."
   - Biggest Fear: "That I'm too old to switch careers (34) or can't compete with CS grads."

2. Submit button calls OpenAI GPT-4 API with this system prompt:
   "[SYSTEM_PROMPT_HERE]"

3. Show loading animation during API call

4. Display GPT-4 response in visually appealing way

5. Handle errors gracefully

## Technical Constraints

- Single HTML file (no external dependencies)
- All CSS inline in `<style>` tag
- All JavaScript inline in `<script>` tag
- Mobile responsive
- Modern, professional design
- File saved as: `evaluation-page.html`
