import React, { useState, useEffect } from 'react'
import { FaMicrophone, FaStop, FaUser, FaRobot } from 'react-icons/fa'

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
  const [lastUserMessage, setLastUserMessage] = useState('')
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const recognition: any = new (window as any).webkitSpeechRecognition() // Type assertion
  recognition.lang = 'en-US'
  recognition.continue = true

  useEffect(() => {
    // Generate timestamps for initial system messages
    const initialMessagesWithTimestamps: Message[] = initialSystemMessages.map((message, index) => ({
      content: message,
      timestamp: Date.now() + index, // Adding index to ensure unique timestamps
      isSystemMessage: true
    }))
    setMessages(initialMessagesWithTimestamps)
  }, [initialSystemMessages])

  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleMessage)
  }, [])

  const handleMessage = (message: { action: string, response: string }) => {
    if (message.action === 'chatGptResponse') {
      addMessage(message.response, true)
    }
  }

  const addMessage = (content: string, isSystemMessage: boolean) => {
    const newMessage = {
      content,
      timestamp: Date.now(),
      isSystemMessage
    }
    const messageBody = document.querySelector('#overlay-content')
    if (messageBody != null) {
      messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight
    }
    setMessages(prevMessages => [...prevMessages, newMessage])
    if (!isSystemMessage) {
      setLastUserMessage(content)
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
      recognition.stop() // Stop speech recognition
      setIsRecording(false)
    }
  }

  // sendMessage;
  const captureScreenshot: () => Promise<void> = async () => {
    console.log('last user message: ' + lastUserMessage)
    chrome.runtime.sendMessage(undefined, { action: 'chatGptApiRequest', userMessage: lastUserMessage }, (response) => {
      console.log(response)
    })
  }

  const stopRecording = () => {
    setIsRecording(false)
    recognition.stop() // Stop speech recognition
    captureScreenshot()
  }

  return (
        <div id="overlay">
            <div id="overlay-content">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.isSystemMessage ? 'system-message' : 'user-message'}`}>
                        <div className="icon-container">
                            {message.isSystemMessage
                              ? (
                                <FaRobot className="message-icon system-icon" />
                                )
                              : (
                                <FaUser className="message-icon user-icon" />
                                )}
                        </div>
                        <div className="message-text">
                            {message.content}
                        </div>
                    </div>
                ))}
            </div>
            <button id="recording-button" onClick={isRecording ? stopRecording : startRecording}>
                {isRecording ? <FaStop color="red"/> : <FaMicrophone />}
            </button>
        </div>
  )
}

export default OverlayComponent
