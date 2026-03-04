import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useNavigate();

  return (
    <div className="landingPageContainer">
      <nav>
        <div className="navHeader">
          <h2 className="font-serif">Vision Meet</h2>
        </div>
        <button
          className="hamburger-menu"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation List */}
        <div className={`navlist ${isMenuOpen ? "navlist-open" : ""}`}>
          <p
            className="font-medium font-serif"
            onClick={() => {
              router("/aljk23");
              setIsMenuOpen(false);
            }}
          >
            Join as Guest
          </p>
          <p
            className="font-medium font-serif"
            onClick={() => {
              router("/auth");
              setIsMenuOpen(false);
            }}
          >
            Register
          </p>
          <div
            onClick={() => {
              router("/auth");
              setIsMenuOpen(false);
            }}
            role="button"
          >
            <p className="font-medium font-serif">Login</p>
          </div>
        </div>

        {isMenuOpen && (
          <div
            className="menu-overlay"
            onClick={() => setIsMenuOpen(false)}
          ></div>
        )}
      </nav>

      <div className="landingMainContainer">
        <div className="font-semibold order-2 md:order-1">
          <p >
            Distance is just a number. Vision Meet makes every mile feel like a
            moment.
          </p>
          <div role="button" className="font-serif">
            <Link to={"/auth"}>Get Started</Link>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <img  src="/mobile.png" alt="Mobile.png" />
        </div>
      </div>
    </div>
  );
}
