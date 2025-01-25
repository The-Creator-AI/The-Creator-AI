import React, { useEffect, useRef, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        setIsClosing(true);
      }
    };

    // Add event listeners when the modal is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      // Clean up the event listener when the modal closes
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close the modal after the closing animation finishes
  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        onClose();
        setIsClosing(false);
      }, 200); // Adjust the timeout to match the animation duration

      return () => clearTimeout(timer);
    }
  }, [isClosing, onClose]);

  // VS Code's default modal has a dark background with a slightly transparent white overlay
  return isOpen ? (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-200 ${isClosing ? "opacity-0" : "opacity-100"
        }`}
    >
      <div className="fixed inset-0 bg-black bg-opacity-75"></div>
      <div
        ref={modalRef}
        className={`fixed inset-0 flex items-center justify-center p-4 transition-all duration-200 ${isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
      >
        <div
          className="bg-white rounded-md shadow-lg p-6 relative overflow-y-auto max-h-[90vh]"
          style={{ maxWidth: "700px" }}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          {/* Modal content */}
          {children}
        </div>
      </div>
    </div>
  ) : null;
};

export default Modal;