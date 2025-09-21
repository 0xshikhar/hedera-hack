'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { STORAGE_NETWORK_ABI } from '@/contracts/FiletheticStorageNetworkABI';
import u2uTestnetDeployment from '@/deployments/u2uTestnet.json';
import u2uMainnetDeployment from '@/deployments/u2uMainnet.json';
import localhostDeployment from '@/deployments/localhost.json';

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
  const { address, isConnected, chainId } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegistrationFormData>({
    defaultValues: {
      bandwidthMbps: '100',
      storageTB: '1',
      ipfsGateway: '',
      location: '',
      stakeAmount: '0.1'
    }
  });

  const { data: hash, writeContract } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const onSubmit = async (data: RegistrationFormData) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Get deployment info based on chain ID
      const deploymentMap: Record<number, any> = {
        2484: u2uTestnetDeployment,
        39: u2uMainnetDeployment,
        31337: localhostDeployment,
      };

      const deployment = deploymentMap[chainId || 2484] || u2uTestnetDeployment;
      
      if (!deployment.filetheticStorageNetwork) {
        toast.error('Storage network contract not deployed');
        return;
      }

      writeContract({
        address: deployment.filetheticStorageNetwork as `0x${string}`,
        abi: STORAGE_NETWORK_ABI,
        functionName: 'registerAsProvider',
        args: [
          BigInt(data.bandwidthMbps),
          BigInt(data.storageTB),
          data.ipfsGateway,
          data.location
        ],
        value: parseEther(data.stakeAmount)
      });

      toast.success('Registration submitted!');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register provider');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle successful confirmation
  if (isConfirmed) {
    toast.success('Successfully registered as provider!');
    onSuccess();
  }

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
        <Label htmlFor="stakeAmount">Stake Amount (U2U)</Label>
        <Input
          id="stakeAmount"
          type="number"
          step="0.01"
          placeholder="0.1"
          {...register('stakeAmount', {
            required: 'Stake amount is required',
            min: { value: 0.1, message: 'Minimum stake is 0.1 U2U' }
          })}
        />
        {errors.stakeAmount && (
          <p className="text-sm text-red-500">{errors.stakeAmount.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Minimum stake: 0.1 U2U. This will be locked while you're an active provider.
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
