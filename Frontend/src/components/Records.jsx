import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Records.css';

const Records = () => {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // NEW: Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    
    if (!userData) {
      navigate("/signin");
      return;
    }

    const { email } = JSON.parse(userData);

    const fetchRecords = async () => {
      try {
        setIsLoading(true); // Show loading when switching pages
        const response = await fetch("http://127.0.0.1:5000/user_records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // NEW: Send the page and limit to the backend
          body: JSON.stringify({ email, page, limit })
        });

        if (response.ok) {
          const data = await response.json();
          // NEW: Unpack the paginated data
          setRecords(data.records);
          setTotalPages(data.total_pages);
          setTotalRecords(data.total_records);
        } else {
          setError("Failed to load records.");
        }
      } catch (err) {
        setError("Server error. Is the backend running?");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, [navigate, page, limit]); // Re-run the fetch anytime page or limit changes!

  return (
    <div className="records-container">
      <div className="records-header">
        <h2>Scan History</h2>
        <p>View all your previously analyzed audio files.</p>
      </div>

      {isLoading && records.length === 0 ? (
        <div className="loading-state">Loading your records...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : totalRecords === 0 ? (
        <div className="empty-state">
          <p>No records found. You haven't uploaded any audios yet.</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="records-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>File Name</th>
                  <th>Size</th>
                  <th>Result</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td>{record.timestamp}</td>
                    <td className="filename-cell">{record.filename}</td>
                    <td>{record.size}</td>
                    <td>
                      <span className={`badge ${record.result === 'Fake Voice' ? 'badge-fake' : 'badge-real'}`}>
                        {record.result}
                      </span>
                    </td>
                    <td>{record.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- NEW: Pagination Controls --- */}
          <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
            
            {/* Limit Selector */}
            <div className="limit-selector">
              <label style={{ marginRight: '0.5rem' }}>Rows per page:</label>
              <select 
                value={limit} 
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1); // Always reset to page 1 when changing the limit
                }}
                style={{ background: 'var(--bg-card)', color: '#fff', border: '1px solid var(--border-color)', padding: '0.3rem', borderRadius: '4px' }}
              >
                <option value={5}>5</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Page Navigation */}
            <div className="page-navigation" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                onClick={() => setPage(page - 1)} 
                disabled={page === 1}
                style={{ background: 'transparent', color: page === 1 ? '#555' : 'var(--primary-accent)', border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
              >
                &larr; Prev
              </button>
              
              <span>Page {page} of {totalPages}</span>
              
              <button 
                onClick={() => setPage(page + 1)} 
                disabled={page === totalPages}
                style={{ background: 'transparent', color: page === totalPages ? '#555' : 'var(--primary-accent)', border: 'none', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
              >
                Next &rarr;
              </button>
            </div>
          </div>
          {/* ------------------------------- */}
        </>
      )}
    </div>
  );
};

export default Records;