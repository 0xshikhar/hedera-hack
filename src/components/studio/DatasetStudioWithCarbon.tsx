'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CarbonFootprint } from '@/components/analytics/CarbonFootprint';
import { carbonCalculator } from '@/services/carbon';
import { Loader2, Sparkles, Leaf, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface DatasetGenerationResult {
  success: boolean;
  datasetId: string;
  nftTokenId?: string;
  ipfsCID?: string;
  carbonFootprint: {
    co2Grams: number;
    formatted: string;
  };
  provenance: {
    logged: boolean;
    transactionId?: string;
  };
}

export function DatasetStudioWithCarbon() {
  const [prompt, setPrompt] = useState('');
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'google'>('openai');
  const [model, setModel] = useState('gpt-4');
  const [rows, setRows] = useState(100);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DatasetGenerationResult | null>(null);
  const [estimatedCarbon, setEstimatedCarbon] = useState<any>(null);

  const modelOptions = {
    openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    google: ['gemini-pro', 'gemini-ultra'],
  };

  const handleProviderChange = (newProvider: 'openai' | 'anthropic' | 'google') => {
    setProvider(newProvider);
    setModel(modelOptions[newProvider][0]);
    updateCarbonEstimate(newProvider, modelOptions[newProvider][0]);
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    updateCarbonEstimate(provider, newModel);
  };

  const updateCarbonEstimate = (prov: string, mod: string) => {
    // Estimate 5 seconds compute time
    const estimate = carbonCalculator.calculate(prov, mod, 5000);
    setEstimatedCarbon(estimate);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setProgress(0);
    setResult(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      // In production, this would call the Dataset Creation Plugin
      // For now, simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 5000));

      clearInterval(progressInterval);
      setProgress(100);

      // Mock result
      const mockResult: DatasetGenerationResult = {
        success: true,
        datasetId: `dataset_${Date.now()}`,
        nftTokenId: `0.0.7158235:${Math.floor(Math.random() * 1000)}`,
        ipfsCID: `Qm${Math.random().toString(36).substring(7)}`,
        carbonFootprint: {
          co2Grams: estimatedCarbon?.co2Grams || 45.2,
          formatted: carbonCalculator.formatCarbonFootprint(
            estimatedCarbon?.co2Grams || 45.2
          ),
        },
        provenance: {
          logged: true,
          transactionId: `0.0.123@${Date.now()}.${Math.floor(Math.random() * 1000000)}`,
        },
      };

      setResult(mockResult);
    } catch (error) {
      console.error('Error generating dataset:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Generate AI Dataset
          </CardTitle>
          <CardDescription>
            Create synthetic datasets with automatic carbon tracking and provenance logging
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Dataset Description</Label>
            <Textarea
              id="prompt"
              placeholder="Generate 100 rows of customer data with name, email, age, and purchase history..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              disabled={loading}
            />
          </div>

          {/* AI Provider */}
          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select
              value={provider}
              onValueChange={(value) =>
                handleProviderChange(value as 'openai' | 'anthropic' | 'google')
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="google">Google</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Model */}
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select value={model} onValueChange={handleModelChange} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {modelOptions[provider].map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rows */}
          <div className="space-y-2">
            <Label htmlFor="rows">Number of Rows</Label>
            <Input
              id="rows"
              type="number"
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value) || 100)}
              min={10}
              max={10000}
              disabled={loading}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Input
              id="category"
              placeholder="e.g., healthcare, finance, retail"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Estimated Carbon */}
          {estimatedCarbon && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Leaf className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Estimated Carbon Footprint
                </span>
              </div>
              <p className="text-lg font-bold text-green-700">
                {estimatedCarbon.formatted}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Equivalent to {estimatedCarbon.equivalents.phoneCharges} phone charges
              </p>
            </div>
          )}

          {/* Progress */}
          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Generating dataset...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Dataset
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results & Carbon Display */}
      <div className="space-y-6">
        {result && (
          <>
            {/* Success Message */}
            <Card className="border-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  Dataset Created Successfully!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Dataset ID</Label>
                  <p className="font-mono text-sm">{result.datasetId}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">NFT Token</Label>
                  <p className="font-mono text-sm">{result.nftTokenId}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">IPFS CID</Label>
                  <p className="font-mono text-sm break-all">{result.ipfsCID}</p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant="outline" className="bg-green-50">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Provenance Logged
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50">
                    <Leaf className="h-3 w-3 mr-1" />
                    Carbon Tracked
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Carbon Footprint */}
            {estimatedCarbon && (
              <CarbonFootprint calculation={estimatedCarbon} showDetails={true} />
            )}
          </>
        )}

        {!result && estimatedCarbon && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Carbon Impact Preview</CardTitle>
              <CardDescription>
                Estimated environmental impact of this generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">CO₂ Emissions</p>
                    <p className="text-2xl font-bold">{estimatedCarbon.formatted}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Offset Cost</p>
                    <p className="text-2xl font-bold">
                      ${estimatedCarbon.offsetCost.toFixed(4)}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    This generation will be automatically logged to HCS with complete
                    provenance tracking including carbon footprint data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!result && !estimatedCarbon && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Select a provider and model to see carbon estimates
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
