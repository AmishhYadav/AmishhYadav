"use server"

import { neon } from "@neondatabase/serverless"

// Initialize the SQL client
const sql = neon(process.env.DATABASE_URL!)

// Helper function to check if a column exists in a table
async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = ${tableName} 
      AND column_name = ${columnName}
    `
    return result.length > 0
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists in table ${tableName}:`, error)
    return false
  }
}

// Get items by category
export async function getItemsByCategory(category: string, isResearcher = false) {
  try {
    let data = []

    // If researcher, show all items. Otherwise, filter out researcher-only items if the column exists
    if (isResearcher) {
      // Researcher can see all items
      switch (category) {
        case "trees":
          data = await sql`SELECT * FROM trees ORDER BY name`
          break
        case "birds":
          data = await sql`SELECT * FROM birds ORDER BY name`
          break
        case "animals":
          data = await sql`SELECT * FROM animals ORDER BY name`
          break
        case "tribes":
          data = await sql`SELECT * FROM tribes ORDER BY name`
          break
        case "terrain":
          data = await sql`SELECT * FROM terrain ORDER BY name`
          break
        default:
          return { success: false, error: "Invalid category" }
      }
    } else {
      // Non-researchers should only see non-researcher-only items if the column exists
      switch (category) {
        case "trees":
          const treesHasResearcherOnly = await columnExists("trees", "researcher_only")
          if (treesHasResearcherOnly) {
            data = await sql`SELECT * FROM trees WHERE researcher_only = false OR researcher_only IS NULL ORDER BY name`
          } else {
            data = await sql`SELECT * FROM trees ORDER BY name`
          }
          break
        case "birds":
          const birdsHasResearcherOnly = await columnExists("birds", "researcher_only")
          if (birdsHasResearcherOnly) {
            data = await sql`SELECT * FROM birds WHERE researcher_only = false OR researcher_only IS NULL ORDER BY name`
          } else {
            data = await sql`SELECT * FROM birds ORDER BY name`
          }
          break
        case "animals":
          const animalsHasResearcherOnly = await columnExists("animals", "researcher_only")
          if (animalsHasResearcherOnly) {
            data =
              await sql`SELECT * FROM animals WHERE researcher_only = false OR researcher_only IS NULL ORDER BY name`
          } else {
            data = await sql`SELECT * FROM animals ORDER BY name`
          }
          break
        case "tribes":
          const tribesHasResearcherOnly = await columnExists("tribes", "researcher_only")
          if (tribesHasResearcherOnly) {
            data =
              await sql`SELECT * FROM tribes WHERE researcher_only = false OR researcher_only IS NULL ORDER BY name`
          } else {
            data = await sql`SELECT * FROM tribes ORDER BY name`
          }
          break
        case "terrain":
          const terrainHasResearcherOnly = await columnExists("terrain", "researcher_only")
          if (terrainHasResearcherOnly) {
            data =
              await sql`SELECT * FROM terrain WHERE researcher_only = false OR researcher_only IS NULL ORDER BY name`
          } else {
            data = await sql`SELECT * FROM terrain ORDER BY name`
          }
          break
        default:
          return { success: false, error: "Invalid category" }
      }
    }

    return { success: true, data }
  } catch (error) {
    console.error(`Error fetching ${category}:`, error)
    return { success: false, error: `Failed to fetch ${category}` }
  }
}

// Get tree by ID
export async function getTreeById(id: string) {
  try {
    const data = await sql`SELECT * FROM trees WHERE id = ${id}`
    return { success: true, data: data[0] || null }
  } catch (error) {
    console.error("Error fetching tree:", error)
    return { success: false, error: "Failed to fetch tree" }
  }
}

// Get bird by ID
export async function getBirdById(id: string) {
  try {
    const data = await sql`SELECT * FROM birds WHERE id = ${id}`
    return { success: true, data: data[0] || null }
  } catch (error) {
    console.error("Error fetching bird:", error)
    return { success: false, error: "Failed to fetch bird" }
  }
}

// Get animal by ID
export async function getAnimalById(id: string) {
  try {
    const data = await sql`SELECT * FROM animals WHERE id = ${id}`
    return { success: true, data: data[0] || null }
  } catch (error) {
    console.error("Error fetching animal:", error)
    return { success: false, error: "Failed to fetch animal" }
  }
}

// Get tribe by ID
export async function getTribeById(id: string) {
  try {
    const data = await sql`SELECT * FROM tribes WHERE id = ${id}`
    return { success: true, data: data[0] || null }
  } catch (error) {
    console.error("Error fetching tribe:", error)
    return { success: false, error: "Failed to fetch tribe" }
  }
}

// Get terrain by ID
export async function getTerrainById(id: string) {
  try {
    const data = await sql`SELECT * FROM terrain WHERE id = ${id}`
    return { success: true, data: data[0] || null }
  } catch (error) {
    console.error("Error fetching terrain:", error)
    return { success: false, error: "Failed to fetch terrain" }
  }
}

