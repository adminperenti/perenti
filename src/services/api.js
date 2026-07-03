import { db, auth } from '../config/firebase';
import { collection, getDocs, doc, getDoc, setDoc, query, where, updateDoc, deleteDoc, addDoc, orderBy } from 'firebase/firestore';

export const getTagColor = (tag) => {
  const TAG_COLORS = {
    Founder: "tag-green",
    Investor: "tag-blue",
    Student: "tag-purple",
    "Business Owner": "tag-orange",
  };
  return TAG_COLORS[tag] || "tag";
};

export const FILTER_TAGS = [
  "All",
  "Founder",
  "Student",
  "Business Owner",
  "Investor",
  "Working Professional",
];

export const getSession = async () => {
  try {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
};

// Members
export const fetchMembers = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    const members = [];
    snapshot.forEach((docSnap) => {
      members.push({ id: docSnap.id, ...docSnap.data() });
    });
    return members;
  } catch (err) {
    console.error("fetchMembers error:", err);
    return [];
  }
};

export const getCurrentUser = async (user) => {
  if (!user || !user.email) return null;
  try {
    const docSnap = await getDoc(doc(db, 'users', user.email));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return {
      name: user.name || "New Member",
      email: user.email,
      profession: "",
      avatar: "",
      needsOnboarding: true,
    };
  } catch (err) {
    return {
      name: user.name || "New Member",
      email: user.email,
      profession: "",
      avatar: "",
      needsOnboarding: true,
    };
  }
};

export const createMember = async (memberData) => {
  try {
    const uid = memberData.uid;
    if (!uid) throw new Error("UID required to create member");
    await setDoc(doc(db, 'users', uid), memberData, { merge: true });
    return memberData;
  } catch (err) {
    console.error("createMember error:", err);
    throw err;
  }
};

export const updateMember = async (uid, updateData) => {
  if (!uid) throw new Error("UID required to update member");
  try {
    await setDoc(doc(db, 'users', uid), updateData, { merge: true });
    return { uid, ...updateData };
  } catch (err) {
    console.error("updateMember error:", err);
    throw err;
  }
};

export const isProfileComplete = (user) => {
  if (!user) return false;
  const required = ["name", "profession", "bio"];
  for (const field of required) {
    if (!user[field] || String(user[field]).trim() === "") return false;
  }
  if (
    (!user.location || String(user.location).trim() === "") &&
    (!user.area || String(user.area).trim() === "")
  ) {
    return false;
  }
  const linkedinVal = user.linkedin || user.linkedIn;
  if (
    (!linkedinVal || String(linkedinVal).trim() === "") &&
    (!user.instagram || String(user.instagram).trim() === "")
  ) {
    return false;
  }
  return true;
};

// Meetups (Events)
export const fetchMeetups = async (includePast = false) => {
  try {
    const snapshot = await getDocs(collection(db, 'events'));
    const meetups = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      meetups.push({
        id: docSnap.id,
        title: data.name || data.title,
        ...data,
      });
    });
    
    const activeMeetups = includePast ? meetups : meetups.filter((m) => m.is_active !== false);

    return activeMeetups.sort((a, b) => {
      if (a.is_active && !b.is_active) return -1;
      if (!a.is_active && b.is_active) return 1;

      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });
  } catch (err) {
    console.error("fetchMeetups error:", err);
    return [];
  }
};

export const createSlug = (title) => {
  if (!title) return "";
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const fetchMeetup = async (idOrSlug) => {
  try {
    const allMeetups = await fetchMeetups();
    const match = allMeetups.find(
      (m) => m.id === idOrSlug || createSlug(m.title) === idOrSlug || m.slug === idOrSlug
    );
    if (match) return match;
    
    // Try by ID
    const docSnap = await getDoc(doc(db, 'events', idOrSlug));
    if (docSnap.exists()) {
      return { id: docSnap.id, title: docSnap.data().name || docSnap.data().title, ...docSnap.data() };
    }
    return null;
  } catch (err) {
    console.error("fetchMeetup error:", err);
    return null;
  }
};

export const createMeetup = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'events'), {
      ...data,
      created_at: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  } catch (err) {
    console.error("createMeetup error:", err);
    throw err;
  }
};

export const updateMeetup = async (id, data) => {
  try {
    await setDoc(doc(db, 'events', id), data, { merge: true });
    return { id, ...data };
  } catch (err) {
    console.error("updateMeetup error:", err);
    throw err;
  }
};

export const deleteMeetup = async (id) => {
  try {
    await deleteDoc(doc(db, 'events', id));
    return { success: true };
  } catch (err) {
    console.error("deleteMeetup error:", err);
    throw err;
  }
};

