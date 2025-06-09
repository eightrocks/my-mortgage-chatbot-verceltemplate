import { createServerSupabaseClient } from './supabase';
import OpenAI from 'openai';

// Configuration constants from migration document
const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSION = 1536;
const SIMILARITY_THRESHOLD = 0.3; // Increased threshold for better performance
const MAX_RESULTS_PER_TABLE = 3; // Get 3 per table for better data coverage
const MAX_CONTEXT_LENGTH = 3000;

interface RetrievedContext {
    source: string;
    content: string;
    post_id?: number;
    s3_key?: string;
    created_at?: string;
    url?: string;
}

export type SourceItem = {
    type: 'attachment' | 'post' | 'comment';
    title: string;
    url?: string; // For posts, or presigned URL for attachments (generated later)
    s3_key?: string; // For attachments
    post_id?: number;
    post_url?: string; // For attachments: link to the original post (from posts table)
    created_at?: string;
}

interface WidgetData {
    attachments: Array<{
        s3_key: string;
        post_id: number;
        extracted_text?: string;
        created_at?: string;
    }>;
    posts: Array<{
        id: number;
        title: string;
        url: string;
        created_at?: string;
    }>;
}

async function generateEmbedding(text: string): Promise<number[] | null> {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
        console.error("OpenAI API Key is missing for embedding generation.");
        return null;
    }
    
    const openai = new OpenAI({ apiKey: openaiApiKey });
    
    try {
        const response = await openai.embeddings.create({
            model: EMBEDDING_MODEL,
            input: text.replace(/\n/g, ' '),
            dimensions: EMBEDDING_DIMENSION,
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        return null;
    }
}

// Add timeout wrapper for individual RPC calls
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => 
            setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
        )
    ]);
}

