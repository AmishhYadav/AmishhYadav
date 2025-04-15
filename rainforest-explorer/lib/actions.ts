"use server"

import { db } from "@/lib/db"
import { explorerItems, explorerPoints } from "@/lib/schema"
import { createClient } from "@supabase/supabase-js"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { neon } from "@neondatabase/serverless"

// Initialize Supabase client for auth
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Get explorer points
export async function getExplorerPoints() {
  try {
    const points = await db.select().from(explorerPoints)
    return { success: true, data: points }
  } catch (error) {
    console.error("Error fetching explorer points:", error)
    return { success: false, error: "Failed to fetch explorer points" }
  }
}

// Get explorer items by category
export async function getExplorerItemsByCategory(category: string) {
  try {
    const items = await db.select().from(explorerItems).where(eq(explorerItems.category, category))
    return { success: true, data: items }
  } catch (error) {
    console.error("Error fetching explorer items:", error)
    return { success: false, error: "Failed to fetch explorer items" }
  }
}

// Create a new explorer item
export async function createExplorerItem(data: {
  name: string
  scientificName?: string
  description: string
  imageUrl: string
  details: Record<string, string>
  category: string
  researcherOnly?: boolean
}) {
  try {
    await db.insert(explorerItems).values({
      name: data.name,
      scientificName: data.scientificName || null,
      description: data.description,
      imageUrl: data.imageUrl,
      details: data.details,
      category: data.category,
      researcherOnly: data.researcherOnly || false,
    })

    revalidatePath("/explorer")
    revalidatePath("/admin/items")

    return { success: true }
  } catch (error) {
    console.error("Error creating explorer item:", error)
    return { success: false, error: "Failed to create explorer item" }
  }
}

// Update the getUserProfile function to better handle Neon database queries
export async function getUserProfile(userId: string) {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    // Use direct neon SQL to avoid any ORM issues
    const sql = neon(process.env.DATABASE_URL!)

    const userProfile = await sql`SELECT * FROM users WHERE id = ${userId}`

    if (!userProfile || userProfile.length === 0) {
      return { success: false, error: "User profile not found" }
    }

    return { success: true, data: userProfile[0] }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return { success: false, error: "Failed to fetch user profile" }
  }
}

