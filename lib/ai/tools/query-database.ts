import { z } from 'zod';
import { tool } from 'ai';
import { createServerSupabaseClient } from '../../supabase';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';

export const queryDatabase = tool({
  description: `
    Query the database with dynamically generated SQL for data analysis and statistics. 
    This tool can generate and execute SQL queries to answer questions about mortgage data,
    post counts, date ranges, statistics, regional analysis, and other structured data questions.
    Use this when users ask about quantities, averages, comparisons, time periods, or data aggregations.
  `,
  parameters: z.object({
    question: z.string().describe('The user\'s question that requires a SQL query'),
  }),
  execute: async ({ question }) => {
    console.log(`DEBUG - queryDatabase tool executed with question: "${question}"`);
    try {
      // Database schema information
      const dbSchema = `
Available Tables and Their Purpose:

1. posts table (Reddit posts from mortgage-related subreddits):
   USE FOR: Post counts, recent posts, post metadata, post timing analysis
   - id (integer, primary key)
   - reddit_id (text, unique)
   - title (text)
   - text (text) - the actual post content
   - author (text)  
   - created_utc (bigint)
   - url (text)
   - original_url (text)
   - data (jsonb)
   - created_at (timestamp)
   - embedding (vector) 
   - checkpoint (boolean)

2. mortgage_data_two table (EXTRACTED MORTGAGE DATA from posts):
   USE FOR: ALL mortgage statistics - interest rates, property values, down payments, regional analysis, loan amounts, closing costs
   This table contains the actual financial data extracted from the posts.
   - id (integer, primary key)
   - post_id (integer, foreign key to posts.id)
   - interest_rate (numeric) ⭐ USE THIS FOR INTEREST RATE QUESTIONS
   - down_payment_amount (integer)
   - down_payment_percent (numeric) ⭐ USE THIS FOR DOWN PAYMENT QUESTIONS
   - state (text) ⭐ USE THIS FOR STATE-BASED ANALYSIS
   - region (text) ⭐ USE THIS FOR REGIONAL ANALYSIS
   - loan_amount (integer)
   - property_value (integer) ⭐ USE THIS FOR PROPERTY VALUE QUESTIONS
   - closing_costs (integer)
   - created_at (timestamp)

3. comments table (Reddit comments on posts):
   USE FOR: Comment analysis, discussion volume, comment sentiment
   - id (integer, primary key)
   - reddit_id (text, unique)
   - post_id (integer, foreign key to posts.id)
   - parent_id (text)
   - body (text)
   - author (text)
   - created_utc (bigint)
   - score (integer)
   - created_at (timestamp)
   - embedding (vector)

4. attachments table (Files/images attached to posts):
   USE FOR: Document content analysis, attachment text search
   - id (integer, primary key)
   - post_id (integer, foreign key to posts.id)
   - url (text)
   - s3_key (text)
   - base64_image (text)
   - extracted_text (text) ⭐ MAIN CONTENT - text extracted from attached documents/images
   - embedding (vector)
   - created_at (timestamp)
`;

      // SQL Generation Schema
      const SQLGenerationSchema = z.object({
        sql: z.string().describe('The SQL query to execute'),
        explanation: z.string().describe('Brief explanation of what the query does'),
        requiresResults: z.boolean().describe('Whether this query should return data to the user')
      });

      // Use OpenAI to generate SQL based on schema and question
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      const response = await openai.responses.parse({
        model: "gpt-4o-2024-08-06",
        input: [
          {
            role: "system",
            content: `You are a SQL query generator. Generate safe, efficient SQL queries based on the database schema and user questions.

IMPORTANT RULES:
- Only use SELECT statements, never UPDATE/DELETE/INSERT/DROP
- Always use proper WHERE clauses when filtering
- Use appropriate aggregate functions (AVG, COUNT, SUM, MIN, MAX)  
- Join tables when needed using proper foreign key relationships
- Limit results appropriately (usually 10-50 for lists)
- Use ORDER BY for meaningful sorting
- Handle NULL values appropriately in calculations
- Use ROUND() for decimal places in averages/percentages

DATABASE SCHEMA:
${dbSchema}

EXAMPLES:
- "What's the average interest rate?" -> SELECT AVG(interest_rate) as avg_interest_rate FROM mortgage_data_two WHERE interest_rate IS NOT NULL;
- "Which states have the highest property values?" -> SELECT state, AVG(property_value) as avg_property_value, COUNT(*) as count FROM mortgage_data_two WHERE property_value IS NOT NULL AND state IS NOT NULL GROUP BY state ORDER BY avg_property_value DESC LIMIT 10;
- "Which regions have the highest interest rates?" -> SELECT region, AVG(interest_rate) as avg_rate, COUNT(*) as count FROM mortgage_data_two WHERE interest_rate IS NOT NULL AND region IS NOT NULL GROUP BY region ORDER BY avg_rate DESC;
- "How many posts total?" -> SELECT COUNT(*) as post_count FROM posts;
- "Average down payment by region" -> SELECT region, AVG(down_payment_percent) as avg_down_payment FROM mortgage_data_two WHERE down_payment_percent IS NOT NULL GROUP BY region;`
          },
          {
            role: "user", 
            content: `Generate a SQL query for this question: "${question}"`
          }
        ],
        text: {
          format: zodTextFormat(SQLGenerationSchema, "sql_generation")
        }
      });

      const sqlGeneration = response.output_parsed;
      if (!sqlGeneration) {
        return "Unable to generate appropriate SQL query for your question.";
      }

      console.log('Generated SQL:', sqlGeneration.sql);
      console.log('Explanation:', sqlGeneration.explanation);

      // Execute using Supabase client by parsing the generated SQL
      const supabase = createServerSupabaseClient();
      
      // Parse SQL and convert to Supabase client calls
      const { data, error } = await executeSupabaseFromSQL(supabase, sqlGeneration.sql);

      if (error) {
        console.error('Supabase query execution error:', error);
        return "Unable to execute query. Please try rephrasing your question.";
      }

      if (!data || data.length === 0) {
        return "No data found matching your query.";
      }

      // Format the results
      const resultText = formatQueryResults(data, sqlGeneration.explanation);
      
      console.log(`DEBUG - queryDatabase returning result: "${resultText}"`);
      return resultText;
      
    } catch (error) {
      console.error('Query database tool error:', error);
      return "Unable to execute database query. Please try rephrasing your question.";
    }
  }
});

