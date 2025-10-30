import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, CheckCircle2 } from 'lucide-react';

interface DatasetResultCardProps {
  result: {
    success: boolean;
    message: string;
    preview?: any[];
    totalSamples?: number;
    metadata?: {
      category: string;
      provider: string;
      model: string;
      tokensUsed: number;
      processingTime: string;
    };
    datasetId?: string;
    downloadInstructions?: string;
  };
}

export function DatasetResultCard({ result }: DatasetResultCardProps) {
  if (!result.success) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Generation Failed</CardTitle>
          <CardDescription className="text-red-600">
            {result.message}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleDownload = () => {
    if (result.preview) {
      const dataStr = JSON.stringify(result.preview, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dataset_${result.datasetId || Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <CardTitle className="text-green-700">Dataset Generated Successfully!</CardTitle>
            </div>
            <CardDescription className="text-gray-600">
              {result.message}
            </CardDescription>
          </div>
          {result.metadata && (
            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
              {result.totalSamples} samples
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Metadata */}
        {result.metadata && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <p className="text-gray-500">Category</p>
              <p className="text-gray-900 font-medium">{result.metadata.category}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500">AI Model</p>
              <p className="text-gray-900 font-medium">
                {result.metadata.provider}/{result.metadata.model}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500">Tokens Used</p>
              <p className="text-gray-900 font-medium">{result.metadata.tokensUsed.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500">Processing Time</p>
              <p className="text-gray-900 font-medium">{result.metadata.processingTime}</p>
            </div>
          </div>
        )}

        {/* Preview */}
        {result.preview && result.preview.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Preview (first 3 samples):</p>
            <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-auto border border-gray-200">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(result.preview, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleDownload}
            className="flex items-center gap-2"
            variant="default"
          >
            <Download className="w-4 h-4" />
            Download JSON
          </Button>
          <Button
            onClick={() => window.open('/create', '_blank')}
            className="flex items-center gap-2"
            variant="outline"
          >
            <ExternalLink className="w-4 h-4" />
            Upload to Marketplace
          </Button>
        </div>

        {/* Instructions */}
        {result.downloadInstructions && (
          <p className="text-xs text-gray-600 border-t border-gray-200 pt-3">
            💡 {result.downloadInstructions}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
