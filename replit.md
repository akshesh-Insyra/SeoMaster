# REPLIT.MD

## Overview

This is a full-stack web application built with React/TypeScript frontend and Express backend, designed as a multi-tool productivity suite called "INSYRA Tools". The application provides 6 different online utilities including PDF manipulation, invoice generation, text processing, code enhancement, and image conversion tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for development and production builds
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **File Processing**: Multer for file uploads with memory storage
- **Image Processing**: Sharp for image format conversion
- **AI Integration**: OpenAI API for code commenting functionality

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: Neon Database serverless connection
- **Current Schema**: Simple user management (users table with username/password)

## Key Components

### Tools Implementation
1. **PDF Merger** - Client-side PDF manipulation using pdf-lib
2. **PDF Password Remover** - Secure password removal processing
3. **Invoice Generator** - Dynamic invoice creation with PDF export
4. **Text Case Converter** - Multiple text transformation utilities
5. **Code Commenting Tool** - AI-powered code documentation using OpenAI
6. **Image Converter** - Format conversion using Sharp library

### Shared Components
- **Header/Footer**: Consistent navigation and branding
- **ToolCard**: Reusable component for tool display
- **ToolLayout**: Standardized layout wrapper for all tools
- **AdSlot**: Placeholder components for future AdSense integration

### UI System
- **Design System**: shadcn/ui component library
- **Theming**: CSS custom properties with light/dark mode support
- **Responsiveness**: Mobile-first responsive design
- **Animations**: Subtle transitions and hover effects

## Data Flow

### Client-Side Processing
Most tools operate entirely client-side for security:
- PDF operations use browser-based libraries
- Text transformations happen locally
- File processing maintains user privacy

### Server-Side Processing
Limited server operations for specific needs:
- AI code commenting via OpenAI API
- Image format conversion using Sharp
- File upload handling with size restrictions

### API Structure
- `/api/comment-code` - POST endpoint for AI code enhancement
- `/api/convert-image` - POST endpoint for image format conversion
- RESTful design with proper error handling

## External Dependencies

### Core Libraries
- **React Ecosystem**: React, React DOM, React Hook Form
- **UI Components**: Radix UI primitives, Lucide React icons
- **Styling**: Tailwind CSS, class-variance-authority
- **Utilities**: date-fns, clsx, tailwind-merge

### Backend Services
- **OpenAI API**: For AI-powered code commenting
- **Neon Database**: Serverless PostgreSQL hosting
- **Sharp**: High-performance image processing

### Development Tools
- **Vite**: Fast build tool with HMR
- **TypeScript**: Type safety and development experience
- **ESBuild**: Production bundling
- **Replit Integration**: Development environment support

## Deployment Strategy

### Development Environment
- Vite dev server for frontend hot reloading
- Express server with TypeScript compilation
- Automatic database migrations via Drizzle

### Production Build
- Frontend: Vite build to static assets
- Backend: ESBuild compilation to single bundle
- Database: Connection via environment variables

### Environment Configuration
- Database URL configuration via environment variables
- OpenAI API key management
- Replit-specific development features

### File Structure
```
/client          - React frontend application
/server          - Express backend with API routes
/shared          - Shared schemas and types
/migrations      - Database migration files
/attached_assets - Project documentation
```

The application is designed to be easily deployable on various platforms while maintaining a clean separation between frontend and backend concerns.