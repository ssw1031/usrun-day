import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

const DB_FILE = path.join(process.cwd(), "db.json");

// Helper types
interface User {
  id: string;
  name: string;
  grade: number;
  totalDistance: number; // km
  totalDuration: number; // seconds
  level: number;
  stamps: string[]; // dates or mission IDs where stamp was earned
  badges: string[]; // unlocked badge IDs
}

interface Activity {
  id: string;
  userId: string;
  userName: string;
  grade: number;
  date: string;
  distance: number; // km
  duration: number; // seconds
  pace: string; // min/km e.g. "5:30"
  memo: string;
  path: [number, number][]; // coordinates [lat, lng]
  stampsEarned: number;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  date: string;
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  grade: number;
  content: string;
  distance?: number;
  duration?: number;
  pace?: string;
  path?: [number, number][];
  likes: string[]; // user IDs
  comments: Comment[];
  date: string;
  isRunRecord?: boolean;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  goal: number;
  type: "distance" | "count" | "pace";
  rewardStamp: number;
  isWeekly: boolean;
}

interface DB {
  users: User[];
  activities: Activity[];
  posts: Post[];
  missions: Mission[];
}

// Coordinate of Naju Donggang Middle School
const DONGGANG_MS_COORDS = { lat: 34.8988, lng: 126.6025 };

// Seed 21 students of Naju Donggang Middle School (properly partitioned and sorted)
const DEFAULT_USERS: User[] = [
  // Grade 1
  { id: "student-01", name: "박찬혁", grade: 1, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "student-02", name: "신영우", grade: 1, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "student-03", name: "이주아", grade: 1, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "student-04", name: "조다현", grade: 1, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },

  // Grade 2
  { id: "student-05", name: "김가영", grade: 2, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "student-06", name: "김태율", grade: 2, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "student-07", name: "김효원", grade: 2, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "student-08", name: "안서진", grade: 2, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "student-09", name: "이준", grade: 2, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "student-10", name: "정한나", grade: 2, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "student-11", name: "차근영", grade: 2, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "student-12", name: "채성진", grade: 2, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },

  // Grade 3
  { id: "student-13", name: "김나연", grade: 3, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "student-14", name: "김시윤", grade: 3, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "student-15", name: "이여진", grade: 3, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "student-16", name: "이지훈", grade: 3, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "student-17", name: "임지현", grade: 3, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "student-18", name: "임혜진", grade: 3, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "student-19", name: "정혜승", grade: 3, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "student-20", name: "조우진", grade: 3, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "student-21", name: "채누리", grade: 3, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },

  // 교직원 (Grade 4, sorted in Korean alphabetical order)
  { id: "staff-01", name: "과학", grade: 4, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "staff-02", name: "교무행정사", grade: 4, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "staff-03", name: "교장", grade: 4, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "staff-04", name: "국어", grade: 4, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "staff-05", name: "나보람", grade: 4, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "staff-06", name: "사회", grade: 4, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "staff-07", name: "수학", grade: 4, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "staff-08", name: "영어", grade: 4, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "staff-09", name: "음악", grade: 4, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "staff-10", name: "체육", grade: 4, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "staff-11", name: "최홍재", grade: 4, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "staff-12", name: "행정실장", grade: 4, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] }
];

const DEFAULT_MISSIONS: Mission[] = [
  { id: "mission-1", title: "어슬런데이 3km 도전!", description: "주간 어슬런데이 달리기 누적 3km를 넘겨 발도장을 꾹 찍으세요!", goal: 3, type: "distance", rewardStamp: 1, isWeekly: true },
  { id: "mission-2", title: "어슬런 출석 대장", description: "이번 주에 누적 3회 이상 달리기를 인증하세요!", goal: 3, type: "count", rewardStamp: 1, isWeekly: true },
  { id: "mission-3", title: "상쾌한 5km 레이스", description: "주간 어슬런데이 달리기 누적 5km 달성하기!", goal: 5, type: "distance", rewardStamp: 2, isWeekly: true },
  { id: "mission-4", title: "지구력 마스터", description: "주간 누적 10km 이상 달리기!", goal: 10, type: "distance", rewardStamp: 2, isWeekly: true },
  { id: "mission-5", title: "에이스 가속 러닝", description: "평균 페이스 6:00 이내로 2km 이상 달리기!", goal: 2, type: "pace", rewardStamp: 3, isWeekly: false }
];

// Generate simple mock coordinates around Donggang-myeon for seeding activities
const generateMockPath = (startOffsetLat = 0, startOffsetLng = 0, length = 5): [number, number][] => {
  const path: [number, number][] = [];
  let currentLat = DONGGANG_MS_COORDS.lat + startOffsetLat;
  let currentLng = DONGGANG_MS_COORDS.lng + startOffsetLng;
  path.push([currentLat, currentLng]);
  for (let i = 0; i < length; i++) {
    currentLat += (Math.random() - 0.5) * 0.003;
    currentLng += (Math.random() - 0.5) * 0.003;
    path.push([currentLat, currentLng]);
  }
  return path;
};

