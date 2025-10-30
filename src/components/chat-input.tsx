'use client';

import { Dispatch, SetStateAction } from 'react';

type ChatInputProps = {
  isPending: boolean;
  prompt: string;
  setPrompt: Dispatch<SetStateAction<string>>;
  handleUserMessage: () => void;
};

export function ChatInput({ handleUserMessage, setPrompt, isPending, prompt }: ChatInputProps) {
  return (
    <form 
      className="flex gap-3" 
      onSubmit={(e) => {
        e.preventDefault();
        if (!isPending && prompt.trim()) {
          handleUserMessage();
        }
      }}
    >
      <input
        disabled={isPending}
        className="flex-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        placeholder="Ask me to generate a dataset..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !isPending && prompt.trim()) {
            e.preventDefault();
            handleUserMessage();
          }
        }}
      />
      <button
        disabled={isPending || !prompt.trim()}
        type="submit"
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
        onClick={handleUserMessage}
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </span>
        ) : (
          'Send'
        )}
      </button>
    </form>
  );
}
