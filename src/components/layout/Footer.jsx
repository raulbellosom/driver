import React from "react";
import { Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto pt-12 pb-6">
      <div className="text-center">
        <p className="text-xs text-gray-400 dark:text-gray-600">
          © {currentYear} DriverPro • Desarrollado con{" "}
          <Heart className="inline h-3 w-3 text-red-400 fill-current mx-0.5" />{" "}
          por{" "}
          <a
            href="https://racoondevs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300 transition-colors font-medium"
          >
            RacoonDevs
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
