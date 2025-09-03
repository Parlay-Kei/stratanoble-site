export default function TestPage() {
  return (
    <div className="p-8 bg-red-500 text-white">
      <h1 className="text-4xl font-bold mb-4">CSS Test Page</h1>
      <div className="bg-blue-500 p-4 rounded-lg">
        <p className="text-yellow-300">If you can see colors and styling, Tailwind is working!</p>
      </div>
      <div className="mt-4 space-y-2">
        <div className="w-32 h-8 bg-emerald-500"></div>
        <div className="w-32 h-8 bg-navy"></div>
        <div className="w-32 h-8 bg-accent-red"></div>
      </div>
    </div>
  )
}