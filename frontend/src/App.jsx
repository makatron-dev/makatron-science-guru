import { Routes, Route, Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container" style={{ padding: '40px 16px' }}>
      <h1>Makatron Science Guru</h1>
      <p className="text-dim">CBT practice for Biology, Chemistry, Physics.</p>
      <div className="stack" style={{ marginTop: 24 }}>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        <Link to="/zoom">Zoom Classes</Link>
      </div>
    </div>
  );
}

function Login() { return <div className="container" style={{ padding: 40 }}><h1>Login</h1><Link to="/">Home</Link></div>; }
function Register() { return <div className="container" style={{ padding: 40 }}><h1>Register</h1><Link to="/">Home</Link></div>; }
function Dashboard() { return <div className="container" style={{ padding: 40 }}><h1>Dashboard</h1><Link to="/">Home</Link></div>; }
function Leaderboard() { return <div className="container" style={{ padding: 40 }}><h1>Leaderboard</h1><Link to="/">Home</Link></div>; }
function Test() { return <div className="container" style={{ padding: 40 }}><h1>Test</h1><Link to="/">Home</Link></div>; }
function Zoom() { return <div className="container" style={{ padding: 40 }}><h1>Zoom Classes</h1><Link to="/">Home</Link></div>; }

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/test/:subject" element={<Test />} />
      <Route path="/zoom" element={<Zoom />} />
    </Routes>
  );
}
