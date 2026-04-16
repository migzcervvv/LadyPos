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
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      {/* HEADER */}
      <div className="sticky top-0 z-20 backdrop-blur px-4 py-3 flex justify-between items-center border-b">
        <h1 className="text-lg font-semibold tracking-tight">Customers</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl text-sm text-white"
          style={{
            backgroundColor: "var(--color-primary)",
          }}
        >
          {showForm ? "Close" : "+ Add"}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="px-4 py-3">
          <PersonForm onSubmit={handleCreate} />
        </div>
      )}

      {/* CONTENT */}
      <div className="px-4 py-4 space-y-4">
        {loading && (
          <p
            className="text-center text-sm"
            style={{ color: "var(--color-muted)" }}
          >
            Loading customers...
          </p>
        )}

        {!loading && persons.length === 0 && (
          <div
            className="text-center text-sm mt-16"
            style={{ color: "var(--color-muted)" }}
          >
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
