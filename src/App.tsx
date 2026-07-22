import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass,
  Trophy,
  Users,
  Award,
  User,
  Clock,
  MapPin,
  Activity,
  Heart,
  MessageSquare,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Flame,
  CheckCircle2,
  Volume2,
  VolumeX,
  Database,
  Map,
  ChevronRight,
  TrendingUp,
  Smile,
  Send,
  Plus,
  Upload,
  Camera,
  Smartphone,
  Calendar,
  X,
  FileText,
  Watch,
  HelpCircle,
  Info,
  ExternalLink,
  Footprints,
  ListOrdered
} from "lucide-react";
import {
  DEFAULT_USERS,
  DEFAULT_MISSIONS,
  DEFAULT_ACTIVITIES,
  DEFAULT_POSTS
} from "./defaults";

// For Leaflet map loading via CDN
declare const L: any;

const getLocalDB = () => {
  const data = localStorage.getItem("easurun_local_db");
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  const initial = {
    users: DEFAULT_USERS,
    activities: DEFAULT_ACTIVITIES,
    posts: DEFAULT_POSTS,
    missions: DEFAULT_MISSIONS
  };
  localStorage.setItem("easurun_local_db", JSON.stringify(initial));
  return initial;
};

const saveLocalDB = (db: any) => {
  localStorage.setItem("easurun_local_db", JSON.stringify(db));
};

interface UserProfile {
  id: string;
  name: string;
  grade: number;
  totalDistance: number;
  totalDuration: number;
  level: number;
  stamps: string[];
  badges: string[];
}

interface Activity {
  id: string;
  userId: string;
  userName: string;
  grade: number;
  date: string;
  distance: number;
  duration: number;
  pace: string;
  memo: string;
  path: [number, number][];
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
  likes: string[];
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

const getGradeLabel = (grade: number) => {
  if (grade === 4) return "교직원";
  if (grade === 0) return "게스트";
  return `${grade}학년`;
};

// 4-Week Beginner Running Plan Data (like RunDay)
interface PlanDay {
  day: number;
  title: string;
  sequence: { type: "walk" | "run" | "warmup" | "cooldown"; duration: number; text: string }[];
}

const RUNNING_PLANS: { week: number; days: PlanDay[] }[] = [
  {
    week: 1, // 🌱 Course 1: 5-Minute Running Course
    days: [
      {
        day: 1,
        title: "5분 코스 1일차 - 첫걸음 걷고 달리기",
        sequence: [
          { type: "warmup", duration: 60, text: "준비 운동을 위해 1분간 가볍게 걷습니다." },
          { type: "run", duration: 60, text: "첫 번째 달리기! 1분 동안 가볍게 뛰어보세요. 무리하지 마세요." },
          { type: "walk", duration: 120, text: "2분 동안 천천히 걸으면서 호흡을 일정하게 가다듬으세요." },
          { type: "run", duration: 60, text: "다시 1분간 즐겁고 경쾌한 페이스로 뛰어봅시다!" },
          { type: "walk", duration: 120, text: "2분간 한숨 쉬면서 천천히 걸어주세요." },
          { type: "cooldown", duration: 60, text: "마무리 정리 운동 걷기입니다. 첫 도전을 환영합니다!" }
        ]
      },
      {
        day: 2,
        title: "5분 코스 2일차 - 페이스 감각 다지기",
        sequence: [
          { type: "warmup", duration: 60, text: "가볍게 1분 동안 천천히 걸으며 다리와 어깨 관절을 활성화합니다." },
          { type: "run", duration: 90, text: "1분 30초 동안 어깨의 힘을 툭 빼고 부드럽게 뛰어보세요." },
          { type: "walk", duration: 120, text: "2분 동안 걷기 시간입니다. 가벼운 발걸음으로 천천히 호흡하세요." },
          { type: "run", duration: 90, text: "다시 한번 1분 30초 동안 힘차게 한 발씩 내딛으며 뛰어봅시다." },
          { type: "cooldown", duration: 60, text: "정리 운동을 위해 1분간 기분 좋은 시원한 바람을 느끼며 천천히 걷습니다." }
        ]
      },
      {
        day: 3,
        title: "5분 코스 3일차 - 5분 연속 달리기 기적의 완주",
        sequence: [
          { type: "warmup", duration: 90, text: "5분 연속 달리기를 앞두고 충분히 몸을 달구기 위해 1분 30초간 걷습니다." },
          { type: "run", duration: 300, text: "오늘의 마스터 도전! 5분 동안 쉬지 않고 일정한 페이스로 달리기 시작! 앞사람 뒤꽁무니만 보며 호흡을 지키세요!" },
          { type: "cooldown", duration: 90, text: "우와, 5분 연속 달리기를 해내셨습니다! 1분 30초간 천천히 걸으며 심박수를 완벽하게 회복해 봅니다." }
        ]
      }
    ]
  },
  {
    week: 2, // 🏃‍♂️ Course 2: 30-Minute Running Course
    days: [
      {
        day: 1,
        title: "30분 코스 1일차 - 15분 연속 페이스 체크",
        sequence: [
          { type: "warmup", duration: 120, text: "30분 달리기의 도전을 위해 2분 동안 경쾌한 속도로 걷기 워밍업을 진행합니다." },
          { type: "run", duration: 900, text: "15분 연속 달리기입니다! 무턱대고 달리지 말고, 옆 친구와 수다 떨 수 있을 정도의 편안한 페이스를 찾으세요." },
          { type: "cooldown", duration: 120, text: "환상적인 질주였습니다! 15분 완수 완료. 2분간 충분한 정리 걷기를 진행하며 물을 드세요." }
        ]
      },
      {
        day: 2,
        title: "30분 코스 2일차 - 20분 끈기의 불꽃",
        sequence: [
          { type: "warmup", duration: 120, text: "체내 페이스 유지력을 높이는 20분 러닝 코스입니다. 워밍업 걷기 2분 출발!" },
          { type: "run", duration: 1200, text: "20분 연속 달리기 시작! 가슴을 당당히 펴고 마을 둘레길과 운동장의 풍경을 즐기며 활기차게 달려봅니다!" },
          { type: "cooldown", duration: 120, text: "한계를 뛰어넘은 나 자신에게 격려의 박수를! 2분간 천천히 걸어 체온을 서서히 복구합니다." }
        ]
      },
      {
        day: 3,
        title: "30분 코스 3일차 - 러닝 코스 30분 완전 완주",
        sequence: [
          { type: "warmup", duration: 180, text: "꿈의 30분 논스톱 러닝 완료를 위해 3분 동안 온몸의 피를 원활히 돌리는 준비 걷기를 진행합니다." },
          { type: "run", duration: 1800, text: "대망의 30분 달리기 도전! 포기하고 싶은 순간마다 나주 동강 전교생 친구들의 응원을 떠올리며 나만의 리듬으로 한 발자국씩 가볍게 골인하세요!" },
          { type: "cooldown", duration: 180, text: "해냈습니다! 여러분은 30분 연속 달리기를 완전히 완주했습니다! 3분 정리 걷기를 만끽하며 승리의 호흡을 쉬세요." }
        ]
      }
    ]
  },
  {
    week: 3, // 🔥 Course 3: 60-Minute Running Course (Endurance Elite)
    days: [
      {
        day: 1,
        title: "60분 코스 1일차 - 40분 연속 에코 LSD 러닝",
        sequence: [
          { type: "warmup", duration: 180, text: "고급 지구력 빌드업 코스입니다. 3분간 힘있게 걷습니다." },
          { type: "run", duration: 2400, text: "40분 연속 달리기 출발! '습습후후' 일정한 템포의 호흡을 타고 뇌와 온몸에 풍성한 산소를 가득 충전하며 매끄럽게 달립니다." },
          { type: "cooldown", duration: 180, text: "완벽하게 페이스를 방어하며 40분 완료! 3분 동안 가볍게 몸을 흔들며 고루 걷습니다." }
        ]
      },
      {
        day: 2,
        title: "60분 코스 2일차 - 50분 페이스 마스터 클래스",
        sequence: [
          { type: "warmup", duration: 180, text: "기적의 완주를 단 한 걸음 앞두고, 50분 인터벌 트레이닝에 돌입합니다. 3분간 워밍업 걷기 출발!" },
          { type: "run", duration: 3000, text: "50분 연속 질주! 허리를 세우고 턱을 가볍게 당겨 중심을 일정히 유지하며 가쁜 숨을 컨트롤하며 달립니다." },
          { type: "cooldown", duration: 180, text: "어메이징합니다! 승리자의 자격을 완전히 입증하셨군요. 3분간 천천히 걸으면서 흥분한 근육들을 가볍게 이완시켜 주세요." }
        ]
      },
      {
        day: 3,
        title: "60분 코스 3일차 - 동강 둘레길 & 코스 완전 제패 (60분 완주)",
        sequence: [
          { type: "warmup", duration: 300, text: "어슬런데이에 한 획을 그을 최종 완성! 60분 도전을 앞두고 발목과 다리 근육을 촉촉히 깨울 5분간의 준비 워밍업을 기쁘게 시작합니다." },
          { type: "run", duration: 3600, text: "60분 연속 무한 질주! 페이스 조절을 마친 당신은 이미 최고의 엘리트 러너입니다. 지금부터 1시간 동안 바람을 벗 삼아 나주 동강중의 전설이 되어보세요!" },
          { type: "cooldown", duration: 300, text: "전율이 흐르는 최종 완주 성공! 무려 60분 연속 달리기를 제패하셨습니다! 5분간 승리의 천천히 걷기를 음미하며 어슬런데이를 대성공으로 장식합니다." }
        ]
      }
    ]
  }
];

// Naju Donggang Middle School Scenic Simulated Route Coordinates
const NAJU_SIMULATION_ROUTE: [number, number][] = [
  [34.8988, 126.6025], // 동강중학교 정문 (출발)
  [34.8974, 126.6012], // 동강면 사무소 삼거리
  [34.8953, 126.5985], // 나주동강초등학교 정문 앞
  [34.8921, 126.5958], // 동강교차로 진입길
  [34.8875, 126.5932], // 둘레길 코스 합류지점
  [34.8836, 126.5908], // 운동장 및 산책로 1
  [34.8808, 126.5931], // 쉼터 정자 (반환점)
  [34.8836, 126.5908], // 복귀길 1
  [34.8875, 126.5932], // 코스 분기점
  [34.8921, 126.5958], // 동강교차로
  [34.8953, 126.5985], // 동강초등학교
  [34.8988, 126.6025]  // 동강중학교 복귀 (골인)
];

const BADGE_INFO: Record<string, { name: string; desc: string; icon: string; color: string }> = {
  "first-run": { name: "어슬런의 첫발", desc: "첫 달리기를 완주하고 피드에 공유함", icon: "👟", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  "speedy": { name: "쾌속 질주", desc: "평균 페이스 6:00 이내의 쾌속 질주 달성", icon: "⚡", color: "bg-amber-100 text-amber-700 border-amber-300" },
  "consistent": { name: "꾸준함의 아이콘", desc: "스탬프를 3개 이상 모아 성실함 입증", icon: "📅", color: "bg-blue-100 text-blue-700 border-blue-300" },
  "distance-10": { name: "동강 러너", desc: "누적 달리기 거리 10km 돌파", icon: "🏆", color: "bg-purple-100 text-purple-700 border-purple-300" },
  "marathon-club": { name: "동강철인 30", desc: "누적 달리기 거리 30km 돌파", icon: "🔥", color: "bg-orange-100 text-orange-700 border-orange-300" },
  "legend": { name: "어슬런 마스터", desc: "누적 달리기 거리 50km 돌파 전교 레전드", icon: "👑", color: "bg-rose-100 text-rose-700 border-rose-300" },
  "stamp-collector": { name: "스탬프 수집 대장", desc: "누적 스탬프 획득 수 5개 이상 돌파", icon: "💮", color: "bg-pink-100 text-pink-700 border-pink-300" }
};

export default function App() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [tab, setTab] = useState<"home" | "run" | "plan" | "ranking" | "feed" | "report" | "teacher">("home");

  // Geolocation states
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [runDistance, setRunDistance] = useState(0); // km
  const [runDuration, setRunDuration] = useState(0); // seconds
  const [runPath, setRunPath] = useState<[number, number][]>([]);
  const [runMemo, setRunMemo] = useState("");
  const [gpsSimulated, setGpsSimulated] = useState(true); // Default simulator mode for testing in iframe!
  const [voiceCoachingEnabled, setVoiceCoachingEnabled] = useState(true);
  const [isSubmittingRun, setIsSubmittingRun] = useState(false);

  // Cadence (SPM), Laps, and Integration Modals
  const [runCadence, setRunCadence] = useState<number>(0); // SPM
  const [runLaps, setRunLaps] = useState<{ km: number; pace: string; timeSec: number }[]>([]);
  const lastNotifiedKmRef = useRef<number>(0);
  const stepCountRef = useRef<number>(0);

  // Modals for Garmin/NRC GPX Integration & Vercel Protection Guide
  const [showGpxGuideModal, setShowGpxGuideModal] = useState<boolean>(false);
  const [showVercelGuideModal, setShowVercelGuideModal] = useState<boolean>(false);
  const [gpxFileName, setGpxFileName] = useState<string>("");

  // Manual Running Entry States
  const [runMode, setRunMode] = useState<"gps" | "manual">("gps");
  const [manualDate, setManualDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [manualKm, setManualKm] = useState<string>("");
  const [manualMin, setManualMin] = useState<string>("");
  const [manualSec, setManualSec] = useState<string>("");
  const [manualPace, setManualPace] = useState<string>("");
  const [manualCadence, setManualCadence] = useState<string>("");
  const [manualMemo, setManualMemo] = useState<string>("");
  const [manualPhotoUrl, setManualPhotoUrl] = useState<string | null>(null);
  const [manualPhotoName, setManualPhotoName] = useState<string>("");
  const [isSubmittingManual, setIsSubmittingManual] = useState<boolean>(false);

  // Auto calculate manual pace
  useEffect(() => {
    const km = parseFloat(manualKm);
    const min = parseInt(manualMin) || 0;
    const sec = parseInt(manualSec) || 0;
    const totalSec = min * 60 + sec;

    if (km > 0 && totalSec > 0) {
      const paceSecPerKm = Math.round(totalSec / km);
      const paceM = Math.floor(paceSecPerKm / 60);
      const paceS = paceSecPerKm % 60;
      const formattedPace = `${paceM}:${paceS < 10 ? "0" : ""}${paceS}`;
      setManualPace(formattedPace);
    } else {
      setManualPace("");
    }
  }, [manualKm, manualMin, manualSec]);

  // Beginner Running Plan Training States
  const [activeTraining, setActiveTraining] = useState<{ week: number; day: number } | null>(null);
  const [trainingActive, setTrainingActive] = useState(false);
  const [trainingIndex, setTrainingIndex] = useState(0);
  const [trainingTimer, setTrainingTimer] = useState(0);
  const [coachingText, setCoachingText] = useState("");
  const [coachingVolume, setCoachingVolume] = useState(true);

  // AI Coaching States
  const [aiReport, setAiReport] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiLoadingMessage, setAiLoadingMessage] = useState("");

  // Teacher View States
  const [selectedTeacherStudentId, setSelectedTeacherStudentId] = useState<string>("");
  const [teacherMemoText, setTeacherMemoText] = useState<string>("");
  const [teacherStampsCount, setTeacherStampsCount] = useState<number>(1);
  const [isSubmittingTeacherAward, setIsSubmittingTeacherAward] = useState<boolean>(false);

  // Login states
  const [loginGradeTab, setLoginGradeTab] = useState<number | "guest" | "staff">(1);
  const [guestNameInput, setGuestNameInput] = useState("");
  const [isLoggingInGuest, setIsLoggingInGuest] = useState(false);
  const [showTeacherPasswordModal, setShowTeacherPasswordModal] = useState(false);
  const [teacherPasswordInput, setTeacherPasswordInput] = useState("");
  const [teacherPasswordError, setTeacherPasswordError] = useState("");

  // Social Feed state
  const [newPostText, setNewPostText] = useState("");
  const [postCommentText, setPostCommentText] = useState<Record<string, string>>({});

  // Refs for tracking
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const polylineInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const gpsWatcherRef = useRef<number | null>(null);
  const runTimerRef = useRef<any>(null);
  const trainingTimerRef = useRef<any>(null);
  const wakeLockRef = useRef<any>(null);

  // Confetti overlay effect trigger
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiMessage, setConfettiMessage] = useState("");

