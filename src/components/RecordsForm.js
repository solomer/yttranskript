"use client"
import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabaseClient"

export default function RecordsForm({ user }) {
  const [field1, setField1] = useState("")
  const [field2, setField2] = useState("")
  const [records, setRecords] = useState([])

  // Kayıtları çek
  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from("records")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (!error) setRecords(data)
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  // Kayıt ekle
  const addRecord = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from("records").insert([
      {
        user_id: user.id,
        field1,
        field2,
      },
    ])
    if (!error) {
      setField1("")
      setField2("")
      fetchRecords()
    } else {
      console.error(error)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Bilgi Ekle</h2>
      <form onSubmit={addRecord} className="space-y-2">
        <input
          type="text"
          placeholder="Bilgi Alanı 1"
          value={field1}
          onChange={(e) => setField1(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          placeholder="Bilgi Alanı 2"
          value={field2}
          onChange={(e) => setField2(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          Kaydet
        </button>
      </form>

      <h2 className="text-xl font-bold mt-6 mb-2">Kayıtlar</h2>
      <table className="border-collapse border border-gray-300 w-full">
        <thead>
          <tr>
            <th className="border p-2">Alan 1</th>
            <th className="border p-2">Alan 2</th>
            <th className="border p-2">Tarih</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec) => (
            <tr key={rec.id}>
              <td className="border p-2">{rec.field1}</td>
              <td className="border p-2">{rec.field2}</td>
              <td className="border p-2">
                {new Date(rec.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
