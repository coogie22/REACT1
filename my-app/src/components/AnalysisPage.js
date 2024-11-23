import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyB9uKYmvrtZZwYFo6WiWb6j_oO7pyM7-AE",
  authDomain: "backend1-79e56.firebaseapp.com",
  databaseURL: "https://backend1-79e56-default-rtdb.firebaseio.com",
  projectId: "backend1-79e56",
  storageBucket: "backend1-79e56.appspot.com",
  messagingSenderId: "327925233289",
  appId: "1:327925233289:web:fb3b6385f7f7cbcb9bb858",
  measurementId: "G-482MFGBLJV",
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function AnalysisPage() {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const dataRef = ref(db, "sensorData");

    // Firebase 데이터 구독
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.values(data).map((item) => ({
          timestamp: new Date(item.timestamp).toLocaleString(),
          temperature: item.temperature,
          humidity: item.humidity,
          soilMoisture: item.soilMoisture,
        }));
        // 최신 데이터가 위로 오도록 정렬
        setTableData(formattedData.reverse());
      }
    });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>데이터 분석</h2>
      <div
        style={{
          marginTop: "20px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          backgroundColor: "#f9f9f9",
          padding: "20px",
        }}
      >
        <h3 style={{ textAlign: "center" }}>저장된 데이터</h3>
        <div
          style={{
            maxHeight: "400px",
            overflowY: "auto",
            border: "1px solid #ddd",
            padding: "10px",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4" }}>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  시간
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  온도 (°C)
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  습도 (%)
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  토양 수분 (%)
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.length > 0 ? (
                tableData.map((row, index) => (
                  <tr key={index}>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {row.timestamp}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {row.temperature}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {row.humidity}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {row.soilMoisture}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      textAlign: "center",
                      padding: "10px",
                      border: "1px solid #ddd",
                    }}
                  >
                    데이터를 불러오는 중입니다...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AnalysisPage;
