'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface MemoryFile {
  name: string;
  path: string;
  description: string;
}

interface MemoryNavigatorProps {
  files: MemoryFile[];
  currentFile: string;
}

export default function MemoryNavigator({ files, currentFile }: MemoryNavigatorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFiles, setFilteredFiles] = useState<MemoryFile[]>(files);
  
  useEffect(() => {
    setFilteredFiles(
      files.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, files]);
  
  return (
    <div className="memory-navigator">
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search memory files..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="files-list">
        {filteredFiles.map((file) => (
          <Link 
            key={file.path}
            href={`/memory/${file.path}`}
            className={`file-item ${currentFile === file.path ? 'active' : ''}`}
          >
            <div className="file-name">{file.name}</div>
            <div className="file-description">{file.description}</div>
          </Link>
        ))}
      </div>
      
      <style jsx>{`
        .memory-navigator {
          background: #f8f9fa;
          border-radius: 0.5rem;
          padding: 1rem;
          width: 100%;
          margin-bottom: 1rem;
        }
        
        .search-container {
          margin-bottom: 1rem;
        }
        
        .search-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        
        .files-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .file-item {
          background: white;
          border: 1px solid #ddd;
          border-radius: 0.25rem;
          padding: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          width: calc(33.333% - 0.5rem);
          text-decoration: none;
          color: inherit;
        }
        
        .file-item:hover {
          background: #f0f4f8;
          border-color: #90cdf4;
        }
        
        .file-item.active {
          background: #ebf8ff;
          border-color: #4299e1;
        }
        
        .file-name {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        
        .file-description {
          font-size: 0.75rem;
          color: #666;
        }
        
        @media (max-width: 768px) {
          .file-item {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
