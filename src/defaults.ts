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
  { id: "student-01", name: "박찬혁", grade: 1, totalDistance: 12.5, totalDuration: 4500, level: 3, stamps: ["mission-1"], badges: ["first-run", "speedy"] },
  { id: "student-02", name: "신영우", grade: 1, totalDistance: 8.2, totalDuration: 3200, level: 2, stamps: [], badges: ["first-run"] },
  { id: "student-03", name: "이주아", grade: 1, totalDistance: 15.4, totalDuration: 5400, level: 4, stamps: ["mission-1", "mission-2"], badges: ["first-run", "consistent"] },
  { id: "student-04", name: "조다현", grade: 1, totalDistance: 5.0, totalDuration: 2100, level: 1, stamps: [], badges: ["first-run"] },

  // Grade 2
  { id: "student-05", name: "김가영", grade: 2, totalDistance: 21.1, totalDuration: 7200, level: 5, stamps: ["mission-1", "mission-2", "mission-3"], badges: ["first-run", "half-marathon", "consistent"] },
  { id: "student-06", name: "김태율", grade: 2, totalDistance: 6.4, totalDuration: 2700, level: 2, stamps: [], badges: ["first-run"] },
  { id: "student-07", name: "김효원", grade: 2, totalDistance: 9.8, totalDuration: 3900, level: 2, stamps: ["mission-1"], badges: ["first-run"] },
  { id: "student-08", name: "안서진", grade: 2, totalDistance: 11.2, totalDuration: 4100, level: 3, stamps: ["mission-1"], badges: ["first-run"] },
  { id: "student-09", name: "이준", grade: 2, totalDistance: 18.0, totalDuration: 6200, level: 4, stamps: ["mission-1", "mission-2"], badges: ["first-run", "consistent"] },
  { id: "student-10", name: "정한나", grade: 2, totalDistance: 7.5, totalDuration: 3000, level: 2, stamps: [], badges: ["first-run"] },
  { id: "student-11", name: "차근영", grade: 2, totalDistance: 24.5, totalDuration: 8500, level: 5, stamps: ["mission-1", "mission-2", "mission-3", "mission-4"], badges: ["first-run", "marathon-club", "consistent"] },
  { id: "student-12", name: "채성진", grade: 2, totalDistance: 13.0, totalDuration: 4800, level: 3, stamps: ["mission-1"], badges: ["first-run"] },

  // Grade 3
  { id: "student-13", name: "김나연", grade: 3, totalDistance: 32.0, totalDuration: 11200, level: 7, stamps: ["mission-1", "mission-2", "mission-3", "mission-4", "mission-5"], badges: ["first-run", "marathon-club", "consistent", "legend"] },
  { id: "student-14", name: "김시윤", grade: 3, totalDistance: 10.5, totalDuration: 4200, level: 3, stamps: ["mission-1"], badges: ["first-run"] },
  { id: "student-15", name: "이여진", grade: 3, totalDistance: 20.3, totalDuration: 7100, level: 5, stamps: ["mission-1", "mission-2", "mission-3"], badges: ["first-run", "consistent"] },
  { id: "student-16", name: "이지훈", grade: 3, totalDistance: 14.1, totalDuration: 5100, level: 3, stamps: ["mission-1", "mission-2"], badges: ["first-run", "speedy"] },
  { id: "student-17", name: "임지현", grade: 3, totalDistance: 4.2, totalDuration: 1800, level: 1, stamps: [], badges: ["first-run"] },
  { id: "student-18", name: "임혜진", grade: 3, totalDistance: 16.7, totalDuration: 5900, level: 4, stamps: ["mission-1", "mission-2"], badges: ["first-run", "consistent"] },
  { id: "student-19", name: "정혜승", grade: 3, totalDistance: 28.0, totalDuration: 9800, level: 6, stamps: ["mission-1", "mission-2", "mission-3", "mission-4"], badges: ["first-run", "consistent", "marathon-club"] },
  { id: "student-20", name: "조우진", grade: 3, totalDistance: 9.0, totalDuration: 3600, level: 2, stamps: [], badges: ["first-run"] },
  { id: "student-21", name: "채누리", grade: 3, totalDistance: 15.0, totalDuration: 5400, level: 4, stamps: ["mission-1", "mission-2"], badges: ["first-run", "consistent"] },

  // Staff (Grade 4)
  { id: "staff-01", name: "과학", grade: 4, totalDistance: 4.5, totalDuration: 1800, level: 2, stamps: ["mission-1"], badges: ["first-run"] },
  { id: "staff-02", name: "교무행정사", grade: 4, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "staff-03", name: "교장", grade: 4, totalDistance: 12.0, totalDuration: 4800, level: 3, stamps: ["mission-1", "mission-2"], badges: ["first-run", "consistent"] },
  { id: "staff-04", name: "국어", grade: 4, totalDistance: 3.2, totalDuration: 1300, level: 1, stamps: ["mission-1"], badges: ["first-run"] },
  { id: "staff-05", name: "나보람", grade: 4, totalDistance: 15.6, totalDuration: 6200, level: 4, stamps: ["mission-1", "mission-2", "mission-3"], badges: ["first-run", "consistent"] },
  { id: "staff-06", name: "사회", grade: 4, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] },
  { id: "staff-07", name: "수학", grade: 4, totalDistance: 8.5, totalDuration: 3400, level: 2, stamps: ["mission-1"], badges: ["first-run"] },
  { id: "staff-08", name: "영어", grade: 4, totalDistance: 10.0, totalDuration: 3800, level: 3, stamps: ["mission-1", "mission-2"], badges: ["first-run"] },
  { id: "staff-09", name: "음악", grade: 4, totalDistance: 5.4, totalDuration: 2400, level: 2, stamps: [], badges: ["first-run"] },
  { id: "staff-10", name: "체육", grade: 4, totalDistance: 22.0, totalDuration: 8100, level: 5, stamps: ["mission-1", "mission-2", "mission-3", "mission-4"], badges: ["first-run", "consistent", "speedy"] },
  { id: "staff-11", name: "최홍재", grade: 4, totalDistance: 18.2, totalDuration: 7200, level: 4, stamps: ["mission-1", "mission-2", "mission-3"], badges: ["first-run", "consistent"] },
  { id: "staff-12", name: "행정실장", grade: 4, totalDistance: 0.0, totalDuration: 0, level: 1, stamps: [], badges: [] }
];

