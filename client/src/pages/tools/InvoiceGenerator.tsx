import { useState, useRef } from "react";
import { Receipt, Download, Plus, Trash2, Loader2 } from "lucide-react"; // Added Loader2 for consistency
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { generateInvoicePDF } from "@/utils/pdfUtils"; // Assuming this utility function is available
import { motion, AnimatePresence } from "framer-motion"; // Import motion and AnimatePresence

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  senderName: string;
  senderAddress: string;
  senderEmail: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  items: InvoiceItem[];
  taxRate: number;
  notes: string;
}

export default function InvoiceGenerator() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: `INV-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    senderName: "",
    senderAddress: "",
    senderEmail: "",
    clientName: "",
    clientAddress: "",
    clientEmail: "",
    items: [{ id: "1", description: "", quantity: 1, price: 0 }],
    taxRate: 0,
    notes: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      price: 0,
    };
    setInvoiceData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (id: string) => {
    if (invoiceData.items.length > 1) {
      setInvoiceData((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
      }));
    }
  };

  const updateItem = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const calculateSubtotal = () =>
    invoiceData.items.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
  const calculateTax = () => calculateSubtotal() * (invoiceData.taxRate / 100);
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  const handleGenerateInvoice = async () => {
    if (!invoiceData.senderName || !invoiceData.clientName) {
      toast({
        title: "Missing information",
        description: "Please fill in at least the sender and client names.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const pdfBytes = await generateInvoicePDF(invoiceData);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceData.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Success!",
        description: "Invoice downloaded successfully.",
      });
    } catch (error) {
      console.error("Invoice generation error:", error);
      toast({
        title: "Generation failed",
        description: "An error occurred while generating the invoice.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
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

  // Framer Motion variants for individual invoice items (staggered)
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  };

  return (
    <ToolLayout
      title="Invoice Generator"
      description="Create stunning invoices in a neon-dark theme"
      icon={<Receipt className="text-white text-2xl" />}
      iconBg="bg-[#1F2235]"
    >
      <div className="space-y-6 text-white">
        {/* Invoice Details Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#00FFD1]">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-300">Invoice Number</Label>
                <Input
                  className="bg-[#181A20] border border-[#2d314d] text-white placeholder-gray-500"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) =>
                    setInvoiceData({
                      ...invoiceData,
                      invoiceNumber: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-gray-300">Date</Label>
                <Input
                  type="date"
                  className="bg-[#181A20] border border-[#2d314d] text-white placeholder-gray-500"
                  value={invoiceData.date}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, date: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-gray-300">Due Date</Label>
                <Input
                  type="date"
                  className="bg-[#181A20] border border-[#2d314d] text-white placeholder-gray-500"
                  value={invoiceData.dueDate}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, dueDate: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sender & Client Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {["Sender", "Client"].map((role, idx) => (
            <motion.div
              key={role}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardInViewVariants}
              transition={{
                ...cardInViewVariants.visible.transition,
                delay: idx * 0.1,
              }} // Staggered delay
            >
              <Card className="bg-[#1A1C2C] border border-[#2d314d] rounded-2xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-[#FFD700]">
                    {role} Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    className="bg-[#181A20] border border-[#2d314d] text-white placeholder-gray-500"
                    placeholder="Name"
                    value={invoiceData[idx ? "clientName" : "senderName"]}
                    onChange={(e) =>
                      setInvoiceData({
                        ...invoiceData,
                        [idx ? "clientName" : "senderName"]: e.target.value,
                      })
                    }
                  />
                  <Textarea
                    className="bg-[#181A20] border border-[#2d314d] text-white placeholder-gray-500"
                    placeholder="Address"
                    value={invoiceData[idx ? "clientAddress" : "senderAddress"]}
                    onChange={(e) =>
                      setInvoiceData({
                        ...invoiceData,
                        [idx ? "clientAddress" : "senderAddress"]:
                          e.target.value,
                      })
                    }
                  />
                  <Input
                    type="email"
                    className="bg-[#181A20] border border-[#2d314d] text-white placeholder-gray-500"
                    placeholder="Email"
                    value={invoiceData[idx ? "clientEmail" : "senderEmail"]}
                    onChange={(e) =>
                      setInvoiceData({
                        ...invoiceData,
                        [idx ? "clientEmail" : "senderEmail"]: e.target.value,
                      })
                    }
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Items Table */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] rounded-2xl shadow-xl">
            <CardHeader className="flex justify-between flex-row items-center">
              {" "}
              {/* Added flex-row and items-center */}
              <CardTitle className="text-[#FF6B6B]">Invoice Items</CardTitle>
              <Button className="glow-button" onClick={addItem}>
                <Plus className="mr-1 h-4 w-4" /> Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatePresence mode="popLayout">
                {" "}
                {/* AnimatePresence for item add/remove */}
                {invoiceData.items.map((item) => (
                  <motion.div
                    key={item.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end" // Ensure responsiveness
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={itemVariants}
                  >
                    <Input
                      className="col-span-12 md:col-span-6 bg-[#181A20] border border-[#2d314d] text-white placeholder-gray-500" // Responsive col-span
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, "description", e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      className="col-span-6 md:col-span-2 bg-[#181A20] border border-[#2d314d] text-white placeholder-gray-500" // Responsive col-span
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                    <Input
                      type="number"
                      className="col-span-6 md:col-span-2 bg-[#181A20] border border-[#2d314d] text-white placeholder-gray-500" // Responsive col-span
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "price",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                    <div className="col-span-9 md:col-span-1 text-sm p-2 bg-[#181A20] border border-[#2d314d] text-white rounded flex items-center justify-end">
                      {" "}
                      {/* Responsive col-span */}$
                      {(item.quantity * item.price).toFixed(2)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="col-span-3 md:col-span-1 text-red-400 hover:bg-red-900/20" // Responsive col-span, added hover
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Totals & Notes */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] rounded-2xl shadow-xl">
            <CardContent className="grid md:grid-cols-2 gap-6 px-4 py-2">
              <div>
                <Label className="text-gray-300">Tax Rate (%)</Label>
                <Input
                  type="number"
                  className="bg-[#181A20] border mt-2 border-[#2d314d] text-white placeholder-gray-500"
                  value={invoiceData.taxRate}
                  onChange={(e) =>
                    setInvoiceData({
                      ...invoiceData,
                      taxRate: parseFloat(e.target.value) || 0,
                    })
                  }
                />
                <Textarea
                  className="bg-[#181A20] border border-[#2d314d] text-white placeholder-gray-500 mt-4"
                  placeholder="Notes..."
                  rows={4}
                  value={invoiceData.notes}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, notes: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 text-right">
                <div className="text-gray-400">
                  Subtotal:{" "}
                  <span className="text-white">
                    ₹{calculateSubtotal().toFixed(2)}
                  </span>
                </div>
                <div className="text-gray-400">
                  Tax:{" "}
                  <span className="text-white">
                    ₹{calculateTax().toFixed(2)}
                  </span>
                </div>
                <div className="text-[#00FF87] text-xl font-bold">
                  Total: ₹{calculateTotal().toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <div className="text-center">
            <Button
              onClick={handleGenerateInvoice}
              disabled={isGenerating}
              className="glow-button px-6 py-3 text-lg transition-all duration-300 transform hover:scale-105" // Added hover animation
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" /> Generate Invoice
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </ToolLayout>
  );
}
