import { useState, useRef } from "react";
import { ImageOff, Upload, Download, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { motion } from "framer-motion";

export default function WatermarkRemover() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Framer Motion variants
  const cardInViewVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      toast({ title: "Image selected", description: `${file.name} is ready.` });
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
      toast({ title: "Invalid file type", description: "Please upload an image file.", variant: "destructive" });
    }
  };

  const handleRemoveWatermark = async () => {
    if (!selectedFile) {
      toast({ title: "No image selected", description: "Please upload an image to remove watermark.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    toast({ title: "Processing...", description: "Attempting to remove watermark. This is a complex operation.", duration: 5000 });

    try {
      // --- IMPORTANT: Placeholder for actual watermark removal logic ---
      // In a real application, robust watermark removal is extremely difficult and would typically involve:
      // 1. Sending the image file to a backend server.
      // 2. The backend server would use advanced image processing libraries (e.g., OpenCV, specialized AI/ML models)
      //    to detect and attempt to remove the watermark. This is a non-trivial task.
      // 3. The backend would then return the processed (watermark-removed) image.
      // 4. The client-side would then download this newly processed image.
      //
      // This client-side code *simulates* the processing and then downloads the *original* file.
      // It does NOT perform actual watermark removal.

      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing time (e.g., 3 seconds)

      // For demonstration purposes, we'll just download the original image
      // with a filename indicating it's "watermark-removed".
      const downloadUrl = URL.createObjectURL(selectedFile);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `watermark-removed-${selectedFile.name}`; // Renames the file
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl); // Clean up the object URL

      toast({
        title: "Process Complete!",
        description: "Downloaded a placeholder image. Note: Actual watermark removal is complex and often requires AI/backend.",
      });

    } catch (error) {
      console.error("Watermark removal error:", error);
      toast({
        title: "Removal Failed",
        description: `An error occurred during processing: ${error instanceof Error ? error.message : "Unknown error"}.`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input element's value
    }
    toast({ title: "File removed", description: "You can select a new image." });
  };

  return (
    <ToolLayout
      title="Watermark Remover"
      description="Upload an image and attempt to remove watermarks. (Note: This is a highly complex task)."
      icon={<ImageOff className="text-white text-2xl" />}
      iconBg="bg-gradient-to-br from-red-500 to-orange-500" // Example gradient
    >
      <div className="space-y-6">
        {/* Input Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-red-500/10 text-white">
            <CardHeader>
              <CardTitle className="text-red-400">Upload Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#363A4D] rounded-lg cursor-pointer hover:border-red-500 transition-colors relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*" // Accepts any image type
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {!selectedFile ? (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-slate-400 mb-2" />
                    <p className="text-slate-300">Drag & drop an image here, or click to select</p>
                    <p className="text-slate-500 text-sm mt-1">(JPG, PNG, etc.)</p>
                  </div>
                ) : (
                  <div className="text-center">
                    {previewUrl && (
                      <img src={previewUrl} alt="Preview" className="max-w-full max-h-48 rounded-md mb-4 object-contain" />
                    )}
                    <p className="text-slate-300 font-medium">{selectedFile.name}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="text-red-400 hover:text-red-500 mt-2"
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-6 text-center">
                <Button
                  onClick={handleRemoveWatermark}
                  disabled={!selectedFile || isProcessing}
                  size="lg"
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg shadow-red-500/30 transform hover:scale-105 transition-all duration-300 rounded-full px-8 py-3 font-semibold"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <ImageOff className="mr-2 h-4 w-4" /> Remove Watermark
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Disclaimer Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#FFD700]/10 text-white">
            <CardContent className="p-6">
              <h4 className="font-semibold text-[#FFD700] mb-3 text-lg">
                Important Note on Watermark Removal
              </h4>
              <ul className="text-slate-400 space-y-2 text-sm list-disc list-inside">
                <li>Automated watermark removal is a highly complex task.</li>
                <li>This tool provides a basic interface, but robust removal often requires advanced AI models and significant computational resources, typically handled on a server.</li>
                <li>Results may vary greatly depending on the watermark's complexity, opacity, and image content.</li>
                <li>Always ensure you have the legal rights to modify any image you process.</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}
