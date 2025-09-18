from mediapipe.python.solutions.pose import PoseLandmark
import math

def get_angle(p1, p2, p3):
    """Helper function to calculate the angle between three points (p2 is the vertex)."""
    angle = math.degrees(math.atan2(p3.y - p2.y, p3.x - p2.x) - 
                         math.atan2(p1.y - p2.y, p1.x - p2.x))
    # Normalize to be between 0 and 360
    if angle < 0:
        angle += 360
    # We want the smaller angle
    if angle > 180:
        angle = 360 - angle
    return angle

def get_distance(p1, p2):
    """Helper function to calculate distance between two landmarks."""
    return math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2)

def analyze_batting_stance(landmarks):
    """Analyzes the batting stance for balance and posture."""
    feedback = []

    # Example check: Head position
    left_shoulder = landmarks.landmark[PoseLandmark.LEFT_SHOULDER]
    right_shoulder = landmarks.landmark[PoseLandmark.RIGHT_SHOULDER]
    nose = landmarks.landmark[PoseLandmark.NOSE]

    # A simple check to see if the head is centered
    shoulder_center_x = (left_shoulder.x + right_shoulder.x) / 2
    if abs(nose.x - shoulder_center_x) > 0.05: # Threshold
         feedback.append("Keep your head still and centered for better balance.")
    
    # Add more checks (backlift, foot placement, etc.)
    left_ankle = landmarks.landmark[PoseLandmark.LEFT_ANKLE]
    right_ankle = landmarks.landmark[PoseLandmark.RIGHT_ANKLE]
    left_wrist = landmarks.landmark[PoseLandmark.LEFT_WRIST]
    right_wrist = landmarks.landmark[PoseLandmark.RIGHT_WRIST]
    left_elbow = landmarks.landmark[PoseLandmark.LEFT_ELBOW]

    # 2. Foot placement check (shoulder-width apart)
    shoulder_width = get_distance(left_shoulder, right_shoulder)
    foot_distance = get_distance(left_ankle, right_ankle)
    
    if foot_distance < shoulder_width * 0.8:
        feedback.append("Widen your stance for better stability.")
    elif foot_distance > shoulder_width * 1.5:
        feedback.append("Your stance is too wide, which may restrict movement.")

    # 3. Backlift check (hands up)
    # Assuming a right-handed batsman, left wrist should be high
    if left_wrist.y > left_elbow.y:
        feedback.append("Raise your hands for a proper backlift.")

    return feedback

# Create functions like analyze_drive(), analyze_pull_shot()
def analyze_drive(landmarks):
    """Analyzes a cricket drive shot for high elbow, knee bend, and head position."""
    feedback = []
    
    # Assuming a right-handed batsman for this logic
    left_shoulder = landmarks.landmark[PoseLandmark.LEFT_SHOULDER]
    left_elbow = landmarks.landmark[PoseLandmark.LEFT_ELBOW]
    left_hip = landmarks.landmark[PoseLandmark.LEFT_HIP]
    left_knee = landmarks.landmark[PoseLandmark.LEFT_KNEE]
    left_ankle = landmarks.landmark[PoseLandmark.LEFT_ANKLE]
    nose = landmarks.landmark[PoseLandmark.NOSE]

    # 1. Check for a high front elbow (left elbow for a right-handed batsman)
    if left_elbow.y > left_shoulder.y:
        feedback.append("Lead with a high elbow for a better drive.")

    # 2. Check for front knee bend, indicating weight transfer
    knee_angle = get_angle(left_hip, left_knee, left_ankle)
    if knee_angle > 160:
        feedback.append("Bend your front knee more to transfer your weight into the shot.")

    # 3. Check for head position over the front knee
    if abs(nose.x - left_knee.x) > 0.1: # Threshold for alignment
        feedback.append("Keep your head over your front knee for better balance and control.")

    if not feedback:
        # This part will only be reached if no flaws are detected.
        # In a real scenario, you might not send feedback if the form is good.
        # For demonstration, we'll send a positive confirmation.
        return ["Good form on the drive! High elbow and solid base."]
        
    return feedback

def analyze_pull_shot(landmarks):
    """Analyzes a cricket pull shot for rotation and bat swing."""
    feedback = []

    # Assuming a right-handed batsman
    left_shoulder = landmarks.landmark[PoseLandmark.LEFT_SHOULDER]
    right_shoulder = landmarks.landmark[PoseLandmark.RIGHT_SHOULDER]
    left_hip = landmarks.landmark[PoseLandmark.LEFT_HIP]
    right_hip = landmarks.landmark[PoseLandmark.RIGHT_HIP]
    left_wrist = landmarks.landmark[PoseLandmark.LEFT_WRIST]
    right_wrist = landmarks.landmark[PoseLandmark.RIGHT_WRIST]

    # 1. Check for body rotation (shoulders rotating more than hips)
    shoulder_angle = math.atan2(left_shoulder.y - right_shoulder.y, left_shoulder.x - right_shoulder.x)
    hip_angle = math.atan2(left_hip.y - right_hip.y, left_hip.x - right_hip.x)
    
    # Convert to degrees and find the difference
    rotation_diff = abs(math.degrees(shoulder_angle) - math.degrees(hip_angle))
    
    if rotation_diff < 15: # Threshold for significant rotation
        feedback.append("Rotate your shoulders and hips more to generate power in your pull shot.")

    # 2. Check for horizontal bat swing
    # Wrists should be at a similar height
    if abs(left_wrist.y - right_wrist.y) > 0.1: # Threshold for height difference
        feedback.append("Keep your bat swing horizontal for a more effective pull shot.")

    if not feedback:
        return ["Excellent rotation and bat path on the pull shot!"]

    return feedback