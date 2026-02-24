# InvenAI — Smart Inventory Management System

A full-stack AI-powered inventory management system built with Next.js, Prisma, NextAuth, and Groq AI.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8)

## Features

### Core
- **Inventory Management** — Full CRUD operations for inventory items (name, SKU, quantity, category, price, supplier, location)
- **Status Tracking** — Mark items as In Stock, Low Stock, Ordered, or Discontinued (auto-detected from quantity thresholds)
- **Category Management** — Admin-managed categories with CRUD operations
- **Search & Filter** — Search by name, SKU, supplier, description; filter by status and category
- **Bulk Operations** — Multi-select items for bulk status changes or deletion
- **CSV Export** — Download inventory data as CSV

### AI-Powered (Groq + Llama 3.3 70B)
- **AI Chat Assistant** — Ask natural language questions about your inventory
- **Smart Restock Suggestions** — AI analyzes stock levels and generates prioritized restock recommendations
- **Dashboard AI Insights** — On-demand AI analysis of inventory health with actionable suggestions

### Security & Access Control
- **Authentication** — Email/password, GitHub OAuth, Google OAuth via NextAuth v5
- **Role-Based Access Control (RBAC)** — Three roles:
  - **Admin** — Full access including user management and category management
  - **Manager** — CRUD on inventory items, view reports
  - **User** — View-only access with search and filter
- **First User Auto-Admin** — The first registered user automatically gets the Admin role

### Additional
- **Activity/Audit Log** — Tracks all changes with user, action, entity, and timestamp
- **Dark/Light Mode** — System-aware theme with manual toggle
- **Responsive Design** — Mobile-friendly layout with collapsible sidebar
- **Dashboard** — Stats cards, low stock alerts, category breakdown, recent activity

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Database | PostgreSQL (Neon) + Prisma ORM |
| Authentication | NextAuth v5 (JWT strategy) |
| AI | Groq SDK + Llama 3.3 70B Versatile |
| UI | Tailwind CSS 4 + Radix UI + Lucide Icons |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- A Neon PostgreSQL database (or any PostgreSQL instance)
- Groq API key (free at [console.groq.com](https://console.groq.com))
- GitHub OAuth app (optional)
- Google OAuth app (optional)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Ali-Mansourr/inventory-management-system.git
cd inventory-management-system
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
AUTH_SECRET="your-generated-secret"      # Generate with: npx auth secret
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
GROQ_API_KEY="your-groq-api-key"
```

4. **Push the database schema**

```bash
npx prisma db push
```

5. **Run the development server**

```bash
npm run dev
```

6. **Open [http://localhost:3000](http://localhost:3000)**

### First-Time Setup

1. Navigate to the sign-up page and create your account
2. The first user is automatically assigned the **Admin** role
3. Create categories (e.g., Electronics, Office Supplies, etc.)
4. Start adding inventory items
5. Try the AI Assistant to get insights about your inventory

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/        # Main app pages (behind auth)
│   │   ├── page.tsx        # Dashboard
│   │   ├── inventory/      # Inventory list, add, edit
│   │   ├── categories/     # Category management
│   │   ├── users/          # User management (admin only)
│   │   ├── activity/       # Activity log
│   │   ├── ai/             # AI assistant
│   │   └── settings/       # User settings
│   ├── auth/               # Sign in / Sign up pages
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth + registration
│   │   ├── inventory/      # CRUD + bulk + export
│   │   ├── categories/     # CRUD
│   │   ├── users/          # User management
│   │   ├── ai/             # Chat, insights, restock
│   │   ├── activity/       # Activity log
│   │   └── dashboard/      # Dashboard stats
│   ├── globals.css
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # Reusable UI components
│   └── layout/             # Sidebar, header, theme
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── prisma.ts           # Prisma client singleton
│   ├── groq.ts             # Groq AI client
│   ├── activity.ts         # Activity logging helper
│   └── utils.ts            # Utility functions
└── proxy.ts                # Route protection proxy
```

## Deployment (Vercel)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Set `AUTH_URL` to your production domain (e.g., `https://your-app.vercel.app`)
5. Deploy — Prisma will auto-generate on `postinstall`
6. Run `npx prisma db push` against your production database (or use Prisma Migrate)

## API Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/dashboard` | Dashboard stats | All |
| GET | `/api/inventory` | List items (paginated, filterable) | All |
| POST | `/api/inventory` | Create item | Manager+ |
| GET | `/api/inventory/:id` | Get item details | All |
| PUT | `/api/inventory/:id` | Update item | Manager+ |
| DELETE | `/api/inventory/:id` | Delete item | Manager+ |
| PUT | `/api/inventory/bulk` | Bulk status update | Manager+ |
| DELETE | `/api/inventory/bulk` | Bulk delete | Admin |
| GET | `/api/inventory/export` | Export CSV | All |
| GET | `/api/categories` | List categories | All |
| POST | `/api/categories` | Create category | Admin |
| PUT | `/api/categories/:id` | Update category | Admin |
| DELETE | `/api/categories/:id` | Delete category | Admin |
| GET | `/api/users` | List users | Admin |
| PUT | `/api/users/:id` | Update user role | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |
| POST | `/api/ai/chat` | AI chat | All |
| GET | `/api/ai/insights` | AI insights | All |
| GET | `/api/ai/restock` | Restock suggestions | All |
| GET | `/api/activity` | Activity log | All |
| POST | `/api/auth/register` | Register new user | Public |

## License

MIT
