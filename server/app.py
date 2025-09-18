# server/app.py
from fastapi import FastAPI, WebSocket
import uvicorn
import base64
import numpy as np
import cv2
import mediapipe as mp
import google.generativeai as genai
from gtts import gTTS
import io
import os
from dotenv import load_dotenv

from analysis.batting_analyzer import analyze_batting_stance

load_dotenv()

# Configure Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file. Please add it to the server/.env file.")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')


# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

app = FastAPI()

def process_image(data_url: str):
    """Decodes a base64 data URL and returns an OpenCV image."""
    try:
        # Split the metadata from the actual data
        head, data = data_url.split(',', 1)
        # Decode the base64 data
        image_bytes = base64.b64decode(data)
        # Convert bytes to a numpy array
        image_np = np.frombuffer(image_bytes, dtype=np.uint8)
        # Decode the numpy array into an image
        image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
        return image
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected!")
    try:
        while True:
            data_url = await websocket.receive_text()
            frame = process_image(data_url)

            if frame is not None:
                # Convert the BGR image to RGB
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                # Process the frame and get pose landmarks
                results = pose.process(rgb_frame)

                if results.pose_landmarks:
                    feedback_list = analyze_batting_stance(results.pose_landmarks)
                    if feedback_list:
                        # 1. Generate Coaching Tip with Gemini
                        prompt = f"You are a cricket coach. A batsman's form issue is: '{feedback_list[0]}'. Give a short, actionable tip."
                        response = model.generate_content(prompt)
                        coaching_tip = response.text
                        
                        print(f"Sending tip: {coaching_tip}")

                        # 2. Convert Tip to Audio
                        mp3_fp = io.BytesIO()
                        tts = gTTS(text=coaching_tip, lang='en')
                        tts.write_to_fp(mp3_fp)
                        mp3_fp.seek(0)
                        audio_bytes = mp3_fp.read()
                        
                        # 3. Encode Audio to Base64 and Send
                        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
                        
                        await websocket.send_json({
                            "type": "audio_feedback",
                            "message": coaching_tip,
                            "audio": audio_base64
                        })
                    
    except Exception as e:
        print(f"Client disconnected or error: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)