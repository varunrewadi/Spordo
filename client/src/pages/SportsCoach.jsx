import { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

const SportsCoach = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [sport, setSport] = useState("basketball");
  const [cameraActive, setCameraActive] = useState(false);
  const [feedback, setFeedback] = useState("");
  const ws = useRef(null);

  useEffect(() => {
    // Establish WebSocket connection when camera turns on
    if (cameraActive) {
      ws.current = new WebSocket("ws://localhost:8000/ws");
      ws.current.onopen = () => console.log("WebSocket connected!");
      ws.current.onclose = () => console.log("WebSocket disconnected.");
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "audio_feedback") {
          setFeedback(data.message); // Display the text

          // Play the audio
          const audio = new Audio("data:audio/mpeg;base64," + data.audio);
          audio.play();
        }
      };
    } else {
      ws.current?.close();
    }

    // Cleanup on component unmount
    return () => ws.current?.close();
  }, [cameraActive]);

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 0,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      const canvasCtx = canvasRef.current.getContext("2d");
      canvasCtx.save();
      canvasCtx.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      if (results.poseLandmarks) {
        drawConnectors(
          canvasCtx,
          results.poseLandmarks,
          Pose.POSE_CONNECTIONS,
          {
            color: "#00FF00",
            lineWidth: 4,
          }
        );
        drawLandmarks(canvasCtx, results.poseLandmarks, {
          color: "#FF0000",
          lineWidth: 2,
        });
      }
      canvasCtx.restore();
    });

    let camera = null;
    if (cameraActive && videoRef.current) {
      camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await pose.send({ image: videoRef.current });
          if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const canvas = canvasRef.current;
            // Send a compressed JPEG image as a Base64 string
            ws.current.send(canvas.toDataURL("image/jpeg", 0.7));
          }
        },
        width: 640,
        height: 480,
      });
      camera.start();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      if (canvasRef.current) {
        const canvasCtx = canvasRef.current.getContext("2d");
        canvasCtx.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
      }
    }

    return () => {
      if (camera) {
        camera.stop();
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      pose.close();
    };
  }, [sport, cameraActive]);

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <h1 className="text-2xl font-bold">SPORDO - Sports Companion</h1>

      {/* Sport Selector */}
      <select
        value={sport}
        onChange={(e) => setSport(e.target.value)}
        className="p-2 rounded-lg border text-black"
      >
        <option value="basketball">Basketball</option>
        <option value="tennis">Tennis</option>
        <option value="fitness">Fitness</option>
      </select>

      <button
        onClick={() => setCameraActive(!cameraActive)}
        className="p-2 rounded-lg border bg-blue-500 text-white"
      >
        {cameraActive ? "Turn Off Camera" : "Turn On Camera"}
      </button>

      {/* Video + Canvas */}
      <div className="relative">
        <video
          ref={videoRef}
          className="rounded-2xl shadow-lg"
          style={{ display: "none" }}
        />
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          className="rounded-2xl shadow-lg"
        />
        {feedback && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white p-2 rounded-lg">
            <p>{feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SportsCoach;
