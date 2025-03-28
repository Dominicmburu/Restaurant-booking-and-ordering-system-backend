const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  
  return `${salt}:${hash}`;
};

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.table.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user with crypto-based hashing
  const hashedPassword = hashPassword('adminpassword');
  
  await prisma.user.create({
    data: {
      name: 'Admin Dominic',
      email: 'admin@turknazz.com',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '0717794150'
    }
  });

  // Create restaurants
  const shirley = await prisma.restaurant.create({
    data: {
      name: 'TurkNazz Shirley',
      address: '148-150 Stratford Road',
      city: 'Birmingham',
      postcode: 'B90 3BD',
      phone: '01212345678',
      email: 'shirley@turknazz.com',
      maxSeating: 50,
      openTime: '11:00',
      closeTime: '22:00'
    }
  });

  const moseley = await prisma.restaurant.create({
    data: {
      name: 'TurkNazz Moseley',
      address: '107 Alcester Road',
      city: 'Birmingham',
      postcode: 'B13 8DD',
      phone: '01212345679',
      email: 'moseley@turknazz.com',
      maxSeating: 40,
      openTime: '11:00',
      closeTime: '22:00'
    }
  });

  const sutton = await prisma.restaurant.create({
    data: {
      name: 'TurkNazz Sutton Coldfield',
      address: '22 Beeches Walk',
      city: 'Birmingham',
      postcode: 'B73 6HN',
      phone: '01212345680',
      email: 'sutton@turknazz.com',
      maxSeating: 45,
      openTime: '11:00',
      closeTime: '22:00'
    }
  });

  // Create tables for each restaurant
  const tableData = [];
  
  // Shirley tables
  for (let i = 1; i <= 12; i++) {
    tableData.push({
      tableNumber: i,
      capacity: i <= 6 ? 4 : (i <= 10 ? 6 : 8),
      restaurantId: shirley.id
    });
  }
  
  // Moseley tables
  for (let i = 1; i <= 10; i++) {
    tableData.push({
      tableNumber: i,
      capacity: i <= 5 ? 4 : (i <= 8 ? 6 : 8),
      restaurantId: moseley.id
    });
  }
  
  // Sutton tables
  for (let i = 1; i <= 11; i++) {
    tableData.push({
      tableNumber: i,
      capacity: i <= 6 ? 4 : (i <= 9 ? 6 : 8),
      restaurantId: sutton.id
    });
  }
  
  await prisma.table.createMany({
    data: tableData
  });

  // Create menu items
  // Kebabs
  const kebabs = [
    {
      name: "Adana Kebab",
      description: "Juicy minced lamb kebab, grilled to perfection and served with rice and grilled vegetables.",
      price: 14.99,
      image: "https://i.pinimg.com/736x/b8/5a/78/b85a78b34d5bf0dd17236240c9f2d387.jpg",
      category: "kebabs",
      isPopular: true
    },
    {
      name: "Chicken Shish Kebab",
      description: "Succulent marinated chicken cubes grilled on skewers, served with pita bread and a side of salad.",
      price: 12.49,
      image: "https://i.pinimg.com/736x/99/9a/da/999adae17a774357f4f762261c4c05a8.jpg",
      category: "kebabs"
    },
    {
      name: "Lamb Doner",
      description: "Tender lamb cooked on a vertical rotisserie, served in a wrap with salad and sauce.",
      price: 13.99,
      image: "https://i.pinimg.com/736x/e2/b3/fd/e2b3fd9dc048e0540fe8ff75ebfcf74a.jpg",
      category: "kebabs",
      isPopular: true
    },
    {
      name: "Chicken Doner",
      description: "Deliciously seasoned chicken served with pita bread, fresh veggies, and your choice of sauce.",
      price: 11.99,
      image: "https://i.pinimg.com/736x/03/48/a6/0348a61190f963687f7d8e9e3a6068e1.jpg",
      category: "kebabs"
    }
  ];

  // Turkish pizzas
  const pizzas = [
    {
      name: "Turkish Lahmacun",
      description: "A traditional Turkish flatbread with minced lamb, vegetables, and spices, a perfect savory delight.",
      price: 9.99,
      image: "https://i.pinimg.com/736x/77/51/c6/7751c6b45b2cce7607fc9c0ec15c2d5a.jpg",
      category: "pizzas",
      isPopular: true
    },
    {
      name: "Turkish Pide",
      description: "A Turkish-style pizza with a soft, thin crust, topped with your choice of meat, cheese, and vegetables.",
      price: 14.49,
      image: "https://i.pinimg.com/736x/c8/65/d0/c865d029b4df63f37b1eaf53b527b864.jpg",
      category: "pizzas",
      isPopular: true
    },
    {
      name: "Cheese Pide",
      description: "A cheese-filled Turkish pide, served hot and crispy, a perfect choice for cheese lovers.",
      price: 12.99,
      image: "https://i.pinimg.com/736x/7c/d8/a7/7cd8a72daffef00a6269a9aae69f8080.jpg",
      category: "pizzas",
      isVegetarian: true
    },
    {
      name: "Su Böreği",
      description: "A traditional Turkish pastry made with layers of dough, cheese, and herbs, often served as a light meal.",
      price: 8.99,
      image: "https://i.pinimg.com/736x/ab/3e/0d/ab3e0d2162fff9ec4212c69e46d5bb2e.jpg",
      category: "pizzas",
      isVegetarian: true
    }
  ];

  // Mezzes
  const mezes = [
    {
      name: "Hummus",
      description: "A creamy, flavorful spread made from chickpeas, tahini, garlic, and lemon juice.",
      price: 5.99,
      image: "https://i.pinimg.com/736x/b6/07/b8/b607b8e01c40928a4d46e9abff687519.jpg",
      category: "mezes",
      isVegetarian: true,
      isVegan: true
    },
    {
      name: "Baba Ghanoush",
      description: "A smoky, tangy dip made from roasted eggplant, tahini, garlic, and olive oil.",
      price: 6.49,
      image: "https://i.pinimg.com/736x/e5/68/68/e56868e5e18ec25558e0aba4e8217369.jpg",
      category: "mezes",
      isVegetarian: true,
      isVegan: true
    },
    {
      name: "Feta Cheese Salad",
      description: "A fresh and tangy salad made with feta cheese, olives, tomatoes, cucumbers, and a lemony dressing.",
      price: 7.99,
      image: "https://i.pinimg.com/736x/14/0f/56/140f5627f12fd4593b64bc419393e029.jpg",
      category: "mezes",
      isVegetarian: true
    },
    {
      name: "Sigara Böreği",
      description: "Crispy, fried pastry rolls filled with feta cheese and spinach.",
      price: 6.99,
      image: "https://i.pinimg.com/736x/2a/4d/51/2a4d5196d8f4309c20c9f31bb37d6877.jpg",
      category: "mezes",
      isVegetarian: true,
      isPopular: true
    }
  ];

  // Desserts
  const desserts = [
    {
      name: "Baklava",
      description: "A sweet and flaky pastry filled with chopped nuts and sweet syrup, a Turkish classic.",
      price: 4.99,
      image: "https://i.pinimg.com/736x/18/bb/0b/18bb0bd33415bd27e99a66c9d5cb5e4c.jpg",
      category: "desserts",
      isVegetarian: true,
      isPopular: true
    },
    {
      name: "Künefe",
      description: "A warm dessert made from shredded filo dough, filled with sweet cheese, and soaked in syrup.",
      price: 6.49,
      image: "https://i.pinimg.com/736x/58/d6/43/58d643bf15e8bba67c97041931a1b446.jpg",
      category: "desserts",
      isVegetarian: true,
      isPopular: true
    },
    {
      name: "Rice Pudding",
      description: "A creamy, comforting dessert made from rice, milk, and sugar, flavored with vanilla and cinnamon.",
      price: 3.99,
      image: "https://i.pinimg.com/736x/06/ce/7a/06ce7a8fd84c3f8e0a5ca5f403df5403.jpg",
      category: "desserts",
      isVegetarian: true
    },
    {
      name: "Turkish Delight",
      description: "Soft, chewy candy made with sugar, cornstarch, and flavored with rosewater or lemon.",
      price: 5.49,
      image: "https://i.pinimg.com/736x/e2/de/46/e2de462ee862d81f7bedf585ff09618e.jpg",
      category: "desserts",
      isVegetarian: true,
      isVegan: true
    }
  ];

  // Drinks
  const drinks = [
    {
      name: "Turkish Tea",
      description: "Authentic Turkish black tea served in traditional glasses.",
      price: 2.49,
      image: "https://i.pinimg.com/736x/36/12/6c/36126c495235cbbedfdebee07088058a.jpg",
      category: "drinks",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true
    },
    {
      name: "Turkish Coffee",
      description: "Rich, strong coffee prepared in the traditional Turkish method.",
      price: 3.49,
      image: "https://i.pinimg.com/736x/63/e7/f6/63e7f6ed293c2a98db6dea59cc87b895.jpg",
      category: "drinks",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true
    },
    {
      name: "Ayran",
      description: "Traditional Turkish yogurt drink, refreshing and savory.",
      price: 2.99,
      image: "https://i.pinimg.com/736x/05/a5/83/05a58391ebbe3d0e33dc4aa282e4f4ca.jpg",
      category: "drinks",
      isVegetarian: true,
      isGlutenFree: true
    },
    {
      name: "Fresh Juice",
      description: "Orange, pomegranate, or mixed fruit juice.",
      price: 4.99,
      image: "https://i.pinimg.com/736x/40/23/39/402339b7da35eb9446b3bfff0bdcc8b8.jpg",
      category: "drinks",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true
    }
  ];

  await prisma.menuItem.createMany({
    data: [...kebabs, ...pizzas, ...mezes, ...desserts, ...drinks]
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });