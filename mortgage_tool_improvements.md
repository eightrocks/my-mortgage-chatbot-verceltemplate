# Mortgage Tool Improvement Recommendations

## Current Tool Limitations
- Lacks contextual awareness of mortgage-specific data
- Gives generic responses that don't leverage the mortgage-post database
- Weak information presentation; needs stronger visualization and data-access features

## Required UI / UX Improvements
- **Perplexity-style elements**
  - Visual image carousel for browsing mortgage documents
  - Clickable source citations that open the original posts
  - Preview images alongside referenced documents
  - Clear tabs / sections for better layout
  - Static images hosted on AWS, exposed via direct links
  - Clean formatting—avoid run-on paragraphs

## System Prompt Enhancements
- Remove unnecessary pleasantries and retention-focused wording
- Make responses more direct and efficient
- Study and adapt Perplexity's prompt structure
- Focus strictly on mortgage-data context
- Enforce proper citation / source referencing
- Review leaked prompts from successful AI tools for additional insight

## Reference Model — Perplexity AI
- Clean information structure with visible user query
- Multiple clickable tabs
- Clear summary sections
- Grounded stats with precise citations
- Source preview images
- Bibliography-style source list

## Development Approach
- Study Perplexity's open-source implementation
- Investigate Google's AI Search SDK
- Address both backend and frontend details
- Build a query layer that hits our database the way Perplexity queries the web
- Allocate significant effort to prompt tuning
- Re-use proven patterns; avoid reinventing the wheel
