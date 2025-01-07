import React, { useState, useEffect, useRef } from 'react'
import { FaMicrophone, FaMicrophoneSlash, FaStop } from 'react-icons/fa'
import { PiStudentBold, PiChalkboardTeacherDuotone } from 'react-icons/pi'
// @ts-ignore
import OpenAIClient from '../api/chatGptClient.js';

interface Message {
  content: string
  timestamp: number
  isSystemMessage: boolean
}

interface OverlayComponentProps {
  initialSystemMessages: string[]
}

const OverlayComponent: React.FC<OverlayComponentProps> = ({ initialSystemMessages }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [lastSystemMessage, setLastSystemMessage] = useState('')
  const [isTypingEffectEnabled, setIsTypingEffectEnabled] = useState(false)
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [isResponseLoading, setIsResponseLoading] = useState<boolean>(false)
  const [transcript, setTranscript] = useState('')
  const recognition: any = new (window as any).webkitSpeechRecognition() // Type assertion
  recognition.lang = 'en-US'
  recognition.continuous = true

  recognition.onresult = (event: any) => {
    if (event.results[event.resultIndex].isFinal) {
      let transcript = '';
      const lastResult = event.results[event.resultIndex];
      transcript += lastResult[0].transcript;
      setTranscript((prevTranscript) => prevTranscript + ' ' + transcript);
    }
  };

  recognition.onerror = (event: any) => {
    console.error('Speech recognition error:', event.error)
    console.log(event)
    recognition.onend = null;
    recognition.stop()
    setIsRecording(false)
    setIsResponseLoading(false)
  }

  recognition.onabort = (event: any) => {
    console.error('Speech recognition abort:', event.error)
    recognition.onend = null;
    recognition.stop()
    setIsRecording(false)
    setIsResponseLoading(false)
  }

  const messagesEndRef = useRef<HTMLDivElement>(null)
  // const openAiClient = new OpenAIClient("", "");

  useEffect(() => {
    // Sequentially add system messages with typewriter effect
    initialSystemMessages.forEach((message, index) => {
      setTimeout(() => {
        addMessage(message, true);
      }, index * 1000); // Adjust timing for typewriter delay between messages
    });
  }, [initialSystemMessages]);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleMessage)
  }, [])

  useEffect(() => {
    scrollChatToBottom()
  }, [isResponseLoading])

  const handleMessage = (message: { action: string; response: string }) => {
    if (message.action === 'chatGptResponse') {
      setIsResponseLoading(false)
      addMessage(message.response, true)
    }
  }

  const scrollChatToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop =
        messagesEndRef.current.scrollHeight - messagesEndRef.current.clientHeight
    }
  }

  const addMessage = (content: string, isSystemMessage: boolean) => {
    if (isSystemMessage) {
      setIsTypingEffectEnabled(true);
      setLastSystemMessage(content);

      // Add a new placeholder message without modifying previous messages
      setMessages((prevMessages) => [
        ...prevMessages,
        { content: "", timestamp: Date.now(), isSystemMessage: true }, // Placeholder for the new message
      ]);

      let index = 0;
      const intervalId = setInterval(() => {
        setMessages((prevMessages) => {
          // Avoid recreating the entire array; only modify the last message
          const lastMessage = prevMessages[prevMessages.length - 1];

          // If the last message already has the full content, do nothing
          if (lastMessage.content === content) {
            clearInterval(intervalId);
            setIsTypingEffectEnabled(false);
            return prevMessages;
          }

          // Update only the last message content
          return [
            ...prevMessages.slice(0, -1), // Keep all but the last message unchanged
            { ...lastMessage, content: content.substring(0, index + 1) },
          ];
        });

        index++;

        if (index === content.length) {
          clearInterval(intervalId);
          setIsTypingEffectEnabled(false);
        }
      }, 30);
    } else {
      // Directly add user messages
      setMessages((prevMessages) => [
        ...prevMessages,
        { content, timestamp: Date.now(), isSystemMessage: false },
      ]);
    }
  };

  const startRecording: () => void = () => {
    recognition.onend = () => { recognition.start(); }
    recognition.start()
    setIsRecording(true)
  }

  const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const sendRecording: () => Promise<void> = async () => {
    setIsResponseLoading(true)
    addMessage("Recording have been sent, good job", true)
    // await chrome.runtime.sendMessage(undefined, {
    //   action: 'chatGptApiRequest',
    //   userMessage: lastSystemMessage,
    // })

    setIsResponseLoading(false)
  }

  const stopRecording = () => {
    console.log("stop recording");
    recognition.onend = null;
    recognition.stop();

    // Add a slight delay to simulate processing time (optional)
    setTimeout(() => {
      addMessage(transcript, false); // Add transcript message
      setTranscript(''); // Clear transcript state
      setIsRecording(false);
      // sendRecording(); // Initiate sending the recording for processing
    }, 2000);
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
                <PiChalkboardTeacherDuotone className="message-icon system-icon" />
              ) : (
                <PiStudentBold className="message-icon user-icon" />
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
        <>
          {isResponseLoading && (
            <div className={`message system-message`}>
              <div className="icon-container">
                <PiChalkboardTeacherDuotone className="message-icon system-icon" />
              </div>
              <div className="loader"></div>
            </div>
          )}
        </>
      </div>
      <>
      </>
      <button
        id="recording-button"
        onClick={isRecording ? stopRecording : startRecording}
        style={{ cursor: isResponseLoading ? 'default' : 'pointer' }} // Apply inline style
      >
        {isRecording ? <FaStop color="red" /> : isResponseLoading ? <FaMicrophoneSlash /> : <FaMicrophone />}
      </button>
    </div>
  )
}

const TypingEffect: React.FC<{ text: string; messagesEndRef: React.RefObject<HTMLDivElement> }> = ({
  text,
  messagesEndRef,
}) => {
  const [displayText, setDisplayText] = useState('')
  const typingEffectRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typingEffectRef.current) {
      typingEffectRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    const scrollAtBottom = () => {
      if (messagesEndRef.current) {
        const { scrollHeight, scrollTop, clientHeight } = messagesEndRef.current
        return scrollHeight - scrollTop !== clientHeight
      }
      return true // If messagesEndRef is not available, assume we're at the bottom
    }

    let index = 0
    const intervalId = setInterval(() => {
      setDisplayText((prevText) => {
        const newDisplayText = text.substring(0, index + 1)
        index++
        if (scrollAtBottom()) {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop =
              messagesEndRef.current.scrollHeight - messagesEndRef.current.clientHeight
          }
        }
        return newDisplayText
      })

      if (index === text.length) {
        clearInterval(intervalId)
      }
    }, 20)
    return () => {
      clearInterval(intervalId)
    }
  }, [text, messagesEndRef])

  return <div ref={typingEffectRef}>{displayText}</div>
}

export default OverlayComponent