// Update the upsertUserProfile function to ensure it works with Neon
export async function upsertUserProfile(data: {
  id: string
  email: string
  name?: string
  userType: string
}) {
  try {
    if (!data.id || !data.email) {
      return { success: false, error: "User ID and email are required" }
    }

    // Validate userType
    const validUserTypes = ["guest", "dora", "researcher"]
    if (!validUserTypes.includes(data.userType)) {
      data.userType = "guest" // Default to guest if invalid
    }

    // Use direct neon SQL to avoid any ORM issues
    const sql = neon(process.env.DATABASE_URL!)

    // Check if users table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `

    if (!tableExists[0].exists) {
      // Create users table if it doesn't exist
      await sql`
        CREATE TABLE users (
          id TEXT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          name VARCHAR(255),
          user_type VARCHAR(50) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    }

    // Check if user exists
    const existingUser = await sql`SELECT * FROM users WHERE id = ${data.id}`

    if (existingUser.length > 0) {
      // Update existing user
      await sql`
        UPDATE users 
        SET email = ${data.email}, name = ${data.name}, user_type = ${data.userType}
        WHERE id = ${data.id}
      `
    } else {
      // Create new user
      await sql`
        INSERT INTO users (id, email, name, user_type)
        VALUES (${data.id}, ${data.email}, ${data.name}, ${data.userType})
      `
    }

    return { success: true }
  } catch (error) {
    console.error("Error upserting user profile:", error)
    return {
      success: false,
      error: "Failed to update user profile: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}

// Seed initial explorer points
export async function seedExplorerPoints() {
  try {
    const points = [
      {
        title: "Explore Trees",
        description:
          "Discover the magnificent trees that form the rainforest canopy. These giants provide homes for countless species and create the unique rainforest ecosystem.",
        icon: "Leaf",
        positionX: "20",
        positionY: "25",
      },
      {
        title: "Tropical Birds",
        description:
          "The rainforest is home to thousands of bird species, including toucans, macaws, and hummingbirds.",
        icon: "Bird",
        positionX: "70",
        positionY: "15",
      },
      {
        title: "Explore Animals",
        description:
          "From colorful butterflies to exotic mammals, the rainforest teems with incredible animal life. Discover the amazing diversity of rainforest creatures.",
        icon: "Bug",
        positionX: "85",
        positionY: "40",
      },
      {
        title: "Tribes",
        description:
          "Indigenous tribes have lived in harmony with the rainforest for thousands of years. Learn about their traditional knowledge and sustainable practices.",
        icon: "Users",
        positionX: "15",
        positionY: "60",
      },
      {
        title: "Explore Terrain",
        description:
          "The rainforest terrain varies from flat floodplains to steep hillsides. Explore how the landscape shapes the unique environments within the rainforest.",
        icon: "Droplets",
        positionX: "60",
        positionY: "50",
      },
    ]

    // Check if points already exist
    const existingPoints = await db.select().from(explorerPoints)
    console.log("Existing points:", existingPoints.length)

    if (existingPoints.length === 0) {
      console.log("Seeding explorer points...")
      for (const point of points) {
        await db.insert(explorerPoints).values(point)
      }
      console.log("Explorer points seeded successfully")
    } else {
      console.log("Explorer points already exist, skipping seed")
    }

    return { success: true }
  } catch (error) {
    console.error("Error seeding explorer points:", error)
    return { success: false, error: "Failed to seed explorer points" }
  }
}

// Seed sample explorer items
export async function seedExplorerItems() {
  try {
    // Check if items already exist
    const existingItems = await db.select().from(explorerItems)

    if (existingItems.length > 0) {
      return { success: true, message: "Items already exist, skipping seed" }
    }

    // Trees
    const trees = [
      {
        name: "Giant Kapok Tree",
        scientificName: "Ceiba pentandra",
        description:
          "The giant kapok tree is one of the largest trees in the rainforest, reaching heights of up to 70 meters. Its massive trunk and wide buttress roots provide stability and support for its towering height.",
        imageUrl: "/rainforest-giant.png",
        details: {
          Height: "Up to 70 meters (230 feet)",
          "Trunk Diameter": "3-4 meters (10-13 feet)",
          Lifespan: "500-1000 years",
          "Ecological Role":
            "The kapok tree serves as a habitat for countless species, from epiphytes growing on its branches to animals nesting in its hollows.",
          "Scientific Classification": "Kingdom: Plantae, Family: Malvaceae",
        },
        category: "trees",
        researcherOnly: false,
      },
      {
        name: "Mahogany",
        scientificName: "Swietenia macrophylla",
        description:
          "Mahogany is a highly valued hardwood tree known for its beautiful reddish-brown timber. It's one of the most commercially important trees in the rainforest, though overharvesting has made it endangered in many areas.",
        imageUrl: "/rainforest-mahogany.png",
        details: {
          Height: "30-40 meters (100-130 feet)",
          "Wood Properties": "Dense, strong, and resistant to rot and insects",
          "Conservation Status": "Vulnerable - protected under CITES Appendix II",
          Uses: "Fine furniture, musical instruments, boat building, and decorative veneers",
          "Scientific Notes": "The wood contains unique compounds that give it natural resistance to decay and pests",
        },
        category: "trees",
        researcherOnly: true,
      },
      {
        name: "Rubber Tree",
        scientificName: "Hevea brasiliensis",
        description:
          "The rubber tree is native to the Amazon rainforest and is the primary source of natural rubber. When the bark is cut, it produces a milky white latex that can be collected and processed into rubber.",
        imageUrl: "/rainforest-rubber-tree.png",
        details: {
          Height: "20-30 meters (65-100 feet)",
          "Economic Importance": "Source of natural rubber, a crucial material for thousands of products",
          "Harvesting Method": "Tapping - making diagonal cuts in the bark to collect latex",
          History: "Seeds were smuggled out of Brazil in the 1870s, leading to rubber plantations in Southeast Asia",
          "Scientific Compounds":
            "The latex contains polyisoprene, which gives rubber its elasticity and water-resistant properties",
        },
        category: "trees",
        researcherOnly: false,
      },
      {
        name: "Brazil Nut Tree",
        scientificName: "Bertholletia excelsa",
        description:
          "The majestic Brazil nut tree produces large, woody fruits containing the familiar Brazil nuts. These trees can live for centuries and require specific rainforest conditions to reproduce successfully.",
        imageUrl: "/majestic-brazil-nut.png",
        details: {
          Height: "Up to 50 meters (160 feet)",
          Lifespan: "500+ years",
          Fruit: "Large woody capsules containing 10-25 seeds (Brazil nuts)",
          "Ecological Relationships":
            "Relies on large-bodied rodents called agoutis to disperse seeds and specific bee species for pollination",
          "Scientific Importance": "Contains high levels of selenium, a vital micronutrient",
        },
        category: "trees",
        researcherOnly: false,
      },
    ]

    // Birds
    const birds = [
      {
        name: "Toco Toucan",
        scientificName: "Ramphastos toco",
        description:
          "The Toco Toucan is known for its enormous, colorful bill. Despite its size, the bill is lightweight, made of keratin with a honeycomb-like structure inside. These birds are fruit-eaters and play an important role in seed dispersal.",
        imageUrl: "/rainforest-toucan.png",
        details: {
          "Bill Length": "Up to 20 cm (8 inches)",
          Wingspan: "55-60 cm (22-24 inches)",
          Diet: "Primarily fruits, but also insects, eggs, and small lizards",
          Habitat: "Forest canopy and edges",
          "Scientific Notes":
            "The bill contains thermoregulatory properties, helping the bird control body temperature",
        },
        category: "birds",
        researcherOnly: false,
      },
      {
        name: "Scarlet Macaw",
        scientificName: "Ara macao",
        description:
          "The Scarlet Macaw is one of the most spectacular parrots, with bright red, yellow, and blue plumage. These intelligent birds form lifelong pair bonds and can live for decades in the wild.",
        imageUrl: "/scarlet-flight.png",
        details: {
          Length: "80-90 cm (31-35 inches) including tail",
          Wingspan: "Up to 1 meter (3.3 feet)",
          Lifespan: "40-50 years in the wild, up to 75 in captivity",
          Communication: "Complex vocalizations and body language",
          "Scientific Behavior": "Exhibits high cognitive abilities, including problem-solving and tool use",
        },
        category: "birds",
        researcherOnly: true,
      },
      {
        name: "Emerald Hummingbird",
        scientificName: "Chlorostilbon mellisugus",
        description:
          "The Emerald Hummingbird is a tiny jewel of the rainforest, with iridescent green plumage that shimmers in the sunlight. These birds can hover in mid-air and even fly backwards, a feat unique to hummingbirds.",
        imageUrl: "/emerald-jewel.png",
        details: {
          Size: "7-9 cm (2.8-3.5 inches)",
          Weight: "2-6 grams (0.07-0.2 ounces)",
          "Wing Beats": "50-80 times per second",
          Metabolism: "Extremely high, requiring frequent feeding",
          "Scientific Adaptations": "Specialized hemoglobin that enhances oxygen delivery during rapid flight",
        },
        category: "birds",
        researcherOnly: false,
      },
      {
        name: "Rufous Hummingbird",
        scientificName: "Selasphorus rufus",
        description:
          "The Rufous Hummingbird is known for its aggressive territorial behavior despite its tiny size. With coppery-orange plumage, these birds are important pollinators for many rainforest plants.",
        imageUrl: "/rufous-hummingbird-nectar.png",
        details: {
          Size: "8 cm (3.1 inches)",
          Migration: "Can travel over 3,000 miles during migration",
          Feeding: "Visits up to 1,000-2,000 flowers per day",
          Memory: "Can remember the location of flowers from previous years",
          "Scientific Metabolism": "Heart rate can exceed 1,200 beats per minute during flight",
        },
        category: "birds",
        researcherOnly: true,
      },
    ]

    // Animals
    const animals = [
      {
        name: "Jaguar",
        scientificName: "Panthera onca",
        description:
          "The jaguar is the largest cat in the Americas and the third-largest in the world. These powerful predators have the strongest bite force of any big cat, allowing them to pierce the shells of turtles and caimans.",
        imageUrl: "/rainforest-jaguar.png",
        details: {
          Weight: "56-96 kg (124-212 lbs)",
          Length: "1.12-1.85 meters (3.7-6.1 feet)",
          "Hunting Style": "Solitary ambush predator",
          "Distinctive Feature": "Rosette pattern with spots inside, unlike leopards",
          "Scientific Classification": "Order: Carnivora, Family: Felidae",
        },
        category: "animals",
        researcherOnly: false,
      },
      {
        name: "Three-toed Sloth",
        scientificName: "Bradypus variegatus",
        description:
          "The three-toed sloth is one of the slowest-moving animals on Earth. They spend most of their lives hanging upside-down in the canopy, moving so slowly that algae grows on their fur, providing camouflage.",
        imageUrl: "/sleepy-sloth-hangout.png",
        details: {
          Speed: "0.24 km/h (0.15 mph) maximum",
          Sleep: "15-18 hours per day",
          Diet: "Leaves, buds, and tender shoots",
          Adaptations: "Specialized claws for hanging, multi-chambered stomach for digestion",
          "Scientific Metabolism": "Lowest metabolic rate of any non-hibernating mammal, 40-45% lower than expected",
        },
        category: "animals",
        researcherOnly: true,
      },
      {
        name: "Poison Dart Frog",
        scientificName: "Dendrobates azureus",
        description:
          "The blue poison dart frog is among the most toxic animals on Earth. Its bright blue coloration serves as a warning to potential predators. Indigenous tribes have used their toxins on blowgun darts for hunting.",
        imageUrl: "/azure-amphibian.png",
        details: {
          Size: "3-4.5 cm (1.2-1.8 inches)",
          Toxicity: "Contains batrachotoxin, a powerful neurotoxin",
          Lifespan: "4-6 years in the wild, up to 12 in captivity",
          Reproduction: "Lays eggs on land, males carry tadpoles to water",
          "Scientific Note": "Toxicity comes from their diet of specific insects and is lost in captivity",
        },
        category: "animals",
        researcherOnly: false,
      },
      {
        name: "Blue Morpho Butterfly",
        scientificName: "Morpho peleides",
        description:
          "The Blue Morpho is one of the largest and most striking butterflies in the world. Its wings appear brilliant blue, but this is actually a structural color created by light reflecting off microscopic scales.",
        imageUrl: "/blue-morpho-leaf.png",
        details: {
          Wingspan: "12-20 cm (5-8 inches)",
          Coloration: "Iridescent blue upper wings, brown undersides with eyespots",
          Lifespan: "115-120 days total, 2-3 weeks as adult butterfly",
          Diet: "Fruit juices, tree sap, and rotting matter as adults",
          "Scientific Structure":
            "Wing scales contain complex nanostructures that create structural color through light diffraction",
        },
        category: "animals",
        researcherOnly: true,
      },
    ]

    // Tribes
    const tribes = [
      {
        name: "Yanomami",
        scientificName: null,
        description:
          "The Yanomami are one of the largest relatively isolated indigenous groups in South America. They live in the Amazon rainforest on the border between Venezuela and Brazil, maintaining traditional ways of life.",
        imageUrl: "/yanomami-shabono.png",
        details: {
          Population: "Approximately 35,000 people",
          Housing: "Communal roundhouses called shabonos",
          Subsistence: "Hunting, fishing, gathering, and slash-and-burn agriculture",
          "Spiritual Beliefs": "Shamanic traditions with plant-based hallucinogens for spiritual journeys",
          Challenges: "Facing threats from illegal gold mining, disease, and deforestation",
        },
        category: "tribes",
        researcherOnly: false,
      },
      {
        name: "Kayapo",
        scientificName: null,
        description:
          "The Kayapo people are indigenous to the Amazon rainforest in Brazil. They are known for their elaborate body paint, feather headdresses, and fierce protection of their traditional lands against development.",
        imageUrl: "/kayapo-warrior.png",
        details: {
          Territory: "Over 11 million acres of legally recognized land",
          "Social Structure": "Matrilineal society with complex kinship systems",
          "Body Adornment": "Intricate geometric patterns with natural pigments",
          Conservation: "Successfully fought against dam projects and logging",
          "Ethnographic Notes": "Maintain extensive knowledge of over 300 medicinal plants",
        },
        category: "tribes",
        researcherOnly: true,
      },
      {
        name: "Embera",
        scientificName: null,
        description:
          "The Embera people live in the rainforests of Panama and Colombia. They are known for their distinctive stilt houses built along riverbanks, colorful attire, and skilled craftsmanship in basket weaving and wood carving.",
        imageUrl: "/embera-stilt-village.png",
        details: {
          Housing: "Palm-thatched homes on stilts to protect from flooding and animals",
          Crafts: "Intricate basketry, wood carvings, and beadwork",
          "Body Art": "Temporary body painting using jagua fruit dye",
          Diet: "Fish, plantains, rice, and forest fruits",
          "Cultural Practices": "Traditional music using maracas, drums, and flutes",
        },
        category: "tribes",
        researcherOnly: false,
      },
      {
        name: "Huaorani",
        scientificName: null,
        description:
          "The Huaorani (also known as Waorani) are indigenous hunter-gatherers living in the Ecuadorian Amazon. Until the mid-20th century, they had little contact with the outside world and were known for their fierce defense of their territory.",
        imageUrl: "/huaorani-hunter.png",
        details: {
          Population: "Around 2,000 people",
          "Hunting Skills": "Expert with 3-meter long blowguns and curare-tipped darts",
          Language: "Huaorani language is linguistically isolated, unrelated to other known languages",
          "Social Organization": "Egalitarian society with flexible leadership",
          "Ethnobotanical Knowledge": "Utilize over 150 plant species for medicine, hunting, and construction",
        },
        category: "tribes",
        researcherOnly: true,
      },
    ]

    // Terrain
    const terrain = [
      {
        name: "Emergent Layer",
        scientificName: null,
        description:
          "The emergent layer is the topmost layer of the rainforest, where the tallest trees rise above the dense canopy below. These giant trees can reach heights of 70 meters and are exposed to strong winds, intense sunlight, and temperature fluctuations.",
        imageUrl: "/rainforest-canopy.jpg",
        details: {
          Height: "45-70 meters (150-230 feet) above ground",
          Temperature: "Variable, with high daytime heat and cooler nights",
          Precipitation: "Receives the most direct rainfall",
          Biodiversity: "Home to eagles, butterflies, bats, and certain monkey species",
          "Ecological Function": "First to capture rainfall, reducing erosion impact on lower layers",
        },
        category: "terrain",
        researcherOnly: false,
      },
      {
        name: "Rainforest Waterfall",
        scientificName: null,
        description:
          "Waterfalls are dramatic features of rainforest landscapes, created where rivers flow over resistant rock ledges. They create unique microhabitats with high humidity and constant mist, supporting specialized plant communities.",
        imageUrl: "/rainforest-waterfall.jpg",
        details: {
          Formation: "Occurs where water flows over resistant rock formations",
          Microclimate: "Creates zones of constant mist and high humidity",
          Flora: "Supports moisture-loving plants like mosses, ferns, and certain orchids",
          "Ecological Impact": "Oxygenates water and creates habitats for specialized aquatic species",
          "Hydrological Significance": "Contributes to groundwater recharge and local precipitation patterns",
        },
        category: "terrain",
        researcherOnly: true,
      },
      {
        name: "Understory",
        scientificName: null,
        description:
          "The understory is a dark, humid environment beneath the canopy where only 2-5% of sunlight penetrates. Plants here have adapted to low light conditions with large, broad leaves to capture what little sunlight filters down.",
        imageUrl: "/rainforest-understory.jpg",
        details: {
          "Light Levels": "2-5% of full sunlight",
          Humidity: "Consistently high, often 95%+",
          "Plant Adaptations": "Large leaves to maximize light capture, shade tolerance",
          Biodiversity: "Home to jaguars, snakes, frogs, and countless insect species",
          "Human Use": "Many medicinal plants are found in this layer",
        },
        category: "terrain",
        researcherOnly: false,
      },
      {
        name: "Rainforest River",
        scientificName: null,
        description:
          "Rivers are the lifeblood of the rainforest ecosystem, serving as transportation corridors for both wildlife and humans. They range from narrow, fast-flowing streams to massive waterways like the Amazon River.",
        imageUrl: "/rainforest-river.jpg",
        details: {
          "Water Chemistry": "Often 'blackwater' (tannin-rich) or 'whitewater' (sediment-rich)",
          "Seasonal Variation": "Can rise 10+ meters during rainy seasons, flooding surrounding forest",
          Biodiversity: "Home to thousands of fish species, river dolphins, caimans, and aquatic invertebrates",
          "Ecological Function": "Distributes nutrients, seeds, and sediments throughout the ecosystem",
          "Hydrological Cycle": "Contributes significantly to atmospheric moisture through evapotranspiration",
        },
        category: "terrain",
        researcherOnly: true,
      },
    ]

    // Combine all items
    const allItems = [...trees, ...birds, ...animals, ...tribes, ...terrain]

    // Insert all items
    for (const item of allItems) {
      await db.insert(explorerItems).values(item)
    }

    revalidatePath("/explorer")
    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("Error seeding explorer items:", error)
    return { success: false, error: "Failed to seed explorer items" }
  }
}
