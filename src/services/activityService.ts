import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ActivityLog } from '../types';

const DEMO_ACTIVITY_KEY = 'contactsphere_demo_activities';

export async function logActivity(
  userId: string,
  isDemo: boolean,
  action: ActivityLog['action'],
  description: string,
  contactName?: string,
  contactId?: string
): Promise<void> {
  const timestamp = new Date().toISOString();
  if (isDemo || userId === 'demo_student_evaluator') {
    const raw = localStorage.getItem(DEMO_ACTIVITY_KEY);
    const list: ActivityLog[] = raw ? JSON.parse(raw) : [];
    const newLog: ActivityLog = {
      id: 'demo_act_' + Date.now(),
      action,
      description,
      contactName,
      contactId,
      timestamp,
    };
    list.unshift(newLog);
    localStorage.setItem(DEMO_ACTIVITY_KEY, JSON.stringify(list.slice(0, 50)));
    return;
  }

  const path = `users/${userId}/activity`;
  try {
    await addDoc(collection(db, path), {
      action,
      description,
      contactName: contactName || '',
      contactId: contactId || '',
      timestamp,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw fatal error for activity logging to prevent blocking main action
  }
}

export function subscribeToActivity(
  userId: string,
  isDemo: boolean,
  callback: (logs: ActivityLog[]) => void
): () => void {
  if (isDemo || userId === 'demo_student_evaluator') {
    const loadDemoLogs = () => {
      const raw = localStorage.getItem(DEMO_ACTIVITY_KEY);
      if (raw) {
        callback(JSON.parse(raw));
      } else {
        const initialDemo: ActivityLog[] = [
          {
            id: 'act-1',
            action: 'create',
            description: 'Directory initialized with academic sample records',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
        ];
        localStorage.setItem(DEMO_ACTIVITY_KEY, JSON.stringify(initialDemo));
        callback(initialDemo);
      }
    };
    loadDemoLogs();
    const interval = setInterval(loadDemoLogs, 2000);
    return () => clearInterval(interval);
  }

  const path = `users/${userId}/activity`;
  const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(30));

  return onSnapshot(
    q,
    (snapshot) => {
      const logs: ActivityLog[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ActivityLog, 'id'>),
      }));
      callback(logs);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}
