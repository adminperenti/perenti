import fs from 'fs';

const path = 'src/pages/Login.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update imports
content = content.replace(
  'import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";',
  'import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";'
);
content = content.replace(
  'import { doc, setDoc } from "firebase/firestore";',
  'import { doc, setDoc, getDoc } from "firebase/firestore";'
);

// 2. Add handleGoogleLogin
const handleSubmitStr = '  const handleSubmit = async (e) => {';
const googleLoginLogic = `  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // New user, create profile
        await setDoc(docRef, {
          name: user.displayName || "",
          email: user.email,
          avatar: user.photoURL || "",
          created_at: new Date().toISOString()
        });
      }
      
      navigate("/discover");
    } catch (err) {
      console.error(err);
      setError("Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {`;
content = content.replace(handleSubmitStr, googleLoginLogic);

// 3. Add Google Button UI
const formEndStr = '          </form>';
const googleUI = `          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border)' }} />
            <span style={{ margin: '0 12px', fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border)' }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "1rem",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              background: "var(--bg-elevated)",
              border: "1.5px solid var(--border-medium)",
              color: "var(--text-primary)",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              opacity: loading ? 0.7 : 1,
            }}
            onMouseOver={(e) => { if(!loading) e.currentTarget.style.borderColor = "var(--primary)" }}
            onMouseOut={(e) => { if(!loading) e.currentTarget.style.borderColor = "var(--border-medium)" }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>`;
content = content.replace(formEndStr, googleUI);

fs.writeFileSync(path, content);
console.log('Patched Login.jsx');
