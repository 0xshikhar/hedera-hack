import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { ChatRequest } from '@/shared/types';

const chatResponseSchema = z.object({
  message: z.string(),
  transactionBytes: z.string().optional(),
});

export async function handleChatRequest(body: ChatRequest) {
  console.log('📤 Sending chat request:', {
    userAccountId: body.userAccountId,
    input: body.input,
    historyLength: body.history.length,
  });
  
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  
  console.log('📥 Received response:', {
    status: response.status,
    statusText: response.statusText,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ API error:', errorData);
    throw new Error(errorData.error || errorData.message || 'Failed to process chat request');
  }
  
  const rawData = await response.json();
  console.log('✅ Chat response received:', {
    hasMessage: !!rawData.message,
    hasTransactionBytes: !!rawData.transactionBytes,
  });
  
  return chatResponseSchema.parse(rawData);
}

export function useHandleChat() {
  return useMutation({
    mutationKey: ['handle-ai-chat'],
    mutationFn: (data: ChatRequest) => handleChatRequest(data),
  });
}
