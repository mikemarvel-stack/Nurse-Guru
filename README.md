# Nurse Guru - Full Stack Application

A complete marketplace platform for nursing students to buy and sell study materials.

## Features

### Backend (Node.js/Express)
- ✅ JWT Authentication
- ✅ SQLite Database with Prisma ORM
- ✅ File Upload/Download
- ✅ Stripe Payment Integration
- ✅ Order Management
- ✅ Cart System
- ✅ Seller Dashboard

### Frontend (React + TypeScript)
- ✅ Modern UI with Tailwind CSS
- ✅ Responsive Design
- ✅ Real-time API Integration
- ✅ Shopping Cart
- ✅ Payment Flow
- ✅ File Downloads

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Stripe account (for payments)

### 1. Clone and Setup

```bash
cd nurse-guru-fullstack
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Build and Run

```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost
- Backend API: http://localhost:3001/api

### 4. Seed Database (Optional)

```bash
docker-compose exec server npx prisma migrate dev
docker-compose exec server npm run db:seed
```

## Development Setup

### Quick Start (Concurrent Mode - Recommended)

Start both frontend and backend simultaneously:

```bash
# From project root directory
npm install
npm run dev
```

This starts:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Backend Only

```bash
cd server
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

### Frontend Only

```bash
cd client
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Documents
- `GET /api/documents` - List all documents
- `GET /api/documents/featured` - Get featured documents
- `GET /api/documents/bestsellers` - Get bestsellers
- `GET /api/documents/:id` - Get single document
- `POST /api/documents` - Create document (seller only)
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Orders
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/seller-orders` - Get seller's orders
- `GET /api/orders/:id/download` - Download purchased document
- `POST /api/orders` - Create order

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add to cart
- `DELETE /api/cart/:documentId` - Remove from cart
- `DELETE /api/cart` - Clear cart

### Payment
- `POST /api/payment/create-intent` - Create Stripe payment intent
- `POST /api/payment/confirm` - Confirm payment

### Upload
- `POST /api/upload/document` - Upload document file
- `POST /api/upload/thumbnail` - Upload thumbnail image

## Demo Accounts

After seeding, you can login with:

| Email | Password | Role |
|-------|----------|------|
| sarah.rn@example.com | password123 | Seller |
| mike.np@example.com | password123 | Seller |
| emma.student@example.com | password123 | Buyer |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Secret key for JWT tokens |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `VITE_API_URL` | Frontend API URL |
| `FRONTEND_URL` | Backend CORS allowed origin |

## Deployment

### Using Docker Compose

```bash
# Production deployment
docker-compose -f docker-compose.yml up -d
```

### Manual Deployment

1. Build the backend:
```bash
cd server
npm ci
npm run build
npm start
```

2. Build the frontend:
```bash
cd client
npm ci
npm run build
# Serve dist folder with nginx or any static server
```

## File Structure

```
nurse-guru-fullstack/
├── server/                 # Backend API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth middleware
│   │   ├── utils/         # Utilities
│   │   ├── index.ts       # Entry point
│   │   └── seed.ts        # Database seed
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   ├── uploads/           # Uploaded files
│   └── Dockerfile
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── store/         # State management
│   │   └── App.tsx        # Main app
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## License

MIT
