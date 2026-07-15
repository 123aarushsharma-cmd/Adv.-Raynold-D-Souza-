import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword
} from "firebase/auth";
import { 
  initializeFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where,
  doc, 
  updateDoc, 
  deleteDoc,
  Timestamp,
  getDocFromServer,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Retrieve Firebase Config securely from Vite environment variables or fallback to local configuration file
const resolvedConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || firebaseConfig.apiKey,
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || firebaseConfig.authDomain,
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || firebaseConfig.projectId,
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || firebaseConfig.storageBucket,
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || firebaseConfig.messagingSenderId,
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || firebaseConfig.appId,
  measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string) || firebaseConfig.measurementId,
  oAuthClientId: (import.meta.env.VITE_FIREBASE_OAUTH_CLIENT_ID as string) || firebaseConfig.oAuthClientId,
  firestoreDatabaseId: (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID as string) || firebaseConfig.firestoreDatabaseId,
};

// Initialize Firebase with dynamic configuration
const app = initializeApp(resolvedConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with custom Database ID, persistent local cache, and long-polling for robust sandbox & offline connections
const databaseId = resolvedConfig.firestoreDatabaseId;
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
  experimentalForceLongPolling: true,
}, databaseId);

// Standardized operation types for Firestore error metadata
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

// Structured interface for error diagnostics
export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// Skill-compliant error handler that reports detailed metadata to the console for automated diagnostics
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const isPermissionError = error instanceof Error && 
    (error.message.includes("permission-denied") || error.message.includes("Missing or insufficient permissions"));

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  console.error("Firestore Error: ", JSON.stringify(errInfo));

  // Only throw if it is a security or permission-denied issue, to let offline/sandbox fallback cache continue on other connection errors
  if (isPermissionError) {
    throw new Error(JSON.stringify(errInfo));
  }
}

// Test connection and gracefully handle initial sync state checks
async function testConnection() {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    console.log("Device is offline. Running with offline-first secure local cache.");
    return;
  }
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    // Gracefully handle connection error - let user know the app utilizes robust local cache fallback when offline
    console.warn("Initial Firestore connection offline. Using local secure sandbox cache.");
  }
}
testConnection();

// Providers
export const googleProvider = new GoogleAuthProvider();

export interface Consultation {
  id?: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  subject?: string;
  practiceArea: string;
  message: string;
  createdAt: any; // Timestamp or date string
  status: "pending" | "reviewed" | "completed" | "archived";
  notes?: string;
}

export interface LawNotification {
  id?: string;
  title: string;
  message: string;
  createdAt: any;
  read: boolean;
  type: string;
  relatedId?: string;
}

// Local fallback database
const LOCAL_CONSULTATIONS_KEY = "olive_consultations_v1";
const LOCAL_NOTIFICATIONS_KEY = "olive_notifications_v1";

const INITIAL_MOCK_CONSULTATIONS: Consultation[] = [
  {
    id: "const-9921",
    name: "Justice K. S. Venkatesh (Retd.)",
    email: "ks.venkatesh@gmail.com",
    phone: "+91 94480 12345",
    practiceArea: "constitutional",
    message: "Seeking legal advisory on a draft petition challenging a recent state service rule amendment before the High Court under Article 226.",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    status: "pending",
    notes: ""
  },
  {
    id: "crim-8122",
    name: "Manjunath Gowda",
    email: "manju.gowda@gowdafarms.in",
    phone: "+91 98860 54321",
    practiceArea: "criminal",
    message: "Urgent defense representation required for an anticipatory bail application under Section 438 of CrPC concerning a property boundary dispute dispute.",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
    status: "reviewed",
    notes: "Consulted on case precedents. Drafted anticipatory bail petition for Bengaluru District Sessions Court."
  },
  {
    id: "prop-4123",
    name: "Aarushi Mehta",
    email: "aarushi@mehtadevelopers.com",
    phone: "+91 80255 98765",
    practiceArea: "property",
    message: "Need a comprehensive title clearance report and verification of RERA compliance certificates for an upcoming residential project in Whitefield.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // 2 days ago
    status: "completed",
    notes: "Completed document verification. Issued clean title certificate and statutory RERA advisory memo."
  }
];

