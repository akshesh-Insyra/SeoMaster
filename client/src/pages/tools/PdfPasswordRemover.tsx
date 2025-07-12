import { useState, useRef } from "react";
import { Unlock, Upload, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { removePDFPassword } from "@/utils/pdfUtils";

export default function PdfPasswordRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
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

  const handleRemovePassword = async () => {
    if (!file || !password) {
      toast({
        title: "Missing information",
        description: "Please upload a PDF file and enter the password.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const unlockedPdfBytes = await removePDFPassword(file, password);
      
      // Create download link
      const blob = new Blob([unlockedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unlocked-${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success!",
        description: "Password removed successfully and file downloaded.",
      });
      
      // Reset form
      setFile(null);
      setPassword("");
    } catch (error) {
      console.error('Password removal error:', error);
      toast({
        title: "Failed to remove password",
        description: "The password might be incorrect or the file might be corrupted.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF Password Remover"
      description="Remove passwords from PDF files you own"
      icon={<Unlock className="text-orange-600 text-2xl" />}
      iconBg="bg-orange-100"
    >
      {/* File Upload Area */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div
            className="file-upload-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="text-orange-600 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {file ? file.name : "Drop your password-protected PDF here"}
            </h3>
            <p className="text-slate-600 mb-4">or click to browse files</p>
            <Button className="brand-primary-bg hover:brand-primary-hover text-white">
              Browse Files
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Password Input */}
      {file && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-slate-900">
                  PDF Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter the PDF password"
                  className="mt-1"
                />
              </div>
              
              <Button
                onClick={handleRemovePassword}
                disabled={isProcessing || !password}
                size="lg"
                className="w-full bg-orange-600 text-white hover:bg-orange-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removing Password...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Remove Password & Download
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-6">
          <h4 className="font-semibold text-amber-900 mb-2">⚠️ Important Disclaimer</h4>
          <p className="text-amber-800 text-sm mb-4">
            Only use this tool for PDF files that you own or have explicit permission to modify. 
            This tool is designed to help you recover access to your own password-protected documents.
          </p>
          <ul className="text-amber-800 space-y-1 text-sm">
            <li>• All processing is done locally in your browser</li>
            <li>• Your files are never uploaded to our servers</li>
            <li>• The password is only used to decrypt the PDF</li>
            <li>• We do not store or log any passwords</li>
          </ul>
        </CardContent>
      </Card>
    </ToolLayout>
  );
}
