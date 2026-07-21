export interface UserProfile {
  id: string;
  name: string;
  grade: number;
  totalDistance: number;
  totalDuration: number;
  level: number;
  stamps: string[];
  badges: string[];
}

export interface Activity {
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
  stampsEarned?: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  date: string;
}

export interface Post {
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

export interface Mission {
  id: string;
  title: string;
  description: string;
  goal: number;
  type: "distance" | "count" | "pace";
  rewardStamp: number;
  isWeekly: boolean;
}

// 21 students and 12 staff of Naju Donggang Middle School
export const DEFAULT_USERS: UserProfile[] = [
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

  // Staff (Grade 4)
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

export const DEFAULT_MISSIONS: Mission[] = [
  { id: "mission-1", title: "어슬런데이 3km 도전!", description: "주간 어슬런데이 달리기 누적 3km를 넘겨 발도장을 꾹 찍으세요!", goal: 3, type: "distance", rewardStamp: 1, isWeekly: true },
  { id: "mission-2", title: "어슬런 출석 대장", description: "이번 주에 누적 3회 이상 달리기를 인증하세요!", goal: 3, type: "count", rewardStamp: 1, isWeekly: true },
  { id: "mission-3", title: "상쾌한 5km 레이스", description: "주간 어슬런데이 달리기 누적 5km 달성하기!", goal: 5, type: "distance", rewardStamp: 2, isWeekly: true },
  { id: "mission-4", title: "지구력 마스터", description: "주간 누적 10km 이상 달리기!", goal: 10, type: "distance", rewardStamp: 2, isWeekly: true },
  { id: "mission-5", title: "에이스 가속 러닝", description: "평균 페이스 6:00 이내로 2km 이상 달리기!", goal: 2, type: "pace", rewardStamp: 3, isWeekly: false }
];

export const DEFAULT_ACTIVITIES: Activity[] = [];

export const DEFAULT_POSTS: Post[] = [
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
