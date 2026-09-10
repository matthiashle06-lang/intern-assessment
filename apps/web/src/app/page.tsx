import { propertyListSchema } from "schemas";

export const dynamic = "force-dynamic";

export default async function Home() {
  const res = await fetch("http://localhost:3001/properties");

  if (!res.ok) {
    return <main className="p-8 text-red-500">Error: Failed to load properties.</main>;
  }

  const rawData = await res.json();
  const parsed = propertyListSchema.safeParse(rawData);

  if (!parsed.success) {
    return <main className="p-8 text-red-500">Error: API returned an unexpected data shape.</main>;
  }

  const properties = parsed.data;

  return (
    <main className="p-8 max-w-2xl mx-auto">
      {/* The Login Link */}
      <div className="mb-6 flex justify-end">
        <a href="/login" className="text-blue-600 hover:underline font-semibold">
          Owner Sign In →
        </a>
      </div>

      <h1 className="text-2xl font-bold mb-6">Published Properties</h1>
      <div className="grid gap-4">
        {properties.length === 0 && <p>No properties available.</p>}
        {properties.map((property) => (
          <div key={property.id} className="border p-4 rounded shadow-sm">
            <h2 className="text-xl font-semibold">
              <a href={`/properties/${property.id}`} className="text-blue-600 hover:underline">
                {property.name}
              </a>
            </h2>
            <p className="text-gray-600">${property.price}</p>
            <p className="mt-2">{property.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
