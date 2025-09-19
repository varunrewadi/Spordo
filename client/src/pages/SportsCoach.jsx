import { AppSidebar } from "../components/app-sidebar";
import { SiteHeader } from "../components/site-header";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const SportsCoach = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [sport, setSport] = useState("cricket");
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
      if (!canvasRef.current) return;
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
          radius: 2.5, // Reduced radius for smaller points
        });
      }
      canvasCtx.restore();
    });

    let camera = null;
    if (cameraActive && videoRef.current) {
      camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await pose.send({ image: videoRef.current });
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
              const canvas = canvasRef.current;
              // Send a compressed JPEG image as a Base64 string
              ws.current.send(canvas.toDataURL("image/jpeg", 0.7));
            }
          }
        },
        width: 1280,
        height: 720,
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
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Sports Coach" />
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Select value={sport} onValueChange={setSport}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cricket">Cricket</SelectItem>
                  <SelectItem value="basketball">Basketball</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setCameraActive(!cameraActive)}>
                {cameraActive ? "Turn Off Camera" : "Turn On Camera"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="relative w-full border aspect-video">
                <video
                  ref={videoRef}
                  className="rounded-2xl shadow-lg absolute inset-0 w-full h-full"
                  style={{ display: "none" }}
                />
                <canvas
                  ref={canvasRef}
                  className="rounded-2xl shadow-lg absolute inset-0 w-full h-full"
                />
                {feedback && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white p-2 rounded-lg">
                    <p>{feedback}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SportsCoach;
