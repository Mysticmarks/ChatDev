// Ensure this file is treated as JSX by Babel

const AgentCreationComponent = ({ currentUser, onAgentCreated, onCancel }) => {
    const [agentName, setAgentName] = React.useState('');
    const [roleDescription, setRoleDescription] = React.useState('');
    const [llmModel, setLlmModel] = React.useState('GPT_4O_MINI');
    const [baseSystemPrompt, setBaseSystemPrompt] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleSaveAgent = () => {
        if (!agentName.trim()) {
            setError('Agent Name is required.');
            return;
        }
        if (!currentUser || !currentUser.pub) {
            setError('Current user not found. Cannot save agent.');
            return;
        }

        setLoading(true);
        setError('');

        const agentId = 'agent_' + Gun.text.random(6); // Generate unique ID
        const agentData = {
            id: agentId, // Storing id within the agent data itself for easier access
            name: agentName,
            description: roleDescription,
            model: llmModel,
            systemPrompt: baseSystemPrompt,
            owner: currentUser.pub,
            createdAt: new Date().toISOString()
        };

        try {
            // Assuming window.gun is initialized and available
            if (!window.gun) {
                throw new Error("Gun.js instance (window.gun) not found.");
            }
            const gun = window.gun;
            
            // Get a reference to the user's 'agents' node.
            // gun.user() without args refers to the currently authenticated user.
            // If currentUser.pub is from a different user context, gun.user(currentUser.pub) is correct.
            // Assuming currentUser is the logged-in user, gun.user() should work.
            const userAgentsNode = gun.user().get('agents'); // gun.user() gets the current logged in user.
                                                           // currentUser.pub is used for the owner field.

            // Create/get the agent node by its ID and put data into it.
            const newAgentNodeRef = gun.get(agentId).put(agentData);

            // Add this new agent node reference to the user's list of agents.
            // .set() adds a relation (graph link) to the newAgentNodeRef.
            userAgentsNode.set(newAgentNodeRef, (ack) => {
                setLoading(false);
                if (ack.err) {
                    console.error('Error saving agent to user list:', ack.err);
                    setError(`Failed to link agent: ${ack.err}`);
                } else {
                    console.log('Agent saved and linked successfully:', agentData);
                    if (onAgentCreated) {
                        onAgentCreated(agentData); // Pass the created agent data back
                    }
                    // Reset form or navigate away as per parent component's logic via onAgentCreated
                    setAgentName('');
                    setRoleDescription('');
                    setLlmModel('GPT_4O_MINI');
                    setBaseSystemPrompt('');
                }
            });
            // Note: gun.get().put() is mostly optimistic. The ack in .set() is more crucial for list updates.
            // If direct ack from put is needed, it's more complex or relies on specific Gun adapters.

        } catch (e) {
            setLoading(false);
            console.error('Error during agent save process:', e);
            setError(`An unexpected error occurred: ${e.message}`);
        }
    };

    return (
        <div style={{ border: '1px solid #ddd', padding: '15px', margin: '15px 0', backgroundColor: '#f9f9f9' }}>
            <h3>Create New Agent</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={(e) => { e.preventDefault(); handleSaveAgent(); }}>
                <div>
                    <label>Agent Name: *</label>
                    <input
                        type="text"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        disabled={loading}
                        required
                        style={{ width: '100%', marginBottom: '10px' }}
                    />
                </div>
                <div>
                    <label>Role Description:</label>
                    <textarea
                        value={roleDescription}
                        onChange={(e) => setRoleDescription(e.target.value)}
                        disabled={loading}
                        style={{ width: '100%', minHeight: '60px', marginBottom: '10px' }}
                    />
                </div>
                <div>
                    <label>Base System Prompt:</label>
                    <textarea
                        value={baseSystemPrompt}
                        onChange={(e) => setBaseSystemPrompt(e.target.value)}
                        disabled={loading}
                        style={{ width: '100%', minHeight: '100px', marginBottom: '10px' }}
                    />
                </div>
                <div>
                    <label>LLM Model:</label>
                    <select
                        value={llmModel}
                        onChange={(e) => setLlmModel(e.target.value)}
                        disabled={loading}
                        style={{ width: '100%', marginBottom: '15px' }}
                    >
                        <option value="GPT_4O_MINI">GPT_4O_MINI</option>
                        <option value="GPT_4O">GPT_4O</option>
                        <option value="GPT_3_5_TURBO">GPT_3_5_TURBO</option>
                    </select>
                </div>
                <div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Agent'}
                    </button>
                    <button type="button" onClick={onCancel} disabled={loading} style={{ marginLeft: '10px' }}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

// window.AgentCreationComponent = AgentCreationComponent; // For global access if not using modules
