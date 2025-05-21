// Ensure this file is treated as JSX by Babel

const PetFormComponent = ({ currentUser, petToEdit, onSave, onCancel }) => {
    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [toolSnippetType, setToolSnippetType] = React.useState('prompt_llm');
    const [toolSnippetConfigString, setToolSnippetConfigString] = React.useState('{\n  "system_prompt": "",\n  "model_type": "GPT_4O_MINI"\n}');
    const [spriteParamsString, setSpriteParamsString] = React.useState('{\n  "color": "blue",\n  "shape": "circle"\n}');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (petToEdit) {
            setName(petToEdit.name || '');
            setDescription(petToEdit.description || '');
            if (petToEdit.toolSnippet) {
                setToolSnippetType(petToEdit.toolSnippet.type || 'prompt_llm');
                setToolSnippetConfigString(JSON.stringify(petToEdit.toolSnippet.config || { system_prompt: "", model_type: "GPT_4O_MINI" }, null, 2));
            } else {
                setToolSnippetConfigString('{\n  "system_prompt": "",\n  "model_type": "GPT_4O_MINI"\n}');
            }
            setSpriteParamsString(JSON.stringify(petToEdit.spriteParams || { color: "blue", shape: "circle" }, null, 2));
        } else {
            // Reset to defaults for new form
            setName('');
            setDescription('');
            setToolSnippetType('prompt_llm');
            setToolSnippetConfigString('{\n  "system_prompt": "",\n  "model_type": "GPT_4O_MINI"\n}');
            setSpriteParamsString('{\n  "color": "blue",\n  "shape": "circle"\n}');
        }
    }, [petToEdit]);

    const handleSave = () => {
        setError('');
        if (!name.trim()) {
            setError('Pet Name is required.');
            return;
        }
        if (!currentUser || !currentUser.pub) {
            setError('Current user not found. Cannot save pet.');
            return;
        }

        let parsedToolSnippetConfig;
        try {
            parsedToolSnippetConfig = JSON.parse(toolSnippetConfigString);
        } catch (e) {
            setError('Tool Snippet Config is not valid JSON.');
            return;
        }

        let parsedSpriteParams;
        try {
            parsedSpriteParams = JSON.parse(spriteParamsString);
        } catch (e) {
            setError('Sprite Parameters is not valid JSON.');
            return;
        }

        setLoading(true);

        const petId = petToEdit ? petToEdit.id : 'pet_' + window.Gun.text.random(6);
        const timestamp = new Date().toISOString();

        const petData = {
            id: petId, // Ensure ID is part of the data
            name,
            description,
            toolSnippet: {
                type: toolSnippetType,
                config: parsedToolSnippetConfig
            },
            spriteParams: parsedSpriteParams,
            owner: currentUser.pub,
            ...(petToEdit ? { updatedAt: timestamp } : { createdAt: timestamp })
        };

        try {
            if (!window.gun) {
                throw new Error("Gun.js instance (window.gun) not found.");
            }
            const gun = window.gun;
            const userToolboxNode = gun.user(currentUser.pub).get('toolbox');
            
            // Save the pet data to its own node
            const petNodeRef = gun.get(petId).put(petData);

            // Add reference to this pet node in the user's toolbox list
            userToolboxNode.set(petNodeRef, (ack) => {
                setLoading(false);
                if (ack.err) {
                    console.error('Error linking pet to user toolbox:', ack.err);
                    setError(`Failed to link pet: ${ack.err}`);
                } else {
                    console.log('Pet saved and linked successfully:', petData);
                    if (onSave) {
                        onSave(petData); // Pass the saved/updated pet data back
                    }
                }
            });
        } catch (e) {
            setLoading(false);
            console.error('Error during pet save process:', e);
            setError(`An unexpected error occurred: ${e.message}`);
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px 0', backgroundColor: '#f9f9f9' }}>
            <h4>{petToEdit ? 'Edit Pet' : 'Create New Pet'}</h4>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div>
                    <label>Pet Name: *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} required style={{ width: '100%', marginBottom: '10px' }} />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} style={{ width: '100%', minHeight: '60px', marginBottom: '10px' }} />
                </div>
                <div>
                    <label>Tool Snippet Type:</label>
                    <select value={toolSnippetType} onChange={(e) => setToolSnippetType(e.target.value)} disabled={loading} style={{ width: '100%', marginBottom: '10px' }}>
                        <option value="prompt_llm">Prompt LLM</option>
                        {/* Add other types here if needed */}
                    </select>
                </div>
                <div>
                    <label>Tool Snippet Configuration (JSON):</label>
                    <textarea
                        value={toolSnippetConfigString}
                        onChange={(e) => setToolSnippetConfigString(e.target.value)}
                        disabled={loading}
                        rows={6}
                        style={{ width: '100%', minHeight: '100px', marginBottom: '10px', fontFamily: 'monospace' }}
                        placeholder='e.g., {"system_prompt": "You are a helpful assistant.", "model_type": "GPT_4O_MINI"}'
                    />
                </div>
                <div>
                    <label>Sprite Parameters (JSON for visual representation):</label>
                    <textarea
                        value={spriteParamsString}
                        onChange={(e) => setSpriteParamsString(e.target.value)}
                        disabled={loading}
                        rows={4}
                        style={{ width: '100%', minHeight: '80px', marginBottom: '15px', fontFamily: 'monospace' }}
                        placeholder='e.g., {"color": "blue", "shape": "circle"}'
                    />
                </div>
                <div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : (petToEdit ? 'Save Changes' : 'Create Pet')}
                    </button>
                    <button type="button" onClick={onCancel} disabled={loading} style={{ marginLeft: '10px' }}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

// window.PetFormComponent = PetFormComponent; // For global access if not using modules
