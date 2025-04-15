import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Create extension for UUID generation if not exists
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    // Create trees table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS trees (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        scientific_name VARCHAR(255),
        description TEXT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        height VARCHAR(100),
        trunk_diameter VARCHAR(100),
        lifespan VARCHAR(100),
        ecological_role TEXT,
        conservation_status VARCHAR(100),
        researcher_only BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create birds table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS birds (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        scientific_name VARCHAR(255),
        description TEXT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        wingspan VARCHAR(100),
        habitat VARCHAR(255),
        diet TEXT,
        lifespan VARCHAR(100),
        conservation_status VARCHAR(100),
        researcher_only BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create animals table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS animals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        scientific_name VARCHAR(255),
        description TEXT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        weight VARCHAR(100),
        length VARCHAR(100),
        habitat VARCHAR(255),
        diet TEXT,
        conservation_status VARCHAR(100),
        researcher_only BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create tribes table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS tribes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        region VARCHAR(255),
        description TEXT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        population VARCHAR(100),
        language VARCHAR(255),
        traditional_practices TEXT,
        challenges TEXT,
        researcher_only BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Create terrain table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS terrain (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100),
        description TEXT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        elevation VARCHAR(100),
        climate TEXT,
        biodiversity TEXT,
        ecological_function TEXT,
        researcher_only BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Check if data already exists in each table
    const existingTrees = await sql`SELECT * FROM trees LIMIT 1`
    const existingBirds = await sql`SELECT * FROM birds LIMIT 1`
    const existingAnimals = await sql`SELECT * FROM animals LIMIT 1`
    const existingTribes = await sql`SELECT * FROM tribes LIMIT 1`
    const existingTerrain = await sql`SELECT * FROM terrain LIMIT 1`

    // Sample data for trees
    if (existingTrees.length === 0) {
      // Insert first tree
      await sql`
        INSERT INTO trees (name, scientific_name, description, image_url, height, trunk_diameter, lifespan, ecological_role, conservation_status, researcher_only)
        VALUES (
          'Giant Kapok Tree', 
          'Ceiba pentandra', 
          'The giant kapok tree is one of the largest trees in the rainforest, reaching heights of up to 70 meters.', 
          '/rainforest-giant.png', 
          'Up to 70 meters (230 feet)', 
          '3-4 meters (10-13 feet)', 
          '500-1000 years', 
          'The kapok tree serves as a habitat for countless species, from epiphytes growing on its branches to animals nesting in its hollows.', 
          'Least Concern', 
          false
        )
      `

      // Insert second tree
      await sql`
        INSERT INTO trees (name, scientific_name, description, image_url, height, trunk_diameter, lifespan, ecological_role, conservation_status, researcher_only)
        VALUES (
          'Mahogany', 
          'Swietenia macrophylla', 
          'Mahogany is a highly valued hardwood tree known for its beautiful reddish-brown timber.', 
          '/rainforest-mahogany.png', 
          '30-40 meters (100-130 feet)', 
          '1-2 meters (3-6 feet)', 
          '200-300 years', 
          'Provides habitat and food for various species', 
          'Vulnerable - protected under CITES Appendix II', 
          true
        )
      `
    }

    // Sample data for birds
    if (existingBirds.length === 0) {
      // Insert first bird
      await sql`
        INSERT INTO birds (name, scientific_name, description, image_url, wingspan, habitat, diet, lifespan, conservation_status, researcher_only)
        VALUES (
          'Toco Toucan', 
          'Ramphastos toco', 
          'The Toco Toucan is known for its enormous, colorful bill.', 
          '/rainforest-toucan.png', 
          '55-60 cm (22-24 inches)', 
          'Forest canopy and edges', 
          'Primarily fruits, but also insects, eggs, and small lizards', 
          '15-20 years', 
          'Least Concern', 
          false
        )
      `

      // Insert second bird
      await sql`
        INSERT INTO birds (name, scientific_name, description, image_url, wingspan, habitat, diet, lifespan, conservation_status, researcher_only)
        VALUES (
          'Scarlet Macaw', 
          'Ara macao', 
          'The Scarlet Macaw is one of the most spectacular parrots, with bright red, yellow, and blue plumage.', 
          '/scarlet-flight.png', 
          'Up to 1 meter (3.3 feet)', 
          'Tropical rainforests', 
          'Seeds, nuts, fruits, and berries', 
          '40-50 years in the wild, up to 75 in captivity', 
          'Least Concern', 
          false
        )
      `
    }

    // Sample data for animals
    if (existingAnimals.length === 0) {
      // Insert first animal
      await sql`
        INSERT INTO animals (name, scientific_name, description, image_url, weight, length, habitat, diet, conservation_status, researcher_only)
        VALUES (
          'Jaguar', 
          'Panthera onca', 
          'The jaguar is the largest cat in the Americas and the third-largest in the world.', 
          '/rainforest-jaguar.png', 
          '56-96 kg (124-212 lbs)', 
          '1.12-1.85 meters (3.7-6.1 feet)', 
          'Tropical rainforests, swamps, and grasslands', 
          'Carnivorous - deer, capybaras, tapirs, and other mammals', 
          'Near Threatened', 
          false
        )
      `

      // Insert second animal
      await sql`
        INSERT INTO animals (name, scientific_name, description, image_url, weight, length, habitat, diet, conservation_status, researcher_only)
        VALUES (
          'Three-toed Sloth', 
          'Bradypus variegatus', 
          'The three-toed sloth is one of the slowest-moving animals on Earth.', 
          '/sleepy-sloth-hangout.png', 
          '3.5-4.5 kg (8-10 lbs)', 
          '45-60 cm (18-24 inches)', 
          'Tropical rainforest canopies', 
          'Leaves, buds, and tender shoots', 
          'Least Concern', 
          false
        )
      `
    }

    // Sample data for tribes
    if (existingTribes.length === 0) {
      // Insert first tribe
      await sql`
        INSERT INTO tribes (name, region, description, image_url, population, language, traditional_practices, challenges, researcher_only)
        VALUES (
          'Yanomami', 
          'Amazon rainforest on the border between Venezuela and Brazil', 
          'The Yanomami are one of the largest relatively isolated indigenous groups in South America.', 
          '/yanomami-shabono.png', 
          'Approximately 35,000 people', 
          'Yanomami', 
          'Hunting, fishing, gathering, and slash-and-burn agriculture', 
          'Facing threats from illegal gold mining, disease, and deforestation', 
          false
        )
      `

      // Insert second tribe
      await sql`
        INSERT INTO tribes (name, region, description, image_url, population, language, traditional_practices, challenges, researcher_only)
        VALUES (
          'Kayapo', 
          'Amazon rainforest in Brazil', 
          'The Kayapo people are indigenous to the Amazon rainforest in Brazil.', 
          '/kayapo-warrior.png', 
          'Around 8,500 people', 
          'Kayapo', 
          'Hunting, fishing, and sustainable agriculture', 
          'Land encroachment, illegal logging, and mining', 
          true
        )
      `
    }

    // Sample data for terrain
    if (existingTerrain.length === 0) {
      // Insert first terrain
      await sql`
        INSERT INTO terrain (name, type, description, image_url, elevation, climate, biodiversity, ecological_function, researcher_only)
        VALUES (
          'Emergent Layer', 
          'Forest layer', 
          'The emergent layer is the topmost layer of the rainforest, where the tallest trees rise above the dense canopy below.', 
          '/rainforest-canopy.jpg', 
          '45-70 meters (150-230 feet) above ground', 
          'Variable, with high daytime heat and cooler nights', 
          'Home to eagles, butterflies, bats, and certain monkey species', 
          'First to capture rainfall, reducing erosion impact on lower layers', 
          false
        )
      `

      // Insert second terrain
      await sql`
        INSERT INTO terrain (name, type, description, image_url, elevation, climate, biodiversity, ecological_function, researcher_only)
        VALUES (
          'Rainforest Waterfall', 
          'Water feature', 
          'Waterfalls are dramatic features of rainforest landscapes, created where rivers flow over resistant rock ledges.', 
          '/rainforest-waterfall.jpg', 
          'Varies', 
          'Creates zones of constant mist and high humidity', 
          'Supports moisture-loving plants like mosses, ferns, and certain orchids', 
          'Oxygenates water and creates habitats for specialized aquatic species', 
          true
        )
      `
    }

    return NextResponse.json({
      success: true,
      message: "Category tables created and seeded successfully",
    })
  } catch (error) {
    console.error("Error seeding category tables:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
