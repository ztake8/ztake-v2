"use client"

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Mail, ArrowRight } from 'lucide-react'
import { useTheme } from './theme-provider'
import { cn } from '@/lib/utils'

interface Message {
    id: string
    text: string
    sender: 'user' | 'support'
    timestamp: Date
}

type ChatStage = 'initial' | 'email-required' | 'connecting' | 'connected'

export function CustomChat() {
    const [isOpen, setIsOpen] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [stage, setStage] = useState<ChatStage>('initial')
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [userEmail, setUserEmail] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Delay mounting to avoid TBT
    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 3000)
        return () => clearTimeout(timer)
    }, [])

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isOpen])

    // Initial Welcome Message
    useEffect(() => {
        if (isMounted && messages.length === 0) {
            setMessages([
                {
                    id: 'welcome',
                    text: "Hey, Welcome to Ztake. 👋",
                    sender: 'support',
                    timestamp: new Date()
                }
            ])
        }
    }, [isMounted])

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return

        const newUserMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, newUserMessage])
        setInputValue('')

        // Logic Flow
        if (stage === 'initial' || stage === 'email-required') {
            // Check if input looks like an email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

            if (emailRegex.test(inputValue.trim())) {
                // Valid Email
                setUserEmail(inputValue.trim())
                setStage('connecting')

                // Simulate connecting delay
                setTimeout(() => {
                    const connectingMsg: Message = {
                        id: 'connecting',
                        text: "Connecting with support...",
                        sender: 'support',
                        timestamp: new Date()
                    }
                    setMessages(prev => [...prev, connectingMsg])

                    setTimeout(() => {
                        setStage('connected')
                        // Optional: Add a "Connected" confirmation or just let them chat
                    }, 1500)
                }, 500)
            } else {
                // Not an email, ask for it
                setStage('email-required')
                setTimeout(() => {
                    const requestEmailMsg: Message = {
                        id: Date.now().toString(),
                        text: "Please enter your mail id to chat with our support team.",
                        sender: 'support',
                        timestamp: new Date()
                    }
                    setMessages(prev => [...prev, requestEmailMsg])
                }, 600)
            }
        } else if (stage === 'connected') {
            // Normal Chat Flow
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: 'Chat User',
                        email: userEmail,
                        message: inputValue,
                        source: 'chat-widget'
                    })
                })

                if (response.ok) {
                    // Auto-reply simulation (since we don't have a real backend socket)
                    setTimeout(() => {
                        const supportMessage: Message = {
                            id: (Date.now() + 1).toString(),
                            text: "Thanks! We've received your message. Our team will reply to your email shortly.",
                            sender: 'support',
                            timestamp: new Date()
                        }
                        setMessages(prev => [...prev, supportMessage])
                    }, 1000)
                }
            } catch (error) {
                console.error('Chat error:', error)
            }
        }
    }

    if (!isMounted) return null

    return (
        <>
            {/* Minimal Chat Button - Apple Style */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110",
                    "bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/20 dark:border-white/10",
                    "text-primary hover:text-primary/80"
                )}
                aria-label="Open chat"
            >
                {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
            </button>

            {/* Chat Window - iOS Liquid Glass */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[90vw] sm:w-80 h-[450px] rounded-[2rem] glass-ios flex flex-col overflow-hidden animate-slideUp origin-bottom-right">
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                                <MessageCircle className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Support</h3>
                                <p className="text-[10px] text-muted-foreground">Online</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={cn(
                                        "max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed",
                                        message.sender === 'user'
                                            ? "bg-primary text-white rounded-br-sm shadow-md shadow-primary/20"
                                            : "bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/10 rounded-bl-sm"
                                    )}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white/5 backdrop-blur-md border-t border-white/10">
                        <div className="relative flex items-center gap-2">
                            <input
                                type="text"
                                placeholder={stage === 'email-required' ? "Enter your email..." : "Type a message..."}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                className="flex-1 px-4 py-2.5 rounded-full bg-white/10 dark:bg-black/20 border border-white/10 focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm placeholder:text-muted-foreground/50 transition-all"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim()}
                                className="p-2.5 rounded-full bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
