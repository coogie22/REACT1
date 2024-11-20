import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

function ChartComponent() {
  const chartRef = useRef(null); // Chart.js 인스턴스 참조
  const canvasRef = useRef(null); // <canvas> 요소 참조
  const MAX_VISIBLE_POINTS = 20; // 차트에 표시할 최대 데이터 포인트 수
  const [latestData, setLatestData] = useState(null); // 최신 데이터
  const [historyData, setHistoryData] = useState([]); // 데이터 히스토리

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    // Chart.js 초기화
    const chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: [], // X축 레이블
        datasets: [
          {
            label: "온도 (°C)",
            data: [],
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderWidth: 1,
            tension: 0.2, // 부드러운 곡선
          },
          {
            label: "습도 (%)",
            data: [],
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderWidth: 1,
            tension: 0.2,
          },
          {
            label: "토양 수분 (%)",
            data: [],
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderWidth: 1,
            tension: 0.2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 300,
          easing: "linear",
        },
        scales: {
          x: {
            title: { display: true, text: "시간" },
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: "값" },
          },
        },
        plugins: {
          legend: { position: "top" },
        },
      },
    });

    chartRef.current = chartInstance;

    // WebSocket 설정
    const socket = new WebSocket("wss://leejaewon.store:5000");

    socket.onopen = () => console.log("WebSocket 연결 성공");
    socket.onerror = (error) => console.error("WebSocket 오류:", error);
    socket.onclose = () => console.warn("WebSocket 연결 종료");

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // 데이터 유효성 검사
        if (
          typeof data.temperature !== "number" ||
          typeof data.humidity !== "number" ||
          typeof data.soilMoisture !== "number"
        ) {
          console.warn("유효하지 않은 데이터:", data);
          return;
        }

        const { labels, datasets } = chartRef.current.data;

        // 최신 데이터 업데이트
        setLatestData({
          temperature: data.temperature,
          humidity: data.humidity,
          soilMoisture: data.soilMoisture,
          timestamp: data.timestamp,
        });

        // 데이터 히스토리 추가
        setHistoryData((prev) => [
          { ...data, timestamp: data.timestamp },
          ...prev.slice(0, 99), // 최대 100개의 히스토리 유지
        ]);

        // 차트 데이터 업데이트
        labels.push(new Date(data.timestamp).toLocaleTimeString());
        datasets[0].data.push(data.temperature);
        datasets[1].data.push(data.humidity);
        datasets[2].data.push(data.soilMoisture);

        if (labels.length > MAX_VISIBLE_POINTS) {
          labels.shift();
          datasets.forEach((dataset) => dataset.data.shift());
        }

        chartRef.current.update();
      } catch (error) {
        console.error("WebSocket 데이터 처리 오류:", error);
      }
    };

    // 정리 함수
    return () => {
      socket.close();
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
        <h3 style={{ textAlign: "center", color: "#00529b" }}>
          실시간 데이터
        </h3>
        {latestData ? (
          <>
            <p>
              <strong>온도:</strong> {latestData.temperature}°C
            </p>
            <p>
              <strong>습도:</strong> {latestData.humidity}%
            </p>
            <p>
              <strong>토양 수분:</strong> {latestData.soilMoisture}%
            </p>
            <p>
              <strong>수신 시간:</strong>{" "}
              {new Date(latestData.timestamp).toLocaleString()}
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
                    <strong>온도:</strong> {item.temperature}°C,{" "}
                    <strong>습도:</strong> {item.humidity}%,{" "}
                    <strong>토양 수분:</strong> {item.soilMoisture}%<br />
                    <strong>수신 시간:</strong>{" "}
                    {new Date(item.timestamp).toLocaleString()}
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
