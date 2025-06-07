'use client';

import { useEffect, useState } from 'react';
import { AttachmentWidget } from './attachment-widget';
import { PostLinksWidget } from './post-links-widget';
import { generateMultiplePresignedUrls } from '@/lib/s3';

interface WidgetContainerProps {
  widgetData?: {
    showAttachments?: boolean;
    showPosts?: boolean;
    attachmentTitle?: string;
    postTitle?: string;
    selectedAttachments?: Array<{
      s3_key: string;
      post_id: number;
      extracted_text?: string;
      created_at?: string;
    }>;
    selectedPosts?: Array<{
      id: number;
      title: string;
      url: string;
      created_at?: string;
    }>;
  };
}

export function WidgetContainer({ widgetData }: WidgetContainerProps) {
  const [attachmentsWithUrls, setAttachmentsWithUrls] = useState<Array<{
    s3_key: string;
    presigned_url: string;
    post_id: number;
    extracted_text?: string;
    created_at?: string;
  }>>([]);
  const [isLoadingUrls, setIsLoadingUrls] = useState(false);

  useEffect(() => {
    const generateUrls = async () => {
      if (!widgetData?.showAttachments || !widgetData.selectedAttachments?.length) {
        return;
      }

      setIsLoadingUrls(true);
      try {
        const s3Keys = widgetData.selectedAttachments.map(att => att.s3_key);
        const urlMap = await generateMultiplePresignedUrls(s3Keys);
        
        const attachmentsWithUrls = widgetData.selectedAttachments
          .filter(att => urlMap[att.s3_key]) // Only include attachments with successful URL generation
          .map(att => ({
            ...att,
            presigned_url: urlMap[att.s3_key]
          }));
        
        setAttachmentsWithUrls(attachmentsWithUrls);
      } catch (error) {
        console.error('Failed to generate presigned URLs:', error);
        setAttachmentsWithUrls([]);
      } finally {
        setIsLoadingUrls(false);
      }
    };

    generateUrls();
  }, [widgetData?.showAttachments, widgetData?.selectedAttachments]);

  if (!widgetData) {
    return null;
  }

  return (
    <div className="space-y-4">
      {widgetData.showAttachments && (
        <AttachmentWidget
          attachments={attachmentsWithUrls}
          title={widgetData.attachmentTitle}
        />
      )}
      
      {widgetData.showPosts && widgetData.selectedPosts && (
        <PostLinksWidget
          posts={widgetData.selectedPosts}
          title={widgetData.postTitle}
        />
      )}
    </div>
  );
}