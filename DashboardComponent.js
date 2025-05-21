// Ensure this file is treated as JSX by Babel

// Assuming AgentCreationComponent.js, AgentListComponent.js, AgentInteractionComponent.js, and ToolboxComponent.js are loaded globally
// For module system: 
// import AgentCreationComponent from './AgentCreationComponent';
// import AgentListComponent from './AgentListComponent';
// import AgentInteractionComponent from './AgentInteractionComponent';
// import ToolboxComponent from './ToolboxComponent';


const DashboardComponent = ({ currentUser, onLogout }) => {
    const [showCreateAgentForm, setShowCreateAgentForm] = React.useState(false);
    const [agentListKey, setAgentListKey] = React.useState(0);
    const [currentDashboardView, setCurrentDashboardView] = React.useState('agent_list'); // 'agent_list', 'agent_interaction', 'toolbox'
    const [selectedAgentForInteraction, setSelectedAgentForInteraction] = React.useState(null);
    const [showToolbox, setShowToolbox] = React.useState(false);


    if (!currentUser) {
        return <p>Loading dashboard or user not found...</p>;
    }

    const userAlias = currentUser.alias || currentUser.pub || 'User';

    const handleAgentCreated = (agentData) => {
        console.log('Agent created in Dashboard:', agentData);
        setShowCreateAgentForm(false);
        setAgentListKey(prevKey => prevKey + 1);
        setCurrentDashboardView('agent_list');
        alert(`Agent "${agentData.name}" created successfully!`);
    };

    const handleCancelCreateAgent = () => {
        setShowCreateAgentForm(false);
        setCurrentDashboardView('agent_list');
    };

    const handleSelectAgentForChat = (agent) => {
        setSelectedAgentForInteraction(agent);
        setCurrentDashboardView('agent_interaction');
        setShowCreateAgentForm(false); 
        setShowToolbox(false); // Close toolbox if open
    };

    const handleBackToAgentList = () => {
        setSelectedAgentForInteraction(null);
        setCurrentDashboardView('agent_list');
    };

    const handleOpenToolbox = () => {
        setShowToolbox(true);
        setCurrentDashboardView('toolbox'); // Change view to toolbox
        setShowCreateAgentForm(false); // Ensure other forms are hidden
        setSelectedAgentForInteraction(null); // Ensure agent interaction is hidden
    };

    const handleCloseToolbox = () => {
        setShowToolbox(false);
        setCurrentDashboardView('agent_list'); // Return to agent list view
    };

    // Component loading checks
    const allComponentsLoaded = 
        typeof AgentListComponent !== 'undefined' &&
        typeof AgentCreationComponent !== 'undefined' &&
        typeof AgentInteractionComponent !== 'undefined' &&
        typeof ToolboxComponent !== 'undefined';

    if (!allComponentsLoaded) {
        let missing = [];
        if (typeof AgentListComponent === 'undefined') missing.push('AgentListComponent');
        if (typeof AgentCreationComponent === 'undefined') missing.push('AgentCreationComponent');
        if (typeof AgentInteractionComponent === 'undefined') missing.push('AgentInteractionComponent');
        if (typeof ToolboxComponent === 'undefined') missing.push('ToolboxComponent');
        return <p style={{color: 'red'}}>Error: Missing critical component(s): {missing.join(', ')}. Ensure all JS files are loaded.</p>;
    }

    let content;
    if (currentDashboardView === 'agent_interaction' && selectedAgentForInteraction) {
        content = (
            <AgentInteractionComponent
                agent={selectedAgentForInteraction}
                currentUser={currentUser}
                onBack={handleBackToAgentList}
            />
        );
    } else if (currentDashboardView === 'toolbox') {
        content = (
            <ToolboxComponent
                currentUser={currentUser}
                onClose={handleCloseToolbox}
            />
        );
    } else { // Default to 'agent_list' view or agent creation form
        if (showCreateAgentForm) {
            content = (
                <AgentCreationComponent
                    currentUser={currentUser}
                    onAgentCreated={handleAgentCreated}
                    onCancel={handleCancelCreateAgent}
                />
            );
        } else {
            content = (
                <div>
                    <h3>My Agents</h3>
                    <AgentListComponent
                        key={agentListKey}
                        currentUser={currentUser}
                        onSelectAgent={handleSelectAgentForChat}
                    />
                    <button onClick={() => {
                        setShowCreateAgentForm(true);
                        setCurrentDashboardView('agent_list'); // Explicitly stay/return to agent list context for creation form
                        setShowToolbox(false);
                        setSelectedAgentForInteraction(null);
                    }} style={{ marginTop: '10px', marginRight: '10px' }}>
                        Create New Agent
                    </button>
                    <button onClick={handleOpenToolbox} style={{ marginTop: '10px' }}>
                        Open Toolbox
                    </button>
                </div>
            );
        }
    }

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h2>Dashboard</h2>
                <button onClick={onLogout}>Logout</button>
            </div>
            <p>Welcome, {userAlias}!</p>
            <hr />
            {content}
        </div>
    );
};

// window.DashboardComponent = DashboardComponent;
