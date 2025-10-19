import { useEffect, useState } from "react";
import axios from "axios";

export default function CoverLetterModal({ app, onClose }) {
  const [coverLetter, setCoverLetter] = useState("Generating...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generate = async () => {
      try { const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/applications`, {
       
          company: app.company,
          role: app.role,
          description: app.description,
        });
        setCoverLetter(data.coverLetter);
      } catch (err) {
        console.error(err);
        setCoverLetter("Error generating cover letter");
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, [app]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">{loading ? "Generating..." : "Cover Letter"}</h2>
        <pre className="whitespace-pre-wrap">{coverLetter}</pre>
        <button
          onClick={onClose}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
