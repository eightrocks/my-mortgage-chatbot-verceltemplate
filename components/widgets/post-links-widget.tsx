'use client';

import { ExternalLink, MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PostLinksWidgetProps {
  posts: Array<{
    id: number;
    title: string;
    url: string;
    created_at?: string;
    comment_count?: number;
    score?: number;
  }>;
  title?: string;
}

export function PostLinksWidget({ posts, title = "Related Posts" }: PostLinksWidgetProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else if (diffInHours < 24 * 30) {
      return `${Math.floor(diffInHours / (24 * 7))}w ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'reddit.com';
    }
  };

  return (
    <Card className="mt-4 border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          {title}
        </CardTitle>
        <CardDescription className="text-xs">
          {posts.length} relevant post{posts.length !== 1 ? 's' : ''} from r/firsttimehomebuyer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="border rounded-lg p-3 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium line-clamp-2 mb-1">
                  {post.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.created_at ? formatTimeAgo(post.created_at) : 'Unknown'}
                  </span>
                  {post.comment_count !== undefined && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {post.comment_count} comments
                    </span>
                  )}
                  {post.score !== undefined && (
                    <span>
                      {post.score} points
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {extractDomain(post.url)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(post.url, '_blank')}
                className="h-8 w-8 p-0 flex-shrink-0"
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}