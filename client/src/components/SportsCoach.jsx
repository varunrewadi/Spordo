import { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

const SportsCoach = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [feedback, setFeedback] = useState("Waiting for movement...");
  const [sport, setSport] = useState("basketball");

  // Native Web Speech API for TTS
  const speak = (message) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1; // adjust speed
      utterance.pitch = 1; // adjust pitch
      speechSynthesis.cancel(); // stop previous speech if still running
      speechSynthesis.speak(utterance);
    }
  };

  // Rule modules for different sports
  const checkPose = (landmarks) => {
    if (!landmarks) return;

    let message = "";

    if (sport === "basketball") {
      // Example: wrist (15) vs elbow (13)
      const elbowY = landmarks[13].y;
      const wristY = landmarks[15].y;
      if (wristY < elbowY) {
        message = "Good shot form! Wrist above elbow.";
      } else {
        message = "Raise your wrist above your elbow for better form.";
      }
    }

    if (sport === "tennis") {
      const shoulderY = landmarks[11].y;
      const wristY = landmarks[15].y;
      if (wristY < shoulderY) {
        message = "Nice racket swing motion!";
      } else {
        message = "Lift your arm higher for a stronger swing.";
      }
    }

    if (sport === "fitness") {
      const hipY = landmarks[23].y;
      const kneeY = landmarks[25].y;
      if (hipY > kneeY) {
        message = "Good squat depth!";
      } else {
        message = "Go lower to complete your squat.";
      }
    }

    if (message) {
      setFeedback(message);
      speak(message);
    }
  };

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

        checkPose(results.poseLandmarks);
      }
      canvasCtx.restore();
    });

    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await pose.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, [sport]);

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
        <div className="absolute bottom-2 left-2 bg-black/60 text-white px-3 py-1 rounded-xl">
          {feedback}
        </div>
      </div>
    </div>
  );
};

export default SportsCoach;