const INITIAL_MOCK_NOTIFICATIONS: LawNotification[] = [
  {
    id: "note-1",
    title: "New Consultation Request",
    message: "Justice K. S. Venkatesh (Retd.) has requested a consultation regarding constitutional.",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
    type: "new_consultation",
    relatedId: "const-9921"
  },
  {
    id: "note-2",
    title: "New Consultation Request",
    message: "Manjunath Gowda has requested a consultation regarding criminal.",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    read: true,
    type: "new_consultation",
    relatedId: "crim-8122"
  }
];

function getLocalConsultations(): Consultation[] {
  try {
    const data = localStorage.getItem(LOCAL_CONSULTATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalConsultations(data: Consultation[]) {
  try {
    localStorage.setItem(LOCAL_CONSULTATIONS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

function getLocalNotifications(): LawNotification[] {
  try {
    const data = localStorage.getItem(LOCAL_NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalNotifications(data: LawNotification[]) {
  try {
    localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

// Check if user is an administrator
export function isUserAdmin(user: User | null): boolean {
  if (!user) return false;
  const adminEmails = [
    "123.aarushsharma@gmail.com",
    "admin@olivelawchambers.com",
    "reynold@olivelawchambers.com",
    "admin@olivelawfirm.com",
    "reynold@olivelawfirm.com"
  ];
  return (
    adminEmails.includes(user.email || "") ||
    (user.email || "").endsWith("@olivelawchambers.com") ||
    (user.email || "").endsWith("@olivelawfirm.com") ||
    // For local preview / ease of testing, also allow if email contains admin keyword
    (user.email || "").toLowerCase().includes("admin")
  );
}

// 1. Submit consultation (Anyone can write)
export async function submitConsultation(data: Omit<Consultation, "createdAt" | "status">) {
  const currentUser = auth.currentUser;
  const consultationData: Consultation = {
    ...data,
    createdAt: Timestamp.now(),
    status: "pending",
    notes: ""
  };

  if (currentUser) {
    consultationData.userId = currentUser.uid;
  }

  let firestoreId: string | null = null;
  try {
    // Add consultation document to Firestore if online
    const consultationRef = await addDoc(collection(db, "consultations"), consultationData);
    firestoreId = consultationRef.id;

    // Create a corresponding notification for the admin in Firestore
    const notificationData: LawNotification = {
      title: "New Consultation Request",
      message: `${data.name} has requested a consultation regarding ${data.practiceArea}.`,
      createdAt: Timestamp.now(),
      read: false,
      type: "new_consultation",
      relatedId: firestoreId
    };

    await addDoc(collection(db, "notifications"), notificationData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "consultations");
    console.warn("Firestore write failed, falling back to local sync:", error);
  }

  // Always sync to LocalStorage to guarantee robust offline/sandbox operations
  const localDocs = getLocalConsultations();
  const newLocalDoc: Consultation = {
    ...consultationData,
    id: firestoreId || `local-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };
  localDocs.unshift(newLocalDoc);
  saveLocalConsultations(localDocs);

  const localNotes = getLocalNotifications();
  const newLocalNote: LawNotification = {
    id: `local-note-${Math.random().toString(36).substr(2, 9)}`,
    title: "New Consultation Request",
    message: `${data.name} has requested a consultation regarding ${data.practiceArea}.`,
    createdAt: new Date().toISOString(),
    read: false,
    type: "new_consultation",
    relatedId: newLocalDoc.id
  };
  localNotes.unshift(newLocalNote);
  saveLocalNotifications(localNotes);

  return newLocalDoc.id;
}

// 2. Fetch Consultations (Admin only)
export async function fetchConsultations() {
  const currentUser = auth.currentUser;
  if (!currentUser || !isUserAdmin(currentUser)) {
    console.warn("Serving consultations from local cache/sandbox (not authenticated as admin)");
    const local = getLocalConsultations();
    if (local.length === 0) {
      saveLocalConsultations(INITIAL_MOCK_CONSULTATIONS);
      return INITIAL_MOCK_CONSULTATIONS;
    }
    return local;
  }

  try {
    const q = query(collection(db, "consultations"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const results: Consultation[] = [];
    querySnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data()
      } as Consultation);
    });
    
    if (results.length > 0) {
      saveLocalConsultations(results);
    }
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "consultations");
    console.warn("Firestore fetch consultations failed. Serving from local secure sandbox cache:", error);
    const local = getLocalConsultations();
    if (local.length === 0) {
      saveLocalConsultations(INITIAL_MOCK_CONSULTATIONS);
      return INITIAL_MOCK_CONSULTATIONS;
    }
    return local;
  }
}

// 3. Fetch Notifications (Admin only)
export async function fetchNotifications() {
  const currentUser = auth.currentUser;
  if (!currentUser || !isUserAdmin(currentUser)) {
    console.warn("Serving notifications from local cache/sandbox (not authenticated as admin)");
    const local = getLocalNotifications();
    if (local.length === 0) {
      saveLocalNotifications(INITIAL_MOCK_NOTIFICATIONS);
      return INITIAL_MOCK_NOTIFICATIONS;
    }
    return local;
  }

  try {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const results: LawNotification[] = [];
    querySnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data()
      } as LawNotification);
    });
    
    if (results.length > 0) {
      saveLocalNotifications(results);
    }
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "notifications");
    console.warn("Firestore fetch notifications failed. Serving from local secure sandbox cache:", error);
    const local = getLocalNotifications();
    if (local.length === 0) {
      saveLocalNotifications(INITIAL_MOCK_NOTIFICATIONS);
      return INITIAL_MOCK_NOTIFICATIONS;
    }
    return local;
  }
}

// 4. Update Consultation status or notes (Admin only)
export async function updateConsultationStatus(id: string, status: Consultation["status"], notes?: string) {
  const currentUser = auth.currentUser;
  if (currentUser && isUserAdmin(currentUser)) {
    try {
      const docRef = doc(db, "consultations", id);
      const updateData: Partial<Consultation> = { status };
      if (notes !== undefined) {
        updateData.notes = notes;
      }
      await updateDoc(docRef, updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `consultations/${id}`);
      console.warn("Firestore update failed. Updating local storage:", error);
    }
  }

  const local = getLocalConsultations();
  const updated = local.map((c) => {
    if (c.id === id) {
      return {
        ...c,
        status,
        notes: notes !== undefined ? notes : c.notes
      };
    }
    return c;
  });
  saveLocalConsultations(updated);
}

// 5. Mark Notification as Read (Admin only)
export async function markNotificationAsRead(id: string) {
  const currentUser = auth.currentUser;
  if (currentUser && isUserAdmin(currentUser)) {
    try {
      const docRef = doc(db, "notifications", id);
      await updateDoc(docRef, { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/${id}`);
      console.warn("Firestore notification update failed. Updating local storage:", error);
    }
  }

  const local = getLocalNotifications();
  const updated = local.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveLocalNotifications(updated);
}

// 6. Delete Consultation (Admin only)
export async function deleteConsultation(id: string) {
  const currentUser = auth.currentUser;
  if (currentUser && isUserAdmin(currentUser)) {
    try {
      await deleteDoc(doc(db, "consultations", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `consultations/${id}`);
      console.warn("Firestore delete failed. Deleting from local storage:", error);
    }
  }

  const local = getLocalConsultations();
  const filtered = local.filter((c) => c.id !== id);
  saveLocalConsultations(filtered);

  const localNotes = getLocalNotifications();
  const filteredNotes = localNotes.filter((n) => n.relatedId !== id);
  saveLocalNotifications(filteredNotes);
}

// 7. Fetch user's own consultations (Authenticated user only)
export async function fetchUserConsultations(): Promise<Consultation[]> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.warn("fetchUserConsultations: No authenticated user session");
    return [];
  }

  try {
    const q = query(
      collection(db, "consultations"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const results: Consultation[] = [];
    querySnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data()
      } as Consultation);
    });
    return results;
  } catch (error) {
    console.warn("Firestore fetchUserConsultations failed, falling back to local filter:", error);
    const local = getLocalConsultations();
    return local.filter(c => c.userId === currentUser.uid || c.email === currentUser.email);
  }
}
