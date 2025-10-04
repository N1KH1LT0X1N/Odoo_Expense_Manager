import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

export function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const [allExpenses, setAllExpenses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [approvalFlows, setApprovalFlows] = useState<any[]>([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showFlowForm, setShowFlowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
  });

  const [flowFormData, setFlowFormData] = useState({
    stepOrder: "1",
    requiredRole: "manager",
    amountThreshold: "",
  });

  useEffect(() => {
    fetchAllExpenses();
    fetchUsers();
    fetchApprovalFlows();
  }, []);

  const fetchAllExpenses = async () => {
    try {
      const response = await fetch("/api/expenses/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAllExpenses(data.expenses);
      }
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userFormData),
      });

      if (response.ok) {
        setShowUserForm(false);
        setUserFormData({ name: "", email: "", password: "", role: "employee" });
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to create user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (expenseId: string, status: "approved" | "rejected") => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchAllExpenses();
      }
    } catch (error) {
      console.error("Failed to update expense:", error);
    }
  };

  const fetchApprovalFlows = async () => {
    try {
      const response = await fetch("/api/approval-flows", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setApprovalFlows(data.flows);
      }
    } catch (error) {
      console.error("Failed to fetch approval flows:", error);
    }
  };

  const handleCreateFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/approval-flows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stepOrder: parseInt(flowFormData.stepOrder),
          requiredRole: flowFormData.requiredRole,
          amountThreshold: flowFormData.amountThreshold ? parseFloat(flowFormData.amountThreshold) : null,
        }),
      });

      if (response.ok) {
        setShowFlowForm(false);
        setFlowFormData({ stepOrder: "1", requiredRole: "manager", amountThreshold: "" });
        fetchApprovalFlows();
      }
    } catch (error) {
      console.error("Failed to create approval flow:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFlow = async (flowId: string) => {
    try {
      const response = await fetch(`/api/approval-flows/${flowId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchApprovalFlows();
      }
    } catch (error) {
      console.error("Failed to delete flow:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return <Badge className={colors[status as keyof typeof colors] || ""}>{status}</Badge>;
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
              Expense Management - Admin Panel
            </h1>
            <div className="flex items-center gap-4">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0">{user?.role}</Badge>
              <span className="text-sm text-gray-700 dark:text-gray-300">{user?.name}</span>
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
        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800/50">
            <TabsTrigger value="expenses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-500 data-[state=active]:text-white">All Expenses</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-500 data-[state=active]:text-white">User Management</TabsTrigger>
            <TabsTrigger value="flows" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-500 data-[state=active]:text-white">Approval Flows</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="mt-6">
            <Card className="border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">All Company Expenses</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">View and manage all expense submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-gray-800">
                      <TableHead className="text-gray-700 dark:text-gray-300">Employee</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Category</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Description</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Amount</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allExpenses.length === 0 ? (
                      <TableRow className="border-gray-200 dark:border-gray-800">
                        <TableCell colSpan={7} className="text-center text-gray-500 dark:text-gray-400">
                          No expenses found
                        </TableCell>
                      </TableRow>
                    ) : (
                      allExpenses.map(({ expense, user: expenseUser }) => (
                        <TableRow key={expense.id} className="border-gray-200 dark:border-gray-800">
                          <TableCell className="text-gray-900 dark:text-white">{expenseUser.name}</TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">{new Date(expense.date).toLocaleDateString()}</TableCell>
                          <TableCell className="capitalize text-gray-700 dark:text-gray-300">{expense.category}</TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">{expense.description}</TableCell>
                          <TableCell className="text-gray-900 dark:text-white font-medium">{expense.currency} {parseFloat(expense.amount).toFixed(2)}</TableCell>
                          <TableCell>{getStatusBadge(expense.status)}</TableCell>
                          <TableCell>
                            {expense.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproval(expense.id, "approved")}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleApproval(expense.id, "rejected")}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h2>
              <span className="relative inline-block overflow-hidden rounded-lg p-[1px]">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <Button 
                  onClick={() => setShowUserForm(!showUserForm)}
                  className="relative bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent dark:from-zinc-300/5 dark:via-purple-400/20 text-gray-900 dark:text-white border-0"
                >
                  {showUserForm ? "Cancel" : "Add New User"}
                </Button>
              </span>
            </div>

            {showUserForm && (
              <Card className="mb-6 border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Create New User</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Add a new employee, manager, or admin</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                        <Input
                          id="name"
                          value={userFormData.name}
                          onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                          className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={userFormData.email}
                          onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                          className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={userFormData.password}
                          onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                          className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                          required
                          minLength={8}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-gray-700 dark:text-gray-300">Role</Label>
                        <Select value={userFormData.role} onValueChange={(value) => setUserFormData({ ...userFormData, role: value })}>
                          <SelectTrigger className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <span className="relative inline-block overflow-hidden rounded-lg p-[1px]">
                      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="relative bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent dark:from-zinc-300/5 dark:via-purple-400/20 text-gray-900 dark:text-white border-0"
                      >
                        {loading ? "Creating..." : "Create User"}
                      </Button>
                    </span>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card className="border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-gray-800">
                      <TableHead className="text-gray-700 dark:text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id} className="border-gray-200 dark:border-gray-800">
                        <TableCell className="text-gray-900 dark:text-white">{u.name}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{u.email}</TableCell>
                        <TableCell>
                          <Badge className={
                            u.role === "admin" ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0" :
                            u.role === "manager" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
                            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          }>
                            {u.role}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flows" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Approval Flows</h2>
              <span className="relative inline-block overflow-hidden rounded-lg p-[1px]">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <Button 
                  onClick={() => setShowFlowForm(!showFlowForm)}
                  className="relative bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent dark:from-zinc-300/5 dark:via-purple-400/20 text-gray-900 dark:text-white border-0"
                >
                  {showFlowForm ? "Cancel" : "Add Approval Flow"}
                </Button>
              </span>
            </div>

            {showFlowForm && (
              <Card className="mb-6 border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Create Approval Flow</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Configure multi-step approval workflows</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateFlow} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stepOrder" className="text-gray-700 dark:text-gray-300">Step Order</Label>
                        <Input
                          id="stepOrder"
                          type="number"
                          value={flowFormData.stepOrder}
                          onChange={(e) => setFlowFormData({ ...flowFormData, stepOrder: e.target.value })}
                          className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                          required
                          min="1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="requiredRole" className="text-gray-700 dark:text-gray-300">Required Role</Label>
                        <Select value={flowFormData.requiredRole} onValueChange={(value) => setFlowFormData({ ...flowFormData, requiredRole: value })}>
                          <SelectTrigger className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amountThreshold" className="text-gray-700 dark:text-gray-300">Amount Threshold (optional)</Label>
                        <Input
                          id="amountThreshold"
                          type="number"
                          step="0.01"
                          value={flowFormData.amountThreshold}
                          onChange={(e) => setFlowFormData({ ...flowFormData, amountThreshold: e.target.value })}
                          className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                          placeholder="e.g., 1000"
                        />
                      </div>
                    </div>

                    <span className="relative inline-block overflow-hidden rounded-lg p-[1px]">
                      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="relative bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent dark:from-zinc-300/5 dark:via-purple-400/20 text-gray-900 dark:text-white border-0"
                      >
                        {loading ? "Creating..." : "Create Flow"}
                      </Button>
                    </span>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card className="border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Configured Approval Flows</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Multi-step approval rules for expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-gray-800">
                      <TableHead className="text-gray-700 dark:text-gray-300">Step Order</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Required Role</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Amount Threshold</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvalFlows.length === 0 ? (
                      <TableRow className="border-gray-200 dark:border-gray-800">
                        <TableCell colSpan={4} className="text-center text-gray-500 dark:text-gray-400">
                          No approval flows configured
                        </TableCell>
                      </TableRow>
                    ) : (
                      approvalFlows.map((flow) => (
                        <TableRow key={flow.id} className="border-gray-200 dark:border-gray-800">
                          <TableCell className="text-gray-900 dark:text-white">{flow.stepOrder}</TableCell>
                          <TableCell className="capitalize text-gray-700 dark:text-gray-300">{flow.requiredRole}</TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">
                            {flow.amountThreshold ? `$${parseFloat(flow.amountThreshold).toFixed(2)}+` : "Any amount"}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteFlow(flow.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
