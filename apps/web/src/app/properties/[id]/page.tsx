import { propertySchema } from "schemas";
import EnquiryForm from "./enquiryForm";

// 1. Update the type to expect a Promise
export default async function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
  // 2. Await the params to unwrap the ID
  const resolvedParams = await params;
  const propertyId = resolvedParams.id;

  // 3. Fetch the single property from Elysia using the unwrapped ID
  const res = await fetch(`http://localhost:3001/properties/${propertyId}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    return <main className="p-8 text-center text-xl">404 - Property Not Found</main>;
  }

  if (!res.ok) {
    return <main className="p-8 text-red-500">Error loading property details.</main>;
  }

  const rawData = await res.json();
  const parsed = propertySchema.safeParse(rawData);

  if (!parsed.success) {
    return <main className="p-8 text-red-500">Error: API contract mismatch on this property.</main>;
  }

  const property = parsed.data;

  // Render the plain UI with the form at the bottom
  return (
    <main className="p-8 max-w-2xl mx-auto">
      <div className="mb-4">
        <a href="/" className="text-blue-600 hover:underline">
          ← Back to all properties
        </a>
      </div>

      <h1 className="text-3xl font-bold">{property.name}</h1>
      <p className="text-gray-500 text-lg mb-6">${property.price} / month</p>

      <div className="prose mb-8">
        <p>{property.description}</p>
      </div>

      <hr />

      <EnquiryForm propertyId={property.id} />
    </main>
  );
}
