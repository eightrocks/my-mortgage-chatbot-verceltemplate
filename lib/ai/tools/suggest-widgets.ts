import { z } from 'zod';
import { tool } from 'ai';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';

export const suggestWidgets = tool({
  description: `
    Analyze the user's question and available context to determine which widgets should be displayed.
    This tool helps create a Perplexity-style interface by suggesting relevant widgets based on the conversation context.
    Use this when you have RAG context that includes attachments or post links that could be valuable to show the user.
  `,
  parameters: z.object({
    userQuestion: z.string().describe('The user\'s original question'),
    availableAttachments: z.array(z.object({
      s3_key: z.string(),
      extracted_text: z.string().optional(),
      post_id: z.number()
    })).describe('Available attachment data from RAG context'),
    availablePosts: z.array(z.object({
      id: z.number(),
      title: z.string(),
      url: z.string(),
      created_at: z.string().optional()
    })).describe('Available post data from RAG context'),
    responseContent: z.string().describe('The main response content that will be shown to the user')
  }),
  execute: async ({ userQuestion, availableAttachments, availablePosts, responseContent }) => {
    try {
      // Define the schema for widget suggestions
      const WidgetSuggestionSchema = z.object({
        showAttachments: z.boolean().describe('Whether to show the attachment widget'),
        showPosts: z.boolean().describe('Whether to show the post links widget'),
        attachmentReason: z.string().optional().describe('Why attachments are relevant (if showAttachments is true)'),
        postReason: z.string().optional().describe('Why posts are relevant (if showPosts is true)'),
        attachmentTitle: z.string().optional().describe('Custom title for attachment widget'),
        postTitle: z.string().optional().describe('Custom title for post widget'),
        selectedAttachments: z.array(z.string()).describe('S3 keys of most relevant attachments to show (max 5)'),
        selectedPosts: z.array(z.number()).describe('IDs of most relevant posts to show (max 5)')
      });

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a widget recommendation system for a mortgage/real estate chatbot. 

Analyze the user's question and determine which widgets would be most helpful:

1. **Attachment Widget**: Show when:
   - User asks about specific documents, rates, calculations, forms
   - Documents contain relevant charts, images, or detailed information
   - Visual evidence would strengthen the answer

2. **Post Links Widget**: Show when:
   - User asks for experiences, opinions, or community insights
   - Posts contain discussions relevant to their specific situation
   - User might benefit from reading full conversations

Guidelines:
- Be selective - only suggest widgets that add real value
- Prioritize quality over quantity (max 5 items per widget)
- Consider the user's intent and information need
- Avoid showing widgets for simple factual questions that are fully answered in the response`
          },
          {
            role: "user",
            content: `User Question: "${userQuestion}"

Response Content: "${responseContent}"

Available Attachments (${availableAttachments.length}):
${availableAttachments.map(att => `- ${att.s3_key} (Post ${att.post_id}): ${att.extracted_text?.substring(0, 100) || 'No text preview'}...`).join('\n')}

Available Posts (${availablePosts.length}):
${availablePosts.map(post => `- ID ${post.id}: "${post.title}" (${post.created_at || 'Unknown date'})`).join('\n')}

Please analyze and suggest which widgets to show and why.`
          }
        ],
        response_format: zodResponseFormat(WidgetSuggestionSchema, "widget_suggestions"),
        temperature: 0.3
      });

      const suggestions = JSON.parse(completion.choices[0].message.content || '{}');
      
      // Filter attachments and posts based on LLM selection
      const filteredAttachments = availableAttachments.filter(att => 
        suggestions.selectedAttachments.includes(att.s3_key)
      );
      
      const filteredPosts = availablePosts.filter(post => 
        suggestions.selectedPosts.includes(post.id)
      );

      return {
        showAttachments: suggestions.showAttachments && filteredAttachments.length > 0,
        showPosts: suggestions.showPosts && filteredPosts.length > 0,
        attachmentTitle: suggestions.attachmentTitle || 'Related Documents',
        postTitle: suggestions.postTitle || 'Related Posts',
        attachmentReason: suggestions.attachmentReason,
        postReason: suggestions.postReason,
        selectedAttachments: filteredAttachments,
        selectedPosts: filteredPosts,
        reasoning: {
          attachmentCount: availableAttachments.length,
          postCount: availablePosts.length,
          selectedAttachmentCount: filteredAttachments.length,
          selectedPostCount: filteredPosts.length
        }
      };
      
    } catch (error) {
      console.error('Widget suggestion tool error:', error);
      
      // Fallback logic - show widgets if we have relevant content
      return {
        showAttachments: availableAttachments.length > 0,
        showPosts: availablePosts.length > 0,
        attachmentTitle: 'Related Documents',
        postTitle: 'Related Posts',
        selectedAttachments: availableAttachments.slice(0, 3), // Show up to 3 as fallback
        selectedPosts: availablePosts.slice(0, 3),
        reasoning: {
          attachmentCount: availableAttachments.length,
          postCount: availablePosts.length,
          selectedAttachmentCount: Math.min(availableAttachments.length, 3),
          selectedPostCount: Math.min(availablePosts.length, 3),
          fallback: true
        }
      };
    }
  }
});