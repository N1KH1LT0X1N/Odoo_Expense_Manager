# Expense Management System

## Overview

This is a full-stack expense management system built with React, Express, and PostgreSQL. The application enables companies to manage employee expense submissions with role-based access control and configurable approval workflows. Employees can submit expenses with receipt uploads, managers can review and approve/reject submissions, and administrators have full control over users, approval rules, and company-wide expense oversight.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Styling**: The application uses React with TypeScript as the frontend framework, styled with TailwindCSS and shadcn/ui components. The component library is configured in the "new-york" style with CSS variables for theming.

**Routing**: Uses wouter for client-side routing with protected routes that redirect unauthenticated users to the login page.

**State Management**: Utilizes React Context API for authentication state (`AuthContext`) and TanStack Query (React Query) for server state management with disabled automatic refetching to reduce unnecessary network calls.

**Authentication Flow**: JWT-based authentication with tokens stored in localStorage. The auth context checks token validity on mount and maintains user session state throughout the application lifecycle.

**Role-Based UI**: The dashboard component dynamically renders different interfaces (EmployeeDashboard, ManagerDashboard, AdminDashboard) based on the authenticated user's role.

### Backend Architecture

**Server Framework**: Express.js server with TypeScript, configured for ESM modules.

**Database Layer**: Uses Drizzle ORM with Neon serverless PostgreSQL driver. Database schema is defined in `shared/schema.ts` and includes:
- Companies table with currency settings
- Users table with role-based access (admin, manager, employee)
- Expenses table with approval workflow tracking
- Approval flows table for configurable multi-step approvals

**Authentication & Authorization**: 
- JWT-based authentication with configurable secret (defaults to development key if not set)
- Middleware-based route protection (`verifyToken`)
- Role-based access control middleware (`requireRole`) for admin/manager-specific endpoints
- Password hashing using bcrypt with salt rounds of 10

**API Structure**: RESTful API organized by domain:
- `/api/auth` - Authentication endpoints (signup, login)
- `/api/users` - User management (admin only)
- `/api/expenses` - Expense CRUD operations with role-based access
- `/api/approval-flows` - Approval workflow configuration (admin only)

**Development Setup**: Vite development server runs in middleware mode, serving the React application with HMR support. Production builds are bundled separately for client (Vite) and server (esbuild).

### Data Models

**User Roles**: Three-tier role system (employee, manager, admin) with hierarchical permissions. Managers can be assigned to employees for approval workflows.

**Expense Categories**: Predefined categories (travel, food, office, equipment, other) stored as PostgreSQL enums.

**Expense Status**: Three-state workflow (pending, approved, rejected) with sequential approval step tracking.

**Approval Workflow**: Configurable multi-step approval process with:
- Step ordering for sequential approvals
- Role-based approver requirements
- Optional amount thresholds for conditional routing

### External Dependencies

**Database**: PostgreSQL via Neon serverless platform (@neondatabase/serverless). Connection configured through DATABASE_URL environment variable.

**UI Components**: shadcn/ui component library built on Radix UI primitives, providing accessible React components for:
- Form controls (input, select, checkbox, radio)
- Overlays (dialog, popover, dropdown, sheet)
- Data display (table, card, badge, tabs)
- Feedback (toast notifications, alerts)

**Authentication**: jsonwebtoken library for JWT generation and verification with 7-day token expiration.

**Password Security**: bcrypt for password hashing with type definitions (@types/bcrypt).

**Development Tools**:
- Replit-specific plugins for runtime error overlay, cartographer, and dev banner
- Drizzle Kit for database migrations
- TypeScript for type safety across the stack

**Planned Features**: The project document indicates OCR receipt processing (Tesseract.js) as a planned feature, though not yet implemented in the current codebase.