// Create a new tree
export async function createTree(data: any) {
  try {
    // Check if researcher_only column exists
    const hasResearcherOnly = await columnExists("trees", "researcher_only")

    if (hasResearcherOnly) {
      await sql`
        INSERT INTO trees (
          name, scientific_name, description, image_url, 
          height, trunk_diameter, lifespan, ecological_role, 
          conservation_status, researcher_only
        ) VALUES (
          ${data.name}, ${data.scientific_name}, ${data.description}, ${data.image_url},
          ${data.height}, ${data.trunk_diameter}, ${data.lifespan}, ${data.ecological_role},
          ${data.conservation_status}, ${data.researcher_only || false}
        )
      `
    } else {
      await sql`
        INSERT INTO trees (
          name, scientific_name, description, image_url, 
          height, trunk_diameter, lifespan, ecological_role, 
          conservation_status
        ) VALUES (
          ${data.name}, ${data.scientific_name}, ${data.description}, ${data.image_url},
          ${data.height}, ${data.trunk_diameter}, ${data.lifespan}, ${data.ecological_role},
          ${data.conservation_status}
        )
      `
    }

    return { success: true }
  } catch (error) {
    console.error("Error creating tree:", error)
    return { success: false, error: "Failed to create tree" }
  }
}

// Create a new bird
export async function createBird(data: any) {
  try {
    // Check if researcher_only column exists
    const hasResearcherOnly = await columnExists("birds", "researcher_only")

    if (hasResearcherOnly) {
      await sql`
        INSERT INTO birds (
          name, scientific_name, description, image_url, 
          wingspan, habitat, diet, lifespan, 
          conservation_status, researcher_only
        ) VALUES (
          ${data.name}, ${data.scientific_name}, ${data.description}, ${data.image_url},
          ${data.wingspan}, ${data.habitat}, ${data.diet}, ${data.lifespan},
          ${data.conservation_status}, ${data.researcher_only || false}
        )
      `
    } else {
      await sql`
        INSERT INTO birds (
          name, scientific_name, description, image_url, 
          wingspan, habitat, diet, lifespan, 
          conservation_status
        ) VALUES (
          ${data.name}, ${data.scientific_name}, ${data.description}, ${data.image_url},
          ${data.wingspan}, ${data.habitat}, ${data.diet}, ${data.lifespan},
          ${data.conservation_status}
        )
      `
    }

    return { success: true }
  } catch (error) {
    console.error("Error creating bird:", error)
    return { success: false, error: "Failed to create bird" }
  }
}

// Create a new animal
export async function createAnimal(data: any) {
  try {
    // Check if researcher_only column exists
    const hasResearcherOnly = await columnExists("animals", "researcher_only")

    if (hasResearcherOnly) {
      await sql`
        INSERT INTO animals (
          name, scientific_name, description, image_url, 
          weight, length, habitat, diet, 
          conservation_status, researcher_only
        ) VALUES (
          ${data.name}, ${data.scientific_name}, ${data.description}, ${data.image_url},
          ${data.weight}, ${data.length}, ${data.habitat}, ${data.diet},
          ${data.conservation_status}, ${data.researcher_only || false}
        )
      `
    } else {
      await sql`
        INSERT INTO animals (
          name, scientific_name, description, image_url, 
          weight, length, habitat, diet, 
          conservation_status
        ) VALUES (
          ${data.name}, ${data.scientific_name}, ${data.description}, ${data.image_url},
          ${data.weight}, ${data.length}, ${data.habitat}, ${data.diet},
          ${data.conservation_status}
        )
      `
    }

    return { success: true }
  } catch (error) {
    console.error("Error creating animal:", error)
    return { success: false, error: "Failed to create animal" }
  }
}

// Create a new tribe
export async function createTribe(data: any) {
  try {
    // Check if researcher_only column exists
    const hasResearcherOnly = await columnExists("tribes", "researcher_only")

    if (hasResearcherOnly) {
      await sql`
        INSERT INTO tribes (
          name, region, description, image_url, 
          population, language, traditional_practices, challenges,
          researcher_only
        ) VALUES (
          ${data.name}, ${data.region}, ${data.description}, ${data.image_url},
          ${data.population}, ${data.language}, ${data.traditional_practices}, ${data.challenges},
          ${data.researcher_only || false}
        )
      `
    } else {
      await sql`
        INSERT INTO tribes (
          name, region, description, image_url, 
          population, language, traditional_practices, challenges
        ) VALUES (
          ${data.name}, ${data.region}, ${data.description}, ${data.image_url},
          ${data.population}, ${data.language}, ${data.traditional_practices}, ${data.challenges}
        )
      `
    }

    return { success: true }
  } catch (error) {
    console.error("Error creating tribe:", error)
    return { success: false, error: "Failed to create tribe" }
  }
}

// Create a new terrain
export async function createTerrain(data: any) {
  try {
    // Check if researcher_only column exists
    const hasResearcherOnly = await columnExists("terrain", "researcher_only")

    if (hasResearcherOnly) {
      await sql`
        INSERT INTO terrain (
          name, type, description, image_url, 
          elevation, climate, biodiversity, ecological_function, 
          researcher_only
        ) VALUES (
          ${data.name}, ${data.type}, ${data.description}, ${data.image_url},
          ${data.elevation}, ${data.climate}, ${data.biodiversity}, ${data.ecological_function},
          ${data.researcher_only || false}
        )
      `
    } else {
      await sql`
        INSERT INTO terrain (
          name, type, description, image_url, 
          elevation, climate, biodiversity, ecological_function
        ) VALUES (
          ${data.name}, ${data.type}, ${data.description}, ${data.image_url},
          ${data.elevation}, ${data.climate}, ${data.biodiversity}, ${data.ecological_function}
        )
      `
    }

    return { success: true }
  } catch (error) {
    console.error("Error creating terrain:", error)
    return { success: false, error: "Failed to create terrain" }
  }
}
