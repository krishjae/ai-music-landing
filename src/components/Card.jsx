// File: components/Card.jsx
import React from 'react';
import styled from 'styled-components';

const Card = ({ title, description, isClickable = false, onClick }) => {
  return (
    <StyledWrapper>
      <div className={`card ${isClickable ? 'clickable' : ''}`} onClick={onClick}>
        <div className="mac-header">
          <span className="red" />
          <span className="yellow" />
          <span className="green" />
        </div>
        <span className="card-title">{title}</span>
        <p className="card-description">{description}</p>
        <span className="card-tag">Feature</span> 
        <span className="card-tag">Music AI</span>
        {isClickable && <span className="card-tag interactive">Click to Explore</span>}
        <div className="code-editor">
          <pre><code>{isClickable ? 
            `// AI-Powered Feature\nfunction ${title.replace(/\s+/g, '')}() {\n  return "Advanced Music Intelligence";\n}` :
            '<h1> Powered by AI </h1>'
          }</code></pre>
        </div>
        {isClickable && (
          <div className="click-indicator">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="#28c941" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card {
    width: 100%;
    padding: 20px;
    border: 1px solid #0d1117;
    border-radius: 10px;
    background-color: #000;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    cursor: ${props => props.isClickable ? 'pointer' : 'default'};
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    position: relative;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  .card.clickable {
    cursor: pointer;
  }

  .card:hover, .card.clickable:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    border-color: #28c941;
  }

  .card.clickable:hover .mac-header .green {
    box-shadow: 0 0 10px #28c941;
  }

  .mac-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 15px;
  }

  .mac-header span {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    transition: box-shadow 0.2s;
  }

  .mac-header .red {
    background-color: #ff5f57;
  }

  .mac-header .yellow {
    background-color: #ffbd2e;
  }

  .mac-header .green {
    background-color: #28c941;
  }

  .card-title {
    font-size: 18px;
    font-weight: bold;
    margin: 0 0 10px;
    color: #e6e6ef;
  }

  .card-description {
    font-size: 14px;
    color: #ccc;
    margin-bottom: 15px;
    line-height: 1.4;
  }

  .card .card-tag {
    display: inline-block;
    font-size: 10px;
    border-radius: 5px;
    background-color: #0d1117;
    padding: 4px 8px;
    margin-right: 6px;
    margin-bottom: 12px;
    color: #dcdcdc;
    border: 1px solid #333;
  }

  .card .card-tag.interactive {
    background-color: #28c941;
    color: #000;
    font-weight: bold;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }

  .code-editor {
    background-color: #0d1117;
    color: #dcdcdc;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;
    line-height: 1.5;
    border-radius: 5px;
    padding: 15px;
    overflow: auto;
    height: 120px;
    border: 1px solid #333;
    margin-bottom: 10px;
  }

  .code-editor::-webkit-scrollbar {
    width: 6px;
  }

  .code-editor::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 3px;
  }

  .code-editor pre code {
    white-space: pre-wrap;
    display: block;
    color: #58a6ff;
  }

  .click-indicator {
    position: absolute;
    bottom: 15px;
    right: 15px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .card.clickable:hover .click-indicator {
    opacity: 1;
  }
`;

export default Card;
