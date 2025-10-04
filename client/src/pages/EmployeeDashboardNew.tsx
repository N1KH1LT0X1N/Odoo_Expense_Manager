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
    <div className="min-h-screen bg-slate-950">
      <nav className="bg-slate-900 shadow-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-white">Expense Management</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300">Welcome, {user?.name}</span>
              <Button variant="outline" onClick={logout}>Logout</Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">My Expenses</h2>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Submit New Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Submit New Expense</DialogTitle>
                <DialogDescription>
                  Fill out the form below to submit a new expense
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger>
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
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Submitting..." : "Submit Expense"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Expense History</CardTitle>
            <CardDescription>View and manage your submitted expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell className="capitalize">{expense.category}</TableCell>
                    <TableCell>${expense.amount} {expense.currency}</TableCell>
                    <TableCell>{getStatusBadge(expense.status)}</TableCell>
                    <TableCell>
                      {expense.receiptUrl ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/api/expenses/receipt/${expense.receiptUrl.split('/').pop()}`, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Upload className="w-4 h-4 mr-1" />
                              Upload
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Upload Receipt</DialogTitle>
                              <DialogDescription>
                                Upload a receipt for this expense
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="receipt">Receipt File</Label>
                                <Input
                                  id="receipt"
                                  type="file"
                                  accept="image/*,.pdf"
                                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                                />
                              </div>
                              <Button 
                                onClick={() => handleReceiptUpload(expense.id)}
                                disabled={!receiptFile}
                                className="w-full"
                              >
                                Upload Receipt
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
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
                          >
                            <History className="w-4 h-4 mr-1" />
                            History
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Approval History</DialogTitle>
                            <DialogDescription>
                              Track the approval progress for this expense
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {approvalHistory.length > 0 ? (
                              <div className="space-y-2">
                                {approvalHistory.map((entry, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                                    <div>
                                      <p className="font-medium">{entry.approver?.name}</p>
                                      <p className="text-sm text-gray-500">{entry.action}</p>
                                      {entry.comments && (
                                        <p className="text-sm text-gray-600">{entry.comments}</p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-gray-500">
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
                              <p className="text-gray-500">No approval history available</p>
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
