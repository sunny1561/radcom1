// app/components/DocumentList.tsx
"use client"
import React from 'react';

interface DocumentListProps {
    Documents?: string[];
}

const DocumentList: React.FC<DocumentListProps> = ({ Documents }) => {
  
  if(!Documents||!Documents.length  ){
    return null
  }
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-6">
      {Documents.length > 0 && (
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Related Documents</h2>
      )}
      <ul className="space-y-2">
        {Documents.length>0&&Documents.map((item, index) => (
          <li 
            key={index}
            className="bg-gray-50 hover:bg-gray-100 rounded-md p-3 transition duration-150 ease-in-out"
          >
            <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline">
              {item}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentList;