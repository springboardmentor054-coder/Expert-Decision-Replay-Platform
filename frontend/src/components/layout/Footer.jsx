import React from "react";
import "../../styles/layout.css";

const Footer = () => {
  return (
    <footer className="app-footer">

      <div className="footer-left">
        © {new Date().getFullYear()} Expert Decision Replay Platform
      </div>

      <div className="footer-center">
        Developed for Infosys Springboard Virtual Internship
      </div>

      <div className="footer-right">
        Version 1.0
      </div>

    </footer>
  );
};

export default Footer;