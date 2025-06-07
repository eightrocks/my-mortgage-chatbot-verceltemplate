'use client';

import { useState } from 'react';
import { ExternalLink, FileText, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AttachmentWidgetProps {
  attachments: Array<{
    s3_key: string;
    presigned_url: string;
    post_id: number;
    extracted_text?: string;
    file_type?: string;
    created_at?: string;
  }>;
  title?: string;
}

export function AttachmentWidget({ attachments, title = "Related Documents" }: AttachmentWidgetProps) {
  const [expandedAttachment, setExpandedAttachment] = useState<string | null>(null);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const getFileIcon = (s3Key: string) => {
    const extension = s3Key.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Eye className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getFileName = (s3Key: string) => {
    return s3Key.split('/').pop() || s3Key;
  };

  const isImageFile = (s3Key: string) => {
    const extension = s3Key.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '');
  };

  return (
    <Card className="mt-4 border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileText className="w-4 h-4" />
          {title}
        </CardTitle>
        <CardDescription className="text-xs">
          {attachments.length} document{attachments.length !== 1 ? 's' : ''} found
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {attachments.map((attachment, index) => (
          <div
            key={attachment.s3_key}
            className="border rounded-lg p-3 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getFileIcon(attachment.s3_key)}
                <span className="text-sm font-medium truncate">
                  {getFileName(attachment.s3_key)}
                </span>
                {attachment.created_at && (
                  <span className="text-xs text-gray-500 ml-auto">
                    {new Date(attachment.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 ml-2">
                {isImageFile(attachment.s3_key) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setExpandedAttachment(
                        expandedAttachment === attachment.s3_key ? null : attachment.s3_key
                      );
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(attachment.presigned_url, '_blank')}
                  className="h-8 w-8 p-0"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {/* Show extracted text preview if available */}
            {attachment.extracted_text && (
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {attachment.extracted_text.substring(0, 100)}...
              </div>
            )}
            
            {/* Show image preview when expanded */}
            {expandedAttachment === attachment.s3_key && isImageFile(attachment.s3_key) && (
              <div className="mt-3 border rounded-lg overflow-hidden">
                <img
                  src={attachment.presigned_url}
                  alt={getFileName(attachment.s3_key)}
                  className="w-full max-h-64 object-contain bg-gray-100 dark:bg-gray-900"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}