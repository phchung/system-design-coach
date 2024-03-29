import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop, FaUser, FaRobot } from 'react-icons/fa';

interface Message {
  content: string;
  timestamp: number;
  isSystemMessage: boolean;
}

interface OverlayComponentProps {
  initialSystemMessages: string[];
}

const OverlayComponent: React.FC<OverlayComponentProps> = ({ initialSystemMessages }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastSystemMessage, setLastSystemMessage] = useState('');
  const [isTypingEffectEnabled, setIsTypingEffectEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const recognition: any = new (window as any).webkitSpeechRecognition(); // Type assertion
  recognition.lang = 'en-US';
  recognition.continue = true;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate timestamps for initial system messages
    const initialMessagesWithTimestamps: Message[] = initialSystemMessages.map((message, index) => ({
      content: message,
      timestamp: Date.now() + index, // Adding index to ensure unique timestamps
      isSystemMessage: true,
    }));
    setMessages(initialMessagesWithTimestamps);

    // Clean up the message listener when component unmounts
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [initialSystemMessages]);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleMessage);
  }, []);

  const handleMessage = (message: { action: string; response: string }) => {
    if (message.action === 'chatGptResponse') {
      addMessage(message.response, true);
    }
  };

  const addMessage = (content: string, isSystemMessage: boolean) => {
    const newMessage = {
      content,
      timestamp: Date.now(),
      isSystemMessage,
    };
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight - messagesEndRef.current.clientHeight
    }
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    if (isSystemMessage) {
      setLastSystemMessage(content);
      setIsTypingEffectEnabled(true);
    }
  };

  const startRecording: () => void = () => {
    setIsRecording(true);
    recognition.start();
    addMessage('yes lets do that', false);
    recognition.onresult = (event: any) => {
      const transcript: string = event.results[0][0].transcript;
      addMessage(transcript, false);
      recognition.stop(); // Stop speech recognition
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      recognition.stop();
      setIsRecording(false);
    };
  };

  const sendRecording: () => Promise<void> = async () => {
    await chrome.runtime.sendMessage(undefined, {
      action: 'chatGptApiRequest',
      userMessage: lastSystemMessage,
    });
  };

  const stopRecording = () => {
    setIsRecording(false);
    recognition.stop();
    sendRecording();
  };

  return (
    <div id="overlay">
      <div id="overlay-content" ref={messagesEndRef}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.isSystemMessage ? 'system-message' : 'user-message'}`}
          >
            <div className="icon-container">
              {message.isSystemMessage ? (
                <FaRobot className="message-icon system-icon" />
              ) : (
                <FaUser className="message-icon user-icon" />
              )}
            </div>
            <div className="message-text">
              {message.isSystemMessage ? (
                <>
                  {isTypingEffectEnabled && lastSystemMessage === message.content ? (
                    <TypingEffect text={message.content} messagesEndRef={messagesEndRef} />
                  ) : (
                    message.content
                  )}
                </>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}
      </div>
      <button id="recording-button" onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? <FaStop color="red" /> : <FaMicrophone />}
      </button>
    </div>
  );
};

const TypingEffect: React.FC<{ text: string; messagesEndRef: React.RefObject<HTMLDivElement> }> = ({
  text,
  messagesEndRef,
}) => {
  const [displayText, setDisplayText] = useState('');
  const typingEffectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typingEffectRef.current) {
      typingEffectRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const scrollAtBottom = () => {
      if (messagesEndRef.current) {
        const { scrollHeight, scrollTop, clientHeight } = messagesEndRef.current;
        return scrollHeight - scrollTop !== clientHeight;
      }
      return true; // If messagesEndRef is not available, assume we're at the bottom
    };

    let index = 0;
    const intervalId = setInterval(() => {
      setDisplayText((prevText) => {
        const newDisplayText = text.substring(0, index + 1);
        index++;
        if (scrollAtBottom()) {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight - messagesEndRef.current.clientHeight
          }
        }
        return newDisplayText;
      });

      if (index === text.length) {
        clearInterval(intervalId);
      }
    }, 20);
    return () => {
      clearInterval(intervalId);
    };
  }, [text, messagesEndRef]);

  return <div ref={typingEffectRef}>{displayText}</div>;
};

export default OverlayComponent;
