import { pgTable, uuid, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core"

// Explorer points table (for the clickable points on the map)
export const explorerPoints = pgTable("explorer_points", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  positionX: varchar("position_x", { length: 10 }).notNull(),
  positionY: varchar("position_y", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Explorer items table (for the items in each category)
export const explorerItems = pgTable("explorer_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  scientificName: varchar("scientific_name", { length: 255 }),
  description: text("description").notNull(),
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
  details: jsonb("details").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  researcherOnly: boolean("researcher_only").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Users table (for storing user profiles)
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Changed from uuid to text to handle Supabase auth IDs
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  userType: varchar("user_type", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})

// Trees table
export const trees = pgTable("trees", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  scientificName: varchar("scientific_name", { length: 255 }),
  description: text("description").notNull(),
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
  height: varchar("height", { length: 100 }),
  trunkDiameter: varchar("trunk_diameter", { length: 100 }),
  lifespan: varchar("lifespan", { length: 100 }),
  ecologicalRole: text("ecological_role"),
  conservationStatus: varchar("conservation_status", { length: 100 }),
  researcherOnly: boolean("researcher_only").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Birds table
export const birds = pgTable("birds", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  scientificName: varchar("scientific_name", { length: 255 }),
  description: text("description").notNull(),
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
  wingspan: varchar("wingspan", { length: 100 }),
  habitat: varchar("habitat", { length: 255 }),
  diet: text("diet"),
  lifespan: varchar("lifespan", { length: 100 }),
  conservationStatus: varchar("conservation_status", { length: 100 }),
  researcherOnly: boolean("researcher_only").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Animals table
export const animals = pgTable("animals", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  scientificName: varchar("scientific_name", { length: 255 }),
  description: text("description").notNull(),
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
  weight: varchar("weight", { length: 100 }),
  length: varchar("length", { length: 100 }),
  habitat: varchar("habitat", { length: 255 }),
  diet: text("diet"),
  conservationStatus: varchar("conservation_status", { length: 100 }),
  researcherOnly: boolean("researcher_only").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Tribes table
export const tribes = pgTable("tribes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  region: varchar("region", { length: 255 }),
  description: text("description").notNull(),
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
  population: varchar("population", { length: 100 }),
  language: varchar("language", { length: 255 }),
  traditionalPractices: text("traditional_practices"),
  challenges: text("challenges"),
  researcherOnly: boolean("researcher_only").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Terrain table
export const terrain = pgTable("terrain", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }),
  description: text("description").notNull(),
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
  elevation: varchar("elevation", { length: 100 }),
  climate: text("climate"),
  biodiversity: text("biodiversity"),
  ecologicalFunction: text("ecological_function"),
  researcherOnly: boolean("researcher_only").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})
