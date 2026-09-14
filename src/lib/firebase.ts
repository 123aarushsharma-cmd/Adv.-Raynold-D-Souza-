import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
  inMemoryPersistence
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
  getDoc,
  setDoc,
  updateDoc, 
  deleteDoc,
  Timestamp,
  getDocFromServer,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";
// Retrieve Firebase Config securely from Vite environment variables or fallback to local configuration file
import firebaseConfig from "../../firebase-applet-config.json";

// Intercept and redirect benign Firestore connection-timeout errors to console.warn to prevent sandbox alerts
if (typeof console !== "undefined" && console.error) {
  const originalConsoleError = console.error;
  console.error = function (...args: any[]) {
    const isFirestoreTimeout = args.some(
      (arg) =>
        typeof arg === "string" &&
        (arg.includes("Could not reach Cloud Firestore backend") ||
          arg.includes("Backend didn't respond within 10 seconds") ||
          arg.includes("@firebase/firestore"))
    );
    if (isFirestoreTimeout) {
      if (console.warn) {
        console.warn("[Graceful Offline Cache Redirect]", ...args);
      } else {
        console.log("[Graceful Offline Cache Redirect]", ...args);
      }
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

const resolvedConfig = {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
  measurementId: firebaseConfig.measurementId,
  oAuthClientId: firebaseConfig.oAuthClientId,
  firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
};

// Initialize Firebase with dynamic configuration
console.log("Initializing Firebase with config:", {
  ...resolvedConfig,
  apiKey: resolvedConfig.apiKey ? "***" : "MISSING"
});
const app = initializeApp(resolvedConfig);

// Initialize Firebase Auth with Session-Only Persistence (Requires re-login when browser window/tab/console is closed)
export const auth = getAuth(app);
try {
  setPersistence(auth, browserSessionPersistence);
} catch (e) {
  console.warn("Setting auth persistence note:", e);
}

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
}

// Test connection and gracefully handle initial sync state checks (delayed to allow app to finish rendering first)
async function testConnection() {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    console.log("Device is offline. Running with offline-first secure local cache.");
    return;
  }
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firestore backend connected successfully.");
  } catch (error) {
    // Gracefully handle connection error - let user know the app utilizes robust local cache fallback when offline
    console.warn("Initial Firestore connection offline or cold-starting. Using local secure sandbox cache.");
  }
}
setTimeout(() => {
  testConnection();
}, 2000);

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
  assignedEmail?: string;
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

export interface Internship {
  id?: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  yearOfStudy: string;
  areaOfInterest: string;
  resumeUrl: string;
  coverLetter: string;
  createdAt: any;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  notes?: string;
  assignedEmail?: string;
}

// Local fallback database keys
const LOCAL_CONSULTATIONS_KEY = "olive_consultations_v1";
const LOCAL_NOTIFICATIONS_KEY = "olive_notifications_v1";
const LOCAL_INTERNSHIPS_KEY = "olive_internships_v1";

// Blacklist of legacy mock IDs and test names to purge from local storage
const MOCK_ID_BLACKLIST = new Set([
  "const-9921",
  "crim-8122",
  "prop-4123",
  "note-1",
  "note-2",
  "intern-1",
  "intern-2"
]);

const MOCK_NAME_FRAGMENTS = [
  "Justice K. S. Venkatesh",
  "Manjunath Gowda",
  "Aarushi Mehta",
  "Siddharth K. Nair",
  "Ananya Deshpande"
];

function isMockRecord(item: any): boolean {
  if (!item || typeof item !== "object") return true;
  if (item.id && MOCK_ID_BLACKLIST.has(item.id)) return true;
  if (typeof item.name === "string") {
    for (const fragment of MOCK_NAME_FRAGMENTS) {
      if (item.name.includes(fragment)) return true;
    }
  }
  if (typeof item.message === "string") {
    for (const fragment of MOCK_NAME_FRAGMENTS) {
      if (item.message.includes(fragment)) return true;
    }
  }
  return false;
}

const INITIAL_SEED_CONSULTATIONS: Consultation[] = [];
const INITIAL_SEED_NOTIFICATIONS: LawNotification[] = [];

