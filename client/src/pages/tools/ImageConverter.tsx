import { useState, useRef } from "react";
import { Image as ImageIcon, Upload, Download, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import ToolLayout from "@/components/ToolLayout";
import { motion, AnimatePresence } from "framer-motion";

// Light Theme Palette Notes:
// - Page Background: bg-slate-50
// - Card Background: bg-white
// - Text: text-slate-800 (Primary), text-slate-600 (Secondary)
// - Borders: border-slate-200/300
// - Accent Gradient: Cyan-500 to Purple-500

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState("jpg");
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // --- Core logic (API call, handlers) is unchanged ---
  // NOTE: This uses a simulated API call. Replace with your actual image processing logic.
  const convertImageMutation = useMutation({
    mutationFn: async (data: { file: File; format: string }) => {
      console.log("Simulating image conversion:", data);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const dummyBlob = new Blob(["dummy image data"], { type: `image/${data.format}` });
      return dummyBlob;
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      setConvertedImage(url);
      toast({ title: "Success!", description: "Image converted successfully." });
    },
    onError: () => {
      toast({ title: "Conversion Failed", description: "There was an error converting your image.", variant: "destructive" });
    },
  });

  const handleFileUpload = (selectedFile: File | null) => {
    if (!selectedFile) return;
    const validTypes = ["image/heic", "image/heif", "image/jpeg", "image/png", "image/webp"];
    if (validTypes.includes(selectedFile.type) || selectedFile.name.toLowerCase().endsWith(".heic")) {
      setFile(selectedFile);
      setConvertedImage(null);
    } else {
      toast({ title: "Invalid File Type", description: "Please upload a HEIC, JPEG, PNG, or WebP image.", variant: "destructive" });
    }
  };
  
  const handleConvert = () => {
    if (!file) {
      toast({ title: "No File Selected", description: "Please upload an image first.", variant: "destructive" });
      return;
    }
    convertImageMutation.mutate({ file, format: outputFormat });
  };

  const handleDownload = () => {
    if (!convertedImage || !file) return;
    const a = document.createElement("a");
    a.href = convertedImage;
    a.download = `converted-${file.name.split(".").slice(0, -1).join(".")}.${outputFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(convertedImage);
    toast({ title: "Downloaded!", description: "Converted image saved." });
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const resetTool = () => {
    setFile(null);
    setConvertedImage(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    toast({ title: "Tool Reset", description: "Ready for a new image." });
  }

  const cardInViewVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  return (
    <ToolLayout
      title="Image Converter"
      description="Easily convert your images to JPG, PNG, or WebP formats."
      icon={<ImageIcon className="text-white" />}
      iconBg="bg-gradient-to-br from-cyan-500 to-purple-500"
    >
      <div className="space-y-8">
        {/* File Upload & Settings Card */}
        <motion.div variants={cardInViewVariants} initial="hidden" animate="visible">
          <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-cyan-500/10">
            <CardHeader><CardTitle className="text-cyan-600">1. Upload & Configure</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div
                className="cursor-pointer text-center border-2 border-dashed border-slate-300 hover:border-cyan-500 p-6 rounded-lg transition-all duration-300 bg-slate-50/70 hover:bg-slate-100"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleFileUpload(e.dataTransfer.files[0]); }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1 truncate">
                  {file ? file.name : "Drop your image here"}
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                  {file ? formatFileSize(file.size) : "or click to browse"}
                </p>
                <p className="text-xs text-slate-400">Supported: HEIC, JPG, PNG, WebP</p>
                <input ref={fileInputRef} type="file" accept=".heic,.heif,.jpg,.jpeg,.png,.webp" onChange={(e) => handleFileUpload(e.target.files?.[0] || null)} className="hidden" />
              </div>

              <AnimatePresence>
              {file && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <div className="w-full max-w-sm mx-auto">
                    <Label className="font-medium text-slate-700">Convert to</Label>
                    <Select value={outputFormat} onValueChange={setOutputFormat}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jpg">JPG</SelectItem>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="webp">WebP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="text-center">
                    <Button onClick={handleConvert} disabled={convertImageMutation.isPending} size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg shadow-cyan-500/40 transform hover:scale-105 transition-all duration-300 rounded-full px-10 py-3 text-base font-semibold">
                      {convertImageMutation.isPending ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Converting...</>) : (<><ImageIcon className="mr-2 h-5 w-5" /> Convert Image</>)}
                    </Button>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Download Card */}
        <AnimatePresence>
          {(convertImageMutation.isPending || convertedImage) && (
            <motion.div variants={cardInViewVariants} initial="hidden" animate="visible" exit="hidden">
              <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-purple-500/10">
                <CardHeader><CardTitle className="text-purple-600">2. Download Your Image</CardTitle></CardHeader>
                <CardContent>
                   {convertImageMutation.isPending ? (
                     <div className="min-h-[200px] flex flex-col items-center justify-center text-slate-500 bg-slate-50 rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mb-3" />
                      <p className="font-semibold text-lg">Processing your image...</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-lg inline-block">
                         <img src={convertedImage ?? ""} alt="Converted" className="max-w-full max-h-64 mx-auto rounded-md shadow-md" />
                      </div>
                      <div>
                        <Button onClick={handleDownload} size="lg" className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white shadow-lg shadow-purple-500/30 transform hover:scale-105 transition-all duration-300 rounded-full px-10 py-3 text-base font-semibold">
                           <Download className="mr-2 h-5 w-5" /> Download Image
                        </Button>
                      </div>
                    </div>
                  )}
                   <div className="mt-6 text-center">
                    <Button onClick={resetTool} size="lg" variant="ghost" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-full px-8 py-3 font-semibold">
                      <RefreshCw className="mr-2 h-4 w-4" /> Convert Another
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
}