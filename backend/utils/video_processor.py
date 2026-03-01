"""
Video Processor Utility

Handles video frame extraction, preprocessing, and motion analysis.
"""

import cv2
import numpy as np
from datetime import timedelta
import os


def extract_frames(video_path, sample_interval=2, max_frames=30):
    """
    Extract frames from video at regular intervals.
    
    Args:
        video_path (str): Path to video file
        sample_interval (int): Seconds between frames (default: 2)
        max_frames (int): Maximum frames to extract (default: 30)
    
    Returns:
        list: [{
            'frame': np.ndarray,
            'timestamp': float (seconds),
            'frame_number': int
        }]
    """
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found: {video_path}")
    
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    if fps <= 0:
        raise ValueError("Could not determine video FPS")
    
    # Calculate frame numbers to extract
    sample_frame_interval = int(fps * sample_interval)
    frame_numbers = range(0, total_frames, max(sample_frame_interval, 1))[:max_frames]
    
    frames_list = []
    frame_count = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        if frame_count in frame_numbers:
            # Resize for faster processing
            frame_resized = cv2.resize(frame, (640, 480))
            timestamp = frame_count / fps
            
            frames_list.append({
                'frame': frame_resized,
                'timestamp': timestamp,
                'frame_number': frame_count
            })
        
        frame_count += 1
    
    cap.release()
    
    return frames_list


def detect_motion(prev_frame, curr_frame, threshold=20):
    """
    Detect motion between two frames using optical flow.
    
    Args:
        prev_frame (np.ndarray): Previous frame
        curr_frame (np.ndarray): Current frame
        threshold (int): Motion intensity threshold
    
    Returns:
        dict: {
            'motion_detected': bool,
            'motion_intensity': float (0-1),
            'motion_areas': int (number of areas with motion)
        }
    """
    if prev_frame is None or curr_frame is None:
        return {'motion_detected': False, 'motion_intensity': 0, 'motion_areas': 0}
    
    # Convert to grayscale
    prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
    curr_gray = cv2.cvtColor(curr_frame, cv2.COLOR_BGR2GRAY)
    
    # Compute absolute difference
    diff = cv2.absdiff(prev_gray, curr_gray)
    
    # Apply threshold
    _, thresh = cv2.threshold(diff, threshold, 255, cv2.THRESH_BINARY)
    
    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Calculate motion intensity as percentage of changed pixels
    motion_pixels = np.sum(thresh > 0)
    total_pixels = thresh.shape[0] * thresh.shape[1]
    motion_intensity = min(1.0, motion_pixels / total_pixels * 5)  # Scale up
    
    # Count significant motion areas
    motion_areas = sum(1 for c in contours if cv2.contourArea(c) > 500)
    
    return {
        'motion_detected': motion_intensity > 0.05,
        'motion_intensity': motion_intensity,
        'motion_areas': motion_areas
    }


def detect_faces(frame):
    """
    Detect faces in frame using Haar Cascade.
    
    Args:
        frame (np.ndarray): Video frame
    
    Returns:
        dict: {
            'faces_detected': int,
            'face_area_ratio': float,
            'face_positions': list of (x, y, w, h)
        }
    """
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Load Haar cascade
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    )
    
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    
    frame_area = frame.shape[0] * frame.shape[1]
    face_area = sum(w * h for (x, y, w, h) in faces)
    face_area_ratio = face_area / frame_area if frame_area > 0 else 0
    
    return {
        'faces_detected': len(faces),
        'face_area_ratio': face_area_ratio,
        'face_positions': [(int(x), int(y), int(w), int(h)) for x, y, w, h in faces]
    }


def detect_people_count(frame):
    """
    Estimate number of people using contour analysis.
    
    Args:
        frame (np.ndarray): Video frame
    
    Returns:
        dict: {
            'people_estimated': int,
            'crowd_density': float (0-1)
        }
    """
    # Convert to HSV for better people detection
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    
    # Look for skin-tone colors
    lower_skin = np.array([0, 20, 70], dtype=np.uint8)
    upper_skin = np.array([20, 255, 255], dtype=np.uint8)
    
    mask = cv2.inRange(hsv, lower_skin, upper_skin)
    
    # Morphological operations
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    
    # Find contours
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Count significant contours (estimate people)
    people = sum(1 for c in contours if cv2.contourArea(c) > 800)
    
    # Calculate crowd density
    frame_area = frame.shape[0] * frame.shape[1]
    skin_area = np.sum(mask > 0)
    crowd_density = min(1.0, skin_area / frame_area)
    
    return {
        'people_estimated': people,
        'crowd_density': crowd_density
    }


def get_frame_brightness(frame):
    """
    Calculate average brightness of frame.
    
    Args:
        frame (np.ndarray): Video frame
    
    Returns:
        dict: {
            'brightness': float (0-1),
            'is_dark': bool
        }
    """
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    brightness = np.mean(gray) / 255.0
    
    return {
        'brightness': brightness,
        'is_dark': brightness < 0.3
    }


