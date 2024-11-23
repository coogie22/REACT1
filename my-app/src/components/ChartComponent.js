import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { getDatabase, ref, onChildAdded } from "firebase/database";
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

function ChartComponent() {
  const chartRef = useRef(null);
  const canvasRef = useRef(null);
  const MAX_VISIBLE_POINTS = 20;
  const [latestData, setLatestData] = useState(null);

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
            borderWidth: 2,
            pointRadius: 4,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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

    // Firebase 데이터 스트림 구독
    const humidityRef = ref(db, "humidityData");
    onChildAdded(humidityRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const { labels, datasets } = chartRef.current.data;

        const humidity = data.humidity;
        const timestamp = new Date(data.timestamp).toLocaleTimeString();

        // 최신 데이터 상태 업데이트
        setLatestData({
          humidity: humidity.toFixed(2),
          timestamp: new Date(data.timestamp).toLocaleString(),
        });

        // 차트 업데이트
        labels.push(timestamp);
        datasets[0].data.push(humidity);

        // 데이터 포인트 제한
        if (labels.length > MAX_VISIBLE_POINTS) {
          labels.shift();
          datasets[0].data.shift();
        }

        chartRef.current.update();
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

      {/* 실시간 데이터 */}
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
