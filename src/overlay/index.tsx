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
  const recognition: any = new (window as any).webkitSpeechRecognition() // Type assertion
  recognition.lang = 'en-US'
  recognition.continue = true

  const messagesEndRef = useRef<HTMLDivElement>(null)
  // const openAiClient = new OpenAIClient("", "");

  useEffect(() => {
    // Generate timestamps for initial system messages
    const initialMessagesWithTimestamps: Message[] = initialSystemMessages.map(
      (message, index) => ({
        content: message,
        timestamp: Date.now() + index, // Adding index to ensure unique timestamps
        isSystemMessage: true,
      }),
    )
    setMessages(initialMessagesWithTimestamps)
    // Clean up the message listener when component unmounts
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [initialSystemMessages])

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
    const newMessage = {
      content,
      timestamp: Date.now(),
      isSystemMessage,
    }
    scrollChatToBottom();
    setMessages((prevMessages) => [...prevMessages, newMessage])
    if (isSystemMessage) {
      setLastSystemMessage(content)
      setIsTypingEffectEnabled(true)
    }
  }

  const startRecording: () => void = () => {
    setIsRecording(true)
    recognition.start()
    addMessage('yes lets do that', false)
    recognition.onresult = (event: any) => {
      const transcript: string = event.results[0][0].transcript
      addMessage(transcript, false)
      recognition.stop() // Stop speech recognition
      setIsRecording(false)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      recognition.stop()
      setIsRecording(false)
      setIsResponseLoading(false)
    }

    recognition.onabort = (event: any) => {
      console.error('Speech recognition abort:', event.error)
      recognition.stop()
      setIsRecording(false)
      setIsResponseLoading(false)
    }
  }

  const sendRecording: () => Promise<void> = async () => {
    console.log("sendRecording")
    await chrome.runtime.sendMessage(undefined, {
      action: 'chatGptApiRequest',
      userMessage: lastSystemMessage,
    })
  }

  const stopRecording = () => {
    setIsRecording(false)
    recognition.stop()
    setIsResponseLoading(true)
    sendRecording();
  }

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
