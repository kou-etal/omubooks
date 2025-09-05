import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 text-center text-gray-500 text-sm mt-10">
      © {new Date().getFullYear()} TextbookMarket. All rights reserved.
    </footer>
  );
}
