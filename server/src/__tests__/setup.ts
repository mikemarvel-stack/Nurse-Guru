import { prisma } from '../index';

// Clean up database before each test
beforeEach(async () => {
  await prisma.notification.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.user.deleteMany({});
});

// Disconnect Prisma after all tests
afterAll(async () => {
  await prisma.$disconnect();
});
