# Multi-Tenant SaaS CRM Frontend Architecture

## Structure
- `src/app`: App Router Pages & Layouts
- `src/components/ui`: Reusable Base UI Primitives (shadcn/ui style)
- `src/components/layout`: App Shell Layout Components (Sidebar, Navbar, PageContainer)
- `src/components/common`: Shared Table, Search, Filter & Status UI
- `src/components/charts`: Analytics & Reporting Recharts Components
- `src/features/*`: Feature-Based Business Logic & Domain Components (Leads, Deals, Finance)
- `src/providers`: Application Providers (Query, Theme, Auth)
- `src/context`: React Context Providers
- `src/lib/api`: Centralized REST API Clients