const DEFAULT_ACTIVITIES: Activity[] = [];

const DEFAULT_POSTS: Post[] = [
  {
    id: "announcement-welcome",
    userId: "staff-10",
    userName: "체육 선생님 🏃‍♂️",
    grade: 4,
    content: "🎉 동강중학교 & 교직원 어슬런데이 러닝 클럽이 공식 시작되었습니다! 매일 한 걸음씩 가볍게 달리며 건강을 가꾸어 봅시다. 여러분의 모든 도전을 응원합니다!",
    likes: [],
    comments: [],
    date: new Date().toISOString(),
    isRunRecord: false
  }
];

// Read DB or write default DB
function loadDB(): DB {
  if (!fs.existsSync(DB_FILE)) {
    const initialDB: DB = {
      users: DEFAULT_USERS,
      activities: DEFAULT_ACTIVITIES,
      posts: DEFAULT_POSTS,
      missions: DEFAULT_MISSIONS
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), "utf8");
    return initialDB;
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file, resetting:", err);
    const initialDB: DB = {
      users: DEFAULT_USERS,
      activities: DEFAULT_ACTIVITIES,
      posts: DEFAULT_POSTS,
      missions: DEFAULT_MISSIONS
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), "utf8");
    return initialDB;
  }
}

function saveDB(db: DB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

// REST API Endpoints

// Get all users (sorted by total distance descending)
app.get("/api/users", (req, res) => {
  const db = loadDB();
  res.json(db.users);
});

// Create or retrieve a guest user
app.post("/api/users", (req, res) => {
  const db = loadDB();
  const { name, grade } = req.body;
  if (!name) {
    return res.status(400).json({ error: "이름이 필요합니다." });
  }

  // Normalize guest name
  const isGuest = (grade === 0);
  const displayName = isGuest ? `${name} (게스트)` : name;

  // Check if user already exists
  let existingUser = db.users.find(u => u.name === displayName);
  if (existingUser) {
    return res.json(existingUser);
  }

  // Create new guest user
  const newUserId = `guest-${Date.now()}`;
  const newUser: User = {
    id: newUserId,
    name: displayName,
    grade: grade || 0, // 0 for guest
    totalDistance: 0,
    totalDuration: 0,
    level: 1,
    stamps: [],
    badges: []
  };

  db.users.push(newUser);
  saveDB(db);
  res.status(201).json(newUser);
});

// Update a specific user profile
app.put("/api/users/:id", (req, res) => {
  const db = loadDB();
  const userId = req.params.id;
  const userIndex = db.users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    db.users[userIndex] = { ...db.users[userIndex], ...req.body };
    saveDB(db);
    res.json(db.users[userIndex]);
  } else {
    res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  }
});

// Get all activities
app.get("/api/activities", (req, res) => {
  const db = loadDB();
  res.json(db.activities);
});

// Add a running activity and sync rankings, badges, stamps, and feed post
app.post("/api/activities", (req, res) => {
  const db = loadDB();
  const { userId, distance, duration, pace, memo, path } = req.body;

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  }

  // Calculate speed
  const dKm = parseFloat(distance);
  const dSec = parseInt(duration);
  const activityId = `act-${Date.now()}`;
  
  // Create running activity
  const newActivity: Activity = {
    id: activityId,
    userId,
    userName: user.name,
    grade: user.grade,
    date: new Date().toISOString(),
    distance: dKm,
    duration: dSec,
    pace: pace || "6:00",
    memo: memo || "어슬런데이 달리기 완료!",
    path: path || [],
    stampsEarned: 1 // Default 1 stamp for any run completed!
  };

  db.activities.unshift(newActivity);

  // Update user statistics
  user.totalDistance = parseFloat((user.totalDistance + dKm).toFixed(2));
  user.totalDuration += dSec;
  
  // Earn a stamp for running completion
  const stampId = `stamp-${Date.now()}`;
  user.stamps.push(stampId);

  // Unlocking badges based on conditions
  if (!user.badges.includes("first-run")) {
    user.badges.push("first-run");
  }
  if (user.totalDistance >= 10 && !user.badges.includes("distance-10")) {
    user.badges.push("distance-10"); // 10km 돌파
  }
  if (user.totalDistance >= 30 && !user.badges.includes("marathon-club")) {
    user.badges.push("marathon-club"); // 30km 돌파
  }
  if (user.totalDistance >= 50 && !user.badges.includes("legend")) {
    user.badges.push("legend"); // 50km 마스터
  }

  // Calculate new level (1 level per 5km run)
  const calculatedLevel = Math.floor(user.totalDistance / 5) + 1;
  if (calculatedLevel > user.level) {
    user.level = calculatedLevel;
  }

  // Automatically create a social feed post for the run!
  const postContent = `🏃‍♂️ ${user.name} 학생이 어슬런데이 달리기를 완주했습니다! 
✨ 거리: ${dKm}km | 시간: ${Math.floor(dSec / 60)}분 ${dSec % 60}초 | 페이스: ${pace || "6:00"}/km
💬 한마디: "${memo || '건강한 학교 생활을 위해 달렸습니다!'}"`;

  const newPost: Post = {
    id: `post-${Date.now()}`,
    userId,
    userName: user.name,
    grade: user.grade,
    content: postContent,
    distance: dKm,
    duration: dSec,
    pace: pace || "6:00",
    path: path || [],
    likes: [],
    comments: [],
    date: new Date().toISOString(),
    isRunRecord: true
  };

  db.posts.unshift(newPost);
  
  saveDB(db);
  res.status(201).json({ activity: newActivity, user, post: newPost });
});

