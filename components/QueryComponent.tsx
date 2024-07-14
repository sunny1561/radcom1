// components/QueryComponent.tsx
"use client"
import React, { useState, useEffect, useRef } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const QueryComponent: React.FC = () => {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messageEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    console.log(chatHistory);
    
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setChatHistory(prev => [...prev, { role: 'user', content: query }]);

    try {
      const response = await fetch('/api/query1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: query,
          chat_history: chatHistory.map(msg => msg.content),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let assistantResponse = '';
      setDocuments([]);
      setImages([]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (typeof data.message === 'string') {
              assistantResponse += data.message;
              updateChatHistory(assistantResponse);
            } else if (data.message.documents) {
              setDocuments(data.message.documents);
            }
            if (data.message.imageData) {
              setImages(data.message.imageData);
            }
            if (data.message.done) {
              setIsLoading(false);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error calling chat API:', error);
      setIsLoading(false);
    } finally {
      setQuery('');
      setIsLoading(false);

    }
  };
  const formatContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.match(/^\d+\./)) {
        return (
          <li key={index} className="ml-6 list-decimal">
            {line.replace(/^\d+\./, '').trim()}
          </li>
        );
      } else if (line.trim().startsWith('-')) {
        return (
          <li key={index} className="ml-6 list-disc">
            {line.replace(/^-/, '').trim()}
          </li>
        );
      }
      return <p key={index}>{line}</p>;
    });
  };
  
  const updateChatHistory = (content: string) => {
    setChatHistory(prev => {
      const newHistory = [...prev];
      if (newHistory[newHistory.length - 1].role === 'assistant') {
        newHistory[newHistory.length - 1].content = content;
      } else {
        newHistory.push({ role: 'assistant', content });
      }
      return newHistory;
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You' : 'Assistant'}:</strong> 
            <div className="prose max-w-none">{formatContent(msg.content)}</div>
              <button
                // onClick={() => copyToClipboard(message.content)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {/* <Copy size={16} /> */}
              </button>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="chat-input-form">
        <textarea
          // type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
          disabled={isLoading}
          className='w-full'
          onKeyPress={(e)=>{
            if(e.key === 'Enter'){
              e.preventDefault();
              handleSubmit(e);
            }}}
        />
        <button type="submit" onKeyPress={(e)=>{
          if(e.key === 'Enter'){
            e.preventDefault();
            handleSubmit(e);
          }
        }} disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Send'}
        </button>
      </form>
      {documents.length > 0 && (
        <div className="related-documents">
          <h3>Related Documents:</h3>
          <ul>
            {documents.map((doc, index) => (
              <li key={index}>{doc}</li>
              
            ))}
          </ul>
        </div>
      )}
      {images.length > 0 && (
        <div className="related-images">
          <h3>Related Images:</h3>
          {/* {images.map((image, index) => (
            <img key={index} src={image.metadata.image_url} alt={`Related image ${index + 1}`} />
          ))} */}
        </div>
      )}
    </div>
  );
};

export default QueryComponent;