import { useState, useRef } from "react";
import { Unlock, Upload, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { removePDFPassword } from "@/utils/pdfUtils";
import { motion, AnimatePresence } from "framer-motion";

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
        variant: "destructive",
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
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const unlockedPdfBytes = await removePDFPassword(file, password);

      // Create download link
      const blob = new Blob([unlockedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
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
      console.error("Password removal error:", error);
      toast({
        title: "Failed to remove password",
        description:
          "The password might be incorrect or the file might be corrupted.",
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
      title="PDF Password Remover"
      description="Remove passwords from PDF files you own"
      icon={<Unlock className="text-white text-2xl" />}
      // Apply green/yellow gradient for icon background
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
                {file ? file.name : "Drop your password-protected PDF here"}
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
              onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
              className="hidden"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Password Input */}
      <AnimatePresence>
        {file && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden" // Animate out when file is removed
            variants={containerVariants}
          >
            <Card className="mb-6 bg-[#1A1C2C] border border-[#2d314d] text-white rounded-xl shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <motion.div variants={itemVariants}>
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-white" // Label text color
                    >
                      PDF Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter the PDF password"
                      // Input styling aligned with dark theme
                      className="mt-1 bg-[#141624] border border-[#363A4D] text-white placeholder:text-slate-500 focus:ring-[#00A389] focus:border-[#00A389] rounded-md shadow-sm"
                    />
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    transition={{
                      ...itemVariants.visible.transition,
                      delay: 0.2,
                    }}
                  >
                    <Button
                      onClick={handleRemovePassword}
                      disabled={isProcessing || !password}
                      size="lg"
                      // Button gradient and hover colors updated to match header's accent
                      className="w-full bg-gradient-to-r from-[#00A389] to-[#FFD700] text-white hover:from-[#008C75] hover:to-[#E6C200] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-full px-8 py-3 font-semibold"
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
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disclaimer */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        transition={{ ...containerVariants.visible.transition, delay: 0.2 }}
      >
        <Card className="bg-[#1A1C2C] border border-[#363A4D] text-white rounded-xl shadow-lg">
          <CardContent className="p-6 bg-[#1A1C2C] rounded-xl shadow-lg border border-[#363A4D]">
            <h4 className="font-semibold text-[#FFD700] mb-3 text-lg"> {/* Changed text-yellow-400 to text-[#FFD700] */}
              ⚠️ Important Disclaimer
            </h4>
            <p className="text-slate-400 text-sm mb-4"> {/* Changed text-gray-300 to text-slate-400 */}
              Only use this tool for PDF files that you own or have explicit
              permission to modify. This tool is designed to help you recover
              access to your own password-protected documents.
            </p>
            <ul className="text-slate-400 space-y-2 text-sm list-disc list-inside"> {/* Changed text-gray-300 to text-slate-400 */}
              <li>All processing is done locally in your browser</li>
              <li>Your files are never uploaded to our servers</li>
              <li>The password is only used to decrypt the PDF</li>
              <li>We do not store or log any passwords</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </ToolLayout>
  );
}