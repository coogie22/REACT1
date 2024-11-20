import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

function ChartComponent() {
  const chartRef = useRef(null); // Chart.js 인스턴스를 저장할 참조
  const canvasRef = useRef(null); // <canvas> 요소 참조
  const MAX_VISIBLE_POINTS = 20; // 차트에 표시할 최대 데이터 포인트 수
  const [latestData, setLatestData] = useState(null); // 가장 최신 데이터를 저장
  const [historyData, setHistoryData] = useState([]); // 수신된 데이터 히스토리 저장

  useEffect(() => {
    // <canvas>의 2D 컨텍스트 가져오기
    const ctx = canvasRef.current.getContext("2d");
    
    // Chart.js 인스턴스 초기화
    const chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: [], // x축 레이블
        datasets: [
          {
            label: "온도",
            data: [],
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderWidth: 1,
          },
          {
            label: "습도",
            data: [],
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderWidth: 1,
          },
          {
            label: "토양 수분",
            data: [],
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 500,
          easing: "linear",
        },
        scales: {
          x: { beginAtZero: true },
          y: { beginAtZero: true },
        },
      },
    });

    chartRef.current = chartInstance; // Chart.js 인스턴스를 참조에 저장

    // WebSocket 연결
    const socket = new WebSocket("ws://34.22.71.108:5000");

    // WebSocket 메시지 처리
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data); // JSON 데이터 파싱
        const { labels, datasets } = chartRef.current.data;

        // 최신 데이터 업데이트
        setLatestData({
          temperature: data.temperature,
          humidity: data.humidity,
          soilMoisture: data.soilMoisture,
          timestamp: data.timestamp,
        });

        // 데이터 히스토리 추가
        setHistoryData((prevHistory) => [
          {
            temperature: data.temperature,
            humidity: data.humidity,
            soilMoisture: data.soilMoisture,
            timestamp: data.timestamp,
          },
          ...prevHistory,
        ]);

        // 차트 데이터 업데이트
        labels.push(new Date(data.timestamp).toLocaleTimeString());
        datasets[0].data.push(data.temperature);
        datasets[1].data.push(data.humidity);
        datasets[2].data.push(data.soilMoisture);

        // 최대 데이터 포인트 초과 시 오래된 데이터 제거
        if (labels.length > MAX_VISIBLE_POINTS) {
          labels.shift();
          datasets.forEach((dataset) => dataset.data.shift());
        }

        chartRef.current.update(); // 차트 업데이트
      } catch (error) {
        console.error("WebSocket 데이터 처리 오류:", error);
      }
    };

    // WebSocket 에러 처리
    socket.onerror = (error) => {
      console.error("WebSocket 오류:", error);
      alert("서버와의 연결에 문제가 발생했습니다.");
    };

    // 컴포넌트 언마운트 시 WebSocket 및 Chart.js 인스턴스 정리
    return () => {
      socket.close();
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []); // 빈 의존성 배열로 한 번만 실행

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
      {/* 차트 */}
      <div className="chart-container" style={{ flex: 1 }}>
        <canvas ref={canvasRef}></canvas>
      </div>

      {/* 실시간 데이터 및 히스토리 */}
      <div
        style={{
          flexBasis: "300px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h3
          style={{
            textAlign: "center",
            color: "#00529b",
            marginBottom: "20px",
          }}
        >
          Node.js에서 받아온 실시간 데이터
        </h3>
        {latestData ? (
          <>
            <div style={{ marginBottom: "20px" }}>
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
            </div>

            <div
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid #ddd",
                padding: "10px",
                borderRadius: "5px",
                backgroundColor: "#fff",
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
                  <hr
                    style={{
                      margin: "5px 0",
                      borderTop: "1px solid #ddd",
                    }}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <p style={{ color: "#888", textAlign: "center" }}>
            데이터를 로드 중입니다...
          </p>
        )}
      </div>
    </div>
  );
}

export default ChartComponent;
