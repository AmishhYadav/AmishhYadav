export type ExplorerPoint = {
  id: string
  title: string
  description: string
  icon: string
  position: { x: number; y: number }
}

export type ExplorerItem = {
  id: string
  name: string
  scientificName?: string
  description: string
  imageUrl: string
  details: Record<string, string>
  category: string
}
