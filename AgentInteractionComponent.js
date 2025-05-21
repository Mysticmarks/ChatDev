// Ensure this file is treated as JSX by Babel

// Assuming ChatViewComponent.js and gunService.js (for signDataForApi) are loaded globally
// For module system: 
// import ChatViewComponent from './ChatViewComponent';
// import { signDataForApi } from './gunService.js'; // Assuming gunService exports this

const AgentInteractionComponent = ({ agent, currentUser, onBack }) => {
    const [conversationHistory, setConversationHistory] = React.useState([]);
    const [isAgentReplying, setIsAgentReplying] = React.useState(false);

    if (!agent) {
        return <p>No agent selected. Please go back and select an agent.</p>;
    }
    if (!currentUser || !currentUser.pub) { // Ensure currentUser.pub is available
        return <p>User not found or public key missing. Please login again.</p>;
    }
    
    const previousAgentIdRef = React.useRef();
    React.useEffect(() => {
        if (previousAgentIdRef.current !== agent.id) {
            setConversationHistory([]);
            setIsAgentReplying(false);
            previousAgentIdRef.current = agent.id;
        }
    }, [agent.id]);

    const handleUserMessage = async (messageText) => {
        console.log(`AgentInteractionComponent: Sending message "${messageText}" to agent ${agent.name}`);
        
        const userMessage = { sender: 'user', text: messageText, timestamp: new Date().toISOString() };
        // Update history immediately for responsiveness
        const updatedHistory = [...conversationHistory, userMessage];
        setConversationHistory(updatedHistory);
        setIsAgentReplying(true);

        const simplifiedHistory = updatedHistory.slice(-20).map(msg => ({ // Send last 20 messages
            role: msg.sender === 'user' ? 'user' : 'assistant', // Map 'agent' to 'assistant'
            content: msg.text
        }));

        const requestBody = {
            userId: currentUser.pub, // User's public key
            agentId: agent.id,
            agentDefinition: { // Construct agentDefinition as expected by backend
                system_prompt: agent.systemPrompt,
                role_name: agent.name, // Or a generic "Assistant" role if name is just for display
                model_type: agent.model 
            },
            message: messageText,
            context: {
                conversation_history: simplifiedHistory
            }
        };

        try {
            if (typeof signDataForApi !== 'function') {
                throw new Error("signDataForApi function is not available. Ensure gunService.js is loaded correctly.");
            }

            // Sign the request body (which itself is an object, signDataForApi will stringify it)
            const signatureHex = await signDataForApi(requestBody);
            
            const response = await fetch('http://localhost:5001/api/v1/agent/invoke', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-GUN-Signature': signatureHex 
                },
                body: JSON.stringify(requestBody) // Send the original object, stringified
            });

            if (response.ok) {
                const responseData = await response.json();
                setConversationHistory(prev => [...prev, { sender: 'agent', text: responseData.reply, timestamp: new Date().toISOString() }]);
            } else {
                const errorText = await response.text();
                console.error("API Error:", response.status, errorText);
                let displayError = `API Error: ${response.status}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    displayError = errorJson.error || errorJson.details || displayError;
                } catch (e) { /* Ignore parsing error, use text */ }
                setConversationHistory(prev => [...prev, { sender: 'system', text: displayError, timestamp: new Date().toISOString() }]);
            }
        } catch (error) {
            console.error('Failed to send message or sign data:', error);
            setConversationHistory(prev => [...prev, { sender: 'system', text: `Error: ${error.message}`, timestamp: new Date().toISOString() }]);
        } finally {
            setIsAgentReplying(false);
        }
    };
    
    if (typeof ChatViewComponent === 'undefined') {
        return <p style={{color: 'red'}}>Error: ChatViewComponent not loaded. Ensure ChatViewComponent.js is included.</p>;
    }

    return (
        <div style={{ border: '1px solid #007bff', padding: '15px', margin: '15px 0', backgroundColor: '#e7f3ff' }}>
            <h2>Chat with {agent.name}</h2>
            <button onClick={onBack} style={{ marginBottom: '15px' }}>
                &larr; Back to Dashboard / Agent List
            </button>

            <div style={{ borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                <h4>Agent Details (for context):</h4>
                <p><strong>ID:</strong> {agent.id}</p>
                <p><strong>Description:</strong> {agent.description || 'N/A'}</p>
                <p><strong>Model:</strong> {agent.model || 'N/A'}</p>
                 <p><strong>System Prompt (first 50 chars):</strong> {agent.systemPrompt ? agent.systemPrompt.substring(0,50) + "..." : 'N/A'}</p>
            </div>

            <hr />

            <ChatViewComponent
                agentName={agent.name}
                conversationHistory={conversationHistory}
                onSendMessage={handleUserMessage}
                isLoading={isAgentReplying}
            />

            <hr style={{marginTop: '20px'}}/>

            {/* Placeholder for TaskforceViewComponent */}
            <div style={{ border: '1px dashed #999', padding: '10px', margin: '10px 0', backgroundColor: '#f8f8f8' }}>
                <h3>Taskforce View</h3>
                <p>Taskforce View Placeholder for agent: {agent.name}</p>
            </div>
        </div>
    );
};

// window.AgentInteractionComponent = AgentInteractionComponent;
