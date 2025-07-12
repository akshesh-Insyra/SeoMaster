import { useState, useRef } from "react";
import { Image as ImageIcon, Upload, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import ToolLayout from "@/components/ToolLayout";

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState("jpg");
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const convertImageMutation = useMutation({
    mutationFn: async (data: { file: File; format: string }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('format', data.format);
      
      const response = await fetch('/api/convert-image', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Conversion failed');
      }
      
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      setConvertedImage(url);
      toast({
        title: "Success!",
        description: "Image converted successfully.",
      });
    },
    onError: (error) => {
      console.error('Image conversion error:', error);
      toast({
        title: "Conversion failed",
        description: "There was an error converting your image. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleFileUpload = (selectedFile: File | null) => {
    if (!selectedFile) return;

    const validTypes = ['image/heic', 'image/heif', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (validTypes.includes(selectedFile.type) || selectedFile.name.toLowerCase().endsWith('.heic')) {
      setFile(selectedFile);
      setConvertedImage(null);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a HEIC, JPEG, PNG, or WebP image.",
        variant: "destructive"
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    handleFileUpload(droppedFile);
  };

  const handleConvert = () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload an image first.",
        variant: "destructive"
      });
      return;
    }

    convertImageMutation.mutate({ file, format: outputFormat });
  };

  const handleDownload = () => {
    if (!convertedImage || !file) return;

    const a = document.createElement('a');
    a.href = convertedImage;
    a.download = `converted-${file.name.split('.')[0]}.${outputFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Downloaded!",
      description: "Converted image downloaded successfully.",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ToolLayout
      title="Image Converter"
      description="Convert HEIC images to JPG or PNG format"
      icon={<ImageIcon className="text-cyan-600 text-2xl" />}
      iconBg="bg-cyan-100"
    >
      <div className="space-y-6">
        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="file-upload-area"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="text-cyan-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {file ? file.name : "Drop your image here"}
              </h3>
              <p className="text-slate-600 mb-4">
                {file ? formatFileSize(file.size) : "Supports HEIC, JPEG, PNG, WebP"}
              </p>
              <Button className="brand-primary-bg hover:brand-primary-hover text-white">
                Browse Files
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".heic,.heif,.jpg,.jpeg,.png,.webp"
              onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Output Format Selection */}
        {file && (
          <Card>
            <CardHeader>
              <CardTitle>Output Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full max-w-xs">
                <Label htmlFor="format">Convert to</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select output format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jpg">JPG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Convert Button */}
        {file && (
          <div className="text-center">
            <Button
              onClick={handleConvert}
              disabled={convertImageMutation.isPending}
              size="lg"
              className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg"
            >
              {convertImageMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Convert Image
                </>
              )}
            </Button>
          </div>
        )}

        {/* Download Converted Image */}
        {convertedImage && (
          <Card>
            <CardHeader>
              <CardTitle>Converted Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-2">Preview:</p>
                  <img
                    src={convertedImage}
                    alt="Converted"
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                  />
                </div>
                <Button
                  onClick={handleDownload}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Converted Image
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h4 className="font-semibold text-blue-900 mb-2">Supported formats:</h4>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• <strong>Input:</strong> HEIC, HEIF, JPEG, PNG, WebP</li>
              <li>• <strong>Output:</strong> JPG, PNG, WebP</li>
            </ul>
            <p className="text-blue-700 text-sm mt-3">
              <strong>Note:</strong> HEIC is commonly used by iOS devices. Convert to JPG or PNG for universal compatibility.
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}
