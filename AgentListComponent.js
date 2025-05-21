// Ensure this file is treated as JSX by Babel

const AgentListComponent = ({ currentUser, onSelectAgent }) => {
    const [agents, setAgents] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');

    const fetchAgents = React.useCallback(async () => {
        setLoading(true);
        setError('');
        setAgents([]); // Clear previous agents

        if (!currentUser || !currentUser.pub) {
            setError('Current user information is missing. Cannot fetch agents.');
            setLoading(false);
            console.warn("AgentListComponent: currentUser or currentUser.pub is missing.", currentUser);
            return;
        }

        try {
            if (!window.gun) {
                throw new Error("Gun.js instance (window.gun) not found.");
            }
            const gun = window.gun;
            const userPub = currentUser.pub;

            console.log(`AgentListComponent: Fetching agents for user: ${userPub}`);

            const userAgentsNode = gun.user(userPub).get('agents');
            const fetchedAgents = [];
            
            // Gun's .map().once() behavior:
            // It iterates over the items in the node.
            // The callback is called for each item.
            // It's important to collect all items and then update state once.
            
            let itemsProcessed = 0;
            let totalItems = 0; // We don't know total items beforehand with .map() easily.

            // Check if the 'agents' node exists for the user.
            userAgentsNode.once(data => {
                if (!data) { // No 'agents' node or it's empty
                    console.log(`AgentListComponent: No 'agents' node found for user ${userPub} or it's empty.`);
                    setLoading(false);
                    setAgents([]); // Ensure agents list is empty
                    return;
                }
                
                // If data exists, then proceed to map over its children
                // This part is tricky because .map().once() doesn't give a "done" callback for the whole map.
                // We need a way to know when all .once() calls from .map() are done.
                // A common pattern is to use a timeout, or count expected items if known.
                // For a dynamic list, this is more complex.
                
                // Let's simplify: iterate and collect. If after a short delay, no agents, assume empty.
                // This is not ideal. A better way would be to get all keys and then .once() each.
                
                const agentIds = [];
                userAgentsNode.map().once((agentData, agentId) => {
                    // This callback fires for each agent linked under 'agents'
                    // agentData here is the actual content of the linked agent node,
                    // not the reference itself. Gun.js resolves the reference.
                    if (agentData) {
                        // Gun.js might return metadata or null for non-existent/deleted nodes.
                        // Check if it's a valid agent object (e.g., has a name or id)
                        if (agentData.id && agentData.name) {
                            fetchedAgents.push({ ...agentData, id: agentData.id }); // Use agentData.id as the primary id
                        } else if (agentData.name) { // Fallback if id is embedded differently
                             fetchedAgents.push({ ...agentData, id: agentId });
                        } else {
                            console.warn("AgentListComponent: Encountered agentData without expected fields:", agentId, agentData);
                        }
                    }
                    // This part is tricky: when is .map().once() "done"?
                    // For now, we'll update state in each .once() and let React batch.
                    // This might lead to multiple re-renders.
                });

                // Because .map().once() calls its callback for each item individually and
                // doesn't provide a single "all items processed" callback,
                // we rely on a timeout to gather all responses.
                // This is a common Gun.js pattern when direct iteration is needed.
                setTimeout(() => {
                    if (fetchedAgents.length > 0) {
                        console.log(`AgentListComponent: Fetched ${fetchedAgents.length} agents.`, fetchedAgents);
                        setAgents(fetchedAgents);
                    } else {
                        console.log(`AgentListComponent: No valid agents found after iterating for user ${userPub}.`);
                        setAgents([]);
                    }
                    setLoading(false);
                }, 500); // Adjust timeout as needed. 500ms might be too short/long.
                       // This timeout is a heuristic. A more robust way would be to
                       // first get all agent IDs, then .once() each, and count responses.
            });

        } catch (e) {
            console.error('AgentListComponent: Error fetching agents:', e);
            setError(`Failed to fetch agents: ${e.message}`);
            setLoading(false);
        }
    }, [currentUser]); // Dependency on currentUser to refetch if it changes

    React.useEffect(() => {
        console.log("AgentListComponent: useEffect triggered, currentUser:", currentUser);
        if (currentUser && currentUser.pub) {
            fetchAgents();
        } else {
             console.log("AgentListComponent: useEffect, no currentUser or currentUser.pub, skipping fetch.");
             setLoading(false); // Not loading if no user
             setAgents([]); // Ensure agents are empty
        }
    }, [fetchAgents, currentUser]); // Include currentUser in dependencies of useEffect

    if (loading) {
        return <p>Loading agents...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>Error: {error}</p>;
    }

    if (agents.length === 0) {
        return <p>No agents created yet. Click "Create New Agent" to get started!</p>;
    }

    return (
        <div>
            <h4>Your Agents:</h4>
            {agents.map(agent => (
                <div key={agent.id} style={{ border: '1px solid #eee', padding: '10px', margin: '10px 0', backgroundColor: '#fff' }}>
                    <h5>{agent.name}</h5>
                    <p>ID: {agent.id}</p>
                    <p>Description: {agent.description || 'No description provided.'}</p>
                    <p>Model: {agent.model || 'N/A'}</p>
                    <button 
                        onClick={() => {
                            if (onSelectAgent) {
                                onSelectAgent(agent);
                            } else {
                                console.warn("onSelectAgent prop not provided to AgentListComponent");
                            }
                        }}
                        style={{ marginTop: '5px', cursor: 'pointer' }}
                    >
                        Chat with Agent
                    </button>
                    {/* Future buttons: Manage, Delete */}
                </div>
            ))}
        </div>
    );
};

// window.AgentListComponent = AgentListComponent; // For global access