export const DEFAULT_MISSIONS: Mission[] = [
  { id: "mission-1", title: "어슬런데이 3km 도전!", description: "주간 어슬런데이 달리기 누적 3km를 넘겨 발도장을 꾹 찍으세요!", goal: 3, type: "distance", rewardStamp: 1, isWeekly: true },
  { id: "mission-2", title: "어슬런 출석 대장", description: "이번 주에 누적 3회 이상 달리기를 인증하세요!", goal: 3, type: "count", rewardStamp: 1, isWeekly: true },
  { id: "mission-3", title: "상쾌한 5km 레이스", description: "주간 어슬런데이 달리기 누적 5km 달성하기!", goal: 5, type: "distance", rewardStamp: 2, isWeekly: true },
  { id: "mission-4", title: "지구력 마스터", description: "주간 누적 10km 이상 달리기!", goal: 10, type: "distance", rewardStamp: 2, isWeekly: true },
  { id: "mission-5", title: "에이스 가속 러닝", description: "평균 페이스 6:00 이내로 2km 이상 달리기!", goal: 2, type: "pace", rewardStamp: 3, isWeekly: false }
];

export const DEFAULT_ACTIVITIES: Activity[] = [
  { id: "act-1", userId: "student-13", userName: "김나연", grade: 3, date: "2026-07-20T17:30:00Z", distance: 5.2, duration: 1620, pace: "5:11", memo: "동강 영산강 강변길 따라 저녁 어슬런데이 완주! 무지 시원함!", path: [[34.8988, 126.6025], [34.8974, 126.6012], [34.8953, 126.5985], [34.8921, 126.5958], [34.8875, 126.5932], [34.8836, 126.5908], [34.8808, 126.5931]] },
  { id: "act-2", userId: "student-05", userName: "김가영", grade: 2, date: "2026-07-20T08:15:00Z", distance: 4.1, duration: 1400, pace: "5:41", memo: "아침 공기 짱이다! 다함께 열심히 달려보아요!", path: [[34.8988, 126.6025], [34.8974, 126.6012], [34.8953, 126.5985], [34.8921, 126.5958]] },
  { id: "act-3", userId: "student-11", userName: "차근영", grade: 2, date: "2026-07-19T18:00:00Z", distance: 3.5, duration: 1100, pace: "5:14", memo: "방과 후에 친구들과 영산강 데크길 한 바퀴 돌았습니다.", path: [[34.8988, 126.6025], [34.8974, 126.6012]] },
  { id: "act-4", userId: "student-19", userName: "정혜승", grade: 3, date: "2026-07-19T07:20:00Z", distance: 6.0, duration: 2160, pace: "6:00", memo: "주말 아침 어슬런 완료! 주간 미션 깨서 신난다.", path: [[34.8988, 126.6025], [34.8974, 126.6012], [34.8953, 126.5985]] }
];

