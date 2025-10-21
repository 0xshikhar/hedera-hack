"use client";

import React, { createContext, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';

interface ConfettiContextType {
  showConfetti: () => void;
}

export const ConfettiContext = createContext<ConfettiContextType | undefined>(undefined);

interface ConfettiProviderProps {
  children: ReactNode;
}

export function ConfettiProvider({ children }: ConfettiProviderProps) {
  const showConfetti = useCallback(() => {
    // Show a success toast instead of confetti
    toast.success('🎉 Success!', {
      description: 'Operation completed successfully',
      duration: 3000,
    });
  }, []);

  return (
    <ConfettiContext.Provider value={{ showConfetti }}>
      {children}
    </ConfettiContext.Provider>
  );
}
