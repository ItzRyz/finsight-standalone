import "dotenv/config";

import {
  PrismaClient,
  ExpenseType,
  CategoryType,
  CategorizationSource,
} from "../src/generated/prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const userId = process.env.SEED_USER_ID!;

if (!userId) {
  throw new Error("SEED_USER_ID is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting seed...");

  // =====================================================
  // USER
  // =====================================================

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error(`User ${userId} was not found.`);
  }

  console.log(`👤 Using user: ${user.email}`);

  // =====================================================
  // SYSTEM CATEGORIES
  // =====================================================

  const categories = [
    {
      name: "Food",
      description: "Meals, restaurants, groceries, and beverages",
      icon: "🍔",
      color: "#F97316",
    },
    {
      name: "Transportation",
      description: "Fuel, public transport, ride-hailing, and parking",
      icon: "🚗",
      color: "#3B82F6",
    },
    {
      name: "Shopping",
      description: "Clothing, electronics, and general shopping",
      icon: "🛍️",
      color: "#A855F7",
    },
    {
      name: "Bills",
      description: "Utilities, internet, phone, and subscriptions",
      icon: "🧾",
      color: "#EF4444",
    },
    {
      name: "Entertainment",
      description: "Movies, games, music, and leisure",
      icon: "🎮",
      color: "#EC4899",
    },
    {
      name: "Health",
      description: "Medicine, doctor visits, and healthcare",
      icon: "❤️",
      color: "#10B981",
    },
    {
      name: "Education",
      description: "Courses, books, school, and learning",
      icon: "📚",
      color: "#6366F1",
    },
    {
      name: "Travel",
      description: "Flights, hotels, and travel expenses",
      icon: "✈️",
      color: "#14B8A6",
    },
    {
      name: "Salary",
      description: "Salary and regular income",
      icon: "💰",
      color: "#22C55E",
    },
    {
      name: "Other",
      description: "Other transactions",
      icon: "📦",
      color: "#6B7280",
    },
  ];

  const categoryMap = new Map<string, string>();

  for (const category of categories) {
    const existing = await prisma.category.findFirst({
      where: {
        name: category.name,
        type: CategoryType.SYSTEM,
        userId: null,
      },
    });

    const result =
      existing ??
      (await prisma.category.create({
        data: {
          name: category.name,
          description: category.description,
          icon: category.icon,
          color: category.color,
          type: CategoryType.SYSTEM,
          userId: null,
        },
      }));

    categoryMap.set(category.name, result.id);
  }

  console.log(`📂 Created/found ${categories.length} categories`);

  // =====================================================
  // EXPENSES
  // =====================================================

  const now = new Date();

  function daysAgo(days: number) {
    const date = new Date(now);

    date.setDate(date.getDate() - days);

    date.setHours(12, 0, 0, 0);

    return date;
  }

  const expenses = [
    {
      title: "Lunch at Warung",
      description: "Lunch with friends",
      amount: 45000,
      category: "Food",
      expenseDate: daysAgo(1),
      merchant: "Warung Sederhana",
      location: "Jakarta",
    },

    {
      title: "Grab to School",
      description: "Transportation to school",
      amount: 28000,
      category: "Transportation",
      expenseDate: daysAgo(1),
      merchant: "Grab",
      location: "Jakarta",
    },

    {
      title: "Coffee",
      description: "Morning coffee",
      amount: 22000,
      category: "Food",
      expenseDate: daysAgo(2),
      merchant: "Kopi Kenangan",
      location: "Jakarta",
    },

    {
      title: "Internet Bill",
      description: "Monthly internet payment",
      amount: 350000,
      category: "Bills",
      expenseDate: daysAgo(3),
      merchant: "IndiHome",
      location: "Jakarta",
    },

    {
      title: "Netflix",
      description: "Monthly subscription",
      amount: 65000,
      category: "Entertainment",
      expenseDate: daysAgo(4),
      merchant: "Netflix",
      location: null,
    },

    {
      title: "New Keyboard",
      description: "Mechanical keyboard",
      amount: 750000,
      category: "Shopping",
      expenseDate: daysAgo(5),
      merchant: "Tokopedia",
      location: "Online",
    },

    {
      title: "Medicine",
      description: "Cold medicine",
      amount: 85000,
      category: "Health",
      expenseDate: daysAgo(6),
      merchant: "Apotek",
      location: "Jakarta",
    },

    {
      title: "Programming Book",
      description: "Next.js programming book",
      amount: 180000,
      category: "Education",
      expenseDate: daysAgo(7),
      merchant: "Gramedia",
      location: "Jakarta",
    },

    {
      title: "Movie Ticket",
      description: "Weekend movie",
      amount: 60000,
      category: "Entertainment",
      expenseDate: daysAgo(8),
      merchant: "CGV",
      location: "Jakarta",
    },

    {
      title: "Fuel",
      description: "Motorcycle fuel",
      amount: 50000,
      category: "Transportation",
      expenseDate: daysAgo(9),
      merchant: "Pertamina",
      location: "Jakarta",
    },

    {
      title: "Groceries",
      description: "Weekly groceries",
      amount: 320000,
      category: "Food",
      expenseDate: daysAgo(10),
      merchant: "Supermarket",
      location: "Jakarta",
    },

    {
      title: "Flight Ticket",
      description: "Flight for vacation",
      amount: 1200000,
      category: "Travel",
      expenseDate: daysAgo(12),
      merchant: "Traveloka",
      location: "Online",
    },

    {
      title: "Salary",
      description: "Monthly salary",
      amount: 7500000,
      category: "Salary",
      expenseDate: daysAgo(15),
      merchant: "Company",
      location: null,
    },

    {
      title: "Dinner",
      description: "Dinner with family",
      amount: 180000,
      category: "Food",
      expenseDate: daysAgo(17),
      merchant: "Restaurant",
      location: "Jakarta",
    },

    {
      title: "New Shoes",
      description: "Running shoes",
      amount: 850000,
      category: "Shopping",
      expenseDate: daysAgo(20),
      merchant: "Sports Store",
      location: "Jakarta",
    },
  ];

  for (const expense of expenses) {
    await prisma.expense.create({
      data: {
        userId,

        categoryId: categoryMap.get(expense.category),

        title: expense.title,

        description: expense.description,

        amount: expense.amount,

        type:
          expense.category === "Salary"
            ? ExpenseType.INCOME
            : ExpenseType.EXPENSE,

        expenseDate: expense.expenseDate,

        merchant: expense.merchant,

        location: expense.location,

        categorizationSource: CategorizationSource.MANUAL,
      },
    });
  }

  console.log(`💰 Created ${expenses.length} transactions`);

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
