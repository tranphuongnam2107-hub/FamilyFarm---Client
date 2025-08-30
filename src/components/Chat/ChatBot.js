import React, { useState, useEffect, useRef } from 'react';
import chatbot_icon from "../../assets/icons/Chatbot.svg";
import cancelIcon from "../../assets/images/cancel_vector.png";
import "./ChatBot.css";
import instance from "../../Axios/axiosConfig";

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const [isShaking, setIsShaking] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hi, you can choose question below to get information",
            isBot: true,
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null);
    const [isBotTyping, setIsBotTyping] = useState(false);


    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Welcome message effect when component mounts
    useEffect(() => {
        const welcomeTimer = setTimeout(() => {
            setShowWelcome(false);
        }, 4000); // Show for 4 seconds

        return () => clearTimeout(welcomeTimer);
    }, []);

    // Periodic shake animation when chatbot is closed
    useEffect(() => {
        if (!isOpen) {
            const shakeInterval = setInterval(() => {
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 1000); // Shake for 1 second
            }, 8000); // Shake every 8 seconds

            return () => clearInterval(shakeInterval);
        }
    }, [isOpen]);

    const predefinedQuestions = [
        "How I can booking service?",
        "How I can view my booking?",
    ];

    const botResponses = {
        "default": "Thank you for your question! Our support team will help you with that. You can also try selecting one of the suggested questions above."
    };

    const handleToggleChat = () => {
        setIsOpen(!isOpen);
        setShowWelcome(false); // Hide welcome message when opening chat
    };

    //XỬ LÝ GỬI TIN NHẮN CHAT BOT
    const handleSendMessage = async (messageText = inputMessage) => {
        if (!messageText.trim()) return;

        const userMessage = {
            id: messages.length + 1,
            text: messageText,
            isBot: false,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');

        setIsBotTyping(true);

        try {
            const response = await instance.post('/api/chat/bot', messageText);
            const botReply = response.data?.reply || "No response received.";

            const botMessage = {
                id: messages.length + 2,
                text: botReply,
                isBot: true,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage = {
                id: messages.length + 2,
                text: "⚠️ Error: Could not connect to chatbot server.",
                isBot: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsBotTyping(false);
        }
    };


    const handleQuestionClick = (question) => {
        handleSendMessage(question);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-50">
            {/* Welcome notification */}
            {showWelcome && !isOpen && (
                <div
                    className="absolute bottom-20 right-0 bg-white rounded-lg shadow-lg p-3 mb-2 border border-gray-200"
                    style={{
                        animation: 'welcomeBounce 2s ease-in-out infinite'
                    }}
                >
                    <div className="relative">
                        <p className="text-sm text-gray-700 whitespace-nowrap">
                            👋 Hi! I'm here to help you!
                        </p>
                        {/* Speech bubble arrow */}
                        <div className="absolute -bottom-1 right-6 w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
                    </div>
                </div>
            )}

            {!isOpen && (
                <button
                    onClick={handleToggleChat}
                    className={`bg-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-solid border-gray-300`}
                    style={{
                        animation: isShaking ? 'shake 0.5s ease-in-out infinite' : undefined
                    }}
                >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                        <img src={chatbot_icon} className='w-16 h-16' alt='chatbot_icon'></img>
                    </div>
                </button>
            )}

            {isOpen && (
                <div
                    className="bg-white rounded-2xl shadow-2xl w-80 h-96 flex flex-col overflow-hidden"
                    style={{
                        animation: 'slideInUp 0.3s ease-out'
                    }}
                >
                    <div className="bg-gradient-to-r from-blue-400 to-green-400 p-2 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <img src={chatbot_icon} className='w-6 h-6' alt='chatbot_icon'></img>
                            </div>
                            <span className="text-white font-semibold">Chatbot</span>
                        </div>
                        <button
                            onClick={handleToggleChat}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                        >
                            <img className="w-[12.62px] h-[12.62px]" src={cancelIcon} alt="Close" />
                        </button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`mb-4 ${message.isBot ? 'flex items-start' : 'flex items-end justify-end'}`}
                                style={{
                                    animation: 'fadeIn 0.3s ease-in'
                                }}
                            >
                                {message.isBot && (
                                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-2 flex-shrink-0 border border-solid border-gray-300">
                                        <img src={chatbot_icon} className='w-5 h-5 p-0.5' alt='chatbot_icon'></img>
                                    </div>
                                )}
                                <div
                                    className={`px-3 py-2 rounded-lg text-sm text-left ${message.isBot
                                        ? 'bg-white text-gray-800 shadow-sm'
                                        : 'bg-blue-500 text-white'
                                        } ${!message.isBot ? 'max-w-[80%] break-words' : ''}`}
                                    style={{
                                        minWidth: '0',
                                        wordBreak: 'break-word',
                                        width: message.isBot ? 'auto' : message.text.length < 20 ? 'auto' : '80%'
                                    }}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}

                        {messages.length === 1 && (
                            <div className="mt-4 space-y-0">
                                {predefinedQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuestionClick(question)}
                                        className="w-full text-left p-2 bg-white shadow-sm hover:shadow-md hover:bg-blue-50 transition-all duration-200 text-xs text-gray-700 border border-gray-100"
                                        style={{
                                            animation: `fadeInUp 0.5s ease-out ${index * 0.2}s both`
                                        }}
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    
                    {isBotTyping && (
                        <div className="flex items-start mb-4" style={{ animation: 'fadeIn 0.3s ease-in' }}>
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-2 border border-gray-300">
                                <img src={chatbot_icon} className='w-5 h-5 p-0.5' alt='chatbot_icon' />
                            </div>
                            <div className="bg-white text-gray-800 shadow-sm px-3 py-2 rounded-lg text-sm">
                                <span className="typing-dots"></span>
                            </div>
                        </div>
                    )}

                    <div className="p-4 border-t border-gray-200 bg-white">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your question..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors hover:scale-105"
                            >
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;