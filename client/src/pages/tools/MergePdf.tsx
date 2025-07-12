import { useState, useRef } from "react";
import { FileText, Upload, X, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { mergePDFs } from "@/utils/pdfUtils";

interface UploadedFile {
  file: File;
  id: string;
  name: string;
  size: number;
}

export default function MergePdf() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (file.type === "application/pdf") {
        newFiles.push({
          file,
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size
        });
      } else {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a PDF file.`,
          variant: "destructive"
        });
      }
    }
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = e.dataTransfer.files;
    handleFileUpload(droppedFiles);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      toast({
        title: "Insufficient files",
        description: "Please upload at least 2 PDF files to merge.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const mergedPdfBytes = await mergePDFs(files.map(f => f.file));
      
      // Create download link
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged-document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success!",
        description: "PDFs merged successfully and downloaded.",
      });
    } catch (error) {
      console.error('Merge error:', error);
      toast({
        title: "Merge failed",
        description: "There was an error merging your PDFs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF Merger"
      description="Combine multiple PDF files into one document"
      icon={<FileText className="text-red-600 text-2xl" />}
      iconBg="bg-red-100"
    >
      {/* File Upload Area */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div
            className="file-upload-area"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="text-blue-600 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Drop your PDF files here</h3>
            <p className="text-slate-600 mb-4">or click to browse files</p>
            <Button className="brand-primary-bg hover:brand-primary-hover text-white">
              Browse Files
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Uploaded Files</h3>
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="file-item">
                  <div className="flex items-center">
                    <FileText className="text-red-600 text-lg mr-3" />
                    <div>
                      <p className="font-medium text-slate-900">{file.name}</p>
                      <p className="text-sm text-slate-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Merge Button */}
      {files.length > 0 && (
        <div className="text-center mb-6">
          <Button
            onClick={handleMerge}
            disabled={isProcessing || files.length < 2}
            size="lg"
            className="bg-green-600 text-white hover:bg-green-700 shadow-lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Merging...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Merge PDFs
              </>
            )}
          </Button>
        </div>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h4 className="font-semibold text-blue-900 mb-2">How to use:</h4>
          <ol className="text-blue-800 space-y-1 text-sm">
            <li>1. Upload multiple PDF files using the area above</li>
            <li>2. Review the uploaded files list</li>
            <li>3. Click "Merge PDFs" to combine them into one file</li>
            <li>4. Download your merged PDF document</li>
          </ol>
        </CardContent>
      </Card>
    </ToolLayout>
  );
}
