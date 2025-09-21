# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `npm run dev` - Start Next.js development server (default: http://localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run type-check` - Run TypeScript type checking

### Testing Commands
- `npm test` - Run test suite (if configured)
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## Project Architecture

### Tech Stack
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript with strict mode
- **UI Library**: shadcn/ui components (Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand or React Context
- **Forms**: React Hook Form with Zod validation
- **Authentication**: NextAuth.js with AWS Cognito integration
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

### AWS Integration Architecture
This frontend interfaces with AWS backend services through a RESTful API layer:
- **Risk Assessment**: Calls AWS AI agents for invoice risk evaluation
- **Communications**: Triggers AWS SES/SNS for automated customer outreach
- **Receipt Processing**: Uploads to S3, processed by AWS Textract
- **Analytics**: Retrieves insights from AWS QuickSight/Athena

### Directory Structure
```
app/                      # Next.js 14+ App Router
├── (auth)/              # Authentication group
│   ├── login/
│   ├── signup/
│   └── forgot-password/
├── (dashboard)/         # Protected dashboard group
│   ├── dashboard/       # Main dashboard
│   ├── invoices/        # Invoice management
│   ├── customers/       # Customer management
│   ├── payments/        # Payment processing
│   ├── communications/  # Communication center
│   ├── analytics/       # Analytics & reporting
│   ├── risk/           # Risk management
│   └── settings/       # Settings & config
├── api/                # API routes
│   ├── auth/
│   ├── invoices/
│   ├── customers/
│   ├── aws/           # AWS service integrations
│   └── webhooks/      # Webhook handlers
└── layout.tsx         # Root layout

components/
├── ui/               # shadcn/ui components
├── dashboard/        # Dashboard-specific components
├── forms/           # Form components
├── charts/          # Chart components
├── tables/          # Data table components
└── providers/       # Context providers

lib/
├── api/             # API client functions
├── aws/             # AWS SDK integrations
├── auth/            # Authentication utilities
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
└── validations/     # Zod schemas

store/               # Zustand stores
├── auth-store.ts
├── invoice-store.ts
├── customer-store.ts
└── ui-store.ts

types/               # TypeScript type definitions
├── api.ts
├── invoice.ts
├── customer.ts
└── aws.ts
```

## Key Implementation Patterns

### API Integration Pattern
All AWS backend calls follow this pattern:
1. Frontend action triggers API call through `lib/api/` functions
2. Next.js API route in `app/api/` validates request and calls AWS services
3. AWS response processed and formatted for frontend consumption
4. State updated via Zustand store or React Query cache

### Authentication Flow
1. NextAuth handles authentication with AWS Cognito as provider
2. Session stored in secure HTTP-only cookies
3. Middleware in `middleware.ts` protects dashboard routes
4. AWS API calls include session token for backend authorization

### Real-time Updates
- Use Server-Sent Events (SSE) or WebSocket connections for:
  - Risk assessment status updates
  - Payment processing notifications
  - Communication delivery status
- Implement optimistic updates for better UX

### Error Handling Strategy
- API errors caught and displayed via toast notifications
- Form validation errors shown inline
- Network failures trigger retry with exponential backoff
- AWS service failures show fallback UI with manual refresh option

## AWS Service Integration Points

### Critical Integrations
1. **Invoice Risk Assessment** (`/api/aws/risk-assessment`)
   - POST invoice data to AWS Lambda
   - Receive risk score and recommendations
   - Update UI with risk indicators

2. **Automated Communications** (`/api/aws/communications`)
   - Trigger email/SMS through AWS
   - Track delivery status via webhooks
   - Display communication history

3. **Receipt Processing** (`/api/aws/receipts`)
   - Upload to S3 with presigned URLs
   - Poll for Textract processing results
   - Auto-populate payment forms with extracted data

4. **Analytics Data** (`/api/aws/analytics`)
   - Fetch aggregated metrics from AWS
   - Cache results for performance
   - Refresh on-demand or scheduled

## Environment Configuration

Required environment variables:
```
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
AWS_COGNITO_CLIENT_ID=
AWS_COGNITO_CLIENT_SECRET=
AWS_COGNITO_ISSUER=

# AWS Services
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_LAMBDA_FUNCTION_ARN=

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_RISK=true
NEXT_PUBLIC_ENABLE_AUTO_COMMS=true
```

## Performance Optimization

### Key Strategies
- Use React Server Components for initial data fetching
- Implement virtual scrolling for large data tables
- Lazy load heavy components (charts, modals)
- Optimize images with Next.js Image component
- Use Suspense boundaries for loading states
- Cache AWS API responses with appropriate TTL

### Bundle Optimization
- Keep client components minimal
- Use dynamic imports for large dependencies
- Tree-shake unused shadcn/ui components
- Analyze bundle with `npm run analyze`

## Testing Approach

### Test Structure
- Unit tests for utility functions and hooks
- Integration tests for API routes
- Component tests for critical UI flows
- E2E tests for complete user journeys

### Mock Strategy
- Mock AWS SDK calls in tests
- Use MSW for API mocking
- Provide test fixtures for common data shapes

## Version Control and Change Management

### Change Documentation
All significant changes to the codebase are documented in `/changes/` directory:
- Each version is documented in `version_x.md` format
- Version files contain:
  - Timestamp of changes
  - List of modified/created files
  - Description of functionality added
  - Breaking changes if any
  - Rollback instructions

### Version Naming Convention
- `version_1.md` - Initial project setup and core structure
- `version_2.md` - Authentication system implementation
- `version_3.md` - Dashboard and core features
- Continue incrementally for each major feature addition

### Rollback Process
To rollback to a previous version:
1. Check the version file for the list of changes
2. Use git to revert to the specific commit mentioned
3. Re-install dependencies if package.json was modified
4. Check for database migration requirements

### Creating Version Documentation
When making changes:
1. Create new version file: `/changes/version_[n].md`
2. Document all file changes
3. Include clear descriptions
4. Note any dependency changes
5. Provide rollback instructions