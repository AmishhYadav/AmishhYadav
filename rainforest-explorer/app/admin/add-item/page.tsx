import AddExplorerItem from "@/components/add-explorer-item"

export default function AddItemPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-green-800 text-center">Add Rainforest Explorer Item</h1>
        <p className="mb-8 text-gray-600 text-center">
          Use this form to add new items to the Rainforest Explorer database.
        </p>
        <AddExplorerItem />
      </div>
    </div>
  )
}
