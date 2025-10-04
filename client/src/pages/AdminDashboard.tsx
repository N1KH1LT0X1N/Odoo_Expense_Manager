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
    <div className="min-h-screen bg-slate-950">
      <nav className="bg-slate-900 shadow-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-white">Expense Management - Admin Panel</h1>
            <div className="flex items-center gap-4">
              <Badge className="bg-purple-600 text-white">{user?.role}</Badge>
              <span className="text-sm text-slate-300">{user?.name}</span>
              <Button variant="outline" onClick={logout}>Logout</Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expenses">All Expenses</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="flows">Approval Flows</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Company Expenses</CardTitle>
                <CardDescription>View and manage all expense submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500">
                          No expenses found
                        </TableCell>
                      </TableRow>
                    ) : (
                      allExpenses.map(({ expense, user: expenseUser }) => (
                        <TableRow key={expense.id}>
                          <TableCell>{expenseUser.name}</TableCell>
                          <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                          <TableCell className="capitalize">{expense.category}</TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell>{expense.currency} {parseFloat(expense.amount).toFixed(2)}</TableCell>
                          <TableCell>{getStatusBadge(expense.status)}</TableCell>
                          <TableCell>
                            {expense.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproval(expense.id, "approved")}
                                  className="bg-green-600 hover:bg-green-700"
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
              <h2 className="text-2xl font-bold text-white">Users</h2>
              <Button onClick={() => setShowUserForm(!showUserForm)}>
                {showUserForm ? "Cancel" : "Add New User"}
              </Button>
            </div>

            {showUserForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Create New User</CardTitle>
                  <CardDescription>Add a new employee, manager, or admin</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={userFormData.name}
                          onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={userFormData.email}
                          onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={userFormData.password}
                          onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                          required
                          minLength={8}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={userFormData.role} onValueChange={(value) => setUserFormData({ ...userFormData, role: value })}>
                          <SelectTrigger>
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

                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Create User"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge className={
                            u.role === "admin" ? "bg-purple-100 text-purple-800" :
                            u.role === "manager" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
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
              <h2 className="text-2xl font-bold text-white">Approval Flows</h2>
              <Button onClick={() => setShowFlowForm(!showFlowForm)}>
                {showFlowForm ? "Cancel" : "Add Approval Flow"}
              </Button>
            </div>

            {showFlowForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Create Approval Flow</CardTitle>
                  <CardDescription>Configure multi-step approval workflows</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateFlow} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stepOrder">Step Order</Label>
                        <Input
                          id="stepOrder"
                          type="number"
                          value={flowFormData.stepOrder}
                          onChange={(e) => setFlowFormData({ ...flowFormData, stepOrder: e.target.value })}
                          required
                          min="1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="requiredRole">Required Role</Label>
                        <Select value={flowFormData.requiredRole} onValueChange={(value) => setFlowFormData({ ...flowFormData, requiredRole: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amountThreshold">Amount Threshold (optional)</Label>
                        <Input
                          id="amountThreshold"
                          type="number"
                          step="0.01"
                          value={flowFormData.amountThreshold}
                          onChange={(e) => setFlowFormData({ ...flowFormData, amountThreshold: e.target.value })}
                          placeholder="e.g., 1000"
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Create Flow"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Configured Approval Flows</CardTitle>
                <CardDescription>Multi-step approval rules for expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Step Order</TableHead>
                      <TableHead>Required Role</TableHead>
                      <TableHead>Amount Threshold</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvalFlows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500">
                          No approval flows configured
                        </TableCell>
                      </TableRow>
                    ) : (
                      approvalFlows.map((flow) => (
                        <TableRow key={flow.id}>
                          <TableCell>{flow.stepOrder}</TableCell>
                          <TableCell className="capitalize">{flow.requiredRole}</TableCell>
                          <TableCell>
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
