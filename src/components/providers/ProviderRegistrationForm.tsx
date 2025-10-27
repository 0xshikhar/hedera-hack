'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useHederaWallet } from '@/contexts/HederaWalletContext';

interface RegistrationFormData {
  bandwidthMbps: string;
  storageTB: string;
  ipfsGateway: string;
  location: string;
  stakeAmount: string;
}

interface ProviderRegistrationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProviderRegistrationForm({ onSuccess, onCancel }: ProviderRegistrationFormProps) {
  const { accountId, isConnected, dAppConnector } = useHederaWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegistrationFormData>({
    defaultValues: {
      bandwidthMbps: '100',
      storageTB: '1',
      ipfsGateway: '',
      location: '',
      stakeAmount: '1000'
    }
  });

  const onSubmit = async (data: RegistrationFormData) => {
    if (!isConnected || !accountId || !dAppConnector) {
      toast.error('Please connect your Hedera wallet');
      return;
    }

    try {
      setIsSubmitting(true);
      setIsConfirming(true);
      
      console.log('🚀 Registering provider with data:', data);
      
      // Get signer from dAppConnector (same as /create page)
      const signer = dAppConnector.signers?.[0];
      if (!signer) {
        throw new Error('No signer available from wallet');
      }

      // Import the registration function
      const { registerProviderTransaction } = await import('@/lib/hedera');

      // Create the transaction
      toast.info('Preparing provider registration transaction...');
      
      const transactionBytes = await registerProviderTransaction(
        Number(data.bandwidthMbps),
        Number(data.storageTB),
        data.ipfsGateway,
        data.location,
        Number(data.stakeAmount),
        accountId,
        signer
      );

      console.log('📝 Transaction created, requesting signature...');
      toast.info('Please approve the transaction in your wallet');

      // Execute the transaction through dAppConnector
      const result = await dAppConnector.signAndExecuteTransaction({
        signerAccountId: accountId,
        transactionList: transactionBytes,
      });

      if (!result) {
        throw new Error('Transaction failed or was rejected');
      }

      console.log('✅ Transaction result:', result);
      
      toast.success('Successfully registered as provider!', {
        description: 'You can now start hosting datasets on the network',
      });
      setIsConfirming(false);
      onSuccess();
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      let errorMessage = 'Failed to register provider';
      
      // Parse contract errors
      if (error instanceof Error) {
        if (error.message.includes('InsufficientStake')) {
          errorMessage = 'Insufficient stake amount. Minimum required: 1000 FILE tokens';
        } else if (error.message.includes('ProviderAlreadyRegistered')) {
          errorMessage = 'You are already registered as a provider';
        } else if (error.message.includes('CONTRACT_REVERT_EXECUTED')) {
          errorMessage = 'Contract error: Please ensure you meet all requirements (minimum 1000 FILE stake)';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
      setIsConfirming(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bandwidth */}
        <div className="space-y-2">
          <Label htmlFor="bandwidthMbps">Bandwidth (Mbps)</Label>
          <Input
            id="bandwidthMbps"
            type="number"
            placeholder="100"
            {...register('bandwidthMbps', {
              required: 'Bandwidth is required',
              min: { value: 1, message: 'Minimum 1 Mbps' }
            })}
          />
          {errors.bandwidthMbps && (
            <p className="text-sm text-red-500">{errors.bandwidthMbps.message}</p>
          )}
        </div>

        {/* Storage */}
        <div className="space-y-2">
          <Label htmlFor="storageTB">Storage (TB)</Label>
          <Input
            id="storageTB"
            type="number"
            placeholder="1"
            {...register('storageTB', {
              required: 'Storage is required',
              min: { value: 1, message: 'Minimum 1 TB' }
            })}
          />
          {errors.storageTB && (
            <p className="text-sm text-red-500">{errors.storageTB.message}</p>
          )}
        </div>
      </div>

      {/* IPFS Gateway */}
      <div className="space-y-2">
        <Label htmlFor="ipfsGateway">IPFS Gateway URL</Label>
        <Input
          id="ipfsGateway"
          type="url"
          placeholder="https://your-gateway.ipfs.io"
          {...register('ipfsGateway', {
            required: 'IPFS gateway is required',
            pattern: {
              value: /^https?:\/\/.+/,
              message: 'Must be a valid URL'
            }
          })}
        />
        {errors.ipfsGateway && (
          <p className="text-sm text-red-500">{errors.ipfsGateway.message}</p>
        )}
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          type="text"
          placeholder="e.g., Singapore, Vietnam, USA"
          {...register('location', {
            required: 'Location is required'
          })}
        />
        {errors.location && (
          <p className="text-sm text-red-500">{errors.location.message}</p>
        )}
      </div>

      {/* Stake Amount */}
      <div className="space-y-2">
        <Label htmlFor="stakeAmount">Stake Amount (FILE tokens)</Label>
        <Input
          id="stakeAmount"
          type="number"
          step="1"
          placeholder="1000"
          {...register('stakeAmount', {
            required: 'Stake amount is required',
            min: { value: 1000, message: 'Minimum stake is 1000 FILE tokens' }
          })}
        />
        {errors.stakeAmount && (
          <p className="text-sm text-red-500">{errors.stakeAmount.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Minimum stake: 1000 FILE tokens. This will be locked while you&apos;re an active provider.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting || isConfirming}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isConfirming || !isConnected}
        >
          {(isSubmitting || isConfirming) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isConfirming ? 'Confirming...' : 'Register Provider'}
        </Button>
      </div>
    </form>
  );
}
