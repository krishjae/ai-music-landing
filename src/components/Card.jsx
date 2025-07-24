
// File: components/Card.jsx
import React from 'react';
import styled from 'styled-components';

const Card = ({ title, description }) => {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="mac-header">
          <span className="red" />
          <span className="yellow" />
          <span className="green" />
        </div>
        <span className="card-title">{title}</span>
        <p className="card-description">{description}</p>
        <span className="card-tag">Feature</span> <span className="card-tag">Music AI</span>
        <div className="code-editor">
          <pre><code>&lt;h1&gt; Powered by AI &lt;/h1&gt;</code></pre>
        </div>
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
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    position: relative;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
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
  }

  .card .card-tag {
    display: inline-block;
    font-size: 10px;
    border-radius: 5px;
    background-color: #0d1117;
    padding: 4px;
    margin-block-end: 12px;
    color: #dcdcdc;
  }

  .code-editor {
    background-color: #0d1117;
    color: #dcdcdc;
    font-family: monospace;
    font-size: 14px;
    line-height: 1.5;
    border-radius: 5px;
    padding: 15px;
    overflow: auto;
    height: 150px;
    border: 1px solid #333;
  }

  .code-editor::-webkit-scrollbar {
    width: 8px;
  }

  .code-editor::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 4px;
  }

  .code-editor pre code {
    white-space: pre-wrap;
    display: block;
  }
`;

export default Card;
