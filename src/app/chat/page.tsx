'use client';

import { ChatMessage } from '@/shared/types';
import { useState } from 'react';
import { useHandleChat } from '@/lib/handle-chat';
import { ChatInput } from '@/components/chat-input';
import { Header } from '@/components/header';
import { useDAppConnector } from '@/components/client-providers';
import { Chat } from '@/components/chat';
import { Sparkles, Database, TrendingUp } from 'lucide-react';

export default function Home() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      type: 'ai',
      content: `👋 Welcome to FileThetic AI Assistant!

I'm here to help you generate high-quality synthetic datasets using natural language. 

**What I can do:**
• Generate synthetic datasets from descriptions
• Recommend dataset types for your use case
• Estimate costs and generation time
• Guide you through the dataset creation process

**Try asking me:**
• "Generate a medical diagnosis dataset with 500 samples"
• "Create financial transaction data for fraud detection"
• "I need e-commerce product data with 200 items"
• "What datasets are available for machine learning?"
• "How much will it cost to generate 1000 samples?"

Let's create some amazing datasets! 🚀`,
    },
  ]);
  const [prompt, setPrompt] = useState('');
  const { mutateAsync, isPending } = useHandleChat();

  const dAppContext = useDAppConnector();
  const dAppConnector = dAppContext?.dAppConnector;

  async function handleUserMessage() {
    if (!dAppConnector?.signers?.[0]) {
      console.error('No wallet connected');
      return;
    }

    const currentPrompt = prompt;
    setPrompt('');

    setChatHistory((v) => [
      ...v,
      {
        type: 'human',
        content: currentPrompt,
      },
    ]);

    const agentResponse = await mutateAsync({
      userAccountId: dAppConnector.signers[0].getAccountId().toString(),
      input: currentPrompt,
      history: chatHistory,
    });

    setChatHistory((v) => [
      ...v,
      {
        type: 'ai',
        content: agentResponse.message,
      },
    ]);

    if (agentResponse.transactionBytes) {
      const result = await dAppConnector.signAndExecuteTransaction({
        signerAccountId: dAppConnector.signers[0].getAccountId().toString(),
        transactionList: agentResponse.transactionBytes,
      });
      const transactionId = 'transactionId' in result ? result.transactionId : null;

      setChatHistory((v) => [
        ...v,
        {
          type: 'ai',
          content: `Transaction signed and executed sucessfully, txId: ${transactionId}`,
        },
      ]);
    }
  }

  const quickPrompts = [
    { icon: Database, text: "Generate medical dataset with 100 samples", label: "Medical Data", color: "from-blue-500 to-cyan-500" },
    { icon: TrendingUp, text: "Create financial transaction data for fraud detection", label: "Financial Data", color: "from-green-500 to-emerald-500" },
    { icon: Sparkles, text: "What datasets are available?", label: "Browse Datasets", color: "from-purple-500 to-pink-500" },
  ];

  const handleQuickPrompt = (text: string) => {
    setPrompt(text);
  };

  return (
    <div className="min-h-screen w-full bg-white">      
      <main className="container mx-auto max-w-6xl h-[calc(100vh-80px)] flex flex-col px-4 py-6">
        {/* Chat Area */}
        <div className="flex-1 mb-6 bg-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <Chat chatHistory={chatHistory} isLoading={isPending} />
        </div>

        {/* Quick Action Buttons - Only show on first message */}
        {chatHistory.length === 1 && (
          <div className="mb-4 flex gap-3 flex-wrap justify-center">
            {quickPrompts.map((promptItem, idx) => {
              const Icon = promptItem.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(promptItem.text)}
                  className={`group relative flex items-center gap-2 px-5 py-3 bg-gradient-to-r ${promptItem.color} rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg text-white font-medium text-sm`}
                >
                  <Icon className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span>{promptItem.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <ChatInput
            handleUserMessage={handleUserMessage}
            prompt={prompt}
            setPrompt={setPrompt}
            isPending={isPending}
          />
        </div>
      </main>
    </div>
  );
}