def detect_fire_smoke(frame):
    """
    Detect fire/smoke through color and brightness analysis.
    
    Fire properties:
    - High red channel
    - Medium-high green
    - Low blue
    - Bright areas
    
    Args:
        frame (np.ndarray): Video frame (BGR)
    
    Returns:
        dict: {
            'fire_smoke_probability': float (0-1),
            'fire_area_ratio': float (0-1),
            'has_orange_red': bool
        }
    """
    # Split BGR channels
    b, g, r = cv2.split(frame)
    
    # Fire/smoke indicators: Red > Green > Blue and bright
    fire_mask = (r.astype(np.float32) > g.astype(np.float32) + 20) & \
                (g.astype(np.float32) > b.astype(np.float32) + 10) & \
                (r.astype(np.float32) > 100)
    
    fire_area = np.sum(fire_mask) / (frame.shape[0] * frame.shape[1])
    
    # Orange/red dominance in HSV space
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    
    # Orange-red range in HSV
    lower_orange = np.array([5, 100, 100], dtype=np.uint8)
    upper_orange = np.array([25, 255, 255], dtype=np.uint8)
    
    orange_mask = cv2.inRange(hsv, lower_orange, upper_orange)
    orange_ratio = np.sum(orange_mask > 0) / (frame.shape[0] * frame.shape[1])
    
    fire_probability = min(1.0, fire_area * 3 + orange_ratio * 2)
    
    return {
        'fire_smoke_probability': fire_probability,
        'fire_area_ratio': fire_area,
        'has_orange_red': orange_ratio > 0.05
    }


def detect_color_anomaly(frame):
    """
    Detect unusual color dominance (flashing, fire glow).
    
    Args:
        frame (np.ndarray): Video frame
    
    Returns:
        dict: {
            'red_dominance': float (0-1),
            'color_saturation': float (0-1),
            'is_flashing': bool (high brightness variation)
        }
    """
    # Red channel dominance
    b, g, r = cv2.split(frame)
    avg_channels = np.mean([b, g, r], axis=0)
    red_dominance = np.mean(r.astype(np.float32) - avg_channels) / 255.0
    red_dominance = max(0, min(1.0, red_dominance + 0.3))
    
    # Color saturation - HSV
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    saturation = hsv[:, :, 1]
    color_saturation = np.mean(saturation) / 255.0
    
    # Brightness variation (potential flashing)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    brightness_std = np.std(gray) / 255.0
    is_flashing = brightness_std > 0.25
    
    return {
        'red_dominance': red_dominance,
        'color_saturation': color_saturation,
        'is_flashing': is_flashing
    }


def detect_crowd_density_zones(frame, face_positions):
    """
    Analyze crowd distribution and identify high-density zones.
    
    Args:
        frame (np.ndarray): Video frame
        face_positions (list): List of (x, y, w, h) face positions
    
    Returns:
        dict: {
            'crowd_pressure_zones': int (number of high-density areas),
            'max_density_ratio': float (densest area ratio),
            'crowd_coherence': float (movement consistency 0-1)
        }
    """
    if len(face_positions) < 2:
        return {
            'crowd_pressure_zones': 0,
            'max_density_ratio': 0,
            'crowd_coherence': 1.0
        }
    
    # Divide frame into 3x3 grid
    h, w = frame.shape[:2]
    cell_h, cell_w = h // 3, w // 3
    
    grid = [[0] * 3 for _ in range(3)]
    
    # Count faces per cell
    for x, y, face_w, face_h in face_positions:
        cx, cy = x + face_w // 2, y + face_h // 2
        grid_x = min(2, cx // cell_w)
        grid_y = min(2, cy // cell_h)
        grid[grid_y][grid_x] += 1
    
    # Find pressure zones (more than average)
    total_faces = len(face_positions)
    avg_per_cell = total_faces / 9.0
    pressure_zones = sum(1 for row in grid for cell in row if cell > avg_per_cell * 1.5)
    
    # Max density ratio
    max_cell = max(max(row) for row in grid) if grid else 0
    max_density = max_cell / total_faces if total_faces > 0 else 0
    
    # Coherence: if people distributed evenly, high; if clustered, low
    variance = np.var([cell for row in grid for cell in row])
    coherence = 1.0 / (1.0 + variance * 0.1)  # Normalize
    coherence = 1.0 - coherence  # Invert so clustered = low
    
    return {
        'crowd_pressure_zones': pressure_zones,
        'max_density_ratio': max_density,
        'crowd_coherence': coherence
    }


def cleanup_video(video_path):
    """Remove temporary video file."""
    try:
        if os.path.exists(video_path):
            os.remove(video_path)
    except Exception as e:
        print(f"Warning: Could not delete video file {video_path}: {e}")