async function vectorSearch(queryEmbedding: number[], limitPerTable: number = MAX_RESULTS_PER_TABLE): Promise<{ context: RetrievedContext[], widgets: WidgetData, sources: SourceItem[] }> {
    const supabase = createServerSupabaseClient();
    
    if (!queryEmbedding) return { context: [], widgets: { attachments: [], posts: [] }, sources: [] };
    let results: RetrievedContext[] = [];
    const widgetData: WidgetData = { attachments: [], posts: [] };
    const sources: SourceItem[] = [];
    const rpcParams = {
        query_embedding: queryEmbedding,
        match_threshold: SIMILARITY_THRESHOLD,
        match_count: limitPerTable
    };

    // Individual search functions with better error handling
    const searchPosts = async (): Promise<RetrievedContext[]> => {
        try {
            const { data, error } = await withTimeout(
                Promise.resolve(supabase.rpc("match_posts_embeddings", rpcParams)),
                10000 // 10 second timeout
            );
            if (error) {
                console.error("Error matching posts:", error);
                return [];
            }
            const postResults = data?.map((post: any) => ({ 
                source: `Reddit Post: ${post.title || 'Untitled'}`, 
                content: post.text || '', 
                post_id: post.id,
                created_at: post.created_at,
                url: post.url
            })) || [];
            
            // Collect widget data and sources for posts
            data?.forEach((post: any) => {
                if (post.title && post.url && post.id) {
                    widgetData.posts.push({
                        id: post.id,
                        title: post.title,
                        url: post.url,
                        created_at: post.created_at
                    });
                    
                    // Add to sources array for citations
                    sources.push({
                        type: 'post',
                        title: post.title,
                        url: post.url,
                        post_id: post.id,
                        created_at: post.created_at
                    });
                }
            });
            
            return postResults;
        } catch (error) {
            console.error("Posts search failed or timed out:", error);
            return [];
        }
    };

    const searchComments = async (): Promise<RetrievedContext[]> => {
        try {
            const { data, error } = await withTimeout(
                Promise.resolve(supabase.rpc("match_comments_embeddings", rpcParams)),
                10000 // 10 second timeout
            );
            if (error) {
                console.error("Error matching comments:", error);
                return [];
            }
            return data?.map((comment: any) => ({ 
                source: `Comment on Post ${comment.post_id}`, 
                content: comment.body || '', 
                post_id: comment.post_id
            })) || [];
        } catch (error) {
            console.error("Comments search failed or timed out:", error);
            return [];
        }
    };

    const searchAttachments = async (): Promise<RetrievedContext[]> => {
        try {
            const { data, error } = await withTimeout(
                Promise.resolve(supabase.rpc("match_attachments_embeddings", rpcParams)),
                10000 // 10 second timeout
            );
            if (error) {
                console.error("Error matching attachments:", error);
                return [];
            }
            const attachmentResults = data?.map((attachment: any) => ({ 
                source: `Document from Post ${attachment.post_id}`, 
                content: attachment.extracted_text || '', 
                post_id: attachment.post_id,
                s3_key: attachment.s3_key,
                created_at: attachment.created_at
            })) || [];
            
            // Collect widget data and sources for attachments
            data?.forEach((attachment: any) => {
                if (attachment.s3_key && attachment.post_id) {
                    widgetData.attachments.push({
                        s3_key: attachment.s3_key,
                        post_id: attachment.post_id,
                        extracted_text: attachment.extracted_text,
                        created_at: attachment.created_at
                    });
                    
                    // Add to sources array for citations
                    // Generate a descriptive title based on s3_key
                    const fileName = attachment.s3_key.split('/').pop() || attachment.s3_key;
                    sources.push({
                        type: 'attachment',
                        title: fileName,
                        s3_key: attachment.s3_key,
                        post_id: attachment.post_id,
                        created_at: attachment.created_at
                        // post_url will be populated later during ordering
                    });
                }
            });
            
            return attachmentResults;
        } catch (error) {
            console.error("Attachments search failed or timed out:", error);
            return [];
        }
    };

    // Use Promise.allSettled to continue even if some searches fail
    try {
        const searchResults = await Promise.allSettled([
            searchPosts(),
            searchComments(),
            searchAttachments()
        ]);
        
        // Collect results from successful searches only
        searchResults.forEach((result) => {
            if (result.status === 'fulfilled') {
                results.push(...result.value);
            }
        });
        
        console.log(`Vector search completed: ${results.length} results from ${searchResults.filter(r => r.status === 'fulfilled').length}/3 tables`);
    } catch (error) {
        console.error('Error in vector search:', error);
    }
    
    // Fetch missing post URLs for attachments that aren't in RAG results
    const attachmentPostIds = sources
        .filter(s => s.type === 'attachment' && s.post_id)
        .map(s => s.post_id!);
    
    const existingPostIds = sources
        .filter(s => s.type === 'post' && s.post_id)
        .map(s => s.post_id!);
    
    const missingPostIds = attachmentPostIds.filter(id => !existingPostIds.includes(id));
    
    // Fetch missing posts from database
    const missingPosts: SourceItem[] = [];
    if (missingPostIds.length > 0) {
        try {
            const { data: missingPostsData } = await supabase
                .from('posts')
                .select('id, title, url')
                .in('id', missingPostIds);
            
            if (missingPostsData) {
                missingPostsData.forEach(post => {
                    missingPosts.push({
                        type: 'post',
                        title: post.title,
                        url: post.url,
                        post_id: post.id
                    });
                });
            }
        } catch (error) {
            console.error('Error fetching missing posts for attachments:', error);
        }
    }
    
    // Combine all sources: original + missing posts
    const allSources = [...sources, ...missingPosts];
    console.log(`Total sources after fetching missing posts: ${allSources.length} (original: ${sources.length}, missing: ${missingPosts.length})`);

    // Ensure sources and context are in the same order for easy citation
    const orderedSources: SourceItem[] = [];
    const orderedContext: RetrievedContext[] = [];
    
    // First add all results and build parallel ordered arrays
    results.forEach(contextItem => {
        orderedContext.push(contextItem);
        
        // Find corresponding source
        const matchingSource = allSources.find(source => {
            if (source.type === 'attachment' && contextItem.s3_key) {
                return source.s3_key === contextItem.s3_key;
            }
            if (source.type === 'post' && contextItem.post_id) {
                return source.post_id === contextItem.post_id;
            }
            return false;
        });
        
        if (matchingSource) {
            // If it's an attachment source, try to find the related post URL
            if (matchingSource.type === 'attachment' && matchingSource.post_id && !matchingSource.post_url) {
                const relatedPost = allSources.find(source => 
                    source.type === 'post' && source.post_id === matchingSource.post_id
                );
                orderedSources.push({
                    ...matchingSource,
                    post_url: relatedPost?.url
                });
            } else {
                orderedSources.push(matchingSource);
            }
        } else {
            // Create a fallback source if no match found
            if (contextItem.s3_key) {
                // For attachments, find the post URL using post_id
                const relatedPost = allSources.find(source => 
                    source.type === 'post' && source.post_id === contextItem.post_id
                );
                
                orderedSources.push({
                    type: 'attachment',
                    title: contextItem.s3_key.split('/').pop() || contextItem.s3_key,
                    s3_key: contextItem.s3_key,
                    post_id: contextItem.post_id,
                    post_url: relatedPost?.url // Link to the original post
                });
            } else if (contextItem.url) {
                orderedSources.push({
                    type: 'post',
                    title: contextItem.source.replace('Reddit Post: ', ''),
                    url: contextItem.url,
                    post_id: contextItem.post_id
                });
            }
        }
    });
    
    // Ensure all attachment sources have post_url populated
    const sourcesWithPostUrls = allSources.map(source => {
        if (source.type === 'attachment' && source.post_id && !source.post_url) {
            const relatedPost = allSources.find(s => 
                s.type === 'post' && s.post_id === source.post_id
            );
            return {
                ...source,
                post_url: relatedPost?.url
            };
        }
        return source;
    });
    
    return { context: orderedContext, widgets: widgetData, sources: sourcesWithPostUrls };
}

