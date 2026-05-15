/**
 * Advanced geometric classifier for ASL letters.
 * Uses normalized vector directions and joint angles for better accuracy.
 */

export type Landmark = { x: number; y: number; z: number };

const dist = (p1: Landmark, p2: Landmark) => 
  Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

// Calculates angle between three points (v1-v2-v3)
const getAngle = (p1: Landmark, p2: Landmark, p3: Landmark) => {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  if (mag1 * mag2 === 0) return 180;
  return Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2)))) * (180 / Math.PI);
};

export function classifySign(landmarks: Landmark[], handedness: string): string {
  if (!landmarks || landmarks.length < 21) return "";

  const wrist = landmarks[0];
  
  // Normalization factor based on palm size (Wrist to Middle Finger Base)
  const palmSize = dist(wrist, landmarks[9]);
  
  // Hand orientation detection
  const palmVector = { x: landmarks[9].x - wrist.x, y: landmarks[9].y - wrist.y };
  // isHorizontal: hand is pointing left/right
  const isHorizontal = Math.abs(palmVector.x) > Math.abs(palmVector.y) * 1.5;
  // isDownward: hand is pointing down (for P, Q)
  const isDownward = palmVector.y > palmSize * 0.5;
  
  // Finger status: 0 = Folded, 1 = Curved, 2 = Extended
  const getFingerState = (base: number, mid: number, tip: number) => {
    const angle = getAngle(landmarks[base], landmarks[mid], landmarks[tip]);
    const d = dist(landmarks[tip], wrist);
    const b = dist(landmarks[mid], wrist);
    
    if (angle > 150 && d > b) return 2; // Straight
    if (angle < 115) return 0; // Folded
    return 1; // Curved
  };

  const f1 = getFingerState(5, 6, 8);   // Index
  const f2 = getFingerState(9, 10, 12);  // Middle
  const f3 = getFingerState(13, 14, 16); // Ring
  const f4 = getFingerState(17, 18, 20); // Pinky

  // Thumb status
  const thumbTip = landmarks[4];
  const thumbBase = landmarks[2];
  const thumbExtended = dist(thumbTip, landmarks[9]) > palmSize * 0.85;

  const allFolded = f1 === 0 && f2 === 0 && f3 === 0 && f4 === 0;
  const allExtended = f1 === 2 && f2 === 2 && f3 === 2 && f4 === 2;

  // --- Alphabet Logic based on geometric constraints ---

  // A: Fist, thumb on side
  if (allFolded && thumbExtended && thumbTip.y < landmarks[5].y) return "A";

  // B: Flat palm, all up
  if (allExtended && dist(landmarks[8], landmarks[12]) < palmSize * 0.4) return "B";

  // C: All fingers curved (making a 'C')
  if (f1 === 1 && f2 === 1 && f3 === 1 && f4 === 1 && dist(landmarks[8], thumbTip) > palmSize * 0.5) return "C";

  // D: Index up, others making a circle with thumb
  if (f1 === 2 && f2 < 2 && f3 < 2 && f4 < 2) {
    if (dist(landmarks[12], thumbTip) < palmSize * 0.5) return "D";
  }

  // E: Tight fist, thumb in front
  if (allFolded && !thumbExtended) {
    if (thumbTip.y > landmarks[10].y) return "E";
  }

  // F: Index/Thumb touching, others up spread
  if (dist(landmarks[8], thumbTip) < palmSize * 0.35 && f2 === 2 && f3 === 2 && f4 === 2) return "F";

  // G: Index out, thumb out (Horizontal)
  if (isHorizontal && f1 === 2 && thumbExtended && f2 === 0) return "G";

  // H: Index and middle out (Horizontal)
  if (isHorizontal && f1 === 2 && f2 === 2 && f3 === 0) return "H";

  // I: Pinky up only
  if (f4 === 2 && f1 === 0 && f2 === 0 && f3 === 0) return "I";

  // K: V with thumb on middle finger joint
  if (f1 === 2 && f2 === 2) {
    if (dist(thumbTip, landmarks[10]) < palmSize * 0.5) return "K";
  }

  // L: Index and thumb forming L
  if (f1 === 2 && thumbExtended && f2 === 0) return "L";

  // M: Fist, thumb under 3 fingers
  if (allFolded && thumbTip.x > landmarks[13].x && handedness === "Right") return "M";
  if (allFolded && thumbTip.x < landmarks[13].x && handedness === "Left") return "M";

  // N: Fist, thumb under 2 fingers
  if (allFolded && thumbTip.x > landmarks[9].x && thumbTip.x < landmarks[13].x && handedness === "Right") return "N";
  if (allFolded && thumbTip.x < landmarks[9].x && thumbTip.x > landmarks[13].x && handedness === "Left") return "N";

  // O: All fingers to thumb (Circle)
  if (allFolded || f1 === 1) {
    const allToThumb = [8, 12, 16, 20].every(i => dist(landmarks[i], thumbTip) < palmSize * 0.4);
    if (allToThumb) return "O";
  }

  // P: K pointing down
  if (isDownward && f1 === 2 && f2 === 2) return "P";

  // Q: G pointing down
  if (isDownward && f1 === 2 && thumbExtended && f2 === 0) return "Q";

  // R: Index and middle crossed
  if (f1 === 2 && f2 === 2 && Math.abs(landmarks[8].x - landmarks[12].x) < palmSize * 0.1) return "R";

  // S: Fist, thumb over middle
  if (allFolded && dist(thumbTip, landmarks[10]) < palmSize * 0.4) return "S";

  // T: Fist, thumb between index and middle
  if (allFolded && thumbTip.x < landmarks[9].x && thumbTip.x > landmarks[5].x) return "T";

  // U: Index/Middle together (Vertical)
  if (f1 === 2 && f2 === 2 && dist(landmarks[8], landmarks[12]) < palmSize * 0.2) return "U";

  // V: Index/Middle spread (V shape)
  if (f1 === 2 && f2 === 2 && dist(landmarks[8], landmarks[12]) > palmSize * 0.3) return "V";

  // W: 3 fingers spread
  if (f1 === 2 && f2 === 2 && f3 === 2 && f4 === 0) return "W";

  // X: Hooked index finger
  if (f1 === 1 && f2 === 0 && f3 === 0 && f4 === 0) return "X";

  // Y: Thumb and Pinky out
  if (thumbExtended && f4 === 2 && f1 === 0 && f2 === 0) return "Y";

  // Z: Pointing up
  if (f1 === 2 && f2 === 0 && f3 === 0 && f4 === 0) return "Z";

  return "";
}

