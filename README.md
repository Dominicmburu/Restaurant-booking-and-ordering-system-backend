# TurkNazz Backend API

Backend API for TurkNazz Restaurant with table booking and food ordering capabilities.

## Features

- User authentication with JWT tokens
- Restaurant location management
- Menu management
- Table booking system
- Food ordering system
- Email notifications for bookings and orders

## Tech Stack

- Node.js & Express
- PostgreSQL with Prisma ORM
- JWT Authentication
- Nodemailer for email notifications
- Winston for logging

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Dominicmburu/Restaurant-booking-and-ordering-system-backend.git
   cd turknazz-backend
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Create `.env` file (use `.env.example` as a template)
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file with your configuration values.

4. Setup the database
   ```bash
   # Run migrations
   npm run db:migrate

   # Seed the database
   npm run db:seed
   ```

5. Start the server
   ```bash
   # Development mode
   pnpm run dev

   # Production mode
   npm start
   ```

## API Documentation

### Authentication Routes

```
POST /api/auth/register - Register a new user
POST /api/auth/login - Login user
GET /api/auth/logout - Logout user
GET /api/auth/me - Get current user
```

### Restaurant Routes

```
GET /api/restaurants - Get all restaurants
GET /api/restaurants/:id - Get single restaurant
POST /api/restaurants - Create new restaurant (Admin)
PUT /api/restaurants/:id - Update restaurant (Admin)
DELETE /api/restaurants/:id - Delete restaurant (Admin)
GET /api/restaurants/:id/menu - Get restaurant menu
```

### Menu Routes

```
GET /api/menu - Get all menu items
GET /api/menu/:id - Get single menu item
POST /api/menu - Create new menu item (Admin)
PUT /api/menu/:id - Update menu item (Admin)
DELETE /api/menu/:id - Delete menu item (Admin)
GET /api/menu/category/:category - Get menu items by category
GET /api/menu/popular - Get popular menu items
```

### Order Routes

```
POST /api/orders - Create new order
GET /api/orders - Get all orders (Admin)
GET /api/orders/myorders - Get user orders
GET /api/orders/:id - Get order by ID
PUT /api/orders/:id/status - Update order status (Admin)
```

### Booking Routes

```
POST /api/bookings - Create new booking
GET /api/bookings - Get all bookings (Admin)
GET /api/bookings/mybookings - Get user bookings
GET /api/bookings/:id - Get booking by ID
PUT /api/bookings/:id/status - Update booking status (Admin)
POST /api/bookings/check-availability - Check table availability
PUT /api/bookings/:id/cancel - Cancel booking
```

## Database Schema

The database schema is defined in `prisma/schema.prisma` and includes the following models:

- `User` - User account information
- `Restaurant` - Restaurant location information
- `MenuItem` - Menu items for each restaurant
- `Order` - Food orders
- `OrderItem` - Individual items in an order
- `Booking` - Table bookings
- `Table` - Restaurant tables

## Environment Variables

```
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/turknazz_db

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# Email
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=TurkNazz Restaurant <your-email@gmail.com>

# Frontend
FRONTEND_URL=http://localhost:5471
```

## License

MIT