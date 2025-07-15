import { useState, useRef } from "react";
import { FileText, Upload, X, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { mergePDFs } from "@/utils/pdfUtils";
import { motion, AnimatePresence } from "framer-motion";

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
          size: file.size,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a PDF file.`,
          variant: "destructive",
        });
      }
    }

    setFiles((prev) => [...prev, ...newFiles]);
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
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      toast({
        title: "Insufficient files",
        description: "Please upload at least 2 PDF files to merge.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const mergedPdfBytes = await mergePDFs(files.map((f) => f.file));

      // Create download link
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged-document.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: "PDFs merged successfully and downloaded.",
      });
    } catch (error) {
      console.error("Merge error:", error);
      toast({
        title: "Merge failed",
        description: "There was an error merging your PDFs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <ToolLayout
      title="PDF Merger"
      description="Combine multiple PDF files into one document"
      icon={<FileText className="text-white text-2xl" />}
      // Header theme uses a green accent. Changed icon background.
      iconBg="bg-gradient-to-br from-[#00A389] to-[#FFD700]"
      // Overall background should match the header's dark theme
      className="bg-[#1A1C2C] text-white" 
    >
      {/* File Upload Area */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card className="mb-6 bg-[#1A1C2C] border border-[#2d314d] text-white rounded-xl shadow-lg">
          <CardContent className="p-6 text-center bg-[#1A1C2C] rounded-xl shadow-lg border border-[#2d314d]">
            <div
              className="file-upload-area p-8 border-2 border-dashed border-[#00A389] rounded-xl cursor-pointer hover:border-[#FFD700] transition-all duration-300 bg-[#23263a] hover:bg-[#23263a]/80"
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                // Adjusted shadow to match header's green accent
                boxShadow: "0 4px 24px 0 rgba(0, 163, 137, 0.15)", 
              }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#00A389] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-[#23263a]">
                <Upload className="text-white text-2xl drop-shadow-lg" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 drop-shadow">
                Drop your PDF files here
              </h3>
              <p className="text-slate-400 mb-4">or click to browse files</p>
              <Button className="bg-gradient-to-r from-[#00A389] to-[#FFD700] hover:from-[#008C75] hover:to-[#E6C200] text-white rounded-full px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
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
      </motion.div>

      {/* Uploaded Files List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={containerVariants}
          >
            <Card className="mb-6 bg-[#1A1C2C] border border-[#2d314d] text-white rounded-xl shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Uploaded Files
                </h3>
                <motion.div
                  className="space-y-3"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: { staggerChildren: 0.07, delayChildren: 0.2 },
                    },
                  }}
                >
                  {files.map((file) => (
                    <motion.div
                      key={file.id}
                      className="file-item flex items-center justify-between p-3 bg-[#141624] rounded-lg border border-[#363A4D] shadow-sm" // Adjusted background and border for file items
                      variants={itemVariants}
                    >
                      <div className="flex items-center">
                        <FileText className="text-[#00A389] text-lg mr-3" />{" "}
                        {/* Icon color updated */}
                        <div>
                          <p className="font-medium text-white">{file.name}</p>
                          <p className="text-sm text-slate-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-red-500 hover:text-red-400 hover:bg-[#202230] transition-colors duration-200 rounded-full" // Adjusted hover background
                      >
                        <X size={16} />
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Merge Button */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            className="text-center mb-6"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={containerVariants}
          >
            <Button
              onClick={handleMerge}
              disabled={isProcessing || files.length < 2}
              size="lg"
              // Button gradient and hover colors updated to match header's accent
              className="bg-gradient-to-r from-[#00A389] to-[#FFD700] text-white hover:from-[#008C75] hover:to-[#E6C200] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-full px-8 py-3 font-semibold"
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        transition={{ ...containerVariants.visible.transition, delay: 0.2 }}
      >
        <Card className="bg-[#1A1C2C] border border-[#2d314d] text-white rounded-xl shadow-lg">
          <CardContent className="p-6">
            {/* Header for instructions updated to green accent */}
            <h4 className="font-semibold text-[#00A389] mb-3 text-lg">
              How to use:
            </h4>
            <ol className="text-slate-400 space-y-2 text-sm list-decimal list-inside">
              <li>Upload multiple PDF files using the area above</li>
              <li>Review the uploaded files list</li>
              <li>Click "Merge PDFs" to combine them into one file</li>
              <li>Download your merged PDF document</li>
            </ol>
          </CardContent>
        </Card>
      </motion.div>
    </ToolLayout>
  );
}