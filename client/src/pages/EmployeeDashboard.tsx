import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Upload, Receipt, Plus, Eye, History } from "lucide-react";

export function EmployeeDashboard() {
  const { user, token, logout } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [approvalHistory, setApprovalHistory] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    amount: "",
    currency: "USD",
    category: "office",
    description: "",
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchExpenses();
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const response = await fetch("/api/currency/supported", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCurrencies(data.currencies);
      }
    } catch (error) {
      console.error("Failed to fetch currencies:", error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await fetch("/api/expenses/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses);
      }
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    }
  };

  const fetchApprovalHistory = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setApprovalHistory(data.history);
      }
    } catch (error) {
      console.error("Failed to fetch approval history:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setShowForm(false);
        setFormData({
          amount: "",
          currency: "USD",
          category: "office",
          description: "",
          date: new Date().toISOString().split('T')[0],
        });
        fetchExpenses();
        
        // Show conversion info if currency was converted
        if (data.originalCurrency !== data.companyCurrency) {
          alert(`Amount converted from ${data.originalAmount} ${data.originalCurrency} to ${data.convertedAmount} ${data.companyCurrency}`);
        }
      }
    } catch (error) {
      console.error("Failed to submit expense:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiptUpload = async (expenseId: string) => {
    if (!receiptFile) return;

    const formData = new FormData();
    formData.append('receipt', receiptFile);

    try {
      const response = await fetch(`/api/expenses/${expenseId}/receipt`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setReceiptFile(null);
        fetchExpenses();
        alert("Receipt uploaded successfully!");
      }
    } catch (error) {
      console.error("Failed to upload receipt:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return <Badge className={colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      {/* Retro Grid Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute inset-0 [transform:rotateX(65deg)]">
          <div className="animate-grid [background-image:linear-gradient(to_right,#9333ea_1px,transparent_0),linear-gradient(to_bottom,#9333ea_1px,transparent_0)] [background-repeat:repeat] [background-size:50px_50px] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent to-90% dark:from-black" />
      </div>
      
      <nav className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
              Expense Management
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">Welcome, {user?.name}</span>
              <span className="relative inline-block overflow-hidden rounded-lg p-[1px]">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <Button 
                  onClick={logout}
                  className="relative bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Logout
                </Button>
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Expenses</h2>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <span className="relative inline-block overflow-hidden rounded-lg p-[1px]">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <Button className="relative bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent dark:from-zinc-300/5 dark:via-purple-400/20 text-gray-900 dark:text-white border-0">
                  <Plus className="w-4 h-4 mr-2" />
                  Submit New Expense
                </Button>
              </span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white">Submit New Expense</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Fill out the form below to submit a new expense
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount" className="text-gray-700 dark:text-gray-300">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency" className="text-gray-700 dark:text-gray-300">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date" className="text-gray-700 dark:text-gray-300">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <span className="relative inline-block overflow-hidden rounded-lg p-[1px] w-full">
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="relative w-full bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent dark:from-zinc-300/5 dark:via-purple-400/20 text-gray-900 dark:text-white border-0"
                  >
                    {loading ? "Submitting..." : "Submit Expense"}
                  </Button>
                </span>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Expense History</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">View and manage your submitted expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 dark:border-gray-800">
                  <TableHead className="text-gray-700 dark:text-gray-300">Description</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Category</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Amount</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Receipt</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id} className="border-gray-200 dark:border-gray-800">
                    <TableCell className="font-medium text-gray-900 dark:text-white">{expense.description}</TableCell>
                    <TableCell className="capitalize text-gray-700 dark:text-gray-300">{expense.category}</TableCell>
                    <TableCell className="text-gray-900 dark:text-white font-medium">${expense.amount} {expense.currency}</TableCell>
                    <TableCell>{getStatusBadge(expense.status)}</TableCell>
                    <TableCell>
                      {expense.receiptUrl ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/api/expenses/receipt/${expense.receiptUrl.split('/').pop()}`, '_blank')}
                            className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                            >
                              <Upload className="w-4 h-4 mr-1" />
                              Upload
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                            <DialogHeader>
                              <DialogTitle className="text-gray-900 dark:text-white">Upload Receipt</DialogTitle>
                              <DialogDescription className="text-gray-600 dark:text-gray-400">
                                Upload a receipt for this expense
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="receipt" className="text-gray-700 dark:text-gray-300">Receipt File</Label>
                                <Input
                                  id="receipt"
                                  type="file"
                                  accept="image/*,.pdf"
                                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                                  className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                              <span className="relative inline-block overflow-hidden rounded-lg p-[1px] w-full">
                                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                                <Button 
                                  onClick={() => handleReceiptUpload(expense.id)}
                                  disabled={!receiptFile}
                                  className="relative w-full bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent dark:from-zinc-300/5 dark:via-purple-400/20 text-gray-900 dark:text-white border-0"
                                >
                                  Upload Receipt
                                </Button>
                              </span>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedExpense(expense);
                              fetchApprovalHistory(expense.id);
                            }}
                            className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            <History className="w-4 h-4 mr-1" />
                            History
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                          <DialogHeader>
                            <DialogTitle className="text-gray-900 dark:text-white">Approval History</DialogTitle>
                            <DialogDescription className="text-gray-600 dark:text-gray-400">
                              Track the approval progress for this expense
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {approvalHistory.length > 0 ? (
                              <div className="space-y-2">
                                {approvalHistory.map((entry, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded bg-gray-50 dark:bg-gray-800/50">
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-white">{entry.approver?.name}</p>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">{entry.action}</p>
                                      {entry.comments && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{entry.comments}</p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(entry.createdAt).toLocaleDateString()}
                                      </p>
                                      <Badge variant={entry.action === 'approved' ? 'default' : entry.action === 'rejected' ? 'destructive' : 'secondary'}>
                                        {entry.action}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 dark:text-gray-400">No approval history available</p>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
