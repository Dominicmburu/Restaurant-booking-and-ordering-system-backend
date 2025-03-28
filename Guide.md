turknazz-backend/
├── .env                        # Environment variables
├── .env.example                # Example environment variables
├── .gitignore                  # Git ignore file
├── package.json                # Project dependencies and scripts
├── prisma/                     # Prisma ORM configuration
│   ├── schema.prisma           # Database schema definition
│   ├── migrations/             # Database migrations
│   └── seed.js                 # Database seed script
├── src/                        # Source code
│   ├── config/                 # Configuration files
│   │   ├── database.js         # Database configuration
│   │   ├── email.js            # Email configuration
│   │   ├── jwt.js              # JWT configuration
│   │   └── index.js            # Configuration exports
│   ├── controllers/            # Request handlers
│   │   ├── authController.js   # Authentication controller
│   │   ├── bookingController.js # Table booking controller
│   │   ├── menuController.js   # Food menu controller
│   │   ├── orderController.js  # Food order controller
│   │   ├── restaurantController.js # Restaurant locations controller
│   │   └── userController.js   # User management controller
│   ├── middlewares/            # Middleware functions
│   │   ├── auth.js             # Authentication middleware
│   │   ├── errorHandler.js     # Error handling middleware
│   │   ├── requestLogger.js    # Request logging middleware
│   │   └── validators.js       # Input validation middleware
│   ├── models/                 # Data models (for extended Prisma models)
│   │   ├── booking.js          # Table booking model
│   │   ├── menu.js             # Food menu model
│   │   ├── order.js            # Food order model
│   │   ├── restaurant.js       # Restaurant locations model
│   │   └── user.js             # User model
│   ├── routes/                 # API routes
│   │   ├── authRoutes.js       # Authentication routes
│   │   ├── bookingRoutes.js    # Table booking routes
│   │   ├── menuRoutes.js       # Food menu routes
│   │   ├── orderRoutes.js      # Food order routes
│   │   ├── restaurantRoutes.js # Restaurant locations routes
│   │   ├── userRoutes.js       # User management routes
│   │   └── index.js            # Route aggregator
│   ├── services/               # Business logic
│   │   ├── authService.js      # Authentication service
│   │   ├── bookingService.js   # Table booking service
│   │   ├── emailService.js     # Email notification service
│   │   ├── menuService.js      # Menu management service
│   │   ├── orderService.js     # Order handling service
│   │   └── restaurantService.js # Restaurant management service
│   ├── utils/                  # Utility functions
│   │   ├── formatters.js       # Data formatters
│   │   ├── validators.js       # Data validators
│   │   ├── logger.js           # Logging utility
│   │   └── errors.js           # Error handling utilities
│   ├── app.js                  # Express app configuration
│   └── server.js               # Server entry point
├── tests/                      # Test files
│   ├── integration/            # Integration tests
│   ├── unit/                   # Unit tests
│   └── setup.js                # Test setup
└── README.md                   # Project documentation


1. npx prisma db pull to turn your database schema into a Prisma schema.
2. Run npx prisma generate

npx prisma migrate dev --name init


https://claude.ai/chat/b6962af4-7f60-4810-bf0e-d5ecc3ab397d