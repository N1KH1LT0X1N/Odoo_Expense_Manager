import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";

export function ManagerDashboard() {
  const { user, token, logout } = useAuth();
  const [pendingExpenses, setPendingExpenses] = useState<any[]>([]);

  useEffect(() => {
    fetchPendingExpenses();
  }, []);

  const fetchPendingExpenses = async () => {
    try {
      const response = await fetch("/api/expenses/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPendingExpenses(data.expenses);
      }
    } catch (error) {
      console.error("Failed to fetch pending expenses:", error);
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
        fetchPendingExpenses();
      }
    } catch (error) {
      console.error("Failed to update expense:", error);
    }
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
              Expense Management - Manager View
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Pending Approvals</h2>

        <Card className="border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Expense Approval Queue</CardTitle>
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
                  <TableHead className="text-gray-700 dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingExpenses.length === 0 ? (
                  <TableRow className="border-gray-200 dark:border-gray-800">
                    <TableCell colSpan={6} className="text-center text-gray-500 dark:text-gray-400">
                      No pending expenses
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingExpenses.map(({ expense, user: expenseUser }) => (
                    <TableRow key={expense.id} className="border-gray-200 dark:border-gray-800">
                      <TableCell className="text-gray-900 dark:text-white">{expenseUser.name}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{new Date(expense.date).toLocaleDateString()}</TableCell>
                      <TableCell className="capitalize text-gray-700 dark:text-gray-300">{expense.category}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{expense.description}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white font-medium">{expense.currency} {parseFloat(expense.amount).toFixed(2)}</TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
