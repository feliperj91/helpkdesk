export type Role = 'CLIENT' | 'TECHNICIAN' | 'ADMIN';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: Role;
    unit_id?: string;
    avatar_url?: string;
    created_at: string;
}

export interface Ticket {
    id: number; // Auto-increment as requested
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    category: string;
    product?: string;
    area?: string;

    // Contact info
    contact_email: string;
    contact_phone?: string;
    unit: string;
    location?: string;

    // Relations
    created_by: string; // User ID
    assigned_to?: string; // User ID (Technician)
    parent_id?: number; // For sub-tickets

    // SLA & Timing
    created_at: string;
    updated_at: string;
    sla_deadline?: string;
    resolved_at?: string;

    attachments?: string[]; // URLs
}

export interface Comment {
    id: string;
    ticket_id: number;
    user_id: string;
    content: string;
    created_at: string;
    attachments?: string[];
    is_internal: boolean; // For technician notes
}
