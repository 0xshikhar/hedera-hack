"use client";

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { useHederaWallet } from '@/contexts/HederaWalletContext';
import { 
  createDatasetTransaction, 
  submitDatasetMetadata, 
  lockDatasetTransaction 
} from "@/lib/hedera";
import { DATASET_NFT_TOKEN_ID } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the form schema
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Dataset name must be at least 3 characters",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters",
  }),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Price must be a non-negative number",
  }),
  visibility: z.enum(["public", "private"], {
    message: "You must select a visibility option",
  }),
  allowNFTAccess: z.boolean(),
  modelType: z.string().min(1, {
    message: "Model type is required",
  }),
  modelVersion: z.string().min(1, {
    message: "Model version is required",
  }),
  samplePrompt: z.string().optional(),
});

export type CreateDatasetFormProps = {
  cid: string;
  fileData?: unknown;
  onBack: () => void;
};

export function CreateDatasetForm({ cid, onBack }: CreateDatasetFormProps) {
  const { isConnected, accountId: address, dAppConnector } = useHederaWallet();
  const [creating, setCreating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "0",
      visibility: "public",
      allowNFTAccess: false,
      modelType: "gpt-4",
      modelVersion: "latest",
      samplePrompt: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isConnected || !address || !dAppConnector) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet to create a dataset",
      });
      return;
    }

    if (!cid) {
      toast.error("No dataset CID found", {
        description: "Something went wrong, please try uploading again",
      });
      return;
    }

    setCreating(true);

    try {
      // Get signer from dAppConnector
      const signer = dAppConnector.signers?.[0];
      if (!signer) {
        throw new Error('No signer available from wallet');
      }

      // Step 1: Create mint transaction
      toast.info("Preparing NFT mint transaction...");
      
      const { transactionBytes: mintTxBytes, metadata } = await createDatasetTransaction(
        values.name,
        values.description,
        cid,
        parseFloat(values.price),
        values.modelType,
        [values.visibility],
        address,
        signer
      );

      toast.info("Please approve the NFT mint transaction in your wallet...");

      // Step 2: Sign and execute mint transaction
      const mintResult = await dAppConnector.signAndExecuteTransaction({
        signerAccountId: address,
        transactionList: mintTxBytes,
      });

      if (!mintResult) {
        throw new Error('Failed to mint NFT');
      }

      // Use timestamp-based serial number (temporary solution)
      const serialNumber = Date.now() % 10000;
      
      toast.success(`NFT minted! Serial #${serialNumber}`, {
        description: "Submitting metadata to HCS...",
      });

      // Step 3: Submit metadata to HCS
      const metadataTxBytes = await submitDatasetMetadata(serialNumber, metadata, address, signer);
      
      toast.info("Please approve the metadata submission in your wallet...");
      
      await dAppConnector.signAndExecuteTransaction({
        signerAccountId: address,
        transactionList: metadataTxBytes,
      });

      toast.success("Metadata submitted!", {
        description: "Locking dataset...",
      });

      // Step 4: Lock the dataset
      const lockTxBytes = await lockDatasetTransaction(DATASET_NFT_TOKEN_ID, serialNumber, address, signer);
      
      toast.info("Please approve the lock transaction in your wallet...");
      
      await dAppConnector.signAndExecuteTransaction({
        signerAccountId: address,
        transactionList: lockTxBytes,
      });

      toast.success("Dataset published successfully!", {
        description: "Your dataset has been locked and is now active on the blockchain.",
      });

      form.reset();
      onBack();
    } catch (error: unknown) {
      console.error("Error creating dataset:", error);
      const errorMessage = error instanceof Error ? error.message : "There was an error creating your dataset";
      toast.error("Error creating dataset", {
        description: errorMessage,
      });
    } finally {
      setCreating(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Please connect your wallet to create a dataset.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Step 2: Add Details</h3>
          <p className="text-sm text-muted-foreground">
            Fill in the details about your dataset.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dataset Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Synthetic Customer Data" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (USDC)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 10.0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A detailed description of your synthetic dataset"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Visibility</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="public" />
                      </FormControl>
                      <FormLabel className="font-normal">Public</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="private" />
                      </FormControl>
                      <FormLabel className="font-normal">Private</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="allowNFTAccess"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Enable NFT Access</FormLabel>
                  <FormDescription>
                    Allow access control via NFT ownership
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-md font-medium">Model Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="modelType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3">Claude 3</SelectItem>
                    <SelectItem value="llama-2">Llama 2</SelectItem>
                    <SelectItem value="mistral">Mistral</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="modelVersion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model Version</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., latest, 1.0, opus" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="samplePrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sample Prompt (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Example prompt used to generate this data"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This helps others understand how the data was generated
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between pt-4">
          <Button 
            type="button"
            variant="outline"
            onClick={onBack}
          >
            Back
          </Button>
          <Button type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create Dataset"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
