import { useState, useRef } from "react";
import { Image as ImageIcon, Upload, Download, Loader2 } from "lucide-react";
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

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState("jpg");
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const convertImageMutation = useMutation({
    mutationFn: async (data: { file: File; format: string }) => {
      // Placeholder for actual API call
      console.log("Simulating API call to convert image:", data);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate network delay

      // Simulate a successful conversion
      const dummyBlob = new Blob(["dummy image data"], {
        type: `image/${data.format}`,
      });
      return dummyBlob;
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      setConvertedImage(url);
      toast({
        title: "Success!",
        description: "Image converted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Conversion failed",
        description:
          "There was an error converting your image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (selectedFile: File | null) => {
    if (!selectedFile) return;

    const validTypes = [
      "image/heic",
      "image/heif",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    if (
      validTypes.includes(selectedFile.type) ||
      selectedFile.name.toLowerCase().endsWith(".heic")
    ) {
      setFile(selectedFile);
      setConvertedImage(null); // Clear previous conversion
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a HEIC, JPEG, PNG, or WebP image.",
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

  const handleConvert = () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }

    convertImageMutation.mutate({ file, format: outputFormat });
  };

  const handleDownload = () => {
    if (!convertedImage || !file) return;

    const a = document.createElement("a");
    a.href = convertedImage;
    a.download = `converted-${file.name.split(".")[0]}.${outputFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(convertedImage); // Revoke URL after download

    toast({
      title: "Downloaded!",
      description: "Converted image downloaded successfully.",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Framer Motion variants for overall container entrance
  const mainContainerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  // Framer Motion variants for card entrance on scroll
  const cardInViewVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  // Framer Motion variants for image preview animation
  const imagePreviewVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <ToolLayout
      title="Image Converter"
      description="Convert HEIC images to JPG or PNG format"
      icon={<ImageIcon className="text-white text-2xl" />}
      // Apply green/yellow gradient for tool icon background
      iconBg="bg-gradient-to-br from-[#00A389] to-[#FFD700]"
      // Overall background should match the header's dark theme
      className="bg-[#1A1C2C] text-white"
    >
      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={mainContainerVariants}
      >
        {/* File Upload */}
        <motion.div
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#00A389]/10 text-white">
            <CardHeader>
              <CardTitle className="text-[#00A389]">Upload Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="cursor-pointer text-center border-2 border-dashed border-[#00A389] hover:border-[#FFD700] p-6 rounded-lg transition-all duration-300 bg-[#23263a] hover:bg-[#23263a]/80"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#00A389] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-[#23263a]">
                  <Upload className="text-white text-xl" />
                </div>
                <h3 className="text-md font-medium text-white mb-2">
                  {file ? file.name : "Drop your image here or click to upload"}
                </h3>
                <p className="text-slate-400 mb-4">
                  {" "}
                  {/* Changed to slate-400 for consistency */}
                  {file
                    ? formatFileSize(file.size)
                    : "Supported: HEIC, JPEG, PNG, WebP"}
                </p>
                <Button className="bg-gradient-to-r from-[#00A389] to-[#FFD700] hover:from-[#008C75] hover:to-[#E6C200] text-white rounded-full px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
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
        </motion.div>

        {/* Output Format Selection */}
        <AnimatePresence>
          {file && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardInViewVariants}
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg text-white">
                <CardHeader>
                  <CardTitle className="text-[#FFD700]">
                    Output Format
                  </CardTitle>{" "}
                  {/* Changed to yellow accent */}
                </CardHeader>
                <CardContent>
                  <div className="w-full max-w-xs sm:max-w-sm">
                    <Label className="text-slate-400 mb-1 block">
                      Convert to
                    </Label>{" "}
                    {/* Changed to slate-400 */}
                    <Select
                      value={outputFormat}
                      onValueChange={setOutputFormat}
                    >
                      <SelectTrigger className="bg-[#141624] text-white border border-[#363A4D] focus:ring-[#00A389] focus:border-[#00A389] transition-all duration-200">
                        <SelectValue placeholder="Select output format" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1C2C] border border-[#2d314d] text-white">
                        <SelectItem
                          value="jpg"
                          className="hover:bg-[#202230] focus:bg-[#202230] transition-colors duration-150"
                        >
                          JPG
                        </SelectItem>
                        <SelectItem
                          value="png"
                          className="hover:bg-[#202230] focus:bg-[#202230] transition-colors duration-150"
                        >
                          PNG
                        </SelectItem>
                        <SelectItem
                          value="webp"
                          className="hover:bg-[#202230] focus:bg-[#202230] transition-colors duration-150"
                        >
                          WebP
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Convert Button */}
        <AnimatePresence>
          {file && (
            <motion.div
              className="text-center"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardInViewVariants}
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <Button
                onClick={handleConvert}
                disabled={convertImageMutation.isPending}
                size="lg"
                className="bg-gradient-to-r from-[#00A389] to-[#FFD700] hover:from-[#008C75] hover:to-[#E6C200] text-white shadow-lg shadow-[#00A389]/30 transform hover:scale-105 transition-all duration-300 rounded-full px-8 py-3 font-semibold"
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Download Converted Image */}
        <AnimatePresence mode="wait">
          {convertedImage && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardInViewVariants}
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg text-white">
                <CardHeader>
                  <CardTitle className="text-[#AF00C3]">
                    Converted Image
                  </CardTitle>{" "}
                  {/* Changed to purple accent */}
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="text-center space-y-4"
                    initial="hidden"
                    animate="visible"
                    variants={imagePreviewVariants}
                  >
                    <div className="bg-[#141624] border border-[#363A4D] rounded-lg p-4 shadow-inner">
                      <p className="text-sm text-slate-400 mb-2">Preview:</p>{" "}
                      {/* Changed to slate-400 */}
                      <img
                        src={convertedImage}
                        alt="Converted"
                        className="max-w-full max-h-64 mx-auto rounded-lg shadow-md border border-[#363A4D]"
                      />
                    </div>
                    <Button
                      onClick={handleDownload}
                      className="bg-gradient-to-r from-[#00A389] to-[#FFD700] hover:from-[#008C75] hover:to-[#E6C200] text-white shadow-lg shadow-[#00A389]/30 transform hover:scale-105 transition-all duration-300 rounded-full px-8 py-3 font-semibold"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Converted Image
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#FFD700]/10 text-white">
            <CardContent className="p-6">
              <h4 className="font-semibold text-[#00A389] mb-3 text-lg">
                Supported formats:
              </h4>
              <ul className="text-slate-400 space-y-2 text-sm list-disc list-inside">
                <li>
                  <strong>Input:</strong> HEIC, HEIF, JPEG, PNG, WebP
                </li>
                <li>
                  <strong>Output:</strong> JPG, PNG, WebP
                </li>
              </ul>
              <p className="text-[#AF00C3] text-sm mt-4">
                <strong>Note:</strong> HEIC is commonly used by iOS devices.
                Convert to JPG or PNG for universal compatibility.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </ToolLayout>
  );
}
