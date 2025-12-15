# Quick Start Guide

## Running the Application

### Option 1: Docker (Recommended)

The easiest way to run the application is using Docker Compose:

```bash
docker compose up --build
```

This will:
1. Start a PostgreSQL database
2. Build the Next.js application
3. Run database migrations
4. Seed the database with initial data
5. Start the application on http://localhost:3000

### Option 2: Local Development

If you want to run the application locally without Docker:

1. **Start PostgreSQL**
   Make sure you have PostgreSQL running locally on port 5432

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Run migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Seed the database**
   ```bash
   npx prisma db seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## Accessing the Application

- **Homepage**: http://localhost:3000
- **Login Page**: http://localhost:3000/login
- **Admin Dashboard**: http://localhost:3000/admin

## Default Credentials

### Admin Account
- Email: `admin@local.test`
- Password: `admin12345`

## Testing the API

### Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@local.test","password":"admin12345"}'
```

### Get apartments (public)
```bash
curl http://localhost:3000/api/apartments
```

### Get all apartments (admin only)
```bash
curl http://localhost:3000/api/apartments/admin \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create apartment (admin only)
```bash
curl -X POST http://localhost:3000/api/apartments/admin \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cozy Studio",
    "city": "Boston",
    "address": "123 Main St",
    "pricePerDay": 100,
    "bedrooms": 1,
    "description": "A cozy studio apartment",
    "photos": ["https://example.com/photo.jpg"],
    "isActive": true
  }'
```

### Generate AI description (admin only)
```bash
curl -X POST http://localhost:3000/api/ai/generate-description \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Modern Loft",
    "city": "New York",
    "bedrooms": 2,
    "pricePerDay": 200
  }'
```

## Features

- Auto-refresh on homepage (every 5 seconds)
- JWT authentication with access and refresh tokens
- Role-based access control (USER and ADMIN)
- Admin dashboard with full CRUD operations
- AI-powered description generation
- Responsive design with Tailwind CSS

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── apartments/   # Apartment CRUD endpoints
│   │   └── ai/           # AI generation endpoint
│   ├── admin/            # Admin dashboard
│   ├── login/            # Login page
│   └── page.tsx          # Homepage
├── lib/
│   ├── auth.ts           # Authentication utilities
│   ├── prisma.ts         # Prisma client
│   └── api-client.ts     # API client with auto-refresh
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── seed.ts           # Database seeding
│   └── migrations/       # Database migrations
├── middleware.ts         # Route protection
├── Dockerfile            # Docker configuration
└── docker-compose.yml    # Docker Compose setup
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for access tokens
- `JWT_REFRESH_SECRET`: Secret for refresh tokens
- `OPENAI_API_KEY`: Optional OpenAI API key for AI descriptions

## Troubleshooting

### Database Connection Issues

If you see database connection errors:
1. Make sure PostgreSQL is running
2. Check your `DATABASE_URL` in `.env`
3. Ensure the database `rentaldb` exists

### Build Issues

If the build fails:
```bash
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Docker Issues

If Docker containers fail to start:
```bash
docker compose down -v
docker compose up --build
```

## Production Deployment

For production:

1. Update environment variables in `docker-compose.yml`
2. Change JWT secrets to secure random strings
3. Add HTTPS/TLS configuration
4. Set up a reverse proxy (nginx/traefik)
5. Configure database backups
6. Set `NODE_ENV=production`

## Support

For issues or questions, please refer to the README.md file.