// Reservations (Tickets)
export const createReservation = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'tickets'), {
      ...data,
      created_at: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  } catch (err) {
    console.error("createReservation error:", err);
    throw err;
  }
};

export const fetchReservations = async (meetupId) => {
  try {
    const q = query(collection(db, 'tickets'), where('meetup_id', '==', meetupId));
    const snapshot = await getDocs(q);
    const res = [];
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      let meetup = null;
      const mSnap = await getDoc(doc(db, 'events', meetupId));
      if (mSnap.exists()) {
        meetup = { id: mSnap.id, title: mSnap.data().name || mSnap.data().title, ...mSnap.data() };
      }
      res.push({ id: docSnap.id, ...data, meetup });
    }
    return res;
  } catch (err) {
    console.error("fetchReservations error:", err);
    return [];
  }
};

export const updateReservationStatus = async (reservationId, status) => {
  try {
    await updateDoc(doc(db, 'tickets', reservationId), { status });
    return { id: reservationId, status };
  } catch (err) {
    console.error("updateReservationStatus error:", err);
    throw err;
  }
};

export const fetchUserReservations = async (email) => {
  try {
    const q = query(collection(db, 'tickets'), where('email', '==', email));
    const snapshot = await getDocs(q);
    const res = [];
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const meetupId = data.meetup_id || data.eventId;
      let meetup = null;
      if (meetupId) {
        const mSnap = await getDoc(doc(db, 'events', meetupId));
        if (mSnap.exists()) {
          meetup = { id: mSnap.id, title: mSnap.data().name || mSnap.data().title, ...mSnap.data() };
        }
      }
      res.push({ id: docSnap.id, ...data, meetup });
    }
    return res;
  } catch (err) {
    console.error("fetchUserReservations error:", err);
    return [];
  }
};

export const scanTicket = async (ticketId, action = "check_in") => {
  try {
    const status = action === "check_in" ? "checked-in" : "scanned";
    await updateDoc(doc(db, 'tickets', ticketId), { status, scanned_at: new Date().toISOString() });
    return { success: true, status };
  } catch (err) {
    console.error("scanTicket error:", err);
    throw err;
  }
};

// Payment Approvals
export const createPendingReservation = async (data) => {
  try {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const docRef = await addDoc(collection(db, 'tickets'), {
      ...data,
      status: "pending_payment",
      expires_at: expiresAt,
      created_at: new Date().toISOString()
    });
    return { id: docRef.id, ...data, status: "pending_payment" };
  } catch (err) {
    console.error("createPendingReservation error:", err);
    throw err;
  }
};

export const checkExistingPending = async (userEmail, meetupId) => {
  if (!userEmail || !meetupId) return null;
  try {
    const q = query(collection(db, 'tickets'), where('email', '==', userEmail), where('status', '==', 'pending_payment'));
    const snapshot = await getDocs(q);
    let found = null;
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if ((data.meetup_id === meetupId || data.eventId === meetupId) && data.expires_at) {
        if (new Date(data.expires_at) > new Date()) {
          found = { id: docSnap.id, ...data };
        }
      }
    });
    return found;
  } catch (err) {
    console.error("checkExistingPending error:", err);
    return null;
  }
};

export const fetchPendingApprovals = async (adminEmail) => {
  try {
    const q = query(collection(db, 'tickets'), where('status', '==', 'pending_payment'));
    const snapshot = await getDocs(q);
    const res = [];
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const meetupId = data.meetup_id || data.eventId;
      let meetup = null;
      if (meetupId) {
        const mSnap = await getDoc(doc(db, 'events', meetupId));
        if (mSnap.exists()) {
          meetup = { id: mSnap.id, title: mSnap.data().name || mSnap.data().title, ...mSnap.data() };
        }
      }
      res.push({ id: docSnap.id, ...data, meetup });
    }
    return res;
  } catch (err) {
    console.error("fetchPendingApprovals error:", err);
    return [];
  }
};

export const approveReservation = async (id, adminEmail) => {
  try {
    await updateDoc(doc(db, 'tickets', id), { status: "confirmed", approved_by: adminEmail, approved_at: new Date().toISOString() });
    return { success: true, status: "confirmed" };
  } catch (err) {
    console.error("approveReservation error:", err);
    throw err;
  }
};

export const rejectReservation = async (id, adminEmail) => {
  try {
    await updateDoc(doc(db, 'tickets', id), { status: "rejected", rejected_by: adminEmail, rejected_at: new Date().toISOString() });
    return { success: true, status: "rejected" };
  } catch (err) {
    console.error("rejectReservation error:", err);
    throw err;
  }
};
