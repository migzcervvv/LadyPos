import { usePersonApi } from "../services/api";
import { useEffect, useState } from "react";
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
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b px-4 py-3 flex justify-between items-center">
        <h1 className="text-lg font-semibold tracking-tight">Customers</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl text-sm shadow active:scale-95 transition"
        >
          {showForm ? "Close" : "+ Add"}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="px-4 py-3 animate-fade-in">
          <PersonForm onSubmit={handleCreate} />
        </div>
      )}

      {/* CONTENT */}
      <div className="px-4 py-4 space-y-4">
        {loading && (
          <p className="text-center text-gray-500 text-sm">
            Loading customers...
          </p>
        )}

        {!loading && persons.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-16">
            No customers yet
          </div>
        )}

        {!loading &&
          persons.map((p) => (
            <PersonCard key={p._id} person={p} refresh={fetchPersons} />
          ))}
      </div>
    </div>
  );
}