// Get all posts
app.get("/api/posts", (req, res) => {
  const db = loadDB();
  res.json(db.posts);
});

// Add a new feed post manually
app.post("/api/posts", (req, res) => {
  const db = loadDB();
  const { userId, content } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  }

  const newPost: Post = {
    id: `post-${Date.now()}`,
    userId,
    userName: user.name,
    grade: user.grade,
    content,
    likes: [],
    comments: [],
    date: new Date().toISOString(),
    isRunRecord: false
  };

  db.posts.unshift(newPost);
  saveDB(db);
  res.status(201).json(newPost);
});

// Like a post
app.post("/api/posts/:id/like", (req, res) => {
  const db = loadDB();
  const postId = req.params.id;
  const { userId } = req.body;

  const post = db.posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "포스트를 찾을 수 없습니다." });
  }

  const likeIndex = post.likes.indexOf(userId);
  if (likeIndex === -1) {
    post.likes.push(userId); // Like
  } else {
    post.likes.splice(likeIndex, 1); // Unlike
  }

  saveDB(db);
  res.json(post);
});

// Comment on a post
app.post("/api/posts/:id/comment", (req, res) => {
  const db = loadDB();
  const postId = req.params.id;
  const { userId, text } = req.body;

  const post = db.posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "포스트를 찾을 수 없습니다." });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  }

  const newComment: Comment = {
    id: `comment-${Date.now()}`,
    userId,
    userName: user.name,
    text,
    date: new Date().toISOString()
  };

  post.comments.push(newComment);
  saveDB(db);
  res.status(201).json(post);
});

// Get all missions
app.get("/api/missions", (req, res) => {
  const db = loadDB();
  res.json(db.missions);
});

// Claim a mission reward and receive stamps
app.post("/api/missions/claim", (req, res) => {
  const db = loadDB();
  const { userId, missionId } = req.body;

  const user = db.users.find(u => u.id === userId);
  const mission = db.missions.find(m => m.id === missionId);

  if (!user || !mission) {
    return res.status(404).json({ error: "사용자 또는 미션을 찾을 수 없습니다." });
  }

  // Add stamps based on reward stamps
  for (let i = 0; i < mission.rewardStamp; i++) {
    user.stamps.push(`mission-${missionId}-${Date.now()}-${i}`);
  }

  // Unlock stamp collector badge if stamps count is high
  if (user.stamps.length >= 5 && !user.badges.includes("stamp-collector")) {
    user.badges.push("stamp-collector");
  }

  saveDB(db);
  res.json({ success: true, stampsCount: user.stamps.length, badges: user.badges });
});

// Award a special teacher praise stamp and create a post in the feed
app.post("/api/teacher/award", (req, res) => {
  const db = loadDB();
  const { userId, teacherMemo, awardStampCount } = req.body;

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  }

  // Add stamps
  const count = parseInt(awardStampCount) || 1;
  for (let i = 0; i < count; i++) {
    user.stamps.push(`teacher-${Date.now()}-${i}`);
  }

  // Check if stamp collector badge is earned
  if (user.stamps.length >= 5 && !user.badges.includes("stamp-collector")) {
    user.badges.push("stamp-collector");
  }

  // Automatically create a post on the feed praising the student
  const postContent = `📢 [선생님의 칭찬 선물] 🌟 담임 선생님이 ${user.name} 학생에게 칭찬 발도장 스탬프 ${count}개와 따뜻한 격려를 보냈습니다!
  
💬 "${teacherMemo || '항상 성실하게 어슬런데이에 참여하는 모습이 매우 기특합니다. 앞으로도 한 걸음 한 걸음 기쁘게 달려보아요!'}"`;

  const newPost: Post = {
    id: `post-teacher-${Date.now()}`,
    userId: "teacher",
    userName: "담임 선생님 🧑‍🏫",
    grade: 0, // Teacher representation
    content: postContent,
    likes: [],
    comments: [],
    date: new Date().toISOString(),
    isRunRecord: false
  };

  db.posts.unshift(newPost);
  saveDB(db);

  res.status(200).json({ success: true, user, post: newPost });
});

