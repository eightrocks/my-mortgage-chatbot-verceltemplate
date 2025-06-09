'use client';

import type { UIMessage } from 'ai';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState, useEffect } from 'react';
import type { Vote } from '@/lib/db/schema';
import { DocumentToolCall, DocumentToolResult } from './document';
import { PencilEditIcon, SparklesIcon } from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { PreviewAttachment } from './preview-attachment';
import { Weather } from './weather';
import { WidgetContainer } from './widgets/widget-container';
import equal from 'fast-deep-equal';
import { cn, sanitizeText } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { MessageEditor } from './message-editor';
import { DocumentPreview } from './document-preview';
import { MessageReasoning } from './message-reasoning';
import type { UseChatHelpers } from '@ai-sdk/react';

interface SourceItem {
  type: 'attachment' | 'post' | 'comment';
  title: string;
  url?: string;
  s3_key?: string;
  post_id?: number;
  post_url?: string; // For attachments: link to the original post
  created_at?: string;
}

// Function to parse citations and make them clickable - Perplexity style
function parseCitations(text: string, sources: SourceItem[]): string {
  console.log('Citation Debug:', { sources: sources.length, text: text.substring(0, 200) });
  const citationRegex = /\[([^\]]+)\]/g;
  
  // First convert basic markdown to HTML
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  
  // Wrap in paragraph tags
  html = `<p>${html}</p>`;
  
  // Then replace citations with clickable links
  html = html.replace(citationRegex, (match, capturedContent: string) => {
    const numbers = capturedContent.split(',').map((numStr) => numStr.trim());
    
    const linksHtml = numbers
      .map((numStr) => {
        const number = parseInt(numStr);
        if (isNaN(number) || number < 1 || number > sources.length) {
          console.log(`Citation ${numStr} invalid: number=${number}, sources.length=${sources.length}`);
          return `[${numStr}]`; // Return as-is if invalid
        }
        
        const source = sources[number - 1];
        if (!source) {
          console.log(`Citation ${numStr} no source found`);
          return `[${numStr}]`;
        }
        
        console.log(`Citation ${numStr}:`, { 
          hasUrl: !!source.url, 
          hasPostUrl: !!source.post_url,
          type: source.type, 
          title: source.title,
          post_id: source.post_id,
          url: source.url ? source.url.substring(0, 50) + '...' : null,
          post_url: source.post_url ? source.post_url.substring(0, 50) + '...' : null
        });
        
        // Create clickable link(s) that open URL directly
        if (source.type === 'attachment' && source.url && source.post_url) {
          // For attachments, show both attachment link and post link
          return `<a href="${source.url}" target="_blank" rel="noopener noreferrer" class="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded text-xs font-mono hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors mx-0.5">${numStr}</a><a href="${source.post_url}" target="_blank" rel="noopener noreferrer" class="inline-block bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-1.5 py-0.5 rounded text-xs font-mono hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors mx-0.5">📝</a>`;
        } else if (source.url) {
          return `<a href="${source.url}" target="_blank" rel="noopener noreferrer" class="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded text-xs font-mono hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors mx-0.5">${numStr}</a>`;
        } else {
          return `<a href="#source-${number}" class="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded text-xs font-mono hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors mx-0.5">${numStr}</a>`;
        }
      })
      .join('');
    
    return linksHtml;
  });
  
  return html;
}

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
  requiresScrollPadding,
  sources,
}: {
  chatId: string;
  message: UIMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers['setMessages'];
  reload: UseChatHelpers['reload'];
  isReadonly: boolean;
  requiresScrollPadding: boolean;
  sources?: SourceItem[];
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            },
          )}
        >
          {message.role === 'assistant' && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div
            className={cn('flex flex-col gap-4 w-full', {
              'min-h-96': message.role === 'assistant' && requiresScrollPadding,
            })}
          >
            {message.experimental_attachments &&
              message.experimental_attachments.length > 0 && (
                <div
                  data-testid={`message-attachments`}
                  className="flex flex-row justify-end gap-2"
                >
                  {message.experimental_attachments.map((attachment) => (
                    <PreviewAttachment
                      key={attachment.url}
                      attachment={attachment}
                    />
                  ))}
                </div>
              )}

            {message.parts?.map((part, index) => {
              const { type } = part;
              const key = `message-${message.id}-part-${index}`;

              if (type === 'reasoning') {
                return (
                  <MessageReasoning
                    key={key}
                    isLoading={isLoading}
                    reasoning={part.reasoning}
                  />
                );
              }

              if (type === 'text') {
                if (mode === 'view') {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      {message.role === 'user' && !isReadonly && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              data-testid="message-edit-button"
                              variant="ghost"
                              className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                              onClick={() => {
                                setMode('edit');
                              }}
                            >
                              <PencilEditIcon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit message</TooltipContent>
                        </Tooltip>
                      )}

                      <div
                        data-testid="message-content"
                        className={cn('flex flex-col gap-4', {
                          'bg-primary text-primary-foreground px-3 py-2 rounded-xl':
                            message.role === 'user',
                        })}
                      >
                        {message.role === 'assistant' && sources?.length ? (
                          <div 
                            className="prose prose-sm max-w-none dark:prose-invert"
                            dangerouslySetInnerHTML={{ 
                              __html: parseCitations(sanitizeText(part.text), sources) 
                            }} 
                          />
                        ) : (
                          <Markdown>{sanitizeText(part.text)}</Markdown>
                        )}
                      </div>

                    </div>
                  );
                }

                if (mode === 'edit') {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      <div className="size-8" />

                      <MessageEditor
                        key={message.id}
                        message={message}
                        setMode={setMode}
                        setMessages={setMessages}
                        reload={reload}
                      />
                    </div>
                  );
                }
              }

              if (type === 'tool-invocation') {
                const { toolInvocation } = part;
                const { toolName, toolCallId, state } = toolInvocation;

                if (state === 'call') {
                  const { args } = toolInvocation;

                  return (
                    <div
                      key={toolCallId}
                      className={cx({
                        skeleton: ['getWeather'].includes(toolName),
                      })}
                    >
                      {toolName === 'getWeather' ? (
                        <Weather />
                      ) : toolName === 'createDocument' ? (
                        <DocumentPreview isReadonly={isReadonly} args={args} />
                      ) : toolName === 'updateDocument' ? (
                        <DocumentToolCall
                          type="update"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === 'requestSuggestions' ? (
                        <DocumentToolCall
                          type="request-suggestions"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : null}
                    </div>
                  );
                }

                if (state === 'result') {
                  const { result } = toolInvocation;

                  return (
                    <div key={toolCallId}>
                      {toolName === 'getWeather' ? (
                        <Weather weatherAtLocation={result} />
                      ) : toolName === 'createDocument' ? (
                        <DocumentPreview
                          isReadonly={isReadonly}
                          result={result}
                        />
                      ) : toolName === 'updateDocument' ? (
                        <DocumentToolResult
                          type="update"
                          result={result}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === 'requestSuggestions' ? (
                        <DocumentToolResult
                          type="request-suggestions"
                          result={result}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === 'suggestWidgets' ? (
                        <WidgetContainer widgetData={result} />
                      ) : toolName === 'queryDatabase' ? (
                        <div className="text-sm">{result}</div>
                      ) : (
                        <pre>{JSON.stringify(result, null, 2)}</pre>
                      )}
                    </div>
                  );
                }
              }
            })}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.id !== nextProps.message.id) return false;
    if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding)
      return false;
    if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;
    if (!equal(prevProps.sources, nextProps.sources)) return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-4 group/message min-h-96"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Hmm...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
