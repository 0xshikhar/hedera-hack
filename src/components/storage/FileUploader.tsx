'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { UploadedInfo } from "@/hooks/storage/useFileUpload";

interface FileUploaderProps {
  onUploadComplete?: (uploadedInfo: UploadedInfo, parsedData: any) => void;
}

/**
 * Simplified File Uploader for IPFS
 */
export function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setUploading(true);
    try {
      // Read file content
      const text = await file.text();
      let parsedData;
      
      try {
        parsedData = JSON.parse(text);
      } catch {
        toast.error("Invalid JSON file");
        setUploading(false);
        return;
      }

      // TODO: Implement IPFS upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const uploadedInfo: UploadedInfo = {
        fileName: file.name,
        fileSize: file.size,
        cid: "placeholder-cid-" + Date.now(),
        commp: "placeholder-commp",
      };

      toast.success("File uploaded successfully!");
      
      if (onUploadComplete) {
        onUploadComplete(uploadedInfo, parsedData);
      }
      
      setFile(null);
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload File to IPFS</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            type="file"
            accept=".json,.csv"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload to IPFS
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
