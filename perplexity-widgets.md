You're asking about how Perplexica implements source citation widgets in the frontend, specifically the UI components that display and link to sources used in AI responses.

## Source Citation Implementation

Perplexica implements source citations through a two-part system: inline citation links within the response text and dedicated source widgets that display source metadata.

### Inline Citation Processing

The core citation functionality is handled in `MessageBox.tsx` where citations are converted from `[number]` format to clickable links [1](#0-0) . The system:

1. Uses regex to find citation patterns like `[1]`, `[2]`, etc.
2. Maps each number to the corresponding source from `message.sources`
3. Converts citations to HTML anchor tags with the source URL
4. Styles them as small, rounded badges with background colors

### Source Widget Display

The `MessageSources.tsx` component creates the visual source widgets that appear above each AI response [2](#0-1) . Each source widget includes:

- Source title (truncated with ellipsis)
- Favicon from the source domain
- Domain name (cleaned URL)
- Numbered indicator matching the citation numbers
- Hover effects and click-through to the original URL

### Data Flow

Sources are provided through the streaming API response. The search system returns both the generated text and an array of `Document` objects containing source metadata [3](#0-2) . Each source includes:

- `pageContent`: Relevant snippet from the source
- `metadata.title`: Page title
- `metadata.url`: Source URL

The frontend receives sources via the streaming response format [4](#0-3)  and stores them in the message state for rendering.

### Key Implementation Details

For your database bot, you'll want to replicate:

1. **Citation parsing**: Convert `[number]` patterns to clickable links
2. **Source widgets**: Create cards showing source metadata with favicons and titles
3. **Responsive layout**: Grid layout that shows 3-4 sources initially with "View more" option [5](#0-4) 
4. **Modal for overflow**: Dialog to show all sources when there are more than 3

The styling uses Tailwind classes for hover effects, dark mode support, and responsive grids.

## Notes

The citation system is tightly integrated with Perplexica's search pipeline - the LLM is prompted to include citations in its responses [6](#0-5) , and the frontend processes these into interactive elements. For a database bot, you'd need to ensure your AI responses include similar citation markers and provide corresponding source metadata.

Wiki pages you might want to explore:
- [Search System (ItzCrazyKns/Perplexica)](/wiki/ItzCrazyKns/Perplexica#4.1)