import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
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
  measurementId: "G-482MFGBLJV"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function ChartComponent() {
  const chartRef = useRef(null);
  const canvasRef = useRef(null);
  const MAX_VISIBLE_POINTS = 20;
  const [latestData, setLatestData] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    // Chart.js 초기화
    const chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "습도 (%)",
            data: [],
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderWidth: 2, // 라인 두께 조정
            pointRadius: 4, // 데이터 포인트 크기 조정
            tension: 0.4, // 곡선 부드럽게
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 600,
          easing: "easeInOutCubic", // 부드러운 애니메이션 효과
        },
        scales: {
          x: {
            title: { display: true, text: "시간" },
          },
          y: {
            beginAtZero: true,
            max: 100,
            title: { display: true, text: "습도 (%)" },
          },
        },
        plugins: {
          legend: { position: "top" },
        },
      },
    });

    chartRef.current = chartInstance;

    // Firebase 데이터 구독
    const humidityRef = ref(db, "humidityData");

    onValue(humidityRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const { labels, datasets } = chartRef.current.data;

        // Firebase에서 받은 데이터를 처리
        Object.values(data).forEach((item) => {
          const humidity = item.humidity;
          let timestamp = item.timestamp;

          if (timestamp && typeof timestamp === "string") {
            timestamp = new Date(timestamp).getTime();
          } else if (!timestamp || isNaN(timestamp)) {
            timestamp = Date.now();
          }

          // 최신 데이터 업데이트
          setLatestData({
            humidity: humidity.toFixed(2),
            timestamp: new Date(timestamp).toLocaleString(),
          });

          // 데이터 히스토리 추가
          setHistoryData((prev) => [
            { humidity, timestamp: new Date(timestamp).toLocaleString() },
            ...prev.slice(0, 99),
          ]);

          // 차트 업데이트
          labels.push(new Date(timestamp).toLocaleTimeString());
          datasets[0].data.push(humidity);

          if (labels.length > MAX_VISIBLE_POINTS) {
            labels.shift();
            datasets[0].data.shift();
          }

          chartRef.current.update();
        });
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
      {/* 차트 */}
      <div style={{ flex: 1 }}>
        <canvas ref={canvasRef}></canvas>
      </div>

      {/* 실시간 데이터 및 히스토리 */}
      <div
        style={{
          flexBasis: "300px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h3 style={{ textAlign: "center", color: "#00529b" }}>실시간 데이터</h3>
        {latestData ? (
          <>
            <p>
              <strong>습도:</strong> {latestData.humidity}%
            </p>
            <p>
              <strong>수신 시간:</strong> {latestData.timestamp}
            </p>
            <hr />
            <h4>데이터 히스토리</h4>
            <div
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid #ddd",
                padding: "10px",
              }}
            >
              {historyData.map((item, index) => (
                <div key={index} style={{ marginBottom: "10px" }}>
                  <p>
                    <strong>습도:</strong> {item.humidity}% <br />
                    <strong>시간:</strong> {item.timestamp}
                  </p>
                  <hr />
                </div>
              ))}
            </div>
          </>
        ) : (
          <p style={{ textAlign: "center", color: "#888" }}>
            데이터를 로드 중입니다...
          </p>
        )}
      </div>
    </div>
  );
}

export default ChartComponent;
