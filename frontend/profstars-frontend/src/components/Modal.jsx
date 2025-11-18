import React from "react";
import { motion } from "framer-motion";
import { FaStar, FaTimes } from "react-icons/fa";

const Modal = ({ item, type, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-content"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        {type === "professors" ? (
          <>
            <div className="modal-avatar">{item.name?.charAt(0)}</div>
            <h2>{item.name}</h2>
            <p>
              <strong>University:</strong> {item.university}
            </p>
            <p>
              <strong>Department:</strong> {item.department}
            </p>
            {item.averageRating && (
              <div className="modal-rating">
                <FaStar /> {item.averageRating.toFixed(1)}
              </div>
            )}
          </>
        ) : (
          <>
            <h2>{item.name}</h2>
            <p>
              <strong>Country:</strong> {item.country}
            </p>
            {item.web_pages?.[0] && (
              <a
                href={item.web_pages[0]}
                target="_blank"
                rel="noreferrer"
                className="modal-link"
              >
                Visit Website →
              </a>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Modal;