  // Load initial data
  useEffect(() => {
    fetchUsers();
    fetchActivities();
    fetchPosts();
    fetchMissions();
  }, []);

  const syncCurrentUser = (usersList: UserProfile[]) => {
    const savedUserId = localStorage.getItem("easurun_user_id");
    if (savedUserId) {
      if (savedUserId === "teacher") {
        setCurrentUser({
          id: "teacher",
          name: "담임 선생님",
          grade: 0,
          totalDistance: 0,
          totalDuration: 0,
          level: 10,
          stamps: [],
          badges: []
        });
        setTab("teacher");
        return;
      }

      const savedUser = usersList.find((u: any) => u.id === savedUserId);
      if (savedUser) {
        setCurrentUser(savedUser);
        return;
      }
    }
    setCurrentUser(null);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      setUsers(data);
      syncCurrentUser(data);
    } catch (e) {
      console.warn("Using offline user database fallback:", e);
      const db = getLocalDB();
      setUsers(db.users);
      syncCurrentUser(db.users);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/activities");
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      setActivities(data);
    } catch (e) {
      console.warn("Using offline activities database fallback:", e);
      const db = getLocalDB();
      setActivities(db.activities);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      setPosts(data);
    } catch (e) {
      console.warn("Using offline posts database fallback:", e);
      const db = getLocalDB();
      setPosts(db.posts);
    }
  };

  const fetchMissions = async () => {
    try {
      const res = await fetch("/api/missions");
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      setMissions(data);
    } catch (e) {
      console.warn("Using offline missions database fallback:", e);
      const db = getLocalDB();
      setMissions(db.missions);
    }
  };

  // Switch student
  const handleUserChange = (userId: string) => {
    if (userId === "teacher") {
      localStorage.setItem("easurun_user_id", "teacher");
      setCurrentUser({
        id: "teacher",
        name: "담임 선생님",
        grade: 0,
        totalDistance: 0,
        totalDuration: 0,
        level: 10,
        stamps: [],
        badges: []
      });
      setTab("teacher");
      return;
    }

    const selected = users.find(u => u.id === userId);
    if (selected) {
      localStorage.setItem("easurun_user_id", userId);
      setCurrentUser(selected);
      // Reset AI Report for the new user so they get fresh analysis
      setAiReport("");
      // Stop running/training on user change to prevent state bleed
      if (isRunning) stopRunningAndCleanup();
      if (trainingActive) stopTrainingAndCleanup();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("easurun_user_id");
    setCurrentUser(null);
    setTab("home");
    speakText("로그아웃 되었습니다. 다른 계정으로 로그인해 주세요.");
  };

  const handleTeacherPasswordVerify = () => {
    if (teacherPasswordInput === "098900") {
      localStorage.setItem("easurun_user_id", "teacher");
      setCurrentUser({
        id: "teacher",
        name: "담임 선생님",
        grade: 0,
        totalDistance: 0,
        totalDuration: 0,
        level: 10,
        stamps: [],
        badges: []
      });
      setTab("teacher");
      setShowTeacherPasswordModal(false);
      setTeacherPasswordInput("");
      setTeacherPasswordError("");
      speakText("인증되었습니다. 교사 대시보드로 로그인되었습니다.");
      triggerCelebration("🧑‍🏫 교사 대시보드 권한으로 로그인되었습니다.");
    } else {
      setTeacherPasswordError("비밀번호가 올바르지 않습니다. 다시 입력해 주세요.");
      speakText("비밀번호가 올바르지 않습니다.");
    }
  };

  const renderTeacherPasswordModal = () => {
    if (!showTeacherPasswordModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100"
        >
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Database size={24} />
            </div>
            <h3 className="text-lg font-black text-white">교사 관리실 인증</h3>
            <p className="text-xs text-slate-400">
              담임 선생님 전용 공간입니다. 진입 비밀번호를 입력하세요.
            </p>
          </div>

          <div className="space-y-2">
            <input
              type="password"
              value={teacherPasswordInput}
              onChange={(e) => {
                setTeacherPasswordInput(e.target.value);
                setTeacherPasswordError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleTeacherPasswordVerify();
                }
              }}
              placeholder="비밀번호 6자리 입력"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-black text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-700 text-center tracking-widest"
              autoFocus
            />
            {teacherPasswordError && (
              <p className="text-xs font-bold text-rose-400 text-center">
                ❌ {teacherPasswordError}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                setShowTeacherPasswordModal(false);
                setTeacherPasswordInput("");
                setTeacherPasswordError("");
              }}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              취소
            </button>
            <button
              onClick={handleTeacherPasswordVerify}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              확인
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  // Voice Speech synthesizer helper
  const speakText = (text: string) => {
    if (!voiceCoachingEnabled || !coachingVolume) return;
    if ("speechSynthesis" in window) {
      // Cancel previous speech
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Trigger celebration banner
  const triggerCelebration = (msg: string) => {
    setConfettiMessage(msg);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };

  // Geolocation Haversine Distance Calculator
  const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // distance in km
  };

  // Screen Wake Lock API helpers to prevent phone from locking/turning screen off while running
  const requestWakeLock = async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
        console.log("화면 꺼짐 방지(Wake Lock)가 활성화되었습니다.");
      }
    } catch (err) {
      console.warn("화면 꺼짐 방지 활성화 실패:", err);
    }
  };

  const releaseWakeLock = () => {
    try {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().then(() => {
          wakeLockRef.current = null;
          console.log("화면 꺼짐 방지(Wake Lock)가 해제되었습니다.");
        });
      }
    } catch (err) {
      console.error("화면 꺼짐 방지 해제 중 오류:", err);
    }
  };

  // Start Real-time GPS/Simulated running
  const startRunning = () => {
    if (!currentUser) return;
    setIsRunning(true);
    setIsPaused(false);
    setRunDistance(0);
    setRunDuration(0);
    setRunCadence(162); // Default cadence initial estimate
    setRunLaps([]);
    setRunMemo("");
    lastNotifiedKmRef.current = 0;
    stepCountRef.current = 0;

    // Request Wake Lock
    requestWakeLock();

    speakText("어슬런데이 실시간 GPS 트래킹을 시작합니다! 가볍고 상쾌한 걸음으로 몸을 깨워주세요.");

    // Start Timer
    runTimerRef.current = setInterval(() => {
      setRunDuration(prev => prev + 1);
    }, 1000);

    // Path Simulator or Real GPS Watcher
    if (gpsSimulated) {
      setRunPath([NAJU_SIMULATION_ROUTE[0]]);
      let stepIndex = 0;
      const simInterval = setInterval(() => {
        if (isPaused) return;
        stepIndex++;
        if (stepIndex < NAJU_SIMULATION_ROUTE.length) {
          const nextPt = NAJU_SIMULATION_ROUTE[stepIndex];
          setRunPath(prev => {
            const lastPt = prev[prev.length - 1];
            const segmentDist = calcDistance(lastPt[0], lastPt[1], nextPt[0], nextPt[1]);
            setRunDistance(d => parseFloat((d + segmentDist).toFixed(3)));
            return [...prev, nextPt];
          });

          // Periodic Simulator voice prompts
          if (stepIndex === 4) {
            speakText("우와! 아름다운 마을 둘레길 코스에 진입하셨습니다. 시원한 공기와 바람을 느껴보세요!");
          } else if (stepIndex === 6) {
            speakText("코스의 반환점에 도달했습니다! 이제 학교를 향해 힘을 내어 복귀해볼까요?");
          }
        } else {
          // If simulator reaches end, generate tiny offsets around school
          const lastPt = NAJU_SIMULATION_ROUTE[NAJU_SIMULATION_ROUTE.length - 1];
          const newPt: [number, number] = [
            lastPt[0] + (Math.random() - 0.5) * 0.0002,
            lastPt[1] + (Math.random() - 0.5) * 0.0002
          ];
          setRunPath(prev => {
            const pLast = prev[prev.length - 1];
            const segmentDist = calcDistance(pLast[0], pLast[1], newPt[0], newPt[1]);
            setRunDistance(d => parseFloat((d + segmentDist).toFixed(3)));
            return [...prev, newPt];
          });
        }
      }, 3000);

      // Store simulated tracker inside the same ref logic
      gpsWatcherRef.current = simInterval as any;
    } else {
      // High Precision Real Geolocation Logic with Jitter Filtering
      if ("geolocation" in navigator) {
        let lastValidPos: { lat: number; lng: number; time: number } | null = null;
        setRunPath([]);

        gpsWatcherRef.current = navigator.geolocation.watchPosition(
          (position) => {
            if (isPaused) return;
            const { latitude, longitude, accuracy } = position.coords;

            // Reject inaccurate GPS positions (> 35m uncertainty)
            if (accuracy && accuracy > 35) {
              console.log("GPS 오차 범위 초과로 스킵:", accuracy);
              return;
            }

            const now = Date.now();
            if (!lastValidPos) {
              // First valid coordinate registered as true start
              lastValidPos = { lat: latitude, lng: longitude, time: now };
              setRunPath([[latitude, longitude]]);
              return;
            }

            const timeDeltaSec = (now - lastValidPos.time) / 1000;
            if (timeDeltaSec < 0.5) return; // Prevent too rapid polling calculations

            const distKm = calcDistance(lastValidPos.lat, lastValidPos.lng, latitude, longitude);
            const distMeters = distKm * 1000;
            const speedMs = distMeters / timeDeltaSec;

            // Accuracy & speed filters:
            // 1. At least 3 meters moved
            // 2. Speed <= 8.3 m/s (30 km/h) to filter out sudden GPS teleportation jumps
            if (distMeters >= 3 && speedMs <= 8.3) {
              lastValidPos = { lat: latitude, lng: longitude, time: now };
              setRunPath(prev => [...prev, [latitude, longitude]]);
              setRunDistance(d => parseFloat((d + distKm).toFixed(3)));
            } else if (distMeters >= 30 && speedMs > 8.3) {
              console.warn("GPS 순간 튐(Jitter) 기각됨:", distMeters, "m, 속도:", speedMs, "m/s");
            }
          },
          (error) => {
            console.error("GPS Geolocation Error:", error);
            setGpsSimulated(true);
            speakText("GPS 신호 수신이 불안정하여 러닝 코스 시뮬레이션 모드로 전환합니다.");
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 1000 }
        );
      } else {
        setGpsSimulated(true);
      }
    }
  };

  // 1km Lap Notification Effect
  useEffect(() => {
    if (!isRunning || runDistance < 1) return;
    const currentKm = Math.floor(runDistance);
    if (currentKm > lastNotifiedKmRef.current) {
      lastNotifiedKmRef.current = currentKm;

      const prevLapsTime = runLaps.reduce((acc, l) => acc + l.timeSec, 0);
      const lapTimeSec = Math.max(1, runDuration - prevLapsTime);
      const lapM = Math.floor(lapTimeSec / 60);
      const lapS = lapTimeSec % 60;
      const lapPaceStr = `${lapM}:${lapS < 10 ? "0" : ""}${lapS}`;

      const newLap = { km: currentKm, pace: lapPaceStr, timeSec: lapTimeSec };
      setRunLaps(prev => [...prev, newLap]);

      speakText(`축하합니다! ${currentKm}킬로미터를 돌파하셨습니다. 이번 구간 페이스는 ${lapM}분 ${lapS}초입니다. 아주 멋진 페이스입니다!`);
    }
  }, [runDistance, isRunning, runDuration, runLaps]);

  // Motion Sensor Device Motion Effect for Cadence (SPM)
  useEffect(() => {
    if (!isRunning || isPaused) return;

    let steps = 0;
    let lastAccelTime = 0;
    const startTime = Date.now();

    const handleMotion = (e: DeviceMotionEvent) => {
      const accel = e.accelerationIncludingGravity;
      if (!accel) return;
      const { x, y, z } = accel;
      if (x == null || y == null || z == null) return;
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      if (magnitude > 12.0 && Date.now() - lastAccelTime > 270) {
        lastAccelTime = Date.now();
        steps++;
        stepCountRef.current = steps;

        const elapsedMin = (Date.now() - startTime) / 60000;
        if (elapsedMin > 0.05) {
          const spm = Math.round(steps / elapsedMin);
          setRunCadence(spm);
        }
      }
    };

    if ("DeviceMotionEvent" in window) {
      window.addEventListener("devicemotion", handleMotion);
    }

    return () => {
      if ("DeviceMotionEvent" in window) {
        window.removeEventListener("devicemotion", handleMotion);
      }
    };
  }, [isRunning, isPaused]);

  // Handle GPX File Upload for Garmin/NRC Import
  const handleGpxFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGpxFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const xmlText = event.target?.result as string;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");

        const trkpts = Array.from(xmlDoc.getElementsByTagName("trkpt"));
        if (trkpts.length === 0) {
          alert("유효한 GPX 트랙 데이터가 포함되어 있지 않은 파일입니다.");
          return;
        }

        let totalDistKm = 0;
        const parsedPath: [number, number][] = [];
        let startTimeMs = 0;
        let endTimeMs = 0;

        trkpts.forEach((pt, idx) => {
          const lat = parseFloat(pt.getAttribute("lat") || "0");
          const lon = parseFloat(pt.getAttribute("lon") || "0");
          if (lat && lon) {
            parsedPath.push([lat, lon]);
            if (idx > 0) {
              const prev = parsedPath[idx - 1];
              totalDistKm += calcDistance(prev[0], prev[1], lat, lon);
            }
          }

          const timeNode = pt.getElementsByTagName("time")[0];
          if (timeNode && timeNode.textContent) {
            const ptTimeMs = new Date(timeNode.textContent).getTime();
            if (idx === 0) startTimeMs = ptTimeMs;
            endTimeMs = ptTimeMs;
          }
        });

        const roundedKm = parseFloat(totalDistKm.toFixed(2));
        let totalDurationSec = 0;
        if (startTimeMs > 0 && endTimeMs > startTimeMs) {
          totalDurationSec = Math.round((endTimeMs - startTimeMs) / 1000);
        } else {
          totalDurationSec = Math.round(roundedKm * 330);
        }

        const mins = Math.floor(totalDurationSec / 60);
        const secs = totalDurationSec % 60;

        setManualKm(roundedKm.toString());
        setManualMin(mins.toString());
        setManualSec(secs.toString());
        setManualCadence("165");
        setManualMemo(`⌚ 가민/나이키 앱 GPX 파일 연동 (${file.name})`);

        speakText(`GPX 파일 분석 성공! 총 ${roundedKm}km 달리기 기록이 세팅되었습니다.`);
        triggerCelebration(`🎉 GPX 파일 (${file.name}) 파싱 성공! ${roundedKm}km 자동 입력!`);
      } catch (err) {
        console.error("GPX Parsing error:", err);
        alert("GPX 파일 파싱 중 오류가 발생했습니다.");
      }
    };
    reader.readAsText(file);
  };

  // Pause running
  const pauseRunning = () => {
    setIsPaused(true);
    speakText("달리기를 잠시 일시 정지합니다. 호흡을 가다듬으세요.");
  };

  // Resume running
  const resumeRunning = () => {
    setIsPaused(false);
    speakText("달리기를 다시 시작합니다! 활기차게 호흡해 보세요.");
  };

  // Stop running and reset variables safely
  const stopRunningAndCleanup = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (runTimerRef.current) clearInterval(runTimerRef.current);
    if (gpsWatcherRef.current) {
      if (gpsSimulated) {
        clearInterval(gpsWatcherRef.current);
      } else {
        navigator.geolocation.clearWatch(gpsWatcherRef.current);
      }
    }
    // Release Wake Lock
    releaseWakeLock();
  };

  // Submit running record
  const submitRunningRecord = async () => {
    if (!currentUser || runDistance < 0.01) return;
    setIsSubmittingRun(true);

    const min = Math.floor(runDuration / 60);
    const sec = runDuration % 60;
    const minutesDecimal = runDuration / 60;
    const calculatedPaceMin = runDistance > 0 ? Math.floor(minutesDecimal / runDistance) : 0;
    const calculatedPaceSec = runDistance > 0 ? Math.round(((minutesDecimal / runDistance) % 1) * 60) : 0;
    const finalPace = `${calculatedPaceMin}:${calculatedPaceSec < 10 ? "0" + calculatedPaceSec : calculatedPaceSec}`;

    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          distance: runDistance,
          duration: runDuration,
          pace: finalPace,
          memo: runMemo || "나주동강 어슬런데이 달리기 완료!",
          path: runPath,
          cadence: runCadence || 165,
          laps: runLaps
        })
      });

      if (!response.ok) throw new Error("API failed");

      speakText(`어슬런데이 완주를 축하합니다! ${runDistance} 킬로미터를 기록하여 발도장 스탬프 한 개가 적립되었습니다.`);
      triggerCelebration(`🎉 어슬런데이 완주! ${runDistance}km 기록! 스탬프 획득 완료!`);

      // Refresh lists
      await fetchUsers();
      await fetchActivities();
      await fetchPosts();

      // Stop running and switch to Feed
      stopRunningAndCleanup();
      setTab("feed");
    } catch (e) {
      console.warn("Using offline database save fallback for running activity:", e);
      const db = getLocalDB();
      const userIndex = db.users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        const user = db.users[userIndex];
        const dKm = parseFloat(runDistance.toFixed(2));
        const dSec = runDuration;

        // Add activity
        const activityId = `act-${Date.now()}`;
        const newActivity = {
          id: activityId,
          userId: user.id,
          userName: user.name,
          grade: user.grade,
          date: new Date().toISOString(),
          distance: dKm,
          duration: dSec,
          pace: finalPace,
          memo: runMemo || "어슬런데이 달리기 완료!",
          path: runPath,
          stampsEarned: 1
        };
        db.activities.unshift(newActivity);

        // Update stats
        user.totalDistance = parseFloat((user.totalDistance + dKm).toFixed(2));
        user.totalDuration += dSec;
        user.stamps.push(`stamp-${Date.now()}`);

        // Badges
        if (!user.badges.includes("first-run")) user.badges.push("first-run");
        if (user.totalDistance >= 10 && !user.badges.includes("distance-10")) user.badges.push("distance-10");
        if (user.totalDistance >= 30 && !user.badges.includes("marathon-club")) user.badges.push("marathon-club");
        if (user.totalDistance >= 50 && !user.badges.includes("legend")) user.badges.push("legend");

        // Level
        const calculatedLevel = Math.floor(user.totalDistance / 5) + 1;
        if (calculatedLevel > user.level) user.level = calculatedLevel;

        // Create social post
        const postContent = `🏃‍♂️ ${user.name}님이 어슬런데이 달리기를 완주했습니다! \n✨ 거리: ${dKm}km | 시간: ${Math.floor(dSec / 60)}분 ${dSec % 60}초 | 페이스: ${finalPace}/km\n💬 한마디: "${newActivity.memo}"`;
        const newPost = {
          id: `post-${Date.now()}`,
          userId: user.id,
          userName: user.name,
          grade: user.grade,
          content: postContent,
          distance: dKm,
          duration: dSec,
          pace: finalPace,
          path: runPath,
          likes: [],
          comments: [],
          date: new Date().toISOString(),
          isRunRecord: true
        };
        db.posts.unshift(newPost);

        saveLocalDB(db);
        setCurrentUser(user);
        setUsers(db.users);
        setActivities(db.activities);
        setPosts(db.posts);

        speakText(`어슬런데이 완주를 축하합니다! ${runDistance} 킬로미터를 기록하여 발도장 스탬프 한 개가 적립되었습니다.`);
        triggerCelebration(`🎉 어슬런데이 완주! ${runDistance}km 기록! 스탬프 획득 완료!`);

        stopRunningAndCleanup();
        setTab("feed");
      }
    } finally {
      setIsSubmittingRun(false);
    }
  };

  // Handle Photo Upload for Manual Run Certification
  const handleManualPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("이미지 파일 크기는 10MB 이하로 업로드해주세요.");
      return;
    }
    setManualPhotoName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setManualPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit Manual Running Record
  const handleManualRunSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const km = parseFloat(manualKm);
    const min = parseInt(manualMin) || 0;
    const sec = parseInt(manualSec) || 0;
    const totalSec = min * 60 + sec;

    if (isNaN(km) || km <= 0) {
      alert("달린 거리를 0.01km 이상 입력해주세요.");
      return;
    }
    if (totalSec <= 0) {
      alert("걸린 시간을 입력해주세요.");
      return;
    }

    const paceStr = manualPace || "6:00";
    setIsSubmittingManual(true);

    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          distance: km,
          duration: totalSec,
          pace: paceStr,
          memo: manualMemo || "수동/나이키 앱 달리기 인증 완료!",
          date: manualDate,
          imageUrl: manualPhotoUrl || undefined,
          isManual: true,
          cadence: manualCadence ? parseInt(manualCadence) : undefined
        })
      });

      if (res.ok) {
        await fetchUsers();
        await fetchActivities();
        await fetchPosts();

        speakText(`수동 인증 완주 축하합니다! ${km}km 달성으로 스탬프가 적립되었습니다.`);
        triggerCelebration(`🎉 ${km}km 수동 달리기 인증 완료! 스탬프 획득!`);

        setManualKm("");
        setManualMin("");
        setManualSec("");
        setManualMemo("");
        setManualPhotoUrl(null);
        setManualPhotoName("");
        setTab("feed");
      } else {
        throw new Error("Server error");
      }
    } catch (e) {
      console.warn("Manual run submit offline fallback:", e);
      const db = getLocalDB();
      const userIndex = db.users.findIndex((u: any) => u.id === currentUser.id);
      if (userIndex !== -1) {
        const user = db.users[userIndex];
        user.totalDistance = parseFloat((user.totalDistance + km).toFixed(2));
        user.totalDuration += totalSec;
        user.stamps.push(`stamp-${Date.now()}`);

        if (!user.badges.includes("first-run")) user.badges.push("first-run");
        if (user.totalDistance >= 10 && !user.badges.includes("distance-10")) user.badges.push("distance-10");
        if (user.totalDistance >= 30 && !user.badges.includes("marathon-club")) user.badges.push("marathon-club");
        if (user.totalDistance >= 50 && !user.badges.includes("legend")) user.badges.push("legend");

        const calculatedLevel = Math.floor(user.totalDistance / 5) + 1;
        if (calculatedLevel > user.level) user.level = calculatedLevel;

        const runIsoDate = new Date(manualDate).toISOString();
        const activityId = `act-${Date.now()}`;
        const newAct = {
          id: activityId,
          userId: user.id,
          userName: user.name,
          grade: user.grade,
          date: runIsoDate,
          distance: km,
          duration: totalSec,
          pace: paceStr,
          memo: manualMemo || "수동/나이키 앱 달리기 인증 완료!",
          path: [],
          stampsEarned: 1,
          imageUrl: manualPhotoUrl || undefined,
          isManual: true
        };
        db.activities.unshift(newAct);

        const newPost = {
          id: `post-${Date.now()}`,
          userId: user.id,
          userName: user.name,
          grade: user.grade,
          content: `📱 수동 인증 러닝 | ${user.name} 님이 달리기를 완료했습니다!\n✨ 거리: ${km}km | 시간: ${min}분 ${sec}초 | 페이스: ${paceStr}/km\n💬 한마디: "${manualMemo || '수동 러닝 완료!'}"`,
          distance: km,
          duration: totalSec,
          pace: paceStr,
          likes: [],
          comments: [],
          date: runIsoDate,
          isRunRecord: true,
          imageUrl: manualPhotoUrl || undefined,
          isManual: true
        };
        db.posts.unshift(newPost);

        saveLocalDB(db);
        setCurrentUser(user);
        setUsers(db.users);
        setActivities(db.activities);
        setPosts(db.posts);

        speakText(`수동 인증 완주 축하합니다! ${km}km 달성으로 스탬프가 적립되었습니다.`);
        triggerCelebration(`🎉 ${km}km 수동 달리기 인증 완료! 스탬프 획득!`);

        setManualKm("");
        setManualMin("");
        setManualSec("");
        setManualMemo("");
        setManualPhotoUrl(null);
        setManualPhotoName("");
        setTab("feed");
      }
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Map Drawing Effect
  useEffect(() => {
    if (tab !== "run" || !mapContainerRef.current) return;

    // Check if map already exists, remove it
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultCoords = runPath.length > 0 ? runPath[runPath.length - 1] : [34.8988, 126.6025];

    try {
      // Create Map
      const map = L.map(mapContainerRef.current).setView(defaultCoords, 15);
      mapInstanceRef.current = map;

      // Add Tile Layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
      }).addTo(map);

      // Draw Polyline for route
      const polyline = L.polyline(runPath, {
        color: "#22c55e", // Emerald green athletic line
        weight: 6,
        opacity: 0.85,
        lineCap: "round"
      }).addTo(map);
      polylineInstanceRef.current = polyline;

      // Add current position marker
      const marker = L.circleMarker(defaultCoords, {
        radius: 8,
        fillColor: "#e11d48", // Rose Red sporty dot
        color: "#ffffff",
        weight: 3,
        fillOpacity: 1
      }).addTo(map);
      markerInstanceRef.current = marker;

      // Map scale
      L.control.scale().addTo(map);
    } catch (e) {
      console.error("Leaflet loading error", e);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [tab, isRunning]);

  // Update map polyline and center as runPath changes
  useEffect(() => {
    if (tab === "run" && mapInstanceRef.current && runPath.length > 0) {
      const lastPt = runPath[runPath.length - 1];
      if (polylineInstanceRef.current) {
        polylineInstanceRef.current.setLatLngs(runPath);
      }
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setLatLng(lastPt);
      }
      mapInstanceRef.current.panTo(lastPt);
    }
  }, [runPath, tab]);

  // Start Training Program with Voice Coaching
  const startTraining = (week: number, day: number, plan: PlanDay) => {
    if (trainingActive) stopTrainingAndCleanup();

    setActiveTraining({ week, day });
    setTrainingActive(true);
    setTrainingIndex(0);
    setTrainingTimer(plan.sequence[0].duration);
    setCoachingText(plan.sequence[0].text);

    const courseName = week === 1 ? "초급 5분 달리기 코스" : week === 2 ? "중급 30분 달리기 코스" : "고급 60분 달리기 코스";
    speakText(`어슬런데이 코칭 플랜, ${courseName} ${day}일차 트레이닝을 시작합니다. ${plan.sequence[0].text}`);

    trainingTimerRef.current = setInterval(() => {
      setTrainingTimer(prev => {
        if (prev <= 1) {
          // Go to next training segment
          setTrainingIndex(currIdx => {
            const nextIdx = currIdx + 1;
            if (nextIdx < plan.sequence.length) {
              const nextSegment = plan.sequence[nextIdx];
              setCoachingText(nextSegment.text);
              speakText(nextSegment.text);
              return nextIdx;
            } else {
              // Finished Training!
              clearInterval(trainingTimerRef.current);
              setTrainingActive(false);
              speakText("축하합니다! 오늘의 러닝 플랜을 무사히 완료하셨습니다. 엄청난 성장이군요!");
              triggerCelebration(`🏆 ${courseName} ${day}일차 트레이닝 완주 성공! 성과 스탬프가 추가됩니다.`);
              claimMissionReward("mission-2"); // Treat as frequency stamp completion
              return currIdx;
            }
          });
          // Next segment duration fallback
          const nextSegment = plan.sequence[trainingIndex + 1];
          return nextSegment ? nextSegment.duration : 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTrainingAndCleanup = () => {
    setTrainingActive(false);
    setActiveTraining(null);
    if (trainingTimerRef.current) clearInterval(trainingTimerRef.current);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Claim Mission Stamp reward
  const claimMissionReward = async (missionId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/missions/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, missionId })
      });
      if (!res.ok) throw new Error("API failed");
      triggerCelebration("💮 미션 완주 스탬프 발도장을 적립했습니다!");
      await fetchUsers();
      await fetchMissions();
    } catch (e) {
      console.warn("Using offline claim reward fallback:", e);
      const db = getLocalDB();
      const userIndex = db.users.findIndex(u => u.id === currentUser.id);
      const mission = db.missions.find(m => m.id === missionId);
      if (userIndex !== -1 && mission) {
        const user = db.users[userIndex];
        for (let i = 0; i < mission.rewardStamp; i++) {
          user.stamps.push(`mission-${missionId}-${Date.now()}-${i}`);
        }
        if (user.stamps.length >= 5 && !user.badges.includes("stamp-collector")) {
          user.badges.push("stamp-collector");
        }
        saveLocalDB(db);
        setCurrentUser(user);
        setUsers(db.users);
        triggerCelebration("💮 미션 완주 스탬프 발도장을 적립했습니다!");
      }
    }
  };

  // Submit Social Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newPostText.trim()) return;

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, content: newPostText })
      });
      if (!res.ok) throw new Error("API failed");
      setNewPostText("");
      await fetchPosts();
    } catch (e) {
      console.warn("Using offline handleCreatePost fallback:", e);
      const db = getLocalDB();
      const newPost = {
        id: `post-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        grade: currentUser.grade,
        content: newPostText,
        likes: [],
        comments: [],
        date: new Date().toISOString(),
        isRunRecord: false
      };
      db.posts.unshift(newPost);
      saveLocalDB(db);
      setPosts(db.posts);
      setNewPostText("");
    }
  };

  // Submit teacher praise and stamp award
  const handleTeacherAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherStudentId) return;

    setIsSubmittingTeacherAward(true);
    try {
      const res = await fetch("/api/teacher/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedTeacherStudentId,
          teacherMemo: teacherMemoText,
          awardStampCount: teacherStampsCount
        })
      });

      if (!res.ok) throw new Error("API failed");

      const student = users.find(u => u.id === selectedTeacherStudentId);
      const studentName = student ? student.name : "학생";
      speakText(`${studentName} 학생에게 칭찬 배달 완료! 스탬프 ${teacherStampsCount}개를 선물했습니다.`);
      triggerCelebration(`🧑‍🏫 ${studentName} 학생에게 칭찬과 스탬프 ${teacherStampsCount}개 선물 완료!`);
      setTeacherMemoText("");
      setTeacherStampsCount(1);
      setSelectedTeacherStudentId("");
      
      // Refresh data
      await fetchUsers();
      await fetchPosts();
      await fetchActivities();
    } catch (e) {
      console.warn("Using offline teacher award fallback:", e);
      const db = getLocalDB();
      const userIndex = db.users.findIndex(u => u.id === selectedTeacherStudentId);
      if (userIndex !== -1) {
        const user = db.users[userIndex];
        const count = parseInt(teacherStampsCount as any) || 1;
        for (let i = 0; i < count; i++) {
          user.stamps.push(`teacher-${Date.now()}-${i}`);
        }
        if (user.stamps.length >= 5 && !user.badges.includes("stamp-collector")) {
          user.badges.push("stamp-collector");
        }

        const postContent = `📢 [선생님의 칭찬 선물] 🌟 담임 선생님이 ${user.name} 학생에게 칭찬 발도장 스탬프 ${count}개와 따뜻한 격려를 보냈습니다!\n\n💬 "${teacherMemoText || '항상 성실하게 어슬런데이에 참여하는 모습이 매우 기특합니다. 앞으로도 한 걸음 한 걸음 기쁘게 달려보아요!'}"`;
        const newPost = {
          id: `post-teacher-${Date.now()}`,
          userId: "teacher",
          userName: "담임 선생님 🧑‍🏫",
          grade: 0,
          content: postContent,
          likes: [],
          comments: [],
          date: new Date().toISOString(),
          isRunRecord: false
        };
        db.posts.unshift(newPost);
        saveLocalDB(db);

        speakText(`${user.name} 학생에게 칭찬 배달 완료! 스탬프 ${count}개를 선물했습니다.`);
        triggerCelebration(`🧑‍🏫 ${user.name} 학생에게 칭찬과 스탬프 ${count}개 선물 완료!`);

        setTeacherMemoText("");
        setTeacherStampsCount(1);
        setSelectedTeacherStudentId("");

        setUsers(db.users);
        setPosts(db.posts);
      }
    } finally {
      setIsSubmittingTeacherAward(false);
    }
  };

  // Like Post
  const handleLikePost = async (postId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      if (!res.ok) throw new Error("API failed");
      await fetchPosts();
    } catch (e) {
      console.warn("Using offline like post fallback:", e);
      const db = getLocalDB();
      const post = db.posts.find(p => p.id === postId);
      if (post) {
        const idx = post.likes.indexOf(currentUser.id);
        if (idx === -1) {
          post.likes.push(currentUser.id);
        } else {
          post.likes.splice(idx, 1);
        }
        saveLocalDB(db);
        setPosts(db.posts);
      }
    }
  };

  // Submit Comment
  const handleAddComment = async (postId: string) => {
    if (!currentUser || !postCommentText[postId]?.trim()) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, text: postCommentText[postId] })
      });
      if (!res.ok) throw new Error("API failed");
      setPostCommentText(prev => ({ ...prev, [postId]: "" }));
      await fetchPosts();
    } catch (e) {
      console.warn("Using offline add comment fallback:", e);
      const db = getLocalDB();
      const post = db.posts.find(p => p.id === postId);
      if (post) {
        const newComment = {
          id: `comment-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          text: postCommentText[postId],
          date: new Date().toISOString()
        };
        post.comments.push(newComment);
        saveLocalDB(db);
        setPosts(db.posts);
        setPostCommentText(prev => ({ ...prev, [postId]: "" }));
      }
    }
  };

  // Request Gemini AI Personal Report Analysis
  const requestAiAnalysis = async () => {
    if (!currentUser) return;
    setIsGeneratingAi(true);
    setAiReport("");

    const loadingMessages = [
      "최근 달리기 데이터를 집계하고 있습니다...",
      "나주 동강 날씨와 달리기 흔적을 분석하는 중입니다...",
      "어슬런 코치 AI가 주간 일정을 검토하고 격려를 작성하고 있어요...",
      "마지막 꿀팁을 조율하는 중입니다. 조금만 기다려주세요!"
    ];

    let msgIdx = 0;
    setAiLoadingMessage(loadingMessages[0]);
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % loadingMessages.length;
      setAiLoadingMessage(loadingMessages[msgIdx]);
    }, 2500);

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      const data = await res.json();
      if (data.analysis) {
        setAiReport(data.analysis);
      }
    } catch (e) {
      console.error(e);
      setAiReport("코치 분석을 가져오는 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      clearInterval(msgInterval);
      setIsGeneratingAi(false);
    }
  };

  // Visual Path Preview inside Feed cards using canvas instead of heavy leafelt instances for multiple items
  const drawFeedPathCanvas = (canvas: HTMLCanvasElement | null, path: [number, number][] | undefined) => {
    if (!canvas || !path || path.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Draw background grid
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 1;
    for (let i = 20; i < w; i += 20) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
    }

    // Coordinates bounding box
    const lats = path.map(p => p[0]);
    const lngs = path.map(p => p[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = maxLat - minLat || 0.001;
    const lngRange = maxLng - minLng || 0.001;

    // Project coordinates to fit canvas with padding
    const padding = 20;
    const project = (lat: number, lng: number) => {
      const x = padding + ((lng - minLng) / lngRange) * (w - padding * 2);
      // Invert Y for canvas
      const y = h - (padding + ((lat - minLat) / latRange) * (h - padding * 2));
      return { x, y };
    };

    // Draw track line
    ctx.strokeStyle = "#22c55e"; // Energetic Green
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    const start = project(path[0][0], path[0][1]);
    ctx.moveTo(start.x, start.y);

    for (let i = 1; i < path.length; i++) {
      const pt = project(path[i][0], path[i][1]);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();

    // Draw start dot
    ctx.fillStyle = "#e11d48"; // Rose Start
    ctx.beginPath();
    ctx.arc(start.x, start.y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw end dot
    const end = project(path[path.length - 1][0], path[path.length - 1][1]);
    ctx.fillStyle = "#3b82f6"; // Blue end
    ctx.beginPath();
    ctx.arc(end.x, end.y, 6, 0, Math.PI * 2);
    ctx.fill();
  };

  // Convert seconds to readable format (HH:MM:SS)
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [
      hrs > 0 ? hrs : null,
      mins < 10 && hrs > 0 ? "0" + mins : mins,
      secs < 10 ? "0" + secs : secs
    ].filter(v => v !== null).join(":");
  };

  // Level badge generator
  const getLevelColor = (level: number) => {
    if (level < 3) return "bg-gray-100 text-gray-700";
    if (level < 5) return "bg-emerald-100 text-emerald-800";
    if (level < 7) return "bg-amber-100 text-amber-800 border border-amber-300";
    return "bg-rose-100 text-rose-800 border-2 border-rose-400 font-extrabold animate-pulse";
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-emerald-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
        {/* Confetti also visible on login success transition */}
        <AnimatePresence>
          {showConfetti && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-extrabold px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 border border-lime-400"
            >
              <Sparkles className="animate-spin text-yellow-300" size={24} />
              <span className="text-sm md:text-base">{confettiMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {renderTeacherPasswordModal()}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 text-slate-100"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-lime-400 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-900/30">
              <Activity size={28} className="animate-pulse" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-400 to-lime-300 bg-clip-text text-transparent">
              어슬런데이 <span className="text-sm font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 align-middle">동강중</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              나주동강중학교 전교생 러닝 클럽 • 달리기 인증 및 칭찬 스탬프
            </p>
          </div>

          {/* Tab buttons for Grade / Guest selection */}
          <div className="flex bg-slate-950 p-1.5 rounded-2xl gap-1 border border-slate-800 flex-wrap">
            {[1, 2, 3].map((g) => (
              <button
                key={g}
                onClick={() => setLoginGradeTab(g)}
                className={`flex-1 min-w-[60px] py-2 text-xs font-black rounded-xl transition cursor-pointer ${
                  loginGradeTab === g
                    ? "bg-emerald-500 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-400 hover:text-slate-100"
                }`}
              >
                {g}학년
              </button>
            ))}
            <button
              onClick={() => setLoginGradeTab("staff")}
              className={`flex-1 min-w-[70px] py-2 text-xs font-black rounded-xl transition cursor-pointer ${
                loginGradeTab === "staff"
                  ? "bg-indigo-500 text-white shadow-md font-extrabold"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              🧑‍🏫 교직원
            </button>
            <button
              onClick={() => setLoginGradeTab("guest")}
              className={`flex-1 min-w-[70px] py-2 text-xs font-black rounded-xl transition cursor-pointer ${
                loginGradeTab === "guest"
                  ? "bg-slate-800 text-white shadow-md font-extrabold"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              👤 게스트
            </button>
          </div>

          {/* Students Grid or Guest Input */}
          <div className="min-h-[220px]">
            {loginGradeTab !== "guest" ? (
              <div className="space-y-3">
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex justify-between items-center px-1">
                  <span>
                    {loginGradeTab === "staff"
                      ? "교직원을 선택하세요 (가나다순)"
                      : `${loginGradeTab}학년 학생을 선택하세요 (가나다순)`}
                  </span>
                  <span className="text-emerald-400 font-bold font-mono">
                    {users.filter(u => u.grade === (loginGradeTab === "staff" ? 4 : loginGradeTab)).length}명 등록됨
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[...users]
                    .filter((u) => u.grade === (loginGradeTab === "staff" ? 4 : loginGradeTab))
                    .sort((a, b) => a.name.localeCompare(b.name, "ko"))
                    .map((student) => {
                      const getStaffGreeting = (name: string) => {
                        if (["교장", "행정실장", "교무행정사"].includes(name)) {
                          return `${name}님`;
                        }
                        return `${name} 선생님`;
                      };
                      return (
                        <button
                          key={student.id}
                          onClick={() => {
                            localStorage.setItem("easurun_user_id", student.id);
                            setCurrentUser(student);
                            if (loginGradeTab === "staff") {
                              speakText(`${getStaffGreeting(student.name)}, 어슬런데이에 오신 것을 환영합니다! 오늘 하루도 기분 좋게 뛰어보세요!`);
                              triggerCelebration(`🧑‍🏫 교직원 ${getStaffGreeting(student.name)}으로 로그인되었습니다!`);
                            } else {
                              speakText(`${student.name} 학생, 어슬런데이에 오신 것을 환영합니다! 오늘 하루도 파이팅!`);
                              triggerCelebration(`🏫 ${student.grade}학년 ${student.name} 학생으로 로그인되었습니다!`);
                            }
                          }}
                          className={`p-3 border rounded-xl text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 shadow-sm ${
                            loginGradeTab === "staff"
                              ? "bg-indigo-950/40 hover:bg-indigo-500 hover:text-white border-indigo-900 hover:border-indigo-400"
                              : "bg-slate-800/60 hover:bg-emerald-500 hover:text-slate-950 border-slate-800 hover:border-emerald-400"
                          }`}
                        >
                          <span className="text-sm font-black text-slate-100 hover:text-inherit">{student.name}</span>
                          <span className="text-[9px] opacity-75 font-bold font-mono">
                            Lv.{student.level} | {student.totalDistance}km
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-sm mx-auto py-4">
                <div className="space-y-1 text-center">
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                    GUEST PORTAL
                  </span>
                  <h4 className="text-sm font-black text-slate-200">외부 사용자 및 게스트 이름 입력</h4>
                  <p className="text-[11px] text-slate-400">자신의 이름을 기입하면 스탬프 및 러닝 데이터를 별도 기록·저장할 수 있습니다.</p>
                </div>
                <input
                  type="text"
                  value={guestNameInput}
                  onChange={(e) => setGuestNameInput(e.target.value)}
                  placeholder="본인의 이름을 입력하세요 (예: 박민재)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-white focus:ring-2 focus:ring-indigo-400 focus:outline-none placeholder:text-slate-600 text-center"
                />
                <button
                  onClick={async () => {
                    const name = guestNameInput.trim();
                    if (!name) return;
                    setIsLoggingInGuest(true);
                    const displayName = `${name} (게스트)`;
                    try {
                      const res = await fetch("/api/users", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: name, grade: 0 })
                      });
                      if (!res.ok) throw new Error("API failed");
                      const user = await res.json();
                      localStorage.setItem("easurun_user_id", user.id);
                      setCurrentUser(user);
                      fetchUsers(); // Refresh list
                      speakText(`${user.name} 게스트님, 환영합니다! 어슬런데이에서 오늘 한번 멋지게 뛰어보세요.`);
                      triggerCelebration(`👤 게스트 ${user.name}님으로 로그인되었습니다!`);
                    } catch (e) {
                      console.warn("Using offline guest registration fallback:", e);
                      const db = getLocalDB();
                      let existingUser = db.users.find(u => u.name === displayName);
                      if (!existingUser) {
                        existingUser = {
                          id: `guest-${Date.now()}`,
                          name: displayName,
                          grade: 0,
                          totalDistance: 0,
                          totalDuration: 0,
                          level: 1,
                          stamps: [],
                          badges: []
                        };
                        db.users.push(existingUser);
                        saveLocalDB(db);
                      }
                      localStorage.setItem("easurun_user_id", existingUser.id);
                      setCurrentUser(existingUser);
                      setUsers(db.users);
                      speakText(`${existingUser.name} 게스트님, 환영합니다! 어슬런데이에서 오늘 한번 멋지게 뛰어보세요.`);
                      triggerCelebration(`👤 게스트 ${existingUser.name}님으로 로그인되었습니다!`);
                    } finally {
                      setIsLoggingInGuest(false);
                    }
                  }}
                  disabled={isLoggingInGuest || !guestNameInput.trim()}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-black text-xs py-3 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isLoggingInGuest ? "입장 중..." : "게스트로 어슬런 시작하기 🏃‍♂️"}
                </button>
              </div>
            )}
          </div>

          {/* Teacher Bypass link */}
          <div className="pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-bold">나주동강중학교 어슬런 관리시스템 v2.1</span>
            <button
              onClick={() => {
                setShowTeacherPasswordModal(true);
                setTeacherPasswordInput("");
                setTeacherPasswordError("");
              }}
              className="text-slate-400 hover:text-emerald-400 font-black transition flex items-center gap-1 cursor-pointer"
            >
              🧑‍🏫 교사 관리실 바로가기
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12 flex flex-col selection:bg-emerald-100">
      
      {/* Dynamic Celebration Modal Overlay */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-extrabold px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 border border-lime-400"
          >
            <Sparkles className="animate-spin text-yellow-300" size={24} />
            <span className="text-sm md:text-base">{confettiMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {renderTeacherPasswordModal()}

      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          
          {/* Logo Vibe */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-lime-400 flex items-center justify-center text-white shadow-md shadow-emerald-200">
              <Activity size={22} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 font-sans flex items-center gap-1">
                어슬런데이 <span className="text-emerald-500 text-xs px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 font-bold">동강중</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">나주동강중학교 전교생 & 교직원 러닝 클럽 🏃‍♂️</p>
            </div>
          </div>

          {/* Active User session details and logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVercelGuideModal(true)}
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-black px-2.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <HelpCircle size={14} className="text-amber-600" />
              <span>🔑 카톡 공유시 로그인 없애기</span>
            </button>

            {currentUser && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-black px-3 py-2 rounded-xl shadow-sm">
                  <Smile size={14} />
                  <span>{currentUser.name} {currentUser.id === "teacher" ? "" : "접속 중"}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-black px-2.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1"
                >
                  <span>사용자 변경</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Primary Tab Bar Menu */}
      <div className="bg-slate-950 text-white py-1.5 px-2">
        <div className="max-w-4xl mx-auto flex justify-between overflow-x-auto gap-1 no-scrollbar text-xs md:text-sm">
          <button
            id="tab_home"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition font-bold shrink-0 ${tab === "home" ? "bg-emerald-500 text-slate-950 font-black shadow-lg" : "hover:bg-slate-900 text-slate-300"}`}
            onClick={() => setTab("home")}
          >
            <Smile size={16} />
            <span>어슬런 홈</span>
          </button>
          <button
            id="tab_run"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition font-bold shrink-0 ${tab === "run" ? "bg-emerald-500 text-slate-950 font-black shadow-lg animate-pulse" : "hover:bg-slate-900 text-slate-300"}`}
            onClick={() => setTab("run")}
          >
            <Compass size={16} />
            <span>실시간 GPS 러닝</span>
          </button>
          <button
            id="tab_plan"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition font-bold shrink-0 ${tab === "plan" ? "bg-emerald-500 text-slate-950 font-black shadow-lg" : "hover:bg-slate-900 text-slate-300"}`}
            onClick={() => setTab("plan")}
          >
            <Clock size={16} />
            <span>초보자 코칭플랜</span>
          </button>
          <button
            id="tab_ranking"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition font-bold shrink-0 ${tab === "ranking" ? "bg-emerald-500 text-slate-950 font-black shadow-lg" : "hover:bg-slate-900 text-slate-300"}`}
            onClick={() => setTab("ranking")}
          >
            <Trophy size={16} />
            <span>동강 랭킹</span>
          </button>
          <button
            id="tab_feed"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition font-bold shrink-0 ${tab === "feed" ? "bg-emerald-500 text-slate-950 font-black shadow-lg" : "hover:bg-slate-900 text-slate-300"}`}
            onClick={() => setTab("feed")}
          >
            <Users size={16} />
            <span>어슬런 피드</span>
          </button>
          <button
            id="tab_report"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition font-bold shrink-0 ${tab === "report" ? "bg-emerald-500 text-slate-950 font-black shadow-lg" : "hover:bg-slate-900 text-slate-300"}`}
            onClick={() => setTab("report")}
          >
            <Award size={16} />
            <span>건강 리포트</span>
          </button>
          <button
            id="tab_teacher"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition font-bold shrink-0 ${tab === "teacher" ? "bg-indigo-600 text-white font-black shadow-lg" : "hover:bg-slate-900 text-slate-300"}`}
            onClick={() => {
              if (currentUser?.id === "teacher") {
                setTab("teacher");
              } else {
                setShowTeacherPasswordModal(true);
                setTeacherPasswordInput("");
                setTeacherPasswordError("");
              }
            }}
          >
            <Database size={16} />
            <span className="flex items-center gap-0.5">교사 관리</span>
          </button>
        </div>
      </div>

      {/* Main Container Content */}
      <main className="max-w-4xl mx-auto px-4 mt-6 w-full flex-grow">
        
        {/* TAB 1: 어슬런 홈 */}
        {tab === "home" && currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Dynamic Card Greeting */}
            <div className="bg-gradient-to-r from-emerald-500 to-lime-500 text-slate-950 p-6 rounded-3xl shadow-lg border border-lime-300 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
                <Activity size={180} />
              </div>
              <div className="relative z-10 space-y-2">
                <span className="text-xs font-extrabold bg-slate-950 text-emerald-400 px-3 py-1 rounded-full uppercase tracking-wider">
                  TODAY RUNNING
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  안녕, {currentUser.name}! 👟
                </h2>
                <div className="space-y-2 max-w-xl">
                  <div className="bg-slate-950/20 backdrop-blur-xs p-3.5 rounded-2xl border border-white/25 text-slate-950">
                    <p className="text-sm md:text-base font-black tracking-tight leading-relaxed">
                      💬 "땀흘려라 바람불면 시원하다, 그것은 바로 <span className="underline decoration-wavy decoration-emerald-950 underline-offset-4">땀바불시</span>!"
                    </p>
                    <p className="text-xs md:text-sm font-extrabold mt-1 text-emerald-950 opacity-90 leading-relaxed">
                      🏃‍♂️ 달리기든 인생이든, 꾸준함은 재능을 이긴다. 빠르게가 아니라 오래, 남보다가 아니라 나답게 !!!
                    </p>
                  </div>
                  <p className="text-xs md:text-sm font-bold opacity-90 leading-relaxed">
                    💡 오늘 하루도 나만의 페이스로 가볍게 시작해보세요! 땀 흘린 뒤의 상쾌한 바람이 우리를 기다립니다.
                  </p>
                </div>
                <div className="pt-3 flex flex-wrap gap-2 text-xs font-bold">
                  <span className="bg-slate-950 text-white px-3 py-1.5 rounded-xl">
                    🔥 누적 거리: {currentUser.totalDistance} km
                  </span>
                  <span className="bg-slate-950 text-white px-3 py-1.5 rounded-xl">
                    💮 스탬프: {currentUser.stamps.length} 개 획득
                  </span>
                  <span className="bg-slate-950 text-white px-3 py-1.5 rounded-xl">
                    ⭐ 소속: {getGradeLabel(currentUser.grade)}
                  </span>
                </div>
              </div>
            </div>

            {/* Stamp Collection Board: Highly Requested for Student Motivation */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                    💮 어슬런 스탬프 북 <span className="text-xs text-slate-400 font-bold">(동기부여 보드)</span>
                  </h3>
                  <p className="text-xs text-slate-500">러닝 완료 및 미션 달성 시 스탬프를 가득 채우세요!</p>
                </div>
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {currentUser.stamps.length} / 10 Stamp
                </span>
              </div>

              {/* 10 Stamp Grid slots */}
              <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const isEarned = idx < currentUser.stamps.length;
                  return (
                    <div
                      key={idx}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition border-2 ${
                        isEarned
                          ? "bg-rose-50 border-rose-300 text-rose-600 scale-105 shadow-sm"
                          : "bg-slate-50 border-dashed border-slate-200 text-slate-300"
                      }`}
                    >
                      {isEarned ? (
                        <>
                          <span className="text-xl md:text-2xl animate-bounce">💮</span>
                          <span className="text-[9px] font-black absolute bottom-1 text-rose-500">참 잘했어요</span>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">{idx + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grid Layout: Active Weekly Missions & Selected Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Weekly Missions */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                <div className="mb-4">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                    🎯 이번 주 어슬런 미션
                  </h3>
                  <p className="text-xs text-slate-500">목표 달성 시 클릭해 스탬프 도장을 획득하세요!</p>
                </div>

                <div className="space-y-3 flex-grow">
                  {missions.map(mission => {
                    // Check if criteria met
                    let progress = 0;
                    let isCompleted = false;

                    if (mission.type === "distance") {
                      progress = currentUser.totalDistance;
                      isCompleted = progress >= mission.goal;
                    } else if (mission.type === "count") {
                      // Number of runs in activities for this user
                      const runCount = activities.filter(a => a.userId === currentUser.id).length;
                      progress = runCount;
                      isCompleted = progress >= mission.goal;
                    } else if (mission.type === "pace") {
                      // Pace is complex; simulate success if user has level >= 4
                      progress = currentUser.level;
                      isCompleted = currentUser.level >= 4;
                    }

                    return (
                      <div
                        key={mission.id}
                        className={`p-3.5 rounded-2xl border transition ${
                          isCompleted ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50/80 border-slate-100"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-800">{mission.title}</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{mission.description}</p>
                          </div>
                          <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                            +{mission.rewardStamp} Stamp
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                            <span>진행 상황</span>
                            <span>{Math.min(progress, mission.goal).toFixed(1)} / {mission.goal} {mission.type === "count" ? "회" : "km"}</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((progress / mission.goal) * 100, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Claim Stamp button */}
                        {isCompleted && (
                          <button
                            onClick={() => claimMissionReward(mission.id)}
                            className="mt-3 w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-1.5 rounded-xl text-xs shadow-sm transition"
                          >
                            💮 미션 완료 스탬프 도장 찍기
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Badges showcase preview */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="mb-4">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                      🏆 {currentUser.name}의 성취 배지
                    </h3>
                    <p className="text-xs text-slate-500">성장하면서 얻은 반짝이는 러닝 훈장들입니다.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(BADGE_INFO).map(([key, value]) => {
                      const isUnlocked = currentUser.badges.includes(key);
                      return (
                        <div
                          key={key}
                          className={`p-3 rounded-2xl border flex items-center gap-2.5 transition ${
                            isUnlocked
                              ? value.color
                              : "bg-slate-50 border-slate-200 opacity-40 grayscale"
                          }`}
                        >
                          <span className="text-2xl">{value.icon}</span>
                          <div>
                            <h4 className="text-xs font-black">{value.name}</h4>
                            <p className="text-[9px] font-medium leading-tight mt-0.5">{value.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">레벨을 올려 배지를 더 잠금 해제하세요!</span>
                  <button
                    onClick={() => setTab("report")}
                    className="text-xs font-extrabold text-emerald-600 flex items-center gap-0.5 hover:underline"
                  >
                    <span>자세히 보기</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: 실시간 Geolocation 러닝 & 수동 기록 인증 */}
        {tab === "run" && currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Run Mode Switcher */}
            <div className="flex bg-slate-200/70 p-1.5 rounded-2xl border border-slate-300/80 shadow-inner">
              <button
                type="button"
                onClick={() => setRunMode("gps")}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
                  runMode === "gps"
                    ? "bg-white text-slate-950 shadow border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Compass size={16} className={runMode === "gps" ? "text-emerald-500" : ""} />
                <span>🛰️ GPS 실시간 러닝 & 시뮬레이터</span>
              </button>
              <button
                type="button"
                onClick={() => setRunMode("manual")}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
                  runMode === "manual"
                    ? "bg-white text-slate-950 shadow border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Smartphone size={16} className={runMode === "manual" ? "text-emerald-500" : ""} />
                <span>📱 수동 기록 & 인증 사진 등록</span>
              </button>
            </div>

            {/* MODE 1: GPS 실시간 러너 */}
            {runMode === "gps" && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <Compass className="text-emerald-500 animate-spin" size={24} />
                      실시간 어슬런 고정밀 GPS 러너
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      GPS 노이즈 및 위치 튐 방지 필터가 적용되어 정확하게 측정됩니다.
                    </p>
                  </div>

                  {/* Tracking simulation toggle for standard desktop inside sandbox iframe */}
                  <div className="flex items-center gap-3 bg-slate-100 px-3 py-2 rounded-2xl border border-slate-200">
                    <span className="text-xs font-black text-slate-700">📍 코스 시뮬레이터:</span>
                    <button
                      onClick={() => {
                        if (isRunning) return;
                        setGpsSimulated(!gpsSimulated);
                      }}
                      disabled={isRunning}
                      className={`text-xs font-extrabold px-3 py-1 rounded-xl transition ${
                        gpsSimulated
                          ? "bg-emerald-500 text-slate-950 shadow-sm"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {gpsSimulated ? "시뮬레이터 활성" : "실제 GPS 활성"}
                    </button>
                  </div>
                </div>

                {/* Main Map Box */}
                <div className="relative">
                  <div
                    id="map-canvas-container"
                    ref={mapContainerRef}
                    className="w-full h-80 md:h-96 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden z-10"
                  />

                  {/* Live Stats Overlay during Run */}
                  {isRunning && (
                    <div className="absolute top-4 left-4 z-20 bg-slate-950/90 backdrop-blur-md text-white p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3 min-w-[200px]">
                      <div className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                        LIVE TRACKING DATA
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-2xl font-black text-lime-400 font-mono tracking-tight">
                            {runDistance.toFixed(2)} <span className="text-xs">km</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold mt-0.5">거리 측정</div>
                        </div>

                        <div>
                          <div className="text-xl font-black font-mono text-white">
                            {formatTime(runDuration)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold mt-0.5">경과 시간</div>
                        </div>

                        <div>
                          <div className="text-base font-black font-mono text-amber-400">
                            {(() => {
                              if (runDistance <= 0.005) return "0:00";
                              const minsDecimal = runDuration / 60;
                              const paceMin = Math.floor(minsDecimal / runDistance);
                              const paceSec = Math.round(((minsDecimal / runDistance) % 1) * 60);
                              return `${paceMin}:${paceSec < 10 ? "0" + paceSec : paceSec}`;
                            })()}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold">평균 페이스 (/km)</div>
                        </div>

                        <div>
                          <div className="text-base font-black font-mono text-cyan-400 flex items-center gap-1">
                            <Footprints size={14} />
                            <span>{runCadence || 165}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold">케이던스 (SPM)</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Lap Split Times Table */}
                {isRunning && runLaps.length > 0 && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <ListOrdered size={16} className="text-emerald-600" />
                      <span>1km 구간별 Lap 기록</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {runLaps.map(lap => (
                        <div key={lap.km} className="bg-white p-2.5 rounded-xl border border-slate-200 text-center shadow-2xs">
                          <span className="text-[10px] text-slate-400 font-bold block">{lap.km} km 구간</span>
                          <span className="text-sm font-black text-slate-900 font-mono">{lap.pace} /km</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Run Controller and Audio Coacher Control */}
                <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    
                    {/* Voice Coacher Guide setup */}
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => setVoiceCoachingEnabled(!voiceCoachingEnabled)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border transition ${
                          voiceCoachingEnabled
                            ? "bg-emerald-100 border-emerald-300 text-emerald-600 shadow-sm"
                            : "bg-slate-100 border-slate-200 text-slate-400"
                        }`}
                      >
                        {voiceCoachingEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                      </button>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800">보이스 코칭 동시 안내</h4>
                        <p className="text-[10px] text-slate-500">Runday식 힘나는 음성 코칭을 들으며 달립니다.</p>
                      </div>
                    </div>

                    {/* Core Action triggers */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                      {!isRunning ? (
                        <button
                          onClick={startRunning}
                          className="w-full md:w-44 bg-gradient-to-r from-emerald-500 to-lime-500 text-slate-950 font-black py-3 px-6 rounded-2xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                        >
                          <Play size={18} fill="currentColor" />
                          <span>달리기 시작!</span>
                        </button>
                      ) : (
                        <>
                          {isPaused ? (
                            <button
                              onClick={resumeRunning}
                              className="bg-emerald-500 text-slate-950 font-black py-2.5 px-5 rounded-2xl shadow-sm hover:bg-emerald-600 transition text-xs md:text-sm"
                            >
                              다시 계속하기
                            </button>
                          ) : (
                            <button
                              onClick={pauseRunning}
                              className="bg-amber-500 text-slate-950 font-black py-2.5 px-5 rounded-2xl shadow-sm hover:bg-amber-600 transition text-xs md:text-sm"
                            >
                              일시 정지
                            </button>
                          )}
                          <button
                            onClick={stopRunningAndCleanup}
                            className="bg-slate-200 text-slate-700 font-bold py-2.5 px-5 rounded-2xl shadow-sm hover:bg-slate-300 transition text-xs md:text-sm"
                          >
                            운동 포기
                          </button>
                        </>
                      )}
                    </div>

                  </div>
                </div>

                {/* Save Run Form: Unlocked after some running distance */}
                {isRunning && runDistance >= 0.05 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-6 border-t border-slate-100 pt-6 space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-black text-slate-800 mb-1.5">
                        ✏️ 오늘 러닝 완료 한마디 (피드 공유)
                      </label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white"
                        placeholder="예) 오늘 땀 흘리고 바람 맞으니 짱 시원하네! 미션 완료해서 기분 좋다!"
                        value={runMemo}
                        onChange={(e) => setRunMemo(e.target.value)}
                      />
                    </div>

                    <button
                      onClick={submitRunningRecord}
                      disabled={isSubmittingRun}
                      className="w-full bg-slate-950 hover:bg-slate-900 text-emerald-400 font-extrabold py-3.5 rounded-2xl shadow-md transition flex items-center justify-center gap-2"
                    >
                      {isSubmittingRun ? (
                        <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 size={18} />
                          <span>러닝 완주 & 피드 기록 제출하기</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                )}

              </div>
            )}

            {/* MODE 2: 수동 기록 직접 입력 & 가민/NRC GPX 파일 가져오기 */}
            {runMode === "manual" && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <Camera className="text-emerald-500" size={24} />
                      수동 기록 & 가민/NRC 파일 연동
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      나이키 러닝 클럽(NRC), 가민 워치(Garmin), 애플워치, 런닝머신 기록 및 인증 사진을 등록하세요.
                    </p>
                  </div>

                  {/* Garmin/NRC Integration Guide Modal Open Button */}
                  <button
                    type="button"
                    onClick={() => setShowGpxGuideModal(true)}
                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-extrabold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0"
                  >
                    <Watch size={16} />
                    <span>⌚ 가민 & 나이키 연동 방법</span>
                  </button>
                </div>

                {/* GPX File Drop Zone for Garmin / NRC auto import */}
                <div className="bg-slate-50 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-5 text-center space-y-2 transition">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 font-black text-xs">
                    <Upload size={18} />
                    <span>⌚ 가민(Garmin) / 나이키(NRC) GPX 파일 자동 업로드</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    가민 커넥트나 나이키 앱에서 내보낸 <span className="font-bold text-slate-700">.gpx</span> 파일을 첨부하면 거리, 시간, 페이스가 자동으로 입력됩니다!
                  </p>
                  <label className="inline-block bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer transition shadow-sm">
                    <span>GPX 파일 선택하기</span>
                    <input
                      type="file"
                      accept=".gpx"
                      className="hidden"
                      onChange={handleGpxFileUpload}
                    />
                  </label>
                  {gpxFileName && (
                    <div className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1 mt-1">
                      <CheckCircle2 size={14} />
                      <span>불러온 파일: {gpxFileName}</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleManualRunSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 달린 날짜 */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1">
                        <Calendar size={14} className="text-emerald-600" />
                        <span>달린 날짜</span>
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white"
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                      />
                    </div>

                    {/* 달린 거리 (km) */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1">
                        <Flame size={14} className="text-amber-500" />
                        <span>달린 거리 (km)</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        max="100"
                        required
                        placeholder="예) 3.5"
                        className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white"
                        value={manualKm}
                        onChange={(e) => setManualKm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* 걸린 시간 & 평균 페이스 & 케이던스 */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* 분 */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1">
                        <Clock size={14} className="text-blue-500" />
                        <span>걸린 시간 (분)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="500"
                        required
                        placeholder="예) 20"
                        className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white"
                        value={manualMin}
                        onChange={(e) => setManualMin(e.target.value)}
                      />
                    </div>

                    {/* 초 */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1">
                        <Clock size={14} className="text-blue-400" />
                        <span>걸린 시간 (초)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        placeholder="예) 30"
                        className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white"
                        value={manualSec}
                        onChange={(e) => setManualSec(e.target.value)}
                      />
                    </div>

                    {/* 평균 페이스 (자동 계산 / 수정 가능) */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1">
                        <TrendingUp size={14} className="text-purple-500" />
                        <span>평균 페이스 (/km)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="자동 계산 (예: 5:45)"
                        className="w-full bg-slate-100 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        value={manualPace}
                        onChange={(e) => setManualPace(e.target.value)}
                      />
                    </div>

                    {/* 케이던스 SPM */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1">
                        <Footprints size={14} className="text-cyan-600" />
                        <span>케이던스 (SPM)</span>
                      </label>
                      <input
                        type="number"
                        placeholder="예) 165"
                        className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white"
                        value={manualCadence}
                        onChange={(e) => setManualCadence(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* 인증 사진 업로드 */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Camera size={14} className="text-emerald-500" />
                        <span>달리기 인증 사진 업로드 (나이키 앱 스크린샷 / 계기판 / 인증샷)</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">선택 사항</span>
                    </label>

                    {manualPhotoUrl ? (
                      <div className="relative rounded-2xl border-2 border-emerald-400 bg-slate-900 p-3 flex flex-col items-center justify-center">
                        <img
                          src={manualPhotoUrl}
                          alt="인증 사진 미리보기"
                          className="max-h-60 rounded-xl object-contain"
                        />
                        <div className="mt-2 flex items-center justify-between w-full text-xs text-white px-2">
                          <span className="truncate max-w-[200px] font-bold">{manualPhotoName || "인증사진.png"}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setManualPhotoUrl(null);
                              setManualPhotoName("");
                            }}
                            className="bg-rose-500 hover:bg-rose-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            <X size={14} />
                            <span>삭제</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition text-center">
                        <Upload size={32} className="text-slate-400 mb-2" />
                        <span className="text-xs font-black text-slate-700">클릭하여 인증 사진 첨부하기</span>
                        <span className="text-[10px] text-slate-400 mt-1">나이키 러닝 클럽 스크린샷, 런닝머신 계기판, 운동장 인증샷 등</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleManualPhotoUpload}
                        />
                      </label>
                    )}
                  </div>

                  {/* 소감 한마디 */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1">
                      <Smile size={14} className="text-amber-500" />
                      <span>오늘 달리기의 한마디 & 소감 (피드 공유)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="예) 초등학교 운동장 10바퀴 완주! 상쾌한 바람 맞으며 달렸어요."
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white resize-none"
                      value={manualMemo}
                      onChange={(e) => setManualMemo(e.target.value)}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmittingManual}
                    className="w-full bg-slate-950 hover:bg-slate-900 text-emerald-400 font-extrabold py-3.5 rounded-2xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    {isSubmittingManual ? (
                      <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        <span>📸 수동 기록 & 인증 사진 제출하기</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

          </motion.div>
        )}

        {/* TAB 3: 어슬런 플랜 & 보이스 코칭 */}
        {tab === "plan" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Guide header */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Volume2 className="text-emerald-500" size={24} />
                초보자 맞춤형 단계별 러닝 플랜
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                달리기가 처음이신가요? 런데이 앱처럼 설계된 걷기-달리기 반복 훈련과 전문 AI 보이스 코칭으로 체력을 기르세요.
              </p>
            </div>

            {/* Plan selection grid */}
            <div className="space-y-6">
              {RUNNING_PLANS.map(weekGroup => (
                <div key={weekGroup.week} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                      {weekGroup.week === 1 ? "🌱 초급 코스: 5분 연속 달리기 완성" : weekGroup.week === 2 ? "🏃‍♂️ 중급 코스: 30분 연속 달리기 도전" : "🔥 고급 코스: 60분 연속 달리기 정복"}
                    </h3>
                    <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full w-fit">
                      {weekGroup.week === 1 ? "기초체력 기르기" : weekGroup.week === 2 ? "지구력 다지기" : "철인 체력 완성"}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {weekGroup.days.map(dayPlan => {
                      const isActive = activeTraining?.week === weekGroup.week && activeTraining?.day === dayPlan.day;
                      return (
                        <div
                          key={dayPlan.day}
                          className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                            isActive
                              ? "bg-emerald-50 border-emerald-300 shadow-sm"
                              : "bg-slate-50 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400">Day {dayPlan.day}</span>
                            <h4 className="text-sm font-extrabold text-slate-800 mt-0.5">{dayPlan.title}</h4>
                            
                            {/* Sequence preview details */}
                            <div className="mt-2 space-y-1">
                              {dayPlan.sequence.map((seq, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                  <span className={`w-2 h-2 rounded-full ${
                                    seq.type === "run" ? "bg-emerald-500" : seq.type === "walk" ? "bg-amber-400" : "bg-blue-400"
                                  }`} />
                                  <span>{seq.type === "run" ? "달리기" : seq.type === "walk" ? "걷기" : "워밍업"}: {seq.duration >= 60 ? `${seq.duration / 60}분` : `${seq.duration}초`}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                            {isActive && trainingActive ? (
                              <button
                                onClick={stopTrainingAndCleanup}
                                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-2 rounded-xl text-xs transition"
                              >
                                트레이닝 중단
                              </button>
                            ) : (
                              <button
                                onClick={() => startTraining(weekGroup.week, dayPlan.day, dayPlan)}
                                className="w-full bg-slate-950 hover:bg-slate-900 text-emerald-400 font-extrabold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1"
                              >
                                <Play size={12} fill="currentColor" />
                                <span>트레이닝 시작</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Active Training Dashboard overlay */}
            {trainingActive && activeTraining && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-950 text-white p-5 rounded-3xl shadow-2xl border border-slate-800 max-w-lg w-11/12 space-y-4"
              >
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-black tracking-widest">LIVE VOICE COACHING</span>
                    <h3 className="text-sm font-black text-white">
                      {activeTraining.week === 1 ? "🌱 초급 5분 코스" : activeTraining.week === 2 ? "🏃‍♂️ 중급 30분 코스" : "🔥 고급 60분 코스"} - {activeTraining.day}일차 훈련 중
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCoachingVolume(!coachingVolume)}
                      className={`p-2 rounded-xl transition border ${
                        coachingVolume ? "bg-slate-800 border-slate-700 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-500"
                      }`}
                    >
                      {coachingVolume ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>
                    <button
                      onClick={stopTrainingAndCleanup}
                      className="text-xs bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 py-1.5 rounded-xl"
                    >
                      훈련 종료
                    </button>
                  </div>
                </div>

                {/* Training Timer circle or progress */}
                <div className="flex items-center justify-center py-2">
                  <div className="text-center">
                    <div className="text-4xl font-mono font-black text-lime-400 tracking-tight">
                      {trainingTimer} <span className="text-sm">초</span>
                    </div>
                    <div className="text-xs text-slate-400 font-bold mt-1">남은 시간</div>
                  </div>
                </div>

                {/* Coach guidance note */}
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-300 font-medium italic text-center">
                    📢 "{coachingText}"
                  </p>
                </div>
                
                {/* Simulated Audio Waves visual element */}
                <div className="flex items-center justify-center gap-1 py-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [8, Math.random() * 24 + 8, 8] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.05 }}
                      className="w-1 bg-emerald-500 rounded-full"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* TAB 4: 동강 랭킹 리더보드 */}
        {tab === "ranking" && currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Top 3 Podium visualization */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="text-center mb-6">
                <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">LEADERBOARD</span>
                <h2 className="text-xl font-black text-white mt-1">나주동강중학교 어슬런 명예의 전당 🥇</h2>
                <p className="text-xs text-slate-400 mt-0.5">전교생 21명의 실시간 누적 거리 경쟁 현황입니다.</p>
              </div>

              {/* Podium display */}
              <div className="flex justify-center items-end gap-3 pt-4 max-w-md mx-auto h-48">
                
                {/* 2nd place */}
                {users.length > 1 && (
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-sm font-black text-slate-300 truncate max-w-full">{users[1].name}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{users[1].totalDistance} km</span>
                    <div className="w-full bg-slate-800 h-16 rounded-t-2xl flex flex-col items-center justify-center border-t-2 border-slate-400 mt-2 relative">
                      <span className="text-2xl font-black text-slate-300 font-mono">2</span>
                      <span className="text-[9px] font-bold text-slate-400 absolute bottom-1">silver</span>
                    </div>
                  </div>
                )}

                {/* 1st place */}
                {users.length > 0 && (
                  <div className="flex flex-col items-center flex-1">
                    <div className="text-yellow-400 animate-bounce mb-1">👑</div>
                    <span className="text-base font-black text-yellow-300 truncate max-w-full">{users[0].name}</span>
                    <span className="text-xs text-yellow-200 font-extrabold">{users[0].totalDistance} km</span>
                    <div className="w-full bg-gradient-to-b from-yellow-500/30 to-slate-800 h-24 rounded-t-2xl flex flex-col items-center justify-center border-t-4 border-yellow-400 mt-2 relative shadow-lg shadow-yellow-500/10">
                      <span className="text-3xl font-black text-yellow-400 font-mono">1</span>
                      <span className="text-[10px] font-bold text-yellow-300 absolute bottom-1">GOLD</span>
                    </div>
                  </div>
                )}

                {/* 3rd place */}
                {users.length > 2 && (
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-sm font-black text-amber-600 truncate max-w-full">{users[2].name}</span>
                    <span className="text-[10px] text-amber-500 font-bold">{users[2].totalDistance} km</span>
                    <div className="w-full bg-slate-800 h-12 rounded-t-2xl flex flex-col items-center justify-center border-t-2 border-amber-600 mt-2 relative">
                      <span className="text-xl font-black text-amber-600 font-mono">3</span>
                      <span className="text-[9px] font-bold text-amber-500 absolute bottom-1">bronze</span>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Complete Leaderboard list */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-900">전체 러닝 랭킹 목록 (전교생 & 교직원)</h3>
                <span className="text-xs text-slate-500 font-bold">누적 달리기 거리 기준</span>
              </div>

              <div className="divide-y divide-slate-100">
                {users.map((user, idx) => {
                  const isCurrent = user.id === currentUser.id;
                  const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`;

                  return (
                    <div
                      key={user.id}
                      className={`p-4 flex items-center justify-between transition ${
                        isCurrent ? "bg-amber-50/50 border-l-4 border-amber-500" : "hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        
                        {/* Medal index */}
                        <div className="w-8 text-center font-mono font-black text-sm text-slate-600">
                          {medal}
                        </div>

                        {/* Student Detail */}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-800 text-sm">{user.name}</span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                              {getGradeLabel(user.grade)}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full animate-pulse">
                                나
                              </span>
                            )}
                          </div>
                          
                          {/* Badges and milestones */}
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${getLevelColor(user.level)}`}>
                              Lv.{user.level}
                            </span>
                            {user.badges.slice(0, 3).map(b => (
                              <span key={b} className="text-[10px]" title={BADGE_INFO[b]?.name}>
                                {BADGE_INFO[b]?.icon}
                              </span>
                            ))}
                          </div>

                        </div>
                      </div>

                      {/* Distance metric */}
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-slate-900 font-mono">
                          {user.totalDistance} <span className="text-xs text-slate-400">km</span>
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 mt-0.5">
                          스탬프 {user.stamps.length}개
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: 어슬런 소셜 피드 */}
        {tab === "feed" && currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Create manual post form */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <form onSubmit={handleCreatePost} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs">
                    {currentUser.name[0]}
                  </div>
                  <span className="text-xs font-black text-slate-800">
                    {currentUser.name} 학생으로 게시글 쓰기
                  </span>
                </div>

                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white resize-none"
                  rows={3}
                  placeholder="예) 오늘 운동장에서 땀 흘리며 달렸어요! 다들 어슬런데이 가요!"
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-slate-950 hover:bg-slate-900 text-emerald-400 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1 shadow-sm transition"
                  >
                    <Send size={12} />
                    <span>글 게시하기</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Shared feed posts */}
            <div className="space-y-6">
              {posts.map(post => {
                const isLiked = post.likes.includes(currentUser.id);
                return (
                  <div key={post.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    
                    {/* Post Header */}
                    <div className="p-4 flex justify-between items-center border-b border-slate-50">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-700 font-black text-xs">
                          {post.userName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-slate-800">{post.userName}</span>
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                              {post.grade}학년
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-bold">{new Date(post.date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {post.isRunRecord && (
                        <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                          ⚡ 러닝 인증
                        </span>
                      )}
                    </div>

                    {/* Post Body Content */}
                    <div className="p-5 space-y-4">
                      <p className="text-xs md:text-sm text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                        {post.content}
                      </p>

                      {/* Photo certification image if available */}
                      {post.imageUrl && (
                        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-96 flex justify-center items-center shadow-inner">
                          <img
                            src={post.imageUrl}
                            alt="달리기 인증 사진"
                            className="max-h-96 w-auto object-contain hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      {/* If linked to running activity path - Render Canvas View */}
                      {post.isRunRecord && post.path && post.path.length > 0 && (
                        <div className="bg-slate-50 rounded-2xl border border-slate-200/50 p-4 flex flex-col md:flex-row gap-4 items-center">
                          
                          {/* Miniature Map Visualized on Canvas */}
                          <div className="relative overflow-hidden w-full md:w-48 h-32 rounded-xl bg-slate-100 flex-shrink-0">
                            <canvas
                              ref={el => {
                                if (el) drawFeedPathCanvas(el, post.path);
                              }}
                              width={240}
                              height={160}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-1.5 left-1.5 bg-slate-900/80 text-[8px] font-black text-white px-1.5 py-0.5 rounded-md flex items-center gap-1">
                              <MapPin size={8} />
                              <span>나주 동강 코스</span>
                            </div>
                          </div>

                          {/* Running stats summary */}
                          <div className="space-y-2 w-full">
                            <div className="grid grid-cols-4 gap-2 text-center">
                              <div className="p-2 rounded-xl bg-white border border-slate-100">
                                <div className="text-[10px] font-black text-slate-400">거리</div>
                                <div className="text-sm font-extrabold text-slate-800 font-mono tracking-tight mt-0.5">
                                  {post.distance} <span className="text-[9px]">km</span>
                                </div>
                              </div>
                              <div className="p-2 rounded-xl bg-white border border-slate-100">
                                <div className="text-[10px] font-black text-slate-400">시간</div>
                                <div className="text-sm font-extrabold text-slate-800 font-mono tracking-tight mt-0.5">
                                  {post.duration ? formatTime(post.duration) : "0:00"}
                                </div>
                              </div>
                              <div className="p-2 rounded-xl bg-white border border-slate-100">
                                <div className="text-[10px] font-black text-slate-400">페이스</div>
                                <div className="text-sm font-extrabold text-slate-800 font-mono tracking-tight mt-0.5">
                                  {post.pace || "6:00"}
                                </div>
                              </div>
                              <div className="p-2 rounded-xl bg-white border border-slate-100">
                                <div className="text-[10px] font-black text-slate-400">케이던스</div>
                                <div className="text-sm font-extrabold text-emerald-600 font-mono tracking-tight mt-0.5">
                                  {post.cadence ? `${post.cadence}` : "165"}
                                </div>
                              </div>
                            </div>

                            {/* Lap split display if laps exist */}
                            {post.laps && post.laps.length > 0 && (
                              <div className="bg-white p-2 rounded-xl border border-slate-100 text-left">
                                <span className="text-[10px] font-black text-slate-500 block mb-1">🏁 1km 구간별 기록 (Laps)</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {post.laps.map(lap => (
                                    <span key={lap.km} className="text-[9px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                                      {lap.km}km: {lap.pace}/km
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                        </div>
                      )}
                    </div>

                    {/* Likes & Comments bar */}
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex gap-4 items-center text-xs text-slate-600 font-bold">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg transition hover:bg-slate-100 ${
                          isLiked ? "text-rose-600" : ""
                        }`}
                      >
                        <Heart size={15} fill={isLiked ? "currentColor" : "none"} />
                        <span>응원 {post.likes.length}</span>
                      </button>
                      
                      <div className="flex items-center gap-1">
                        <MessageSquare size={15} />
                        <span>댓글 {post.comments.length}</span>
                      </div>
                    </div>

                    {/* Comments section */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
                      {post.comments.map(comment => (
                        <div key={comment.id} className="text-xs leading-relaxed flex items-start gap-1.5">
                          <span className="font-extrabold text-slate-800 whitespace-nowrap">{comment.userName}:</span>
                          <span className="text-slate-600 font-medium">{comment.text}</span>
                        </div>
                      ))}

                      {/* Comment input form */}
                      <div className="flex gap-2 pt-2 border-t border-slate-100/60">
                        <input
                          type="text"
                          className="flex-grow bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          placeholder="응원 댓글을 한 줄 적어주세요..."
                          value={postCommentText[post.id] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPostCommentText(prev => ({ ...prev, [post.id]: val }));
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="bg-slate-950 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-slate-900 transition"
                        >
                          등록
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 6: 건강 리포트 & AI 분석 */}
        {tab === "report" && currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Visual Stats Summary */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                <TrendingUp className="text-emerald-500" size={24} />
                {currentUser.name}의 어슬런 건강 분석 대시보드
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-lime-50 border border-emerald-100">
                  <div className="text-slate-500 text-xs font-black">누적 어슬런 거리</div>
                  <div className="text-3xl font-black text-slate-900 font-mono tracking-tight mt-1">
                    {currentUser.totalDistance} <span className="text-sm">km</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-1.5">동강중 운동장 약 {Math.round(currentUser.totalDistance * 5)}바퀴</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-lime-50 border border-emerald-100">
                  <div className="text-slate-500 text-xs font-black">누적 운동 시간</div>
                  <div className="text-3xl font-black text-slate-900 font-mono tracking-tight mt-1">
                    {Math.round(currentUser.totalDuration / 60)} <span className="text-sm">분</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-1.5">지속 체력 훈련 완수</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-lime-50 border border-emerald-100">
                  <div className="text-slate-500 text-xs font-black">획득 스탬프 도장</div>
                  <div className="text-3xl font-black text-slate-900 font-mono tracking-tight mt-1">
                    {currentUser.stamps.length} <span className="text-sm">개</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-1.5">스탬프 수집률 {(currentUser.stamps.length * 10)}% 돌파</p>
                </div>
              </div>

              {/* Progress Level wheel representation */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center text-xl font-black border-2 border-emerald-400 shadow-md">
                    Lv.{currentUser.level}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">어슬런 마스터 레벨 {currentUser.level}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      5km를 달릴 때마다 레벨이 1개씩 성장하며 몸집이 튼튼해집니다.
                    </p>
                  </div>
                </div>
                <div className="text-right w-full md:w-auto">
                  <div className="text-xs text-slate-500 font-bold mb-1">다음 레벨까지 남은 거리</div>
                  <div className="text-sm font-extrabold text-slate-900 font-mono">
                    {((currentUser.level * 5) - currentUser.totalDistance).toFixed(1)} km
                  </div>
                </div>
              </div>
            </div>

            {/* AI Coaching Report Section powered by Gemini 3.5-flash */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                    🤖 전문 AI 코칭 데이터 리포트
                  </h3>
                  <p className="text-xs text-slate-500">Gemini가 학생의 누적 달리기 데이터를 분석하고 일대일 코칭을 건넵니다.</p>
                </div>

                <button
                  onClick={requestAiAnalysis}
                  disabled={isGeneratingAi}
                  className="bg-slate-950 hover:bg-slate-900 text-emerald-400 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1 shadow-md transition disabled:opacity-50"
                >
                  <Sparkles size={13} />
                  <span>AI 분석 신청하기</span>
                </button>
              </div>

              {/* AI Report output screen */}
              {isGeneratingAi ? (
                <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-black text-slate-600 animate-pulse">{aiLoadingMessage}</p>
                </div>
              ) : aiReport ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prose prose-sm prose-slate max-w-none text-xs md:text-sm bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100 leading-relaxed font-medium text-slate-700 whitespace-pre-wrap space-y-3"
                >
                  {aiReport}
                </motion.div>
              ) : (
                <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 flex flex-col items-center justify-center">
                  <span className="text-3xl mb-1.5">⚡</span>
                  <p className="text-xs font-black text-slate-600">위 버튼을 눌러 AI 코치의 일대일 러닝 진단서와 응원 보고서를 받아보세요!</p>
                </div>
              )}
            </div>

            {/* Badge wall detail showcase */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-1.5">
                🏆 어슬런 성취 배지 전시장
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(BADGE_INFO).map(([key, value]) => {
                  const isUnlocked = currentUser.badges.includes(key);
                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-2xl border flex items-start gap-4 transition ${
                        isUnlocked
                          ? value.color + " shadow-sm scale-102"
                          : "bg-slate-50 border-slate-200 opacity-30 grayscale"
                      }`}
                    >
                      <span className="text-3xl p-2 bg-white rounded-xl shadow-sm">{value.icon}</span>
                      <div>
                        <h4 className="text-xs md:text-sm font-black text-slate-800">{value.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{value.desc}</p>
                        <span className="text-[9px] font-extrabold mt-2 inline-block text-emerald-600">
                          {isUnlocked ? "✅ 잠금해제 완료" : "🔒 도전 과제 미달성"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 7: 교사 대시보드 */}
        {tab === "teacher" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 animate-fade-in"
          >
            {/* 1. School-wide Aggregate Statistics Card */}
            <div className="bg-gradient-to-tr from-indigo-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl border border-indigo-800 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5">
                <Database size={180} />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold bg-indigo-500 text-white px-2.5 py-1 rounded-full uppercase tracking-wider">
                      TEACHER / COACH DASHBOARD
                    </span>
                    <h2 className="text-xl md:text-2xl font-black mt-2">
                      나주동강중학교 어슬런데이 교사 관리실 🧑‍🏫
                    </h2>
                    <p className="text-xs text-indigo-200 mt-1">
                      우리 학교 21명 학생들의 누적 달리기 정보와 활동 스탬프를 확인하고 격려의 편지를 보냅니다.
                    </p>
                  </div>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <div className="bg-indigo-950/40 border border-indigo-700/50 p-3 rounded-2xl text-center">
                    <div className="text-indigo-300 text-[10px] font-black">총 누적 달리기 거리</div>
                    <div className="text-xl md:text-2xl font-black font-mono mt-1 text-emerald-400">
                      {users.reduce((acc, u) => acc + u.totalDistance, 0).toFixed(1)} <span className="text-[10px] text-white">km</span>
                    </div>
                  </div>
                  <div className="bg-indigo-950/40 border border-indigo-700/50 p-3 rounded-2xl text-center">
                    <div className="text-indigo-300 text-[10px] font-black">학생 평균 달리기 거리</div>
                    <div className="text-xl md:text-2xl font-black font-mono mt-1 text-emerald-400">
                      {users.length > 0 ? (users.reduce((acc, u) => acc + u.totalDistance, 0) / users.length).toFixed(1) : 0} <span className="text-[10px] text-white">km</span>
                    </div>
                  </div>
                  <div className="bg-indigo-950/40 border border-indigo-700/50 p-3 rounded-2xl text-center">
                    <div className="text-indigo-300 text-[10px] font-black">수여된 총 스탬프 수</div>
                    <div className="text-xl md:text-2xl font-black font-mono mt-1 text-amber-400">
                      {users.reduce((acc, u) => acc + u.stamps.length, 0)} <span className="text-[10px] text-white">개</span>
                    </div>
                  </div>
                  <div className="bg-indigo-950/40 border border-indigo-700/50 p-3 rounded-2xl text-center">
                    <div className="text-indigo-300 text-[10px] font-black">학교 평균 러닝 레벨</div>
                    <div className="text-xl md:text-2xl font-black font-mono mt-1 text-sky-300">
                      Lv.{(users.reduce((acc, u) => acc + u.level, 0) / users.length).toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Praise and Stamp reward Card Form */}
            <div id="teacher_award_form_section" className="bg-white p-6 rounded-3xl border border-indigo-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                  💮 학생 격려 및 칭찬 스탬프 보내기
                </h3>
                <p className="text-xs text-slate-500">학생의 노력을 칭찬하고 격려 카드를 피드에 공개 발행하여 동기를 극대화합니다.</p>
              </div>

              <form onSubmit={handleTeacherAward} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Student */}
                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-1.5">칭찬할 학생 선택</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                      value={selectedTeacherStudentId}
                      onChange={(e) => setSelectedTeacherStudentId(e.target.value)}
                      required
                    >
                      <option value="">-- 격려할 학생을 선택하세요 (21명) --</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.grade}학년 - {u.name} (누적 {u.totalDistance}km | 스탬프 {u.stamps.length}개)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stamp reward count */}
                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-1.5">선물할 칭찬 스탬프 개수</label>
                    <div className="flex gap-2">
                      {[1, 2, 3].map(count => (
                        <button
                          key={count}
                          type="button"
                          className={`flex-1 py-1.5 text-xs font-black rounded-xl border transition ${
                            teacherStampsCount === count
                              ? "bg-amber-100 border-amber-400 text-amber-800 shadow-sm"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                          onClick={() => setTeacherStampsCount(count)}
                        >
                          💮 +{count} 도장
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Praise Memo */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-black text-slate-500">담임 선생님의 따뜻한 격려 한마디</label>
                    <span className="text-[10px] text-indigo-600 font-bold">발행 시 어슬런 피드에 실시간 공유됩니다.</span>
                  </div>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-400 focus:outline-none h-20 placeholder:text-slate-400"
                    placeholder="예: 어제 운동장 트랙을 따라 페이스를 조절해가며 완주해낸 끈기를 칭찬합니다! 조금씩 자라나는 체력이 참 멋집니다."
                    value={teacherMemoText}
                    onChange={(e) => setTeacherMemoText(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingTeacherAward || !selectedTeacherStudentId}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <span>📬 칭찬 편지 & 스탬프 발송하기</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 3. Student Overall Progress Directory */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                    📊 동강중학교 전교생 (21명) 어슬런 현황판
                  </h3>
                  <p className="text-xs text-slate-500">각 학생의 누적 달리기 통계와 레벨, 획득 뱃지 현황입니다.</p>
                </div>
                <span className="text-xs font-extrabold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                  전체 21명 등록 완료
                </span>
              </div>

              {/* Grid representation instead of boring table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {users.map(u => {
                  return (
                    <div
                      key={u.id}
                      className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col justify-between hover:border-indigo-300 transition"
                    >
                      <div>
                        {/* Grade and Name */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md">
                              {u.grade}학년
                            </span>
                            <span className="text-sm font-black text-slate-900">{u.name}</span>
                          </div>
                          <span className="text-[11px] font-extrabold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                            Lv.{u.level}
                          </span>
                        </div>

                        {/* Distance & time */}
                        <div className="grid grid-cols-2 gap-2 mt-3 text-center bg-white p-2 rounded-xl border border-slate-100">
                          <div>
                            <div className="text-[9px] font-black text-slate-400">누적 거리</div>
                            <div className="text-xs font-black text-slate-800 font-mono mt-0.5">{u.totalDistance} km</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-black text-slate-400">보유 스탬프</div>
                            <div className="text-xs font-black text-slate-800 font-mono mt-0.5">💮 {u.stamps.length}개</div>
                          </div>
                        </div>

                        {/* Badges unlocked */}
                        <div className="mt-3 flex flex-wrap gap-1">
                          {u.badges.map(badgeId => {
                            const badge = BADGE_INFO[badgeId as keyof typeof BADGE_INFO];
                            return badge ? (
                              <span
                                key={badgeId}
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200"
                                title={badge.name}
                              >
                                {badge.icon} {badge.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-end">
                        <button
                          type="button"
                          className="text-[10px] font-black bg-indigo-950 text-emerald-400 px-2.5 py-1.5 rounded-xl hover:bg-slate-900 transition flex items-center gap-1"
                          onClick={() => {
                            setSelectedTeacherStudentId(u.id);
                            // Scroll to form
                            const formElement = document.getElementById("teacher_award_form_section");
                            if (formElement) {
                              formElement.scrollIntoView({ behavior: "smooth" });
                            }
                          }}
                        >
                          <Smile size={10} />
                          <span>이 학생 칭찬하기</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Student activity running logs */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                  📁 전교생 최근 어슬런 활동 원본 로그
                </h3>
                <p className="text-xs text-slate-500">학생들이 실시간 GPS 어플로 완주 후 서버에 업로드한 기록입니다.</p>
              </div>

              <div className="space-y-4">
                {activities.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-bold border border-dashed border-slate-200 rounded-2xl">
                    아직 업로드된 학생 활동 기록이 없습니다.
                  </div>
                ) : (
                  activities.map(act => (
                    <div key={act.id} className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                      <div className="space-y-2 flex-grow">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                            {act.grade}학년 - {act.userName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {new Date(act.date).toLocaleDateString("ko-KR")} {new Date(act.date).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed">
                          💬 "{act.memo}"
                        </p>
                        <div className="flex gap-4 text-xs font-mono font-bold text-slate-600 pt-1">
                          <span>🏃‍♂️ 거리: {act.distance}km</span>
                          <span>⏱️ 시간: {formatTime(act.duration)}</span>
                          <span>⚡ 페이스: {act.pace}/km</span>
                        </div>
                      </div>

                      {/* Map coordinate drawing mini icon */}
                      {act.path && act.path.length > 0 && (
                        <div className="relative overflow-hidden w-28 h-20 rounded-xl bg-white border border-slate-200 flex-shrink-0 self-end md:self-center">
                          <canvas
                            ref={el => {
                              if (el) drawFeedPathCanvas(el, act.path);
                            }}
                            width={112}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

      </main>

      {/* MODAL 1: Vercel Deployment Protection & No-Login Guide Modal */}
      <AnimatePresence>
        {showVercelGuideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                    🔑
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">카톡 공유시 로그인 없애는 방법</h3>
                    <p className="text-[11px] text-slate-500 font-medium">학생들이 회원가입/비밀번호 없이 접속하게 만드는 원클릭 설정</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowVercelGuideModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                  <h4 className="font-extrabold text-amber-900 flex items-center gap-1.5">
                    <Info size={16} className="text-amber-600" />
                    <span>왜 버셀(Vercel) 로그인 화면이 뜨나요?</span>
                  </h4>
                  <p className="text-slate-600">
                    Vercel 기본 설정 중 <span className="font-bold text-amber-900">"Deployment Protection"</span> 옵션이 켜져 있으면, Vercel 계정이 없는 사람(학생들)에게 비번 입력을 요구합니다.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-black text-slate-900 text-sm">💡 해결 방법 2가지 (선생님 추천):</h4>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="font-extrabold text-slate-900 text-xs">방법 1. Vercel에서 보호 기능 해제 (가장 쉬움)</div>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 font-medium pl-1">
                      <li><a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-bold">Vercel 대시보드</a> 접속</li>
                      <li>본 프로젝트 클릭 ➔ 상단 <span className="font-bold text-slate-800">Settings</span> 탭 클릭</li>
                      <li>좌측 메뉴의 <span className="font-bold text-slate-800">Deployment Protection</span> 클릭</li>
                      <li><span className="font-bold text-rose-600">Vercel Authentication</span> 항목을 <span className="font-bold text-emerald-600">Disabled (비활성화)</span>로 변경 후 Save 클릭!</li>
                    </ol>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="font-extrabold text-slate-900 text-xs">방법 2. AI Studio 자체 정식 배포 URL 카톡에 공유</div>
                    <p className="text-[11px] text-slate-600">
                      AI Studio의 <strong>Deploy</strong> 버튼을 통해 배포된 원본 Cloud Run 주소를 학생들에게 보내주시면 Vercel 로그인 창 없이 곧바로 열립니다!
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowVercelGuideModal(false)}
                  className="w-full bg-slate-950 text-white font-black py-3 rounded-2xl hover:bg-slate-900 transition text-xs"
                >
                  확인했습니다 (닫기)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Garmin Watch & Nike Run Club Integration Guide Modal */}
      <AnimatePresence>
        {showGpxGuideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                    ⌚
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">가민 & 나이키 러닝 클럽 연동 가이드</h3>
                    <p className="text-[11px] text-slate-500 font-medium">가민 시계 및 나이키 앱의 기록을 어슬런데이에 불러오기</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGpxGuideModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                {/* Garmin Connect Guide */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                    <Watch className="text-emerald-600" size={16} />
                    <span>1. 가민 워치 (Garmin Connect) 연동 방법</span>
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 font-medium pl-1">
                    <li>스마트폰/PC에서 Garmin Connect 앱 또는 웹사이트에 로그인합니다.</li>
                    <li>달리기 활동 내역을 선택합니다.</li>
                    <li>우측 상단 ⚙️ 설정(점 3개) ➔ <span className="font-bold text-emerald-700 font-mono">.GPX로 내보내기</span> 클릭!</li>
                    <li>어슬런데이 앱의 <span className="font-bold text-slate-900">[수동 기록 & 가민 연동]</span> 탭에서 해당 GPX 파일을 첨부하면 완료됩니다.</li>
                  </ol>
                </div>

                {/* Nike Run Club Guide */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                    <Smartphone className="text-emerald-600" size={16} />
                    <span>2. 나이키 러닝 클럽 (NRC) 연동 방법</span>
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 font-medium pl-1">
                    <li>나이키 앱 실행 ➔ 활동 탭에서 오늘 달린 기록을 엽니다.</li>
                    <li><span className="font-bold text-slate-800">[수동 인증 사진 등록]</span> 선택 후, NRC 달리기 스크린샷을 찍어 첨부하거나 GPX 변환 서비스를 활용해 파일로 불러올 수 있습니다.</li>
                  </ol>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-emerald-900 text-[11px] font-bold">
                  ✨ GPX 파일이 업로드되면 달린 거리, 시간, 페이스가 소수점 단위로 오차 없이 즉시 자동 세팅됩니다!
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowGpxGuideModal(false)}
                  className="w-full bg-slate-950 text-white font-black py-3 rounded-2xl hover:bg-slate-900 transition text-xs"
                >
                  확인했습니다 (닫기)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Humble credit in page footer */}
      <footer className="text-center py-8 text-[11px] text-slate-400 font-bold max-w-4xl mx-auto border-t border-slate-200 mt-12 w-11/12 space-y-1">
        <div>어슬런데이 - 전라남도 나주시 동강면 동강중학교 건강 문화 달리기 프로젝트</div>
        <div className="text-slate-300 font-medium">Developed for 21 outstanding students of Naju Donggang Middle School</div>
      </footer>

    </div>
  );
}