async function executeSupabaseFromSQL(supabase: any, sql: string): Promise<{ data: any[], error: any }> {
  try {
    console.log('Parsing SQL:', sql);
    
    // Extract table name
    const fromMatch = sql.match(/FROM\s+(\w+)/i);
    if (!fromMatch) {
      return { data: [], error: new Error('No table found in SQL') };
    }
    const tableName = fromMatch[1];
    
    // Extract SELECT clause
    const selectMatch = sql.match(/SELECT\s+(.*?)\s+FROM/i);
    if (!selectMatch) {
      return { data: [], error: new Error('Invalid SELECT clause') };
    }
    const selectClause = selectMatch[1].trim();
    
    // Check if it's an aggregate query
    const isAggregate = /AVG\(|COUNT\(|SUM\(|MIN\(|MAX\(/i.test(selectClause);
    const hasGroupBy = /GROUP BY/i.test(sql);
    
    // Start building Supabase query
    let query = supabase.from(tableName);
    
    if (isAggregate && !hasGroupBy) {
      // Simple aggregate query (e.g., SELECT AVG(interest_rate) FROM mortgage_data_two)
      if (selectClause.includes('COUNT(*)')) {
        const { count, error } = await query.select('*', { count: 'exact', head: true });
        if (error) return { data: [], error };
        return { data: [{ count }], error: null };
      }
      
      // For other aggregates, we need to fetch data and calculate manually
      const columnMatch = selectClause.match(/(?:AVG|SUM|MIN|MAX)\((\w+)\)/i);
      if (columnMatch) {
        const column = columnMatch[1];
        query = query.select(column).not(column, 'is', null);
        
        // Add WHERE conditions if they exist
        const whereConditions = parseWhereClause(sql);
        whereConditions.forEach(condition => {
          query = applyCondition(query, condition);
        });
        
        const { data, error } = await query;
        if (error) return { data: [], error };
        
        // Calculate aggregate
        const values = data.map((row: any) => parseFloat(row[column]) || 0);
        if (values.length === 0) return { data: [], error: null };
        
        let result;
        if (selectClause.toUpperCase().includes('AVG')) {
          result = values.reduce((a: number, b: number) => a + b, 0) / values.length;
        } else if (selectClause.toUpperCase().includes('SUM')) {
          result = values.reduce((a: number, b: number) => a + b, 0);
        } else if (selectClause.toUpperCase().includes('MIN')) {
          result = Math.min(...values);
        } else if (selectClause.toUpperCase().includes('MAX')) {
          result = Math.max(...values);
        }
        
        const resultKey = selectClause.toLowerCase().replace(/[(),\s]/g, '_');
        return { data: [{ [resultKey]: Number(result?.toFixed(2)) }], error: null };
      }
    }
    
    if (hasGroupBy) {
      // GROUP BY queries (e.g., SELECT state, AVG(interest_rate) FROM mortgage_data_two GROUP BY state)
      const groupByMatch = sql.match(/GROUP BY\s+(\w+)/i);
      if (!groupByMatch) {
        return { data: [], error: new Error('Invalid GROUP BY clause') };
      }
      const groupByColumn = groupByMatch[1];
      
      // Get all data for grouping
      const columnsNeeded = extractColumnsFromSelect(selectClause);
      query = query.select(columnsNeeded.join(', ')).not(groupByColumn, 'is', null);
      
      // Add WHERE conditions
      const whereConditions = parseWhereClause(sql);
      whereConditions.forEach(condition => {
        query = applyCondition(query, condition);
      });
      
      const { data, error } = await query;
      if (error) return { data: [], error };
      
      // Group data manually
      const grouped = groupAndAggregate(data, groupByColumn, selectClause);
      
      // Apply ORDER BY if exists
      const orderByMatch = sql.match(/ORDER BY\s+(\w+)\s*(ASC|DESC)?/i);
      if (orderByMatch) {
        const orderColumn = orderByMatch[1];
        const direction = orderByMatch[2]?.toUpperCase() === 'ASC' ? 1 : -1;
        grouped.sort((a: any, b: any) => {
          const aVal = parseFloat(a[orderColumn]) || 0;
          const bVal = parseFloat(b[orderColumn]) || 0;
          return (aVal - bVal) * direction;
        });
      }
      
      // Apply LIMIT if exists
      const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) {
        const limit = parseInt(limitMatch[1]);
        return { data: grouped.slice(0, limit), error: null };
      }
      
      return { data: grouped, error: null };
    }
    
    // Regular SELECT query
    if (selectClause === '*') {
      query = query.select('*');
    } else {
      query = query.select(selectClause);
    }
    
    // Add WHERE conditions
    const whereConditions = parseWhereClause(sql);
    whereConditions.forEach(condition => {
      query = applyCondition(query, condition);
    });
    
    // Add ORDER BY
    const orderByMatch = sql.match(/ORDER BY\s+(\w+)\s*(ASC|DESC)?/i);
    if (orderByMatch) {
      const column = orderByMatch[1];
      const ascending = orderByMatch[2]?.toUpperCase() !== 'DESC';
      query = query.order(column, { ascending });
    }
    
    // Add LIMIT
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1]);
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    return { data: data || [], error };
    
  } catch (err) {
    console.error('SQL parsing error:', err);
    return { data: [], error: err };
  }
}

function parseWhereClause(sql: string): Array<{column: string, operator: string, value: string}> {
  const conditions: Array<{column: string, operator: string, value: string}> = [];
  
  const whereMatch = sql.match(/WHERE\s+(.*?)(?:\s+GROUP BY|\s+ORDER BY|\s+LIMIT|$)/i);
  if (!whereMatch) return conditions;
  
  const whereClause = whereMatch[1];
  
  // Handle IS NOT NULL
  const notNullMatches = whereClause.matchAll(/(\w+)\s+IS\s+NOT\s+NULL/gi);
  for (const match of notNullMatches) {
    conditions.push({ column: match[1], operator: 'IS_NOT_NULL', value: '' });
  }
  
  // Handle equality conditions
  const eqMatches = whereClause.matchAll(/(\w+)\s*=\s*'([^']*)'|\b(\w+)\s*=\s*(\d+)/gi);
  for (const match of eqMatches) {
    const column = match[1] || match[3];
    const value = match[2] || match[4];
    conditions.push({ column, operator: '=', value });
  }
  
  return conditions;
}

function applyCondition(query: any, condition: {column: string, operator: string, value: string}): any {
  switch (condition.operator) {
    case 'IS_NOT_NULL':
      return query.not(condition.column, 'is', null);
    case '=':
      return query.eq(condition.column, condition.value);
    case '>':
      return query.gt(condition.column, condition.value);
    case '<':
      return query.lt(condition.column, condition.value);
    default:
      return query;
  }
}

function extractColumnsFromSelect(selectClause: string): string[] {
  // Extract column names from SELECT clause, handling aggregates
  const columns = [];
  
  // Find aggregate functions and extract their columns
  const aggregateMatches = selectClause.matchAll(/(?:AVG|SUM|MIN|MAX|COUNT)\((\w+)\)/gi);
  for (const match of aggregateMatches) {
    columns.push(match[1]);
  }
  
  // Find regular column names
  const parts = selectClause.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (!/(?:AVG|SUM|MIN|MAX|COUNT)\(/i.test(trimmed) && /^\w+$/.test(trimmed)) {
      columns.push(trimmed);
    }
  }
  
  return [...new Set(columns)]; // Remove duplicates
}

function groupAndAggregate(data: any[], groupColumn: string, selectClause: string): any[] {
  const groups: { [key: string]: any[] } = {};
  
  // Group data
  data.forEach(row => {
    const key = row[groupColumn];
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  });
  
  // Calculate aggregates for each group
  return Object.entries(groups).map(([key, rows]) => {
    const result: any = { [groupColumn]: key };
    
    // Find aggregate functions in SELECT clause
    const aggregateMatches = selectClause.matchAll(/(?:AVG|SUM|MIN|MAX|COUNT)\((\w+)\)(?:\s+as\s+(\w+))?/gi);
    for (const match of aggregateMatches) {
      const column = match[1];
      const alias = match[2] || `${match[0].split('(')[0].toLowerCase()}_${column}`;
      const values = rows.map(row => parseFloat(row[column]) || 0);
      
      if (match[0].toUpperCase().startsWith('AVG')) {
        result[alias] = (values.reduce((a: number, b: number) => a + b, 0) / values.length).toFixed(2);
      } else if (match[0].toUpperCase().startsWith('COUNT')) {
        result[alias] = values.length;
      } else if (match[0].toUpperCase().startsWith('SUM')) {
        result[alias] = values.reduce((a: number, b: number) => a + b, 0);
      }
    }
    
    // Add count
    result.count = rows.length;
    
    return result;
  });
}

function formatQueryResults(data: any[], explanation: string): string {
  if (!data || data.length === 0) {
    return "No data found for your query.";
  }

  // For single row results (like averages, counts)
  if (data.length === 1) {
    const row = data[0];
    const keys = Object.keys(row);
    
    if (keys.length === 1) {
      const key = keys[0];
      const value = row[key];
      
      // Format based on key name
      if (key.includes('avg') || key.includes('average')) {
        return `${explanation}: ${typeof value === 'number' ? value.toFixed(2) : value}`;
      } else if (key.includes('count')) {
        return `${explanation}: ${value}`;
      } else {
        return `${explanation}: ${value}`;
      }
    }
  }

  // For multiple rows (like state comparisons, lists)
  if (data.length <= 10) {
    // Show all results for small datasets
    const headers = Object.keys(data[0]);
    let result = `${explanation}:\n\n`;
    
    data.forEach((row, index) => {
      const rowData = headers.map(header => {
        const value = row[header];
        if (typeof value === 'number' && value % 1 !== 0) {
          return value.toFixed(2);
        }
        return value;
      }).join(' | ');
      
      result += `${index + 1}. ${rowData}\n`;
    });
    
    return result;
  }

  // For large datasets, show summary
  return `${explanation}:\n\nFound ${data.length} results. Here are the first 10:\n\n${
    data.slice(0, 10).map((row, index) => {
      const firstTwoValues = Object.values(row).slice(0, 2);
      return `${index + 1}. ${firstTwoValues.join(' | ')}`;
    }).join('\n')
  }`;
}