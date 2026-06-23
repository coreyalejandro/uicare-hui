'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const MemoryNavigator = dynamic(() => import('../components/MemoryNavigator'), {
  ssr: false,
});
const MemoryViewer = dynamic(() => import('../components/MemoryViewer'), {
  ssr: false,
});

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

export default function MemoryPage() {
  const [currentFile, setCurrentFile] = useState('projectbrief');
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
    
    fetchMemoryFile();
  }, [currentFile]);
  
  const currentFileName = MEMORY_FILES.find(f => f.path === currentFile)?.name || 'Memory File';
  
  return (
    <div className="memory-page">
      <h1 className="page-title">Memory Bank</h1>
      <p className="page-description">
        Access and navigate through Cline&apos;s memory files to understand the UICare System project.
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
        
        .page-title {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
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