async function getDatabaseStats(): Promise<Record<string, number>> {
    const supabase = createServerSupabaseClient();
    const stats: Record<string, number> = { posts: 0, comments: 0, attachments: 0 };
    try {
        const [{ count: postsCount }, { count: commentsCount }, { count: attachmentsCount }] = await Promise.all([
            supabase.from('posts').select('id', { count: 'exact', head: true }),
            supabase.from('comments').select('post_id', { count: 'exact', head: true }),
            supabase.from('attachments').select('post_id', { count: 'exact', head: true })
        ]);
        stats.posts = postsCount || 0;
        stats.comments = commentsCount || 0;
        stats.attachments = attachmentsCount || 0;
    } catch (error) {
        console.error('Error getting database stats:', error);
    }
    return stats;
}

export async function getRAGContext(userInput: string): Promise<{ context: RetrievedContext[], widgets: WidgetData, sources: SourceItem[], dbStats: Record<string, number> }> {
    const queryEmbedding = await generateEmbedding(userInput);
    if (!queryEmbedding) {
        return { context: [], widgets: { attachments: [], posts: [] }, sources: [], dbStats: {} };
    }
    
    const [searchResults, dbStats] = await Promise.all([
        vectorSearch(queryEmbedding),
        getDatabaseStats()
    ]);
    
    return { 
        context: searchResults.context, 
        widgets: searchResults.widgets,
        sources: searchResults.sources,
        dbStats 
    };
}

export function formatRAGContext(context: RetrievedContext[], dbStats: Record<string, number>): string {
    const statsString = `Posts: ${dbStats.posts}, Comments: ${dbStats.comments}, Attachments: ${dbStats.attachments}`;
    
    if (context.length === 0) {
        return `Database stats: ${statsString}`;
    }
    
    let contextText = context.map(item => `SOURCE: ${item.source}\n${item.content}`).join('\n\n');
    if (contextText.length > MAX_CONTEXT_LENGTH) {
        contextText = contextText.substring(0, MAX_CONTEXT_LENGTH) + "...";
    }
    
    return `Database stats: ${statsString}\n\nRelevant information from r/firsttimehomebuyer:\n\n${contextText}`;
}

export function formatRAGContextWithSources(context: RetrievedContext[], sources: SourceItem[], dbStats: Record<string, number>): string {
    const statsString = `Posts: ${dbStats.posts}, Comments: ${dbStats.comments}, Attachments: ${dbStats.attachments}`;
    
    if (context.length === 0 && sources.length === 0) {
        return `Database stats: ${statsString}`;
    }
    
    let result = `Database stats: ${statsString}\n\n`;
    
    // Add numbered sources for citation
    if (sources.length > 0) {
        result += `SOURCES FOR CITATION:\n`;
        sources.forEach((source, index) => {
            const sourceNum = index + 1;
            result += `[${sourceNum}] ${source.title} (${source.type})\n`;
        });
        result += `\nWhen referencing information from these sources, use [1], [2], [3] etc. in your response.\n\n`;
        console.log(`AI Prompt - Sources section:`, sources.map((s, i) => ({ num: i+1, title: s.title, type: s.type })));
    }
    
    // Add context content with source numbers for easy citation
    if (context.length > 0) {
        result += `CONTEXT FROM r/firsttimehomebuyer:\n\n`;
        
        // Since sources and context are now in the same order, we can directly map
        const contextWithSourceNumbers = context.map((item, index) => {
            const sourceNum = index + 1;
            return `[${sourceNum}] ${item.source}\n${item.content}`;
        });
        
        let contextText = contextWithSourceNumbers.join('\n\n');
        if (contextText.length > MAX_CONTEXT_LENGTH) {
            contextText = contextText.substring(0, MAX_CONTEXT_LENGTH) + "...";
        }
        result += contextText;
    }
    
    return result;
}