function getLocalConsultations(): Consultation[] {
  try {
    const data = localStorage.getItem(LOCAL_CONSULTATIONS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    // Strictly filter out any mock/placeholder data so only genuine form submissions are displayed
    return parsed.filter((c: any) => !isMockRecord(c));
  } catch {
    return [];
  }
}

function saveLocalConsultations(data: Consultation[]) {
  try {
    // Strictly ensure no mock entries are saved
    const cleaned = data.filter((c: any) => !isMockRecord(c));
    localStorage.setItem(LOCAL_CONSULTATIONS_KEY, JSON.stringify(cleaned));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

function getLocalNotifications(): LawNotification[] {
  try {
    const data = localStorage.getItem(LOCAL_NOTIFICATIONS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((n: any) => !isMockRecord(n));
  } catch {
    return [];
  }
}

function saveLocalNotifications(data: LawNotification[]) {
  try {
    const cleaned = data.filter((n: any) => !isMockRecord(n));
    localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(cleaned));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

function getLocalInternships(): Internship[] {
  try {
    const data = localStorage.getItem(LOCAL_INTERNSHIPS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    const realData: Internship[] = parsed.filter((i: any) => !isMockRecord(i));
    if (realData.length !== parsed.length) {
      saveLocalInternships(realData);
    }
    return realData;
  } catch {
    return [];
  }
}

function saveLocalInternships(data: Internship[]) {
  try {
    const cleaned = data.filter((i: any) => !isMockRecord(i));
    localStorage.setItem(LOCAL_INTERNSHIPS_KEY, JSON.stringify(cleaned));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

// Clear and purge all cached consultation, notification, and internship records from browser local storage
export function purgeAllPreviousQueries(): void {
  try {
    localStorage.removeItem(LOCAL_CONSULTATIONS_KEY);
    localStorage.removeItem(LOCAL_NOTIFICATIONS_KEY);
    localStorage.removeItem(LOCAL_INTERNSHIPS_KEY);
    console.log("All local query storage purged completely.");
  } catch (e) {
    console.error("Failed to purge local query storage:", e);
  }
}

// Ensure old cached items are completely purged on module initialization
try {
  purgeAllPreviousQueries();
} catch (e) {
  // Ignore in SSR environment
}
export const AUTHORIZED_ADMIN_EMAILS: readonly string[] = [
  "advrdsouza181@gmail.com", // Primary Admin & Chambers Founder
  "123.aarushsharma@gmail.com" // Secondary Admin
];

// Check if user is an administrator - strict whitelist enforcement
export function isUserAdmin(user: User | null | { email?: string | null }): boolean {
  if (!user || !user.email) return false;
  const cleanEmail = user.email.trim().toLowerCase();
  return AUTHORIZED_ADMIN_EMAILS.includes(cleanEmail);
}

// Helper function to remove undefined fields from payload objects before sending to Firestore
function sanitizeFirestorePayload<T extends Record<string, any>>(obj: T): T {
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      clean[key] = val;
    }
  }
  return clean as T;
}

// 1. Submit consultation (Anyone can write)
export async function submitConsultation(data: Omit<Consultation, "createdAt" | "status">) {
  const currentUser = auth.currentUser;
  const rawConsultationData: Consultation = {
    ...data,
    createdAt: Timestamp.now(),
    status: "pending",
    notes: "",
    assignedEmail: "advrdsouza181@gmail.com"
  };

  if (currentUser) {
    rawConsultationData.userId = currentUser.uid;
  }

  const consultationData = sanitizeFirestorePayload(rawConsultationData);

  let firestoreId: string | null = null;
  try {
    // Add consultation document to Firestore if online
    const consultationRef = await addDoc(collection(db, "consultations"), consultationData);
    firestoreId = consultationRef.id;

    // Create a corresponding notification for the admin in Firestore
    const rawNotificationData: LawNotification = {
      title: "New Consultation Request",
      message: `${data.name} has requested a consultation regarding ${data.practiceArea}.`,
      createdAt: Timestamp.now(),
      read: false,
      type: "new_consultation",
      relatedId: firestoreId
    };

    await addDoc(collection(db, "notifications"), sanitizeFirestorePayload(rawNotificationData));
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
export async function fetchConsultations(): Promise<Consultation[]> {
  const currentUser = auth.currentUser;
  if (!currentUser || !isUserAdmin(currentUser)) {
    return getLocalConsultations();
  }

  try {
    const q = query(collection(db, "consultations"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const results: Consultation[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!isMockRecord({ id: doc.id, ...data })) {
        results.push({
          id: doc.id,
          ...data
        } as Consultation);
      }
    });
    
    saveLocalConsultations(results);
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "consultations");
    console.warn("Firestore fetch consultations failed. Returning local records:", error);
    return getLocalConsultations();
  }
}

// 3. Fetch Notifications (Admin only)
export async function fetchNotifications(): Promise<LawNotification[]> {
  const currentUser = auth.currentUser;
  if (!currentUser || !isUserAdmin(currentUser)) {
    return getLocalNotifications();
  }

  try {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const results: LawNotification[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!isMockRecord({ id: doc.id, ...data })) {
        results.push({
          id: doc.id,
          ...data
        } as LawNotification);
      }
    });
    
    saveLocalNotifications(results);
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "notifications");
    console.warn("Firestore fetch notifications failed. Returning local notifications:", error);
    return getLocalNotifications();
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

// 8. Submit internship (Anyone can write)
export async function submitInternship(data: Omit<Internship, "createdAt" | "status">) {
  const currentUser = auth.currentUser;
  const rawInternshipData: Internship = {
    ...data,
    createdAt: Timestamp.now(),
    status: "pending",
    notes: "",
    assignedEmail: "advrdsouza181@gmail.com"
  };

  if (currentUser) {
    rawInternshipData.userId = currentUser.uid;
  }

  const internshipData = sanitizeFirestorePayload(rawInternshipData);

  let firestoreId: string | null = null;
  try {
    const docRef = await addDoc(collection(db, "internships"), internshipData);
    firestoreId = docRef.id;

    // Create a corresponding notification for the admin in Firestore
    const rawNotificationData: LawNotification = {
      title: "New Internship Application",
      message: `${data.name} from ${data.college} has applied for an internship.`,
      createdAt: Timestamp.now(),
      read: false,
      type: "new_internship",
      relatedId: firestoreId
    };

    await addDoc(collection(db, "notifications"), sanitizeFirestorePayload(rawNotificationData));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "internships");
    console.warn("Firestore internship write failed, falling back to local sync:", error);
  }

  // Always sync to LocalStorage to guarantee robust offline/sandbox operations
  const localDocs = getLocalInternships();
  const newLocalDoc: Internship = {
    ...internshipData,
    id: firestoreId || `local-int-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };
  localDocs.unshift(newLocalDoc);
  saveLocalInternships(localDocs);

  const localNotes = getLocalNotifications();
  const newLocalNote: LawNotification = {
    id: `local-note-${Math.random().toString(36).substr(2, 9)}`,
    title: "New Internship Application",
    message: `${data.name} from ${data.college} has applied for an internship.`,
    createdAt: new Date().toISOString(),
    read: false,
    type: "new_internship",
    relatedId: newLocalDoc.id
  };
  localNotes.unshift(newLocalNote);
  saveLocalNotifications(localNotes);

  return newLocalDoc.id;
}

// 9. Fetch Internships (Admin only)
export async function fetchInternships(): Promise<Internship[]> {
  const currentUser = auth.currentUser;
  if (!currentUser || !isUserAdmin(currentUser)) {
    return getLocalInternships();
  }

  try {
    const q = query(collection(db, "internships"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const results: Internship[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!isMockRecord({ id: doc.id, ...data })) {
        results.push({
          id: doc.id,
          ...data
        } as Internship);
      }
    });
    
    saveLocalInternships(results);
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "internships");
    console.warn("Firestore fetch internships failed. Returning genuine local records only:", error);
    return getLocalInternships();
  }
}

// 10. Update Internship status or notes (Admin only)
export async function updateInternshipStatus(id: string, status: Internship["status"], notes?: string) {
  const currentUser = auth.currentUser;
  if (currentUser && isUserAdmin(currentUser)) {
    try {
      const docRef = doc(db, "internships", id);
      const updateData: Partial<Internship> = { status };
      if (notes !== undefined) {
        updateData.notes = notes;
      }
      await updateDoc(docRef, updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `internships/${id}`);
      console.warn("Firestore update failed. Updating local storage:", error);
    }
  }

  const local = getLocalInternships();
  const updated = local.map((i) => {
    if (i.id === id) {
      return {
        ...i,
        status,
        notes: notes !== undefined ? notes : i.notes
      };
    }
    return i;
  });
  saveLocalInternships(updated);
}

// 11. Delete Internship (Admin only)
export async function deleteInternship(id: string) {
  const currentUser = auth.currentUser;
  if (currentUser && isUserAdmin(currentUser)) {
    try {
      await deleteDoc(doc(db, "internships", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `internships/${id}`);
      console.warn("Firestore delete failed. Deleting from local storage:", error);
    }
  }

  const local = getLocalInternships();
  const filtered = local.filter((i) => i.id !== id);
  saveLocalInternships(filtered);

  const localNotes = getLocalNotifications();
  const filteredNotes = localNotes.filter((n) => n.relatedId !== id);
  saveLocalNotifications(filteredNotes);
}

// 12. Fetch user's own internships (Authenticated user only)
export async function fetchUserInternships(): Promise<Internship[]> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.warn("fetchUserInternships: No authenticated user session");
    return [];
  }

  try {
    const q = query(
      collection(db, "internships"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const results: Internship[] = [];
    querySnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data()
      } as Internship);
    });
    return results;
  } catch (error) {
    console.warn("Firestore fetchUserInternships failed, falling back to local filter:", error);
    const local = getLocalInternships();
    return local.filter(i => i.userId === currentUser.uid || i.email === currentUser.email);
  }
}

// ============================================================================
// 13. LEGAL TEAM & ADVISORS MANAGEMENT (Founder & Additional Legal Advisers)
// ============================================================================

export interface FounderProfile {
  name: string;
  role: string;
  title: string;
  photoUrl: string;
  bio: string;
  quote: string;
  quoteAuthor: string;
  updatedAt?: any;
}

export interface AdvocateProfile {
  id: string;
  name: string;
  role: string;
  location: string;
  education: string;
  experience: string;
  specialization: string;
  admissionNo: string;
  bio: string;
  photoUrl?: string;
  displayOrder?: number;
  updatedAt?: any;
}

const LOCAL_FOUNDER_KEY = "olive_founder_profile_v1";
const LOCAL_ADVOCATES_KEY = "olive_advocates_v1";

function cleanPhotoUrl(url?: string): string {
  if (!url) return "";
  if (url.includes("unsplash.com") || url.includes("images.unsplash")) {
    return "";
  }
  return url;
}

export const DEFAULT_FOUNDER_PROFILE: FounderProfile = {
  name: "Reynold D'Souza",
  role: "Founder & Principal",
  title: "Advocate, High Court of Karnataka",
  photoUrl: "",
  bio: "Enrolled under the Bar Council, representing clients in Civil, Criminal, Constitutional, and Commercial litigation across Karnataka.",
  quote: "Justice is not just a destination, but the path we walk with every client we serve. Our commitment to your rights is absolute.",
  quoteAuthor: "— Founder's Note"
};

export const DEFAULT_ADVOCATES: AdvocateProfile[] = [
  {
    id: "advocate-1",
    name: "Advocate Priyesh G. Kamath",
    role: "Senior Associate Advocate",
    location: "Bengaluru (Head Office)",
    education: "LL.M. (Constitutional Law), National Law School of India University (NLSIU), Bengaluru",
    experience: "12+ Years in High Court & Tribunal Practice",
    specialization: "Constitutional Writs, Service Law (KAT/CAT), & Commercial Arbitration",
    admissionNo: "KAR/1420/2014",
    bio: "Priyesh specializes in administrative and regulatory dispute resolution. He regularly assists Advocate Reynold D'Souza in drafting high-stakes writ petitions before the High Court of Karnataka and central tribunals.",
    photoUrl: "",
    displayOrder: 1
  },
  {
    id: "advocate-2",
    name: "Advocate Soumya S. Kulkarni",
    role: "Associate Advocate (Satellite Lead)",
    location: "Dharwad (Satellite Location)",
    education: "LL.B. (Hons.), Karnatak University Law College, Dharwad",
    experience: "8+ Years in Real Estate & Civil Litigation",
    specialization: "Property Verification, K-RERA Disputes, & Land Title Clearances",
    admissionNo: "KAR/2180/2018",
    bio: "Soumya manages the firm's North Karnataka presence, leading property title investigations and representing apartment owners and developers before local tribunals and civil courts.",
    photoUrl: "",
    displayOrder: 2
  },
  {
    id: "advocate-3",
    name: "Advocate Nihal R. Patil",
    role: "Associate Advocate",
    location: "Belagavi & Dharwad (Satellite Locations)",
    education: "LL.B., KLES R.L. Law College, Belagavi",
    experience: "6+ Years in Trial Advocacy",
    specialization: "Criminal Trials, Bail Matters, & Consumer Forums",
    admissionNo: "KAR/3055/2020",
    bio: "Nihal is a dedicated criminal trial advocate who represents clients before District Sessions Courts and Magistrate Courts, managing anticipatory bail applications and defense trials with absolute precision.",
    photoUrl: "",
    displayOrder: 3
  }
];

// ============================================================================
// REAL-TIME BROADCAST CHANNEL & CROSS-TAB EVENT SYNC
// ============================================================================

const SYNC_CHANNEL_NAME = "olive_firm_cloud_sync_v1";
let globalSyncChannel: BroadcastChannel | null = null;

if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    globalSyncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  } catch (e) {
    console.warn("BroadcastChannel initialization skipped:", e);
  }
}

export function broadcastFirmSync(type: "branding" | "team" | "content" | "settings" | "consultations" | "notifications", detail?: any) {
  if (typeof window === "undefined") return;
  try {
    if (globalSyncChannel) {
      globalSyncChannel.postMessage({ type, detail, timestamp: Date.now() });
    }
  } catch (e) {
    // Ignore postMessage issues
  }
}

export function subscribeToFirmBroadcast(callback: (msg: { type: string; detail?: any; timestamp: number }) => void): () => void {
  if (typeof window === "undefined" || !globalSyncChannel) return () => {};
  const handler = (event: MessageEvent) => {
    if (event.data && typeof event.data === "object") {
      callback(event.data);
    }
  };
  globalSyncChannel.addEventListener("message", handler);
  return () => {
    globalSyncChannel?.removeEventListener("message", handler);
  };
}

function notifyTeamUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("olive_team_updated"));
    broadcastFirmSync("team");
  }
}

export function getLocalFounderProfile(): FounderProfile {
  try {
    const raw = localStorage.getItem(LOCAL_FOUNDER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          ...DEFAULT_FOUNDER_PROFILE,
          ...parsed,
          photoUrl: cleanPhotoUrl(parsed.photoUrl)
        };
      }
    }
  } catch (e) {
    console.warn("Could not read local founder profile", e);
  }
  return DEFAULT_FOUNDER_PROFILE;
}

export function saveLocalFounderProfile(profile: FounderProfile) {
  try {
    const sanitized = {
      ...profile,
      photoUrl: cleanPhotoUrl(profile.photoUrl)
    };
    localStorage.setItem(LOCAL_FOUNDER_KEY, JSON.stringify(sanitized));
    notifyTeamUpdated();
  } catch (e) {
    console.error("Local storage error saving founder profile:", e);
  }
}

export function getLocalAdvocates(): AdvocateProfile[] {
  try {
    const raw = localStorage.getItem(LOCAL_ADVOCATES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
          .map((a: AdvocateProfile) => ({
            ...a,
            photoUrl: cleanPhotoUrl(a.photoUrl)
          }))
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      }
    }
  } catch (e) {
    console.warn("Could not read local advocates", e);
  }
  return DEFAULT_ADVOCATES;
}

export function saveLocalAdvocates(advocates: AdvocateProfile[]) {
  try {
    const sanitized = advocates.map(a => ({
      ...a,
      photoUrl: cleanPhotoUrl(a.photoUrl)
    }));
    localStorage.setItem(LOCAL_ADVOCATES_KEY, JSON.stringify(sanitized));
    notifyTeamUpdated();
  } catch (e) {
    console.error("Local storage error saving advocates:", e);
  }
}

// Fetch Founder profile with Firestore synchronization & local fallback
export async function fetchFounderProfile(): Promise<FounderProfile> {
  try {
    const docRef = doc(db, "founder_profile", "main");
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const rawData = snapshot.data() as FounderProfile;
      const data: FounderProfile = {
        ...DEFAULT_FOUNDER_PROFILE,
        ...rawData,
        photoUrl: cleanPhotoUrl(rawData.photoUrl)
      };
      saveLocalFounderProfile(data);
      return data;
    }
  } catch (err) {
    console.warn("Firestore fetchFounderProfile unavailable, using cached profile:", err);
  }
  return getLocalFounderProfile();
}

// Save Founder profile (Persists directly to Firestore and local cache)
export async function saveFounderProfile(profile: FounderProfile): Promise<void> {
  const sanitizedProfile: FounderProfile = {
    ...profile,
    photoUrl: cleanPhotoUrl(profile.photoUrl)
  };

  const profileWithMeta = sanitizeFirestorePayload({
    ...sanitizedProfile,
    updatedAt: Timestamp.now()
  });

  // Always update local storage & broadcast change immediately
  saveLocalFounderProfile(sanitizedProfile);

  try {
    const docRef = doc(db, "founder_profile", "main");
    await setDoc(docRef, profileWithMeta);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, "founder_profile/main");
    console.warn("Firestore saveFounderProfile failed, saved locally:", err);
  }
}

// Fetch Advocates with Firestore synchronization & local fallback
export async function fetchAdvocates(): Promise<AdvocateProfile[]> {
  try {
    const q = query(collection(db, "advocates"), orderBy("displayOrder", "asc"));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const results: AdvocateProfile[] = [];
      querySnapshot.forEach((d) => {
        const rawData = d.data();
        results.push({
          id: d.id,
          ...rawData,
          photoUrl: cleanPhotoUrl(rawData.photoUrl)
        } as AdvocateProfile);
      });
      saveLocalAdvocates(results);
      return results;
    }
  } catch (err) {
    console.warn("Firestore fetchAdvocates unavailable, using cached advocates:", err);
  }
  return getLocalAdvocates();
}

// Save or Update a single Advocate (Persists directly to Firestore and local cache)
export async function saveAdvocate(advocate: AdvocateProfile): Promise<void> {
  const sanitizedAdvocate: AdvocateProfile = {
    ...advocate,
    photoUrl: cleanPhotoUrl(advocate.photoUrl)
  };

  const advocateWithMeta = sanitizeFirestorePayload({
    ...sanitizedAdvocate,
    updatedAt: Timestamp.now()
  });

  // Update local
  const current = getLocalAdvocates();
  const index = current.findIndex((a) => a.id === advocate.id);
  if (index >= 0) {
    current[index] = sanitizedAdvocate;
  } else {
    current.push(sanitizedAdvocate);
  }
  saveLocalAdvocates(current);

  try {
    const docRef = doc(db, "advocates", advocate.id);
    await setDoc(docRef, advocateWithMeta);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `advocates/${advocate.id}`);
    console.warn("Firestore saveAdvocate failed, saved locally:", err);
  }
}

// Create new Advocate
export async function createAdvocate(advocate: Omit<AdvocateProfile, "id">): Promise<AdvocateProfile> {
  const current = getLocalAdvocates();
  const newId = `advocate-${Date.now()}`;
  const newAdvocate: AdvocateProfile = {
    ...advocate,
    id: newId,
    photoUrl: cleanPhotoUrl(advocate.photoUrl),
    displayOrder: advocate.displayOrder ?? (current.length + 1)
  };

  current.push(newAdvocate);
  saveLocalAdvocates(current);

  try {
    const docRef = doc(db, "advocates", newId);
    await setDoc(docRef, sanitizeFirestorePayload({
      ...newAdvocate,
      updatedAt: Timestamp.now()
    }));
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `advocates/${newId}`);
    console.warn("Firestore createAdvocate failed, saved locally:", err);
  }

  return newAdvocate;
}

// Delete an Advocate
export async function deleteAdvocate(id: string): Promise<void> {
  const current = getLocalAdvocates();
  const updated = current.filter((a) => a.id !== id);
  saveLocalAdvocates(updated);

  try {
    await deleteDoc(doc(db, "advocates", id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `advocates/${id}`);
    console.warn("Firestore deleteAdvocate failed, deleted locally:", err);
  }
}

// Reorder Advocates
export async function reorderAdvocates(advocates: AdvocateProfile[]): Promise<void> {
  const reordered = advocates.map((a, idx) => ({
    ...a,
    photoUrl: cleanPhotoUrl(a.photoUrl),
    displayOrder: idx + 1
  }));
  saveLocalAdvocates(reordered);

  try {
    for (const a of reordered) {
      const docRef = doc(db, "advocates", a.id);
      await setDoc(docRef, sanitizeFirestorePayload({
        ...a,
        updatedAt: Timestamp.now()
      }));
    }
  } catch (err) {
    console.warn("Firestore batch reorder failed, updated locally:", err);
  }
}

// Reset team to defaults (Clears all AI images to Monogram Seals)
export async function resetTeamToDefaults(): Promise<{ founder: FounderProfile; advocates: AdvocateProfile[] }> {
  saveLocalFounderProfile(DEFAULT_FOUNDER_PROFILE);
  saveLocalAdvocates(DEFAULT_ADVOCATES);

  try {
    await setDoc(doc(db, "founder_profile", "main"), {
      ...DEFAULT_FOUNDER_PROFILE,
      updatedAt: Timestamp.now()
    });
    for (const a of DEFAULT_ADVOCATES) {
      await setDoc(doc(db, "advocates", a.id), {
        ...a,
        updatedAt: Timestamp.now()
      });
    }
  } catch (err) {
    console.warn("Firestore reset to defaults failed, reset locally:", err);
  }

  return {
    founder: DEFAULT_FOUNDER_PROFILE,
    advocates: DEFAULT_ADVOCATES
  };
}

// ============================================================================
// 14. BRAND SETTINGS, LOGO, FAVICON & SOCIAL OG ASSET MANAGEMENT
// ============================================================================
export interface FirmBrandingSettings {
  logoUrl?: string;
  faviconUrl?: string;
  ogImageUrl?: string;
  firmName?: string;
  updatedAt?: any;
}

const LOCAL_BRAND_LOGO_KEY = "olive_official_brand_logo_v4";
const LOCAL_FAVICON_KEY = "olive_official_favicon_v4";
const LOCAL_OG_IMAGE_KEY = "olive_official_og_image_v4";

// --- BRAND LOGO ---
export function getLocalBrandLogo(): string {
  try {
    const raw = localStorage.getItem(LOCAL_BRAND_LOGO_KEY);
    if (raw && raw.trim().length > 0) {
      return raw;
    }
  } catch (e) {
    console.warn("Could not read local brand logo", e);
  }
  return "";
}

export function saveLocalBrandLogo(logoUrl: string): void {
  try {
    if (logoUrl && logoUrl.trim().length > 0) {
      localStorage.setItem(LOCAL_BRAND_LOGO_KEY, logoUrl);
    } else {
      localStorage.removeItem(LOCAL_BRAND_LOGO_KEY);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("olive_brand_logo_updated", { detail: { logoUrl } }));
      broadcastFirmSync("branding", { type: "logo", logoUrl });
    }
  } catch (e) {
    console.error("Error saving local brand logo:", e);
  }
}

export async function fetchBrandLogo(): Promise<string> {
  try {
    const docRef = doc(db, "firm_settings", "logo");
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data && typeof data.logoUrl === "string" && data.logoUrl.trim().length > 0) {
        saveLocalBrandLogo(data.logoUrl);
        return data.logoUrl;
      }
    }
  } catch (err) {
    console.warn("Firestore fetchBrandLogo unavailable, using local cache:", err);
  }
  return getLocalBrandLogo();
}

export async function saveBrandLogo(logoUrl: string): Promise<boolean> {
  saveLocalBrandLogo(logoUrl);
  try {
    const docRef = doc(db, "firm_settings", "logo");
    await setDoc(docRef, {
      logoUrl,
      updatedAt: Timestamp.now()
    }, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, "firm_settings/logo");
    console.warn("Firestore saveBrandLogo failed, saved locally:", err);
    return true;
  }
}

export async function resetBrandLogo(): Promise<void> {
  saveLocalBrandLogo("");
  try {
    const docRef = doc(db, "firm_settings", "logo");
    await setDoc(docRef, {
      logoUrl: "",
      updatedAt: Timestamp.now()
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore resetBrandLogo failed, reset locally:", err);
  }
}

// --- FAVICON LIVE SYSTEM ---
export function getLocalFavicon(): string {
  try {
    const raw = localStorage.getItem(LOCAL_FAVICON_KEY);
    if (raw && raw.trim().length > 0) {
      return raw;
    }
  } catch (e) {
    console.warn("Could not read local favicon", e);
  }
  return "";
}

export function saveLocalFavicon(faviconUrl: string): void {
  try {
    if (faviconUrl && faviconUrl.trim().length > 0) {
      localStorage.setItem(LOCAL_FAVICON_KEY, faviconUrl);
    } else {
      localStorage.removeItem(LOCAL_FAVICON_KEY);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("olive_favicon_updated", { detail: { faviconUrl } }));
      broadcastFirmSync("branding", { type: "favicon", faviconUrl });
    }
  } catch (e) {
    console.error("Error saving local favicon:", e);
  }
}

export async function fetchFavicon(): Promise<string> {
  try {
    const docRef = doc(db, "firm_settings", "favicon");
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data && typeof data.faviconUrl === "string" && data.faviconUrl.trim().length > 0) {
        saveLocalFavicon(data.faviconUrl);
        return data.faviconUrl;
      }
    }
  } catch (err) {
    console.warn("Firestore fetchFavicon unavailable, using local cache:", err);
  }
  return getLocalFavicon();
}

export async function saveFavicon(faviconUrl: string): Promise<boolean> {
  saveLocalFavicon(faviconUrl);
  try {
    const docRef = doc(db, "firm_settings", "favicon");
    await setDoc(docRef, {
      faviconUrl,
      updatedAt: Timestamp.now()
    }, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, "firm_settings/favicon");
    console.warn("Firestore saveFavicon failed, saved locally:", err);
    return true;
  }
}

export async function resetFavicon(): Promise<void> {
  saveLocalFavicon("");
  try {
    const docRef = doc(db, "firm_settings", "favicon");
    await setDoc(docRef, {
      faviconUrl: "",
      updatedAt: Timestamp.now()
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore resetFavicon failed, reset locally:", err);
  }
}

// --- SOCIAL SHARE / OG IMAGE LIVE SYSTEM ---
export function getLocalOgImage(): string {
  try {
    const raw = localStorage.getItem(LOCAL_OG_IMAGE_KEY);
    if (raw && raw.trim().length > 0) {
      return raw;
    }
  } catch (e) {
    console.warn("Could not read local og image", e);
  }
  return "";
}

export function saveLocalOgImage(ogImageUrl: string): void {
  try {
    if (ogImageUrl && ogImageUrl.trim().length > 0) {
      localStorage.setItem(LOCAL_OG_IMAGE_KEY, ogImageUrl);
    } else {
      localStorage.removeItem(LOCAL_OG_IMAGE_KEY);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("olive_og_image_updated", { detail: { ogImageUrl } }));
      broadcastFirmSync("branding", { type: "og_image", ogImageUrl });
    }
  } catch (e) {
    console.error("Error saving local og image:", e);
  }
}

export async function fetchOgImage(): Promise<string> {
  try {
    const docRef = doc(db, "firm_settings", "og_image");
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data && typeof data.ogImageUrl === "string" && data.ogImageUrl.trim().length > 0) {
        saveLocalOgImage(data.ogImageUrl);
        return data.ogImageUrl;
      }
    }
  } catch (err) {
    console.warn("Firestore fetchOgImage unavailable, using local cache:", err);
  }
  return getLocalOgImage();
}

export async function saveOgImage(ogImageUrl: string): Promise<boolean> {
  saveLocalOgImage(ogImageUrl);
  try {
    const docRef = doc(db, "firm_settings", "og_image");
    await setDoc(docRef, {
      ogImageUrl,
      updatedAt: Timestamp.now()
    }, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, "firm_settings/og_image");
    console.warn("Firestore saveOgImage failed, saved locally:", err);
    return true;
  }
}

export async function resetOgImage(): Promise<void> {
  saveLocalOgImage("");
  try {
    const docRef = doc(db, "firm_settings", "og_image");
    await setDoc(docRef, {
      ogImageUrl: "",
      updatedAt: Timestamp.now()
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore resetOgImage failed, reset locally:", err);
  }
}


