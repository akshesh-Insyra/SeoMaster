import { useState, useRef } from "react";
import { FileText, Upload, X, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { mergePDFs } from "@/utils/pdfUtils"; // Assuming this utility is available
import { motion, AnimatePresence } from "framer-motion";

interface UploadedFile {
  file: File;
  id: string;
  name: string;
  size: number;
}

// Light Theme Palette Notes:
// - Page Background: bg-slate-50
// - Card Background: bg-white
// - Text: text-slate-800 (Primary), text-slate-600 (Secondary)
// - Borders: border-slate-200/300
// - Accent Gradient: Blue-500 to Indigo-500

export default function MergePdf() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // --- Core logic functions (file handling, merge) are unchanged ---
  const handleFileUpload = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const newFiles: UploadedFile[] = Array.from(selectedFiles)
      .filter((file) => {
        if (file.type === "application/pdf") return true;
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a PDF.`,
          variant: "destructive",
        });
        return false;
      })
      .map((file) => ({
        file,
        id: `${file.name}-${file.lastModified}`, // More stable key
        name: file.name,
        size: file.size,
      }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) =>
    setFiles((prev) => prev.filter((file) => file.id !== id));

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      toast({
        title: "Not Enough Files",
        description: "Please upload at least two PDFs to merge.",
        variant: "destructive",
      });
      return;
    }
    setIsProcessing(true);
    try {
      const mergedPdfBytes = await mergePDFs(files.map((f) => f.file));
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged-document.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Success!", description: "PDFs merged and downloaded." });
    } catch (error) {
      console.error("Merge error:", error);
      toast({
        title: "Merge Failed",
        description: "An error occurred while merging the PDFs.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  return (
    <ToolLayout
      title="PDF Merger"
      description="Combine multiple PDF files into one seamless document."
      icon={<FileText className="text-white" />}
      iconBg="bg-gradient-to-br from-blue-500 to-indigo-500"
    >
      <div className="space-y-8">
        {/* File Upload Area */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="bg-white border-slate-200 rounded-xl shadow-lg shadow-blue-500/10">
            <CardContent className="p-6">
              <div
                className="cursor-pointer text-center border-2 border-dashed border-slate-300 hover:border-blue-500 p-8 rounded-lg transition-all duration-300 bg-slate-50/70 hover:bg-slate-100"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileUpload(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">
                  Drop your PDF files here
                </h3>
                <p className="text-slate-500">or click to browse</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Uploaded Files & Merge Action */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white border-slate-200 rounded-xl shadow-lg shadow-indigo-500/10">
                <CardHeader>
                  <CardTitle className="text-indigo-600">
                    Files to Merge ({files.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    <AnimatePresence>
                      {files.map((file) => (
                        <motion.div
                          key={file.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileText className="text-blue-500 flex-shrink-0" />
                            <div className="overflow-hidden">
                              <p className="font-medium text-slate-800 truncate">
                                {file.name}
                              </p>
                              <p className="text-sm text-slate-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(file.id)}
                            className="text-slate-500 hover:bg-red-100 hover:text-red-600 flex-shrink-0"
                          >
                            <X size={18} />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="text-center">
                    <Button
                      onClick={handleMerge}
                      disabled={isProcessing || files.length < 2}
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/40 transform hover:scale-105 transition-all duration-300 rounded-full px-10 py-3 text-base font-semibold"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                          Merging...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-5 w-5" /> Merge & Download
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="bg-amber-50 border border-amber-200/80 rounded-xl shadow-lg shadow-amber-500/10">
            <CardContent className="p-6">
              <h4 className="font-semibold text-amber-700 mb-3 text-lg">
                How to Merge PDFs
              </h4>
              <ol className="text-amber-900/80 space-y-2 text-sm list-decimal list-outside ml-4">
                <li>
                  Drag and drop your PDF files into the upload area, or click to
                  select them.
                </li>
                <li>
                  The files will appear in a list below, where you can remove
                  any if needed.
                </li>
                <li>
                  Click the "Merge & Download" button to combine all listed PDFs
                  into a single file.
                </li>
                <li>Your new, merged PDF will be downloaded automatically.</li>
              </ol>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}
