# 💰 Expense Management System

<div align="center">

![Expense Management System](https://img.shields.io/badge/Expense-Management-blue?style=for-the-badge&logo=calculator)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178C6?style=for-the-badge&logo=typescript)
![Express](https://img.shields.io/badge/Express-4.21.2-000000?style=for-the-badge&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-336791?style=for-the-badge&logo=postgresql)

**A modern, full-stack expense management solution with role-based access control and configurable approval workflows**

[🚀 Live Demo](#-quick-start) • [📖 Documentation](#-features) • [🛠️ Tech Stack](#️-tech-stack) • [📸 Screenshots](#-screenshots)

</div>

---

## 🌟 Overview

The **Expense Management System** is a comprehensive, enterprise-grade application designed to streamline expense tracking and approval processes for organizations of all sizes. Built with modern web technologies, it provides an intuitive interface for employees to submit expenses, managers to review and approve them, and administrators to oversee the entire system.

### ✨ Key Highlights

- 🎯 **Role-Based Access Control** - Three-tier permission system (Employee, Manager, Admin)
- 🔄 **Configurable Approval Workflows** - Multi-step approval processes with amount thresholds
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- 🔐 **Secure Authentication** - JWT-based auth with bcrypt password hashing
- 📊 **Real-time Analytics** - Comprehensive expense reporting and insights
- 🚀 **Modern Tech Stack** - Built with React, TypeScript, Express, and PostgreSQL

---

## 🎯 Features

### 👥 **Multi-Role Dashboard System**

| Role | Capabilities |
|------|-------------|
| **👤 Employee** | Submit expenses, upload receipts, track status, view personal reports |
| **👨‍💼 Manager** | Review/approve expenses, manage team, view team analytics |
| **👑 Admin** | Full system control, user management, approval workflows, company settings |

### 💼 **Expense Management**

- ✅ **Smart Expense Submission** - Categorized expense entry with receipt upload
- 📋 **Receipt Processing** - Upload and attach receipts to expenses
- 🏷️ **Category Management** - Predefined categories (Travel, Food, Office, Equipment, Other)
- 💱 **Multi-Currency Support** - Handle expenses in different currencies
- 📅 **Date Tracking** - Expense date and submission tracking

### 🔄 **Approval Workflows**

- ⚙️ **Configurable Rules** - Set up custom approval flows based on amount and role
- 📈 **Multi-Step Approvals** - Sequential approval processes
- 💰 **Amount Thresholds** - Automatic routing based on expense amounts
- 🔔 **Real-time Notifications** - Instant updates on approval status changes

### 📊 **Analytics & Reporting**

- 📈 **Visual Dashboards** - Interactive charts and graphs
- 📋 **Detailed Reports** - Comprehensive expense reports
- 💹 **Trend Analysis** - Track spending patterns over time
- 🎯 **Department Insights** - Team and department-level analytics

---

## 🛠️ Tech Stack

### **Frontend**
- ⚛️ **React 18.3.1** - Modern UI library with hooks
- 🔷 **TypeScript 5.6.3** - Type-safe JavaScript
- 🎨 **TailwindCSS 3.4.17** - Utility-first CSS framework
- 🧩 **shadcn/ui** - Beautiful, accessible component library
- 🎭 **Radix UI** - Headless UI primitives
- 🎨 **Framer Motion** - Smooth animations and transitions
- 🔄 **TanStack Query** - Powerful data synchronization
- 🛣️ **Wouter** - Lightweight routing solution

### **Backend**
- 🚀 **Express.js 4.21.2** - Fast, unopinionated web framework
- 🔷 **TypeScript** - Type-safe server-side code
- 🔐 **JWT Authentication** - Secure token-based auth
- 🔒 **bcrypt** - Password hashing and security
- 📊 **Drizzle ORM** - Type-safe database operations
- 🗄️ **PostgreSQL** - Robust relational database

### **Database & Infrastructure**
- 🐘 **PostgreSQL** - Primary database
- ☁️ **Neon** - Serverless PostgreSQL hosting
- 🔄 **Drizzle Kit** - Database migrations and schema management

### **Development Tools**
- ⚡ **Vite** - Lightning-fast build tool
- 🔧 **ESBuild** - Fast JavaScript bundler
- 🎯 **TypeScript** - Static type checking
- 🎨 **PostCSS** - CSS processing
- 📦 **npm** - Package management

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **PostgreSQL** database (or Neon account)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/expense-management-system.git
   cd expense-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   DATABASE_URL="postgresql://username:password@hostname/database"
   NODE_ENV="development"
   PORT="3000"
   JWT_SECRET="your-secret-key-here"
   ```

4. **Run database migrations**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

### 🐳 Docker Setup (Alternative)

```bash
# Start PostgreSQL with Docker
docker run --name postgres-expense \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=expense_manager \
  -p 5432:5432 -d postgres

# Set environment variable
export DATABASE_URL="postgresql://postgres:password@localhost:5432/expense_manager"

# Run the application
npm run dev
```

---

## 📸 Screenshots

### 🏠 **Landing Page**
![Landing Page](https://via.placeholder.com/800x400/1e40af/ffffff?text=Landing+Page)

### 🔐 **Authentication**
![Login Page](https://via.placeholder.com/800x400/059669/ffffff?text=Login+Page)

### 👤 **Employee Dashboard**
![Employee Dashboard](https://via.placeholder.com/800x400/7c3aed/ffffff?text=Employee+Dashboard)

### 👨‍💼 **Manager Dashboard**
![Manager Dashboard](https://via.placeholder.com/800x400/dc2626/ffffff?text=Manager+Dashboard)

### 👑 **Admin Dashboard**
![Admin Dashboard](https://via.placeholder.com/800x400/ea580c/ffffff?text=Admin+Dashboard)

---

## 🏗️ Project Structure

```
expense-management-system/
├── 📁 client/                 # React frontend
│   ├── 📁 src/
│   │   ├── 📁 components/     # Reusable UI components
│   │   ├── 📁 pages/          # Page components
│   │   ├── 📁 contexts/       # React contexts
│   │   ├── 📁 hooks/          # Custom hooks
│   │   └── 📁 lib/            # Utility functions
│   └── 📄 index.html
├── 📁 server/                 # Express backend
│   ├── 📁 routes/             # API route handlers
│   ├── 📁 middleware/         # Custom middleware
│   ├── 📄 index.ts           # Server entry point
│   └── 📄 db.ts              # Database configuration
├── 📁 shared/                 # Shared types and schemas
│   └── 📄 schema.ts          # Database schema definitions
├── 📄 package.json           # Dependencies and scripts
├── 📄 vite.config.ts         # Vite configuration
└── 📄 drizzle.config.ts      # Database migration config
```

---

## 🔧 API Documentation

### **Authentication Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/signup` | Create new company and admin | ❌ |
| `POST` | `/api/auth/login` | User login | ❌ |

### **User Management**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/users` | Get all users | ✅ (Admin) |
| `POST` | `/api/users` | Create new user | ✅ (Admin) |
| `PUT` | `/api/users/:id` | Update user | ✅ (Admin) |
| `DELETE` | `/api/users/:id` | Delete user | ✅ (Admin) |

### **Expense Management**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/expenses` | Get expenses | ✅ |
| `POST` | `/api/expenses` | Create expense | ✅ |
| `PUT` | `/api/expenses/:id` | Update expense | ✅ |
| `DELETE` | `/api/expenses/:id` | Delete expense | ✅ |
| `POST` | `/api/expenses/:id/approve` | Approve expense | ✅ (Manager+) |
| `POST` | `/api/expenses/:id/reject` | Reject expense | ✅ (Manager+) |

---

## 🎨 UI Components

The application uses a comprehensive set of UI components built with **shadcn/ui** and **Radix UI**:

### **Form Components**
- Input fields, select dropdowns, checkboxes, radio buttons
- Date pickers, file uploads, text areas
- Form validation with error handling

### **Data Display**
- Tables with sorting and filtering
- Cards, badges, and status indicators
- Charts and graphs for analytics

### **Navigation & Layout**
- Responsive navigation menus
- Sidebar navigation
- Breadcrumb navigation
- Modal dialogs and sheets

### **Feedback & Notifications**
- Toast notifications
- Alert dialogs
- Loading states and skeletons
- Progress indicators

---

## 🔐 Security Features

- **🔒 JWT Authentication** - Secure token-based authentication
- **🛡️ Password Hashing** - bcrypt with salt rounds for password security
- **🔐 Role-Based Access Control** - Granular permissions system
- **🛡️ Input Validation** - Zod schema validation for all inputs
- **🔒 CORS Protection** - Cross-origin request security
- **🛡️ SQL Injection Prevention** - Drizzle ORM with parameterized queries

---

## 🚀 Deployment

### **Production Build**

```bash
# Build the application
npm run build

# Start production server
npm start
```

### **Environment Variables**

```bash
# Required environment variables
DATABASE_URL="postgresql://username:password@hostname/database"
NODE_ENV="production"
PORT="3000"
JWT_SECRET="your-production-secret-key"
```

### **Database Setup**

```bash
# Run migrations
npm run db:push

# Or generate migration files
npx drizzle-kit generate
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### **Development Guidelines**

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **shadcn/ui** - Beautiful component library
- **Radix UI** - Accessible UI primitives
- **TailwindCSS** - Utility-first CSS framework
- **Drizzle ORM** - Type-safe database operations
- **Neon** - Serverless PostgreSQL hosting

---

## 📞 Support

- 📧 **Email**: support@expensemanager.com
- 💬 **Discord**: [Join our community](https://discord.gg/expensemanager)
- 📖 **Documentation**: [docs.expensemanager.com](https://docs.expensemanager.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/expense-management-system/issues)

---

<div align="center">

**Made with ❤️ by the Expense Management Team**

[⭐ Star this repo](https://github.com/yourusername/expense-management-system) • [🐛 Report Bug](https://github.com/yourusername/expense-management-system/issues) • [💡 Request Feature](https://github.com/yourusername/expense-management-system/issues)

</div>
