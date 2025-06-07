import { z } from 'zod';
import { tool } from 'ai';
import { createServerSupabaseClient } from '../../supabase';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';

export const queryDatabase = tool({
  description: `
    Query the database with SQL for structured data analysis, especially time-based queries. 
    This tool can generate and execute SQL queries to answer questions about post counts, 
    date ranges, statistics, and other structured data questions that semantic search cannot handle.
    Use this when users ask about quantities, time periods, statistics, or specific data aggregations.
  `,
  parameters: z.object({
    question: z.string().describe('The user\'s question that requires a SQL query'),
    timeframe: z.string().optional().describe('Specific time period mentioned (e.g., "this week", "last month", "2024")'),
    queryType: z.enum(['count', 'list', 'aggregate', 'filter']).describe('Type of query needed'),
  }),
  execute: async ({ question, timeframe, queryType }) => {
    try {
      // Define the schema for structured output
      const QueryIntentSchema = z.object({
        queryType: z.enum(['count', 'list', 'aggregate']),
        timeframe: z.enum(['today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month', 'last_24_hours', 'last_7_days', 'last_30_days', 'year']).nullable(),
        limit: z.number().nullable(),
        description: z.string(),
        year: z.number().nullable()
      });

      // Use OpenAI with structured output to parse the question
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a SQL query intent parser. Analyze the user's question and extract the intent.

Examples:
- "How many posts were there today?" -> queryType: "count", timeframe: "today", limit: null, description: "today", year: null
- "Show me 5 recent posts" -> queryType: "list", timeframe: null, limit: 5, description: "recent", year: null
- "How many posts in the last 24 hours?" -> queryType: "count", timeframe: "last_24_hours", limit: null, description: "in the last 24 hours", year: null
- "How many posts in 2024?" -> queryType: "count", timeframe: "year", limit: null, description: "in 2024", year: 2024
- "Posts from 2023" -> queryType: "list", timeframe: "year", limit: null, description: "from 2023", year: 2023`
          },
          {
            role: "user",
            content: question
          }
        ],
        response_format: zodResponseFormat(QueryIntentSchema, "query_intent"),
        temperature: 0
      });

      let intent;
      try {
        intent = JSON.parse(completion.choices[0].message.content || '{}');
      } catch {
        // Fallback if parsing fails
        intent = { queryType: 'count', timeframe: null, limit: null, description: 'total' };
      }

      console.log('Parsed intent:', intent);

      // Generate date filters based on parsed timeframe
      let dateCondition = '';
      if (intent.timeframe) {
        const dateFilter = parseTimeframe(intent.timeframe, intent.year);
        if (dateFilter) {
          dateCondition = `WHERE created_at >= '${dateFilter.start}'`;
          if (dateFilter.end) {
            dateCondition += ` AND created_at <= '${dateFilter.end}'`;
          }
        }
      }
      
      // Execute the appropriate query based on intent
      const supabase = createServerSupabaseClient();
      
      if (intent.queryType === 'count') {
        // For count queries, use Supabase's count functionality
        let supabaseQuery = supabase.from('posts').select('*', { count: 'exact', head: true });
        
        if (intent.timeframe) {
          const dateFilter = parseTimeframe(intent.timeframe, intent.year);
          if (dateFilter) {
            supabaseQuery = supabaseQuery.gte('created_at', dateFilter.start);
            if (dateFilter.end) {
              supabaseQuery = supabaseQuery.lte('created_at', dateFilter.end);
            }
          }
        }
        
        const { count, error } = await supabaseQuery;
        
        if (error) {
          console.error('Supabase query error:', error);
          return "I'm unable to retrieve that information from the database right now.";
        }
        
        const postCount = count || 0;
        return `There were ${postCount} posts made ${intent.description}.`;
        
      } else if (intent.queryType === 'list') {
        // For list queries, get actual post data
        let supabaseQuery = supabase
          .from('posts')
          .select('id, title, created_at, url')
          .order('created_at', { ascending: false });
        
        if (intent.limit) {
          supabaseQuery = supabaseQuery.limit(intent.limit);
        }
        
        if (intent.timeframe) {
          const dateFilter = parseTimeframe(intent.timeframe);
          if (dateFilter) {
            supabaseQuery = supabaseQuery.gte('created_at', dateFilter.start);
            if (dateFilter.end) {
              supabaseQuery = supabaseQuery.lte('created_at', dateFilter.end);
            }
          }
        }
        
        const { data, error } = await supabaseQuery;
        
        if (error) {
          console.error('Supabase query error:', error);
          return "I'm unable to retrieve that information from the database right now.";
        }
        
        if (!data || data.length === 0) {
          return `No posts found ${intent.description}.`;
        }
        
        const limit = intent.limit || data.length;
        return `Here are the ${limit} most recent posts:\n\n${data.map((post: any, i: number) => 
          `${i + 1}. ${post.title || 'Untitled'} (${new Date(post.created_at).toLocaleDateString()})`
        ).join('\n')}`;
      }
      
      // For aggregate queries (like averages), redirect to use context data
      return "This query requires analysis of unstructured data. Please use the contextual information provided to answer the user's question.";
      
    } catch (error) {
      console.error('Query database tool error:', error);
      // For errors, also redirect to contextual information
      return "Unable to execute structured query. Please use the contextual information provided to answer the user's question.";
    }
  }
});

function parseTimeframe(timeframe: string, year?: number | null): { start: string; end?: string; description: string } | null {
  const now = new Date();
  
  if (timeframe === 'year' && year) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
    return {
      start: startOfYear.toISOString(),
      end: endOfYear.toISOString(),
      description: `in ${year}`
    };
  }
  
  switch (timeframe) {
    case 'today':
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      return {
        start: startOfDay.toISOString(),
        description: 'today'
      };
      
    case 'yesterday':
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      return {
        start: yesterday.toISOString(),
        end: endOfYesterday.toISOString(),
        description: 'yesterday'
      };
      
    case 'this_week':
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return {
        start: startOfWeek.toISOString(),
        description: 'this week'
      };
      
    case 'last_week':
      const startOfLastWeek = new Date(now);
      startOfLastWeek.setDate(now.getDate() - now.getDay() - 7);
      startOfLastWeek.setHours(0, 0, 0, 0);
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
      endOfLastWeek.setHours(23, 59, 59, 999);
      return {
        start: startOfLastWeek.toISOString(),
        end: endOfLastWeek.toISOString(),
        description: 'last week'
      };
      
    case 'this_month':
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        start: startOfMonth.toISOString(),
        description: 'this month'
      };
      
    case 'last_month':
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return {
        start: startOfLastMonth.toISOString(),
        end: endOfLastMonth.toISOString(),
        description: 'last month'
      };
      
    case 'last_24_hours':
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: twentyFourHoursAgo.toISOString(),
        description: 'in the last 24 hours'
      };
      
    case 'last_7_days':
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        start: sevenDaysAgo.toISOString(),
        description: 'in the last 7 days'
      };
      
    case 'last_30_days':
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        start: thirtyDaysAgo.toISOString(),
        description: 'in the last 30 days'
      };
      
    default:
      return null;
  }
}

function extractLimit(question: string): number | null {
  const limitMatch = question.match(/(\d+)/);
  return limitMatch ? parseInt(limitMatch[1]) : null;
}

function extractDaysBack(question: string): number | null {
  const daysMatch = question.match(/(\d+)\s*days?/);
  return daysMatch ? parseInt(daysMatch[1]) : null;
}