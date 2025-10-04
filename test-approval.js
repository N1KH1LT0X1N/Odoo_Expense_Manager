// Simple test to verify approval service
const { approvalService } = require('./server/services/approvalService.ts');

async function testApproval() {
  try {
    console.log('Testing approval service...');
    
    // Test simple approval without flows
    const result = await approvalService.processSimpleApproval(
      'test-expense-id',
      'test-approver-id', 
      'approved',
      'Test approval'
    );
    
    console.log('Approval result:', result);
  } catch (error) {
    console.error('Error testing approval:', error);
  }
}

testApproval();
