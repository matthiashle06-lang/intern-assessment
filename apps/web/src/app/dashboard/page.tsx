"use client";

import { useEffect, useState } from "react";
import { enquiryListSchema, propertyListSchema } from "schemas";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch both resources concurrently with cookies included
        const [enqRes, propRes] = await Promise.all([
          fetch("http://localhost:3001/enquiries", { credentials: "include" }),
          fetch("http://localhost:3001/properties?filter=mine", { credentials: "include" }),
        ]);
        if (!enqRes.ok || !propRes.ok) throw new Error("Failed to load dashboard data");

        const rawEnquiries = await enqRes.json();
        const rawProperties = await propRes.json();

        // Enforce the contracts
        const parsedEnq = enquiryListSchema.safeParse(rawEnquiries);
        const parsedProp = propertyListSchema.safeParse(rawProperties);

        if (!parsedEnq.success || !parsedProp.success) {
          throw new Error("API returned an unexpected data shape.");
        }

        setEnquiries(parsedEnq.data);
        setProperties(parsedProp.data);
        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await fetch("http://localhost:3001/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
      });
      router.push("/");
    } catch (err) {
      console.error("Failed to sign out");
    }
  };

  if (status === "loading")
    return <main className="p-8 max-w-2xl mx-auto text-gray-500">Loading dashboard...</main>;
  if (status === "error")
    return <main className="p-8 max-w-2xl mx-auto text-red-500">Error: {errorMsg}</main>;

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Owner Dashboard</h1>
        <button onClick={handleSignOut} className="text-red-600 hover:underline font-semibold">
          Sign Out
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Properties Column */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Your Properties</h2>
          {properties.length === 0 ? (
            <p className="text-gray-600 border p-4 rounded">No properties listed.</p>
          ) : (
            <div className="grid gap-4">
              {properties.map((prop) => (
                <div key={prop.id} className="border p-4 rounded shadow-sm bg-white text-black">
                  <div className="flex justify-between">
                    <span className="font-semibold">{prop.name}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${prop.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                    >
                      {prop.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">${prop.price}/month</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Enquiries Column */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Your Enquiries</h2>
          {enquiries.length === 0 ? (
            <p className="text-gray-600 border p-4 rounded">No enquiries received yet.</p>
          ) : (
            <div className="grid gap-4">
              {enquiries.map((enq) => (
                <div key={enq.id} className="border p-4 rounded shadow-sm bg-white text-black">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-sm">{enq.name}</span>
                    <span className="text-xs text-gray-500">{enq.email}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{enq.message}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
