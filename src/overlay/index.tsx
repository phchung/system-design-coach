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
  const [isRecording, setIsRecording] = useState<boolean>(false)
  let recognition: any = null // Declare recognition outside the component to access it in stopRecording()

  useEffect(() => {
    // Generate timestamps for initial system messages
    const initialMessagesWithTimestamps: Message[] = initialSystemMessages.map((message, index) => ({
      content: message,
      timestamp: Date.now() + index, // Adding index to ensure unique timestamps
      isSystemMessage: true
    }))
    setMessages(initialMessagesWithTimestamps)
  }, [initialSystemMessages])

  const addMessage = (content: string, isSystemMessage: boolean) => {
    const newMessage = {
      content,
      timestamp: Date.now(),
      isSystemMessage
    }
    const messageBody = document.querySelector('#overlay-content')
    if (messageBody) {
      messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight
    }
    setMessages(prevMessages => [...prevMessages, newMessage])
  }

  const startRecording = () => {
    setIsRecording(true)
    recognition = new (window as any).webkitSpeechRecognition() // Type assertion
    recognition.lang = 'en-US'
    recognition.start()
    addMessage('asdfadfs', false)
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
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

  const stopRecording = () => {
    setIsRecording(false)
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
