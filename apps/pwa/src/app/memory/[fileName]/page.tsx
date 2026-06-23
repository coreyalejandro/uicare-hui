'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import MemoryNavigator from '../../components/MemoryNavigator';
import MemoryViewer from '../../components/MemoryViewer';

const MEMORY_FILES = [
  { 
    name: 'Project Brief', 
    path: 'projectbrief', 
    description: 'Overview of the UICare System project'
  },
  { 
    name: 'Product Context', 
    path: 'productContext', 
    description: 'Why this project exists and problems it solves'
  },
  { 
    name: 'System Patterns', 
    path: 'systemPatterns', 
    description: 'System architecture and design patterns'
  },
  { 
    name: 'Tech Context', 
    path: 'techContext', 
    description: 'Technologies, development setup, and constraints'
  },
  { 
    name: 'Active Context', 
    path: 'activeContext', 
    description: 'Current work focus and recent changes'
  },
  { 
    name: 'Progress', 
    path: 'progress', 
    description: 'What works and what\'s left to build'
  },
  { 
    name: 'Cline Rules', 
    path: '.clinerules', 
    description: 'Project-specific conventions and patterns'
  }
];

export default function MemoryFilePage() {
  const params = useParams();
  const currentFile = params.fileName as string;
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMemoryFile = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/memory/${currentFile}`);
        if (!response.ok) throw new Error('Failed to fetch memory file');
        const data = await response.json();
        setFileContent(data.content);
      } catch (error) {
        console.error('Error fetching memory file:', error);
        setFileContent('# Error Loading File\n\nUnable to load the requested memory file.');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentFile) {
      fetchMemoryFile();
    }
  }, [currentFile]);
  
  const currentFileName = MEMORY_FILES.find(f => f.path === currentFile)?.name || 'Memory File';
  
  return (
    <div className="memory-page">
      <div className="header">
        <h1 className="page-title">Memory Bank</h1>
        <Link href="/memory" className="back-link">Back to All Files</Link>
      </div>
      
      <p className="page-description">
        Viewing: <strong>{currentFileName}</strong>
      </p>
      
      <MemoryNavigator 
        files={MEMORY_FILES} 
        currentFile={currentFile} 
      />
      
      {loading ? (
        <div className="loading">Loading memory file...</div>
      ) : (
        <MemoryViewer 
          content={fileContent} 
          fileName={currentFileName} 
        />
      )}
      
      <style jsx>{`
        .memory-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .page-title {
          font-size: 2.5rem;
          margin: 0;
        }
        
        .back-link {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: #e6f2ff;
          color: #0066cc;
          border-radius: 0.25rem;
          text-decoration: none;
          font-weight: 500;
          transition: background 0.2s;
        }
        
        .back-link:hover {
          background: #cce4ff;
        }
        
        .page-description {
          color: #666;
          margin-bottom: 2rem;
        }
        
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 300px;
          background: #f8f9fa;
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
}
