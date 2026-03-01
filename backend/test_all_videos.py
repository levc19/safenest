#!/usr/bin/env python3
"""
Test all videos to see domain classification results
"""
import sys
sys.path.insert(0, '/Users/levine/deeplearningweek/safenest/backend')

from utils.video_processor import extract_frames, detect_motion, detect_faces, detect_people_count, get_frame_brightness, detect_fire_smoke, detect_color_anomaly, detect_crowd_density_zones
from utils.signal_detector import detect_pose_and_hands, generate_signal_features
from utils.domain_classifier import classify_domain_from_signals

videos = [
    ('child_kidnapping.mov', 'child_safety'),
    ('elderly_falling.mov', 'elder_care'),
    ('fire.mov', 'environmental'),
    ('smoke.mov', 'environmental'),
]

print("Testing Video Domain Classification")
print("=" * 70)

for filename, expected_domain in videos:
    video_path = f'/Users/levine/deeplearningweek/safenest/videos/{filename}'
    
    try:
        frames_list = extract_frames(video_path, sample_interval=1, max_frames=3)
        if not frames_list:
            print(f"\n❌ {filename}: Could not extract frames")
            continue
        
        print(f"\n📹 {filename}")
        print(f"   Expected: {expected_domain}")
        
        # Collect signals across frames
        all_signal_features = {}
        all_analyses = []
        
        for frame_data in frames_list:
            frame = frame_data['frame']
            
            brightness = get_frame_brightness(frame)
            faces = detect_faces(frame)
            people = detect_people_count(frame)
            fire_smoke = detect_fire_smoke(frame)
            color_anom = detect_color_anomaly(frame)
            
            frame_analysis = {
                **brightness,
                'motion_detected': False,
                'motion_intensity': 0,
                'motion_areas': 0,
                'faces_detected': faces['faces_detected'],
                'crowd_density': people['crowd_density'],
                'fall_detected': False,
                'rapid_motion_intensity': 0,
                'fire_smoke_probability': fire_smoke['fire_smoke_probability'],
                'has_orange_red': fire_smoke['has_orange_red'],
                'red_dominance': color_anom['red_dominance'],
                'is_flashing': color_anom['is_flashing'],
                'aggressive_stance_probability': 0,
                'fighting_probability': 0,
                'contact_detected': False,
                'contact_impact_intensity': 0,
                'is_chaotic': False,
                'crowd_vulnerability': 0,
                'crowd_panic_probability': 0,
            }
            
            all_analyses.append(frame_analysis)
            
            signal_features = generate_signal_features(frame_analysis)
            for signal, score in signal_features.items():
                all_signal_features[signal] = max(all_signal_features.get(signal, 0), score)
        
        # Show detected signals
        triggered_signals = {s: v for s, v in all_signal_features.items() if v > 0.1}
        if triggered_signals:
            print(f"   Signals (>0.1):")
            for sig, score in sorted(triggered_signals.items(), key=lambda x: -x[1]):
                print(f"      • {sig}: {score:.2f}")
        else:
            print(f"   Signals: NONE")
        
        # Show frame analysis stats
        print(f"   Frame stats:")
        avg_brightness = sum(a['brightness'] for a in all_analyses) / len(all_analyses)
        max_fire_smoke = max(a['fire_smoke_probability'] for a in all_analyses)
        max_red = max(a['red_dominance'] for a in all_analyses)
        max_people = max(a['crowd_density'] for a in all_analyses)
        print(f"      Avg brightness: {avg_brightness:.2f}")
        print(f"      Max fire/smoke: {max_fire_smoke:.2f}")
        print(f"      Max red dominance: {max_red:.2f}")
        print(f"      Max crowd density: {max_people:.2f}")
        
        # Classify
        domain_result = classify_domain_from_signals(all_signal_features, all_analyses[0], faces)
        classified = domain_result['primary_domain']
        confidence = domain_result['confidence']
        
        is_correct = "✅" if classified == expected_domain else "❌"
        print(f"   {is_correct} Classified: {classified} (conf: {confidence:.2f})")
        
        if classified != expected_domain:
            print(f"      Probabilities: {domain_result['domain_probabilities']}")
        
    except Exception as e:
        print(f"\n❌ {filename}: ERROR - {e}")
        import traceback
        traceback.print_exc()

print("\n" + "=" * 70)
