import { v4 as uuidv4 } from 'uuid';

// Tipuri de activități care pot fi înregistrate
export type ActivityType = 
  | 'PURCHASE' 
  | 'CONVERSION_START' 
  | 'CONVERSION_COMPLETE' 
  | 'VERIFICATION' 
  | 'SURRENDER';

// Interfața pentru o activitate din istoric
export interface Activity {
  id: string;
  userId: string;
  timestamp: Date;
  type: ActivityType;
  certificateId?: string;
  sellerId?: string;
  amount?: number;
  price?: number;
  totalValue?: number;
  details?: string;
}

// Funcție pentru a genera date aleatorii în ultimele 6 luni
function getRandomDate(months: number = 6): Date {
  const now = new Date();
  const pastDate = new Date(now);
  pastDate.setMonth(now.getMonth() - months);
  
  const randomTimestamp = pastDate.getTime() + Math.random() * (now.getTime() - pastDate.getTime());
  return new Date(randomTimestamp);
}

// Generare istoric de activități simulat pentru ultimele 6 luni
const generateMockHistory = (): Activity[] => {
  const mockActivities: Activity[] = [];
  
  // Adăugare activități pentru alți utilizatori (ascunse)
  for (let i = 0; i < 50; i++) {
    const randomType = ['PURCHASE', 'CONVERSION_START', 'CONVERSION_COMPLETE', 'VERIFICATION', 'SURRENDER'][
      Math.floor(Math.random() * 5)
    ] as ActivityType;
    
    mockActivities.push({
      id: uuidv4(),
      userId: `user-${Math.floor(Math.random() * 20) + 2}`, // utilizatori diferiți de Victor (id: 1)
      timestamp: getRandomDate(),
      type: randomType,
      certificateId: `cert-${uuidv4().substring(0, 8)}`,
      sellerId: Math.random() > 0.5 ? `S-CHN-${1001 + Math.floor(Math.random() * 3)}` : `S-EU-${2001 + Math.floor(Math.random() * 4)}`,
      amount: Math.floor(Math.random() * 5000) + 100,
      price: randomType === 'PURCHASE' ? Math.random() * 10 + 40 : undefined,
      totalValue: randomType === 'PURCHASE' ? Math.random() * 500000 + 10000 : undefined
    });
  }
  
  // Sortare după dată
  return mockActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Inițializare istoric cu date simulate
let activityHistory: Activity[] = generateMockHistory();

// Salvare istoric în localStorage (simulare bază de date)
export const initializeActivityHistory = (): void => {
  const storedHistory = localStorage.getItem('activityHistory');
  
  if (storedHistory) {
    const parsedHistory = JSON.parse(storedHistory);
    // Convertire string-uri de dată în obiecte Date
    activityHistory = parsedHistory.map((activity: { id: string; type: string; description: string; timestamp: string | Date; amount?: number; price?: number }) => ({
      ...activity,
      timestamp: new Date(activity.timestamp)
    }));
  } else {
    // Inițializare cu date simulate dacă nu există
    activityHistory = generateMockHistory();
    saveActivityHistory();
  }
};

// Salvare istoric în localStorage
const saveActivityHistory = (): void => {
  localStorage.setItem('activityHistory', JSON.stringify(activityHistory));
};

// Adăugare activitate nouă
export const addActivity = (activity: Omit<Activity, 'id'>): Activity => {
  const newActivity: Activity = {
    ...activity,
    id: uuidv4()
  };
  
  activityHistory.unshift(newActivity);
  saveActivityHistory();
  
  return newActivity;
};

// Obținere istoric filtrat după utilizator
export const getUserActivityHistory = (userId: string): Activity[] => {
  return activityHistory.filter(activity => activity.userId === userId);
};

// Obținere tot istoricul (pentru admin)
export const getAllActivityHistory = (): Activity[] => {
  return [...activityHistory];
};

// Filtrare istoric după perioadă
export const getFilteredActivityHistory = (
  userId: string | null = null, 
  startDate: Date | null = null, 
  endDate: Date | null = null, 
  activityType: ActivityType | null = null,
  showAllUsers: boolean = false
): Activity[] => {
  return activityHistory.filter(activity => {
    // Dacă nu este specificat să arate toate activitățile și există un userId specificat
    if (!showAllUsers && userId && activity.userId !== userId) {
      return false;
    }
    
    // Filtrare după data de început
    if (startDate && activity.timestamp < startDate) {
      return false;
    }
    
    // Filtrare după data de sfârșit
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      if (activity.timestamp > endDateTime) {
        return false;
      }
    }
    
    // Filtrare după tipul activității
    if (activityType && activity.type !== activityType) {
      return false;
    }
    
    return true;
  });
};