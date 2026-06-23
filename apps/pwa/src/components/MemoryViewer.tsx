'use client';

import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

interface MemoryViewerProps {
  content: string;
  fileName: string;
}

export default function MemoryViewer({ content, fileName }: MemoryViewerProps) {
  const [renderedContent, setRenderedContent] = useState('');
  
  useEffect(() => {
    // Configure marked with syntax highlighting
    const renderer = new marked.Renderer();
    
    // Add syntax highlighting to the renderer
    renderer.code = function({ text, lang }) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          const highlighted = hljs.highlight(text, { language: lang }).value;
          return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
        } catch (err) {
          console.error('Error highlighting code:', err);
        }
      }
      return `<pre><code>${text}</code></pre>`;
    };

    marked.setOptions({
      renderer,
      gfm: true,
      breaks: true
    });
    
    // Generate table of contents
    const lines = content.split('\n');
    let toc = '## Table of Contents\n';
    let headerCount = 0;
    
    lines.forEach(line => {
      if (line.startsWith('# ')) {
        const headerText = line.replace('# ', '');
        const anchor = headerText.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
        toc += `- [${headerText}](#${anchor})\n`;
        headerCount++;
      } else if (line.startsWith('## ') && !line.includes('Table of Contents')) {
        const headerText = line.replace('## ', '');
        const anchor = headerText.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
        toc += `  - [${headerText}](#${anchor})\n`;
        headerCount++;
      }
    });
    
    // Only add TOC if we have headers
    const contentWithToc = headerCount > 1 
      ? content.replace('# ', `# ${fileName}\n\n${toc}\n\n# `) 
      : content;
    
    // Render markdown and sanitize the result to prevent XSS
    const rendered = marked.parse(contentWithToc);
    if (typeof rendered === 'string') {
      const sanitized = DOMPurify.sanitize(rendered);
      setRenderedContent(sanitized);
    }
  }, [content, fileName]);

  return (
    <div className="memory-viewer">
      <div 
        className="markdown-content prose prose-slate max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: renderedContent }} 
      />
      <style jsx>{`
        .memory-viewer {
          background: white;
          color: #333;
          padding: 2rem;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-height: calc(100vh - 200px);
          overflow-y: auto;
        }
        
        .memory-viewer :global(h1) {
          font-size: 2.25rem;
          border-bottom: 2px solid #eaeaea;
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .memory-viewer :global(h2) {
          font-size: 1.75rem;
          border-bottom: 1px solid #eaeaea;
          padding-bottom: 0.25rem;
          margin: 1.5rem 0 1rem;
        }
        
        .memory-viewer :global(pre) {
          background: #f6f8fa;
          padding: 1rem;
          border-radius: 0.25rem;
          overflow-x: auto;
        }
        
        .memory-viewer :global(code) {
          font-family: 'Consolas', 'Monaco', monospace;
        }
        
        .memory-viewer :global(blockquote) {
          border-left: 4px solid #ddd;
          padding-left: 1rem;
          color: #666;
        }
        
        .memory-viewer :global(.table-of-contents) {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 0.25rem;
          margin-bottom: 2rem;
        }
        
        .memory-viewer :global(table) {
          border-collapse: collapse;
          width: 100%;
        }
        
        .memory-viewer :global(th, td) {
          border: 1px solid #ddd;
          padding: 0.5rem;
        }
        
        .memory-viewer :global(th) {
          background: #f2f2f2;
        }

        .memory-viewer :global(.mermaid) {
          margin: 2rem 0;
        }
      `}</style>
    </div>
  );
}
