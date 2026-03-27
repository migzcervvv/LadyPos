import { useEffect, useState } from "react";
import { usePersonApi } from "../services/api";
import PersonForm from "../components/PersonForm";
import PersonCard from "../components/PersonCard";

export default function PersonsPage() {
    const { getPersons, createPerson } = usePersonApi();

  const [persons, setPersons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchPersons() {
    try {
      setLoading(true);
      const res = await getPersons();
      setPersons(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPersons();
  }, []);

  async function handleCreate(data) {
    await createPerson(data);
    setShowForm(false);
    fetchPersons();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Persons</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm"
        >
          {showForm ? "Close" : "+ Add"}
        </button>
      </div>

      {/* Form (collapsible) */}
      {showForm && (
        <div className="px-4 py-3">
          <PersonForm onSubmit={handleCreate} />
        </div>
      )}

      {/* Content */}
      <div className="px-3 py-4 space-y-3">
        
        {/* Loading */}
        {loading && (
          <p className="text-center text-gray-500 text-sm">
            Loading persons...
          </p>
        )}

        {/* Empty State */}
        {!loading && persons.length === 0 && (
          <div className="text-center text-gray-500 text-sm mt-10">
            No persons yet.
          </div>
        )}

        {/* List */}
        {!loading &&
          persons.map((p) => (
            <PersonCard
              key={p._id}
              person={p}
              refresh={fetchPersons}
            />
          ))}
      </div>
    </div>
  );
}