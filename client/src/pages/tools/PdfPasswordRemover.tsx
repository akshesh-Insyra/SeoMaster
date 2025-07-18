import { useState, useRef } from "react";
import { Unlock, Upload, Download, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { removePDFPassword } from "@/utils/pdfUtils"; // Assuming this utility is available
import { motion, AnimatePresence } from "framer-motion";

// Light Theme Palette Notes:
// - Page Background: bg-slate-50
// - Card Background: bg-white
// - Text: text-slate-800 (Primary), text-slate-700 (Secondary)
// - Borders: border-slate-200/300
// - Accent Gradient: Red-500 to Orange-500
// - Disclaimer/Info Accent: Amber

export default function PdfPasswordRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // --- Core logic functions (file handling, password removal) are unchanged ---
  const handleFileUpload = (selectedFile: File | null) => {
    if (!selectedFile) return;
    if (selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
    }
  };

  const handleRemovePassword = async () => {
    if (!file || !password) {
      toast({
        title: "Missing Information",
        description: "Please upload a PDF and enter its password.",
        variant: "destructive",
      });
      return;
    }
    setIsProcessing(true);
    try {
      const unlockedPdfBytes = await removePDFPassword(file, password);
      const blob = new Blob([unlockedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `unlocked-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Success!",
        description: "Password removed and file downloaded.",
      });
      resetTool(); // Reset after successful download
    } catch (error) {
      console.error("Password removal error:", error);
      toast({
        title: "Failed to Remove Password",
        description:
          "The password might be incorrect or the file may be corrupted.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetTool = () => {
    setFile(null);
    setPassword("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const cardInViewVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <ToolLayout
      title="PDF Password Remover"
      description="Remove passwords from PDF files that you own, right in your browser."
      icon={<Unlock className="text-white" />}
      iconBg="bg-gradient-to-br from-red-500 to-orange-500"
    >
      <div className="space-y-8">
        {/* Main Tool Card */}
        <motion.div
          variants={cardInViewVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="bg-white border-slate-200 rounded-xl shadow-lg shadow-red-500/10">
            <CardHeader>
              <CardTitle className="text-red-600">Unlock Your PDF</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div
                className="cursor-pointer text-center border-2 border-dashed border-slate-300 hover:border-red-500 p-8 rounded-lg transition-all duration-300 bg-slate-50/70 hover:bg-slate-100"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileUpload(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1 truncate">
                  {file ? file.name : "Drop your password-protected PDF"}
                </h3>
                <p className="text-slate-500">or click to browse</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    handleFileUpload(e.target.files?.[0] || null)
                  }
                  className="hidden"
                />
              </div>

              <AnimatePresence>
                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 pt-4 border-t border-slate-200"
                  >
                    <div className="space-y-2">
                      <Label
                        htmlFor="password"
                        className="font-medium text-slate-700"
                      >
                        PDF Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter the PDF password"
                        className="bg-white focus:ring-red-500/50 focus:border-red-500"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        onClick={handleRemovePassword}
                        disabled={isProcessing || !password}
                        size="lg"
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg shadow-red-500/40 transform hover:scale-105 transition-all duration-300 rounded-full px-10 py-3 text-base font-semibold"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                            Unlocking...
                          </>
                        ) : (
                          <>
                            <Unlock className="mr-2 h-5 w-5" /> Remove Password
                            & Download
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={resetTool}
                        variant="ghost"
                        className="w-full sm:w-auto text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-full"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" /> Start Over
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Disclaimer Card */}
        <motion.div
          variants={cardInViewVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="bg-amber-50 border border-amber-200/80 rounded-xl shadow-lg shadow-amber-500/10">
            <CardContent className="p-6">
              <h4 className="font-semibold text-amber-700 mb-3 text-lg">
                ⚠️ Important Disclaimer
              </h4>
              <p className="text-amber-900/80 text-sm mb-4">
                Only use this tool for PDF files that you own or have explicit
                permission to modify. This tool is designed to help you recover
                access to your own password-protected documents.
              </p>
              <ul className="text-amber-900/80 space-y-2 text-sm list-disc list-outside ml-4">
                <li>All processing is done securely in your browser.</li>
                <li>Your files are never uploaded to our servers.</li>
                <li>We do not store or log any passwords.</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}
