export type UserRole = 'ADMIN' | 'FAMILY' | 'VIEWER'
export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled'
export type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low'
export interface AppUser { uid: string; email: string; displayName: string; role: UserRole; status: 'active' | 'suspended'; phone?: string }
export interface WeddingTask {
  id?: string; title: string; description?: string; functionId: string; category?: string;
  quantity?: string; ownerId?: string; ownerName: string; supporters?: string[];
  priority: TaskPriority; status: TaskStatus; deadline?: string;
  estimatedCost?: number; actualCost?: number; vendorRef?: string; paymentStatus?: string;
  isTemplate?: boolean; createdBy?: string; createdAt?: unknown; updatedAt?: unknown;
}
export interface Expense {
  id?: string; category: string; functionId?: string; description: string; vendor?: string;
  estimatedAmount: number; actualAmount: number; advancePaid: number;
  paymentDeadline?: string; paymentStatus: string; paidBy?: string; createdAt?: unknown;
}
export interface WeddingFunction { id: string; code: string; name: string }
