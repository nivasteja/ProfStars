import { Link } from "react-router-dom";
import "../styles/Home.css";
import logo from "../assets/logo.svg"; // ✅ make sure you have your logo inside /assets folder

const Home = () => {
  return (
    <div className="home-page">
      <div className="overlay">
        <header className="home-header">
          <img src={logo} alt="ProfStars Logo" className="home-logo" />
          <h1 className="home-title">ProfStars</h1>
        </header>

        <div className="home-content">
          <h2 className="tagline">
            Rate. Discover. Empower. <br /> Explore professors across the globe.
          </h2>
          <p className="subtext">
            Join our international academic community where students share reviews,
            professors shine, and knowledge connects us all.
          </p>

          <div className="home-buttons">
            <Link to="/login" className="btn primary">
              Login
            </Link>
            <Link to="/register" className="btn secondary">
              Register
            </Link>
          </div>
        </div>

        <footer className="home-footer">
          <p>© {new Date().getFullYear()} ProfStars | All Rights Reserved</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;


