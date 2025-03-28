const prisma = require('../config/database');

beforeAll(async () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Tests must be run in test environment');
  }
  
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.table.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});