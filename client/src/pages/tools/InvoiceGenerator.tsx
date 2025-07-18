import { useState } from "react";
import { Receipt, Download, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { generateInvoicePDF } from "@/utils/pdfUtils"; // Assuming a utility for PDF generation
import { motion, AnimatePresence } from "framer-motion";

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

// Light Theme Palette Notes:
// - Page Background: bg-slate-50
// - Card Background: bg-white
// - Text: text-slate-800 (Primary), text-slate-600 (Secondary)
// - Borders: border-slate-200/300
// - Accent Gradient: Green-500 to Teal-500

export default function InvoiceGenerator() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: `INV-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    senderName: "", senderAddress: "", senderEmail: "",
    clientName: "", clientAddress: "", clientEmail: "",
    items: [{ id: "1", description: "", quantity: 1, price: 0 }],
    taxRate: 0,
    notes: "Thank you for your business!",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // --- Core logic functions are unchanged ---
  const addItem = () => setInvoiceData(prev => ({ ...prev, items: [...prev.items, { id: Date.now().toString(), description: "", quantity: 1, price: 0 }] }));
  const removeItem = (id: string) => { if (invoiceData.items.length > 1) { setInvoiceData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) })); } };
  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => setInvoiceData(prev => ({ ...prev, items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item) }));
  
  const calculateSubtotal = () => invoiceData.items.reduce((total, item) => total + item.quantity * item.price, 0);
  const calculateTax = () => calculateSubtotal() * (invoiceData.taxRate / 100);
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  const handleGenerateInvoice = async () => {
    if (!invoiceData.senderName || !invoiceData.clientName) {
      toast({ title: "Missing Information", description: "Please fill in sender and client names.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      // Assumes generateInvoicePDF is a function that takes invoiceData and returns PDF bytes
      const pdfBytes = await generateInvoicePDF(invoiceData);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceData.invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Success!", description: "Invoice PDF downloaded." });
    } catch (error) {
      console.error("Invoice generation error:", error);
      toast({ title: "Generation Failed", description: "An error occurred while creating the PDF.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const cardInViewVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  };

  return (
    <ToolLayout
      title="Invoice Generator"
      description="Create and download professional invoices with ease."
      icon={<Receipt className="text-white" />}
      iconBg="bg-gradient-to-br from-green-500 to-teal-500"
    >
      <div className="space-y-8">
        {/* Invoice Details */}
        <motion.div variants={cardInViewVariants} initial="hidden" animate="visible">
          <Card className="bg-white border-slate-200 rounded-xl shadow-lg shadow-green-500/10">
            <CardHeader><CardTitle className="text-green-600">Invoice Details</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1.5"><Label htmlFor="inv-num">Invoice Number</Label><Input id="inv-num" value={invoiceData.invoiceNumber} onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="inv-date">Date</Label><Input id="inv-date" type="date" value={invoiceData.date} onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="inv-due">Due Date</Label><Input id="inv-due" type="date" value={invoiceData.dueDate} onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })} /></div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sender & Client Details */}
        <div className="grid md:grid-cols-2 gap-8">
          {[{role: 'Sender', data: {name: invoiceData.senderName, address: invoiceData.senderAddress, email: invoiceData.senderEmail}}, {role: 'Client', data: {name: invoiceData.clientName, address: invoiceData.clientAddress, email: invoiceData.clientEmail}}].map((party, idx) => (
            <motion.div key={party.role} variants={cardInViewVariants} initial="hidden" animate="visible" transition={{ delay: idx * 0.1 }}>
              <Card className="bg-white border-slate-200 rounded-xl shadow-lg shadow-slate-500/10 h-full">
                <CardHeader><CardTitle className="text-slate-700">{party.role} Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Name" value={party.data.name} onChange={(e) => setInvoiceData(prev => ({...prev, [`${party.role.toLowerCase()}Name`]: e.target.value}))} />
                  <Textarea placeholder="Address" value={party.data.address} onChange={(e) => setInvoiceData(prev => ({...prev, [`${party.role.toLowerCase()}Address`]: e.target.value}))} />
                  <Input type="email" placeholder="Email" value={party.data.email} onChange={(e) => setInvoiceData(prev => ({...prev, [`${party.role.toLowerCase()}Email`]: e.target.value}))} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Items */}
        <motion.div variants={cardInViewVariants} initial="hidden" animate="visible">
          <Card className="bg-white border-slate-200 rounded-xl shadow-lg shadow-teal-500/10">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-teal-600">Invoice Items</CardTitle>
              <Button variant="outline" onClick={addItem} className="border-teal-500 text-teal-600 hover:bg-teal-50 hover:text-teal-700"><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatePresence>
                {invoiceData.items.map((item) => (
                  <motion.div key={item.id} variants={itemVariants} initial="hidden" animate="visible" exit="exit" layout className="grid grid-cols-12 gap-2 items-center">
                    <Input className="col-span-12 md:col-span-5" placeholder="Description" value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} />
                    <Input className="col-span-4 md:col-span-2" type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)} />
                    <Input className="col-span-4 md:col-span-2" type="number" placeholder="Price" value={item.price} onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value) || 0)} />
                    <div className="col-span-3 md:col-span-2 text-right p-2 font-medium text-slate-700 bg-slate-100 rounded-md">₹{(item.quantity * item.price).toFixed(2)}</div>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="col-span-1 text-slate-500 hover:bg-red-100 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Totals & Notes */}
        <motion.div variants={cardInViewVariants} initial="hidden" animate="visible">
            <div className="grid md:grid-cols-2 gap-8 items-start">
                <Card className="bg-white border-slate-200 rounded-xl shadow-lg shadow-slate-500/10">
                    <CardHeader><CardTitle className="text-slate-700">Notes & Tax</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                            <Input id="tax-rate" type="number" value={invoiceData.taxRate} onChange={(e) => setInvoiceData({...invoiceData, taxRate: parseFloat(e.target.value) || 0})} />
                        </div>
                         <div className="space-y-1.5">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea id="notes" placeholder="e.g., Payment is due within 30 days." rows={3} value={invoiceData.notes} onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 rounded-xl shadow-lg shadow-teal-500/10">
                    <CardHeader><CardTitle className="text-teal-600">Total Summary</CardTitle></CardHeader>
                    <CardContent className="space-y-3 text-right">
                        <div className="flex justify-between text-slate-600"><p>Subtotal:</p><p className="font-medium text-slate-800">₹{calculateSubtotal().toFixed(2)}</p></div>
                        <div className="flex justify-between text-slate-600"><p>Tax ({invoiceData.taxRate}%):</p><p className="font-medium text-slate-800">₹{calculateTax().toFixed(2)}</p></div>
                        <div className="pt-3 border-t border-slate-200 flex justify-between text-teal-700 text-2xl font-bold"><p>Total:</p><p>₹{calculateTotal().toFixed(2)}</p></div>
                    </CardContent>
                </Card>
            </div>
        </motion.div>

        {/* Action Button */}
        <motion.div variants={cardInViewVariants} initial="hidden" animate="visible" className="text-center pt-4">
            <Button onClick={handleGenerateInvoice} disabled={isGenerating} size="lg" className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg shadow-green-500/40 transform hover:scale-105 transition-all duration-300 rounded-full px-10 py-3 text-base font-semibold">
                {isGenerating ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating PDF...</>) : (<><Download className="mr-2 h-5 w-5" /> Generate & Download PDF</>)}
            </Button>
        </motion.div>
      </div>
    </ToolLayout>
  );
}