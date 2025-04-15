import SetupDatabase from "@/scripts/setup-database"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-green-800">Rainforest Explorer Database Setup</h1>
        <p className="mb-8 text-gray-600">
          This page will help you set up the necessary database tables and initial data for the Rainforest Explorer app.
        </p>
        <SetupDatabase />
      </div>
    </div>
  )
}
