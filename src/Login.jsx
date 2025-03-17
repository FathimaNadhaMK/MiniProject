import React, { useState, useEffect } from 'react';   
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError('Please verify your email before logging in.');
        setLoading(false);
        return;
      }

      alert('Login successful!');
      navigate('/home');
    } catch (error) {
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email format.');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        default:
          setError('Login failed. Please try again.');
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      document.body.classList.add('loaded');
    }, 500);

    const handleScroll = () => {
      const projectInfo = document.getElementById('project-info');
      if (projectInfo) {
        const rect = projectInfo.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75) {
          projectInfo.classList.add('visible');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className="header">
        <h1 className="logo">LocalStream</h1>
        <div className="header-buttons">
          <Link to="/login" className="header-btn">Login</Link>
          <Link to="/signup" className="header-btn">Sign Up</Link>
          <button className="header-btn" onClick={() => document.getElementById("project-info").scrollIntoView({ behavior: "smooth" })}>About</button>
        </div>
      </header>

      <div className="container">
        <div className='background-wrapper'>
          <form onSubmit={handleSubmit} className="responsive-form">
            <h2>What’s Latest In This Area</h2>
            {error && <div className="error-message">{error}</div>}
            <div className="input-group">
              <label>Email</label>
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
            </div>
            <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Log In'}</button>
            <p className="signup-text">Don't have an account? <Link to="/signup">Sign Up</Link></p>
          </form>
        </div>
      </div>

      <div className="project-info" id="project-info">
        <h2><em>Get the most out of</em> <br /> your neighborhood with <strong>LocalStream</strong></h2>
        <p>"LocalStream is your go-to platform for staying informed about everything happening in your community." 🚀</p>
        <div className="features">
          <div className="feature"><img src="/icon-news.png" alt="News Icon" /><h3>Essential</h3><p>Relevant news from neighbors, businesses, and local sources.</p></div>
          <div className="feature"><img src="/icon-location.png" alt="Location Icon" /><h3>Local</h3><p>Instantly connect to events and updates near your home.</p></div>
          <div className="feature"><img src="/icon-announcement.png" alt="Trust Icon" /><h3>Trusted</h3><p>Reliable platform with verified information.</p></div>
        </div>
        <div className='cta'>
          <h3><em>Instantly connect with your neighborhood</em></h3>
          <button className="cta-button" onClick={() => navigate("/signup")}>Sign Up</button>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-box">
          <h3>About LocalStream</h3>
          <p>Stay informed and connected with real-time local news and updates.</p>
        </div>
      </footer>
    </>
  );
}

export default Login;