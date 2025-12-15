# RentalHub - Fullstack Rental Housing Application

A production-ready fullstack rental housing application built with Next.js 14, TypeScript, Prisma, PostgreSQL, and Docker.

## Features

- **Authentication**: JWT-based authentication with access and refresh tokens
- **Role-based Access**: USER and ADMIN roles with protected routes
- **Apartment Management**: Full CRUD operations for apartments (admin only)
- **Public Listings**: Browse active apartment listings with auto-refresh
- **AI Integration**: Generate apartment descriptions using OpenAI
- **Fully Dockerized**: Easy deployment with Docker Compose

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (access + refresh tokens)
- **Containerization**: Docker & Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose installed on your system

### Running with Docker

1. Clone the repository
2. Run the application:

```bash
docker compose up --build
```

3. Access the application at http://localhost:3000

### Default Admin Credentials

- Email: `admin@local.test`
- Password: `admin12345`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Apartments (Public)
- `GET /api/apartments` - List all active apartments

### Apartments (Admin Only)
- `GET /api/apartments/admin` - List all apartments
- `POST /api/apartments/admin` - Create apartment
- `PATCH /api/apartments/admin/:id` - Update apartment
- `DELETE /api/apartments/admin/:id` - Delete apartment

### AI (Admin Only)
- `POST /api/ai/generate-description` - Generate apartment description

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/rentaldb?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
OPENAI_API_KEY="" # Optional: Add your OpenAI API key for AI descriptions
```

## Development

### Local Development (without Docker)

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Start PostgreSQL (or update DATABASE_URL to point to your database)

4. Run Prisma migrations:
```bash
npx prisma migrate dev
```

5. Seed the database:
```bash
npx prisma db seed
```

6. Start the development server:
```bash
npm run dev
```

## Project Structure

```
├── app/
│   ├── api/          # API routes
│   ├── admin/        # Admin dashboard
│   ├── login/        # Login page
│   └── page.tsx      # Home page
├── components/       # React components
│   └── ui/          # shadcn/ui components
├── lib/             # Utility functions
│   ├── auth.ts      # Authentication helpers
│   ├── prisma.ts    # Prisma client
│   └── api-client.ts # API client with auto-refresh
├── prisma/
│   ├── schema.prisma # Database schema
│   └── seed.ts       # Database seeding
├── middleware.ts     # Route protection middleware
├── Dockerfile        # Docker configuration
└── docker-compose.yml # Docker Compose configuration
```

## License

MIT
