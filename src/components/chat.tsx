import { LoaderCircle } from 'lucide-react';
import { EmptyChat } from '@/components/empty-chat';
import { ChatMessage } from '@/shared/types';
import { DatasetResultCard } from '@/components/chat/dataset-result-card';

type ChatProps = {
  isLoading: boolean;
  chatHistory: ChatMessage[];
};

function MessageContent({ content }: { content: string }) {
  // Try to parse as JSON for dataset results
  try {
    const parsed = JSON.parse(content);
    if (parsed.success !== undefined && parsed.datasetId) {
      return <DatasetResultCard result={parsed} />;
    }
  } catch {
    // Not JSON, render as text with markdown-like formatting
  }

  // Simple markdown-like rendering
  const renderText = (text: string) => {
    // Split by lines
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold text
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={idx} className="font-bold text-gray-900 mt-2">
            {line.slice(2, -2)}
          </p>
        );
      }
      // Bullet points
      if (line.startsWith('•') || line.startsWith('-')) {
        return (
          <p key={idx} className="text-gray-700 ml-4">
            {line}
          </p>
        );
      }
      // Regular text
      if (line.trim()) {
        return (
          <p key={idx} className="text-gray-700">
            {line}
          </p>
        );
      }
      // Empty line
      return <div key={idx} className="h-2" />;
    });
  };

  return <div className="space-y-1">{renderText(content)}</div>;
}

export function Chat({ chatHistory, isLoading }: ChatProps) {
  return (
    <div className="h-full flex flex-col gap-4 p-6 overflow-y-auto">
      {chatHistory.map((message, idx) => (
        <div key={idx} className="flex animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
          {message.type === 'human' ? (
            <div className="bg-blue-600 inline-block px-5 py-3 rounded-2xl ml-auto max-w-[80%] shadow-sm">
              <p className="text-white font-medium">{message.content}</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 inline-block px-5 py-4 rounded-2xl max-w-[90%] shadow-sm">
              <MessageContent content={message.content} />
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="flex animate-pulse">
          <div className="bg-white border border-gray-200 inline-block px-5 py-3 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2">
              <LoaderCircle className="animate-spin text-blue-600 w-5 h-5" />
              <span className="text-gray-600 text-sm">Thinking...</span>
            </div>
          </div>
        </div>
      )}

      <EmptyChat isChatEmpty={chatHistory.length <= 0} />
    </div>
  );
}
