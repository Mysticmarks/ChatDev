// Ensure this file is treated as JSX by Babel

const ChatViewComponent = ({ agentName, conversationHistory, onSendMessage, isLoading }) => {
    const [newMessageInput, setNewMessageInput] = React.useState('');
    const chatHistoryRef = React.useRef(null);

    // Scroll to bottom when new messages are added or component updates
    React.useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [conversationHistory]);

    const handleInputChange = (event) => {
        setNewMessageInput(event.target.value);
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        if (newMessageInput.trim() && !isLoading) {
            onSendMessage(newMessageInput); // Pass only the message text
            setNewMessageInput('');
        }
    };

    const messageStyle = (sender) => ({
        textAlign: sender === 'user' ? 'right' : 'left',
        margin: '8px',
        padding: '10px 15px',
        backgroundColor: sender === 'user' ? '#dcf8c6' : '#f1f0f0',
        borderRadius: '10px',
        maxWidth: '70%',
        alignSelf: sender === 'user' ? 'flex-end' : 'flex-start',
        wordWrap: 'break-word',
        boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
    });

    const senderStyle = {
        fontSize: '0.8em',
        color: '#555',
        marginBottom: '3px',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '500px' /* Example height */ }}>
            <h4>Chat with {agentName}</h4>
            <div
                ref={chatHistoryRef}
                style={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    border: '1px solid #ccc',
                    padding: '10px',
                    marginBottom: '10px',
                    backgroundColor: '#fff',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {conversationHistory.map((msg, index) => (
                    <div key={index} style={messageStyle(msg.sender)}>
                        <p style={senderStyle}>{msg.sender === 'user' ? 'You' : agentName}</p>
                        <p style={{ margin: 0 }}>{msg.text}</p>
                        {msg.timestamp && (
                            <p style={{ ...senderStyle, textAlign: 'inherit', fontSize: '0.7em', marginTop: '5px' }}>
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </p>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div style={{ ...messageStyle('agent'), fontStyle: 'italic', alignSelf: 'flex-start' }}>
                        {agentName} is typing...
                    </div>
                )}
            </div>
            <form onSubmit={handleFormSubmit} style={{ display: 'flex' }}>
                <input
                    type="text"
                    value={newMessageInput}
                    onChange={handleInputChange}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    style={{ flexGrow: 1, padding: '10px', marginRight: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <button type="submit" disabled={isLoading || !newMessageInput.trim()} style={{ padding: '10px 15px', borderRadius: '5px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}>
                    Send
                </button>
            </form>
        </div>
    );
};

// window.ChatViewComponent = ChatViewComponent; // For global access if not using modules
