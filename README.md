# Idea Portal Dashboard

A modern, responsive dashboard for tracking and analyzing idea submissions and progress across different products and quarters.

## Features

- **Multi-Product Support**: Track ideas across TeamConnect, Collaborati, LegalHold, and other products
- **Quarterly Analysis**: View data by fiscal quarters with trend analysis
- **Interactive Charts**: Responsive charts with drill-down capabilities
- **CSV Data Import**: Upload and manage data through CSV files
- **Action Items**: Track and manage action items by product and quarter
- **Real-time Updates**: Live data synchronization with Supabase backend
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## Performance Optimizations

- **Code Splitting**: Lazy loading of heavy components
- **Memoization**: React.memo for expensive components
- **Caching**: LRU cache for CSV parsing and API responses
- **Bundle Optimization**: Separate vendor chunks for better caching
- **Virtual Scrolling**: For large data sets
- **Error Boundaries**: Graceful error handling

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Charts**: Recharts
- **Backend**: Supabase (PostgreSQL, Real-time subscriptions)
- **Build Tool**: Vite
- **Icons**: Lucide React

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials.

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:analyze` - Build and analyze bundle size
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run tests

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components
│   ├── dashboard/      # Dashboard-specific components
│   ├── navigation/     # Navigation components
│   └── upload/         # File upload components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── layouts/            # Page layouts
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── main.tsx           # Application entry point
```

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for type safety
3. Add proper error handling
4. Write meaningful commit messages
5. Test your changes thoroughly

## License

Private - Mitratech Internal Use Only
