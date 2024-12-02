import React, { useState, useEffect } from "react";

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
  const [gradeFilter, setGradeFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // Add filter for exam status (Approved/Rejected)

  // Mocked data fetch (adjust with actual API/DynamoDB call)
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        //examples
        const mockExams = [
          {
            id: 1,
            grade: "Secondary Grade 1",
            subject: "ENG 102",
            file: "Grade1_ENG-102.pdf",
            status: "Approved",
            
          },
          {
            id: 2,
            grade: "Secondary Grade 2",
            subject: "ENG 201",
            file: "Grade2_ENG-201.pdf",
            status: "Rejected",
            
          },
        ];
        setHistory(mockExams);
        setFilteredHistory(mockExams);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    fetchHistory();
  }, []);

  // Apply filters
  const handleFilter = () => {
    const filtered = history.filter(
      (exam) =>
        (gradeFilter ? exam.grade === gradeFilter : true) &&
        (subjectFilter ? exam.subject === subjectFilter : true) &&
        (statusFilter ? exam.status === statusFilter : true)
    );
    setFilteredHistory(filtered);
  };

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2
        style={{
          fontFamily: "Georgia, serif",
          color: "#333",
          marginBottom: "2rem",
          fontSize: "28px",
          textAlign: "center",
        }}
      >
        Exam Approval History
      </h2>

      {/* Filter Section */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "2rem",
          backgroundColor: "#fff",
          padding: "1rem",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "800px",
        }}
      >
        <div>
          <label
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#555",
            }}
          >
            Grade:
          </label>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            style={{
              display: "block",
              width: "200px",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              marginTop: "0.5rem",
              fontSize: "14px",
            }}
          >
            <option value="">All Grades</option>
            <option value="Secondary Grade 1">Secondary Grade 1</option>
            <option value="Secondary Grade 2">Secondary Grade 2</option>
            <option value="Secondary Grade 3">Secondary Grade 3</option>
          </select>
        </div>
        <div>
          <label
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#555",
            }}
          >
            Subject:
          </label>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            style={{
              display: "block",
              width: "200px",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              marginTop: "0.5rem",
              fontSize: "14px",
            }}
          >
            <option value="">All Subjects</option>
            <option value="ENG 101">ENG 101</option>
            <option value="ENG 102">ENG 102</option>
            <option value="ENG 201">ENG 201</option>
            <option value="ENG 301">ENG 301</option>
          </select>
        </div>
        <div>
          <label
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#555",
            }}
          >
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              display: "block",
              width: "200px",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              marginTop: "0.5rem",
              fontSize: "14px",
            }}
          >
            <option value="">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <button
          onClick={handleFilter}
          style={{
            backgroundColor: "#4b4b4b",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            fontSize: "16px",
            border: "none",
            cursor: "pointer",
            marginTop: "1.5rem",
          }}
        >
          Apply Filters
        </button>
      </div>

      {/* Exam History Section */}
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          backgroundColor: "#fff",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h3
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "20px",
            fontWeight: "bold",
            color: "#333",
            marginBottom: "1rem",
          }}
        >
          Exam History
        </h3>
        <ul
          style={{
            listStyleType: "none",
            padding: 0,
          }}
        >
          {filteredHistory.length > 0 ? (
            filteredHistory.map((exam) => (
              <li
                key={exam.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem",
                  borderBottom: "1px solid #ccc",
                }}
              >
                <div>
                  <span style={{ color: "#333", fontSize: "16px" }}>
                    {exam.grade} - {exam.subject} (
                    <strong>{exam.status}</strong>)
                  </span>
                  
                </div>
                <a
                  href={`https://your-s3-bucket-url/${exam.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    backgroundColor: "#4b4b4b",
                    color: "#fff",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  Download PDF
                </a>
              </li>
            ))
          ) : (
            <p
              style={{
                textAlign: "center",
                fontSize: "16px",
                color: "#777",
              }}
            >
              No exams found. Adjust your filters or try again later.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default HistoryPage;