// Gemini-powered personalized stats running report/coaching analysis
app.post("/api/ai/analyze", async (req, res) => {
  const { userId } = req.body;
  const db = loadDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  }

  // Gather user activities
  const userActivities = db.activities.filter(a => a.userId === userId);
  const totalRuns = userActivities.length;
  const averageDistance = totalRuns > 0 ? (user.totalDistance / totalRuns).toFixed(2) : "0";
  const recentMemos = userActivities.slice(0, 3).map(a => `[${a.date.split("T")[0]}] 거리: ${a.distance}km, 시간: ${Math.floor(a.duration / 60)}분, 페이스: ${a.pace}, 한마디: ${a.memo}`).join("\n");

  const prompt = `당신은 전교생 21명의 전남 나주동강중학교 학생들이 참여하는 '어슬런데이' 건강 달리기 프로젝트의 전문 AI 러닝 코치입니다.
중학생 눈높이에 맞게 매우 친근하고 격려하며, 밝은 말투(존댓말, 이모티콘 적극 활용)로 학생의 운동 기록을 분석하고 통계 리포트와 피드백을 작성해주세요.

[학생 정보]
이름: ${user.name} (${user.grade}학년)
누적 달리기 거리: ${user.totalDistance}km
누적 운동 시간: ${Math.floor(user.totalDuration / 60)}분
러닝 레벨: ${user.level}레벨 (스탬프 ${user.stamps.length}개 획득)
소유 뱃지 목록: ${user.badges.join(", ") || "첫걸음"}

[최근 달리기 기록들]
${recentMemos || "최근 기록 없음 (첫 걸음을 떼기를 기다리고 있습니다!)"}

[답변 가이드라인]
1. 분석 리포트: 누적 거리와 레벨을 칭찬하고, 학생의 페이스나 러닝 습관에 대해 따뜻하고 활기찬 격려를 적어주세요.
2. 성장을 위한 다음 미션 추천: 이번 주에 도전하면 좋은 구체적인 맞춤 목표를 제안해주세요 (예: '동강 영산강 강변에서 3km 쉬지 않고 완주하기', '스탬프 1개 추가 적립하기' 등).
3. 건강 코칭: 성장기 중학생을 위해 부상 방지 팁이나 발을 디딜 때의 바른 자세, 수분 섭취의 중요성을 알기 쉽게 설명해주세요.

친절하고 역동적인 마크다운 형식으로 출력해주세요.`;

  if (!ai) {
    // Fallback if API key is not present
    const fallbackResponse = `### 🌟 ${user.name} 학생을 위한 AI 코칭 리포트 🏃‍♂️

나주동강중학교의 건강 지킴이, **${user.name} 학생**! 지금까지 누적 **${user.totalDistance}km**나 달렸군요! 정말 멋져요. 😎

**💡 코치님의 응원:**
- 벌써 **${user.level}레벨**에 도달하고 **${user.stamps.length}개**의 스탬프를 모았다니, 끈기 하나는 우리 동강중 전교 1등 감이네요!
- 최근 기록에서 느껴지는 건강한 에너지가 너무 보기 좋습니다. 영산강 강변길을 뛰거나 운동장을 돌면서 한 단계씩 체력을 높여가는 모습이 최고예요.

**🎯 다음 목표 제안:**
- 이번 주에는 **누적 3km 추가 달성**해서 스탬프 발도장을 더 모아볼까요? 친구들과 함께 랭킹 배틀을 하면서 같이 달리면 재미가 두 배가 될 거예요!

**안전 러닝 꿀팁:**
- 달리기 전후에는 발목과 무릎 스트레칭을 꼭! 해주세요.
- 달릴 때 턱을 가볍게 당기고 영산강의 맑은 공기를 가슴 깊이 마시며 뛰면 폐활량이 쑥쑥 늘어납니다! 수분 섭취도 잊지 마세요 🥤`;
    return res.json({ analysis: fallbackResponse });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error("Gemini API call failed:", error);
    res.status(500).json({ error: "AI 분석 리포트를 생성하는 과정에서 오류가 발생했습니다." });
  }
});

// Configure Vite or Serve Static Production Files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
