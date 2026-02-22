# Nurse Guru Project - Setup Complete ✅

## What Was Fixed

1. **Fullstack Client Package.json** ✅
   - Replaced incorrect Vue dependencies with proper React dependencies
   - Added all necessary UI component libraries (Radix UI, Tailwind CSS, etc.)
   - Updated build scripts to support TypeScript

2. **Client Application Files** ✅
   - Copied all necessary configuration files (tsconfig, vite.config, tailwind, postcss, eslint)
   - Created proper source structure with React components
   - All UI components, pages, hooks, and utilities in place

3. **Client Dependencies** ✅
   - Installed all npm packages with proper React setup
   - Vite and React build tools configured
   - All Tailwind CSS and Radix UI dependencies available

4. **Server TypeScript** ✅
   - All compilation errors resolved
   - Type annotations properly configured
   - Prisma client generation working

5. **Database Setup** ✅
   - SQLite database created at `data/dev.db`
   - Initial Prisma migration applied
   - Demo data seeded (3 users, 3 documents)

## How to Run Locally

### Terminal 1 - Start Backend Server
```bash
cd nurse-guru-fullstack/server
npm run dev
```
Server will run on: **http://localhost:3001**

### Terminal 2 - Start Frontend Dev Server
```bash
cd nurse-guru-fullstack/client
npm run dev
```
Frontend will typically run on: **http://localhost:5173**

## Demo Accounts

After seeding, you can login with:

| Email | Password | Role |
|-------|----------|------|
| sarah.rn@example.com | password123 | Seller |
| mike.np@example.com | password123 | Seller |
| emma.student@example.com | password123 | Buyer |

## API Endpoints

Base URL: `http://localhost:3001/api`

### Key Endpoints:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/documents` - List all documents
- `GET /api/cart` - Get cart items
- `POST /api/payment/create-intent` - Create Stripe payment

## Database

- **Location**: `nurse-guru-fullstack/data/dev.db`
- **Type**: SQLite
- **ORM**: Prisma

To reset database:
```bash
cd nurse-guru-fullstack/server
rm data/dev.db
npm run db:migrate
npm run db:seed
```

## Environment Variables

Configuration is in `nurse-guru-fullstack/.env`
- `JWT_SECRET` - JWT token secret (change in production)
- `STRIPE_SECRET_KEY` - Your Stripe test key
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `VITE_API_URL` - API URL for frontend
- `FRONTEND_URL` - Frontend URL for CORS

## Project Structure

```
nurse-guru-fullstack/
├── server/              # Express.js backend
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── middleware/  # Auth & other middleware
│   │   └── index.ts     # Server entry point
│   └── prisma/          # Database schema
├── client/              # React + Vite frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   └── App.tsx      # Main app component
│   └── index.html       # HTML entry point
├── data/                # SQLite database
└── uploads/             # User uploaded files
```

## Building for Production

### Backend
```bash
cd server
npm run build
npm start
```

### Frontend
```bash
cd client
npm run build
# Output in: dist/
```

## Common Issues & Solutions

### Port Already in Use
If port 3001 or 5173 is busy:
- Kill existing processes: `lsof -i :3001` and `kill -9 <PID>`
- Or change ports in server index.ts and vite.config.ts

### Module Not Found Errors
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install --force
```

### Database Locked
```bash
# Reset database
rm -f data/dev.db
npm run db:migrate
npm run db:seed
```

## Next Steps

1. Start both servers (see "How to Run Locally" above)
2. Access frontend at http://localhost:5173
3. Login with demo account
4. Test features (browse documents, add to cart, checkout)
5. Check API responses at http://localhost:3001/api endpoints

