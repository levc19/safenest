# Vision-Based Video Classification – How It Works

SafeNest uses a hybrid heuristic + AI pipeline to analyze CCTV footage, classify safety domains, and compute a calibrated risk score.

## 1. Frame Extraction & Heuristic Signal Generation

When a video is uploaded to `/analyze-video`:

1. Frames are extracted at fixed intervals.
2. Each frame undergoes deterministic, rule-based analysis to detect:
   - Motion intensity
   - Fire/smoke probability
   - Fighting/contact probability
   - Fall detection
   - Crowd density and panic indicators
   - Brightness and color anomalies

These features are converted into structured safety signals using `generate_signal_features()`.

All signals are aggregated across frames (maximum confidence retained per signal).

No GPT calls occur at the frame level — all frame analysis is purely heuristic.

---

## 2. Deterministic Keyframe Selection

Instead of sending the entire video to the model, SafeNest selects up to **3 keyframes** deterministically using three selection criteria:

- **Best clarity frame**  
  Based on face area estimate and brightness, penalized by motion blur.

- **Peak event frame**  
  Frame with the highest combined event intensity across:
  - Motion intensity  
  - Fire/smoke detection  
  - Fighting detection  

- **Aftermath frame**  
  Either:
  - The frame with highest crowd panic probability, or  
  - The frame immediately following the first detected fall.

Duplicates are removed and total keyframes are capped at 3.

This ensures:
- Cost efficiency  
- Reproducibility (no randomness)  
- Focus on visually meaningful and safety-relevant moments  

---

## 3. Vision-Based Domain Classification (GPT-4o-mini)

Selected keyframes and aggregated signal summaries are sent to GPT-4o-mini Vision once per video.

The model classifies the video into one of four AI-defined domains:

- `child_safety`
- `elder_safety`
- `environmental_hazard`
- `crime`

It returns:
- Domain probabilities (sum ≈ 1.0)
- Severity score (0–1)
- Reasoning explanation
- 2–3 grounded visual observations

If the API fails or no keyframes are available:
- `gpt_used = false`
- The system falls back to heuristic domain classification.

Note: The heuristic classifier internally uses slightly different domain labels (`elder_care`, `environmental`, `crime_prevention`). When GPT is used successfully, the GPT domain labels are returned. When GPT fails, the heuristic domain may be returned.

---

## 4. Risk Score Computation & Calibration

SafeNest combines heuristic and AI-based severity:

1. Heuristic risk score is computed from aggregated signals (internally 0–100, converted to 0–1).
2. GPT severity (0–1) is retrieved.
3. A calibrated score is computed:

    calibrated = 0.6 * gpt_severity + 0.4 * heuristic_risk  
    final_risk = clamp(max(heuristic_risk, calibrated), 0, 1)

This ensures:
- GPT enhances severity assessment
- Risk never drops below heuristic baseline
- Final score remains bounded in [0, 1]

The final score is converted to a 0–100 Crisis Risk Index for UI display.

---

## 5. Structured API Response

The endpoint returns:

- Primary domain classification
- Domain probabilities
- GPT severity (0–1 scale)
- Heuristic risk score (0–1 internal scale)
- Final calibrated risk score (0–100 UI scale)
- Selected keyframes with reasons
- Triggered signals
- Escalation probability
- Visual observations (if GPT used)
- Timeline summary of analyzed frames

---

## Design Principles

- Deterministic keyframe selection (no randomness)
- Single GPT call per video (efficient and scalable)
- Heuristic baseline always preserved
- Graceful fallback if AI fails
- No identity tracking (face detection only counts presence, not identity)

This architecture ensures SafeNest delivers reliable, explainable, and scalable video-based safety intelligence.