export const DEFAULT_POSTS: Post[] = [
  {
    id: "post-1",
    userId: "student-13",
    userName: "김나연",
    grade: 3,
    content: "🏃‍♂️ 오늘 영산강 바람 맞으며 5km 달렸어요! 나주 동강의 자연 속에서 달리니까 가슴이 뻥 뚫리네요. 다들 이번 주 어슬런 하셨나요?",
    distance: 5.2,
    duration: 1620,
    pace: "5:11",
    path: [[34.8988, 126.6025], [34.8974, 126.6012], [34.8953, 126.5985], [34.8921, 126.5958], [34.8875, 126.5932], [34.8836, 126.5908], [34.8808, 126.5931]],
    likes: ["student-05", "student-11", "student-19"],
    comments: [
      { id: "comment-1", userId: "student-05", userName: "김가영", text: "와 선배 진짜 빨라요 ㄷㄷ 자극받고 저도 바로 뛰러 갑니다!", date: "2026-07-20T18:00:00Z" },
      { id: "comment-2", userId: "student-11", userName: "차근영", text: "3학년 에이스의 클래스... 부럽습니다!", date: "2026-07-20T18:30:00Z" }
    ],
    date: "2026-07-20T17:35:00Z",
    isRunRecord: true
  },
  {
    id: "post-2",
    userId: "student-05",
    userName: "김가영",
    grade: 2,
    content: "아침 러닝 성공! 상쾌하게 하루를 시작합니다! 동강중 전교생 모두 매일 달리면서 건강해집시다 😃",
    distance: 4.1,
    duration: 1400,
    pace: "5:41",
    path: [[34.8988, 126.6025], [34.8974, 126.6012], [34.8953, 126.5985], [34.8921, 126.5958]],
    likes: ["student-13", "student-02"],
    comments: [
      { id: "comment-3", userId: "student-02", userName: "신영우", text: "오 가영이 대단한데? 내일은 같이 뛰자!", date: "2026-07-20T09:00:00Z" }
    ],
    date: "2026-07-20T08:20:00Z",
    isRunRecord: true
  },
  {
    id: "post-3",
    userId: "student-03",
    userName: "이주아",
    grade: 1,
    content: "🔥 다들 러닝 플랜 1주차 하고 계신가요? 초보자용 가이드 음성 코칭 들으면서 뛰니까 걷고 뛰기 조절이 쉬워서 안 지치고 뛸 수 있어요. 강력 추천!!",
    likes: ["student-01", "student-04", "student-07"],
    comments: [
      { id: "comment-4", userId: "student-04", userName: "조다현", text: "저도 내일은 음성 코칭 켜고 해봐야겠어요!", date: "2026-07-19T21:00:00Z" }
    ],
    date: "2026-07-19T20:15:00Z",
    isRunRecord: false
  }
];
