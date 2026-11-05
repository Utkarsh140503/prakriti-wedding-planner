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
export interface WeddingFunction { id: string; code: string; name: string }

export interface Expense { id?: string; title: string; category: string; functionId: string; vendorName?: string; estimatedCost?: number; actualCost?: number; advancePaid?: number; paidBy?: string; paymentMethod?: string; paymentDate?: string; notes?: string; receiptUrl?: string }
export interface Vendor { id?: string; businessName: string; ownerName?: string; category: string; contactPerson?: string; phone?: string; whatsapp?: string; email?: string; address?: string; city?: string; quotedAmount?: number; finalAmount?: number; advancePaid?: number; status: string; functionId?: string; rating?: number; notes?: string; contractUrl?: string }
export interface ShopItem { id?: string; itemName: string; category: string; personFor: string; functionId: string; shop?: string; estimatedPrice?: number; actualPrice?: number; status: string; priority: string; assignedTo?: string; purchaseDate?: string; notes?: string; isTemplate?: boolean }
export interface RitualItem { id?: string; itemName: string; hindiName?: string; functionId: string; category: string; quantity?: string; unit?: string; status: string; priority: string; source?: string; estimatedCost?: number; actualCost?: number; assignedTo?: string; notes?: string; isTemplate?: boolean }
export interface FamilyMember { id?: string; fullName: string; relation: string; side: string; phone?: string; whatsapp?: string; email?: string; address?: string; responsibilities?: string[]; functionsInvolved?: string[]; notes?: string; status: string }

export interface Guest { id?: string; fullName: string; familyName?: string; side: string; relation?: string; phone?: string; whatsapp?: string; email?: string; address?: string; city?: string; memberCount?: number; adults?: number; children?: number; invitationType?: string; invitationStatus: string; rsvpStatus: string; mealPreference?: string; accommodation?: boolean; transport?: boolean; functionsInvited?: string[]; notes?: string; priority?: string }
export interface ScheduleEvent { id?: string; eventName: string; functionId: string; date: string; startTime?: string; endTime?: string; venue?: string; address?: string; mapsLink?: string; description?: string; dressCode?: string; contactPerson?: string; notes?: string; status: string }
