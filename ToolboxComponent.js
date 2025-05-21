// Ensure this file is treated as JSX by Babel

// Assuming PetFormComponent.js and PetSpriteComponent.js are loaded globally
// For module system: 
// import PetFormComponent from './PetFormComponent';
// import PetSpriteComponent from './PetSpriteComponent';

const ToolboxComponent = ({ currentUser, onClose }) => {
    const [pets, setPets] = React.useState([]);
    const [showPetForm, setShowPetForm] = React.useState(false);
    const [editingPet, setEditingPet] = React.useState(null);
    const [loadingPets, setLoadingPets] = React.useState(true);
    const [fetchError, setFetchError] = React.useState('');

    const fetchPets = React.useCallback(async () => {
        setLoadingPets(true);
        setFetchError('');
        setPets([]);

        if (!currentUser || !currentUser.pub) {
            setFetchError('Current user information is missing.');
            setLoadingPets(false);
            return;
        }

        try {
            if (!window.gun) {
                throw new Error("Gun.js instance (window.gun) not found.");
            }
            const gun = window.gun;
            const userToolboxNode = gun.user(currentUser.pub).get('toolbox');
            const fetchedPets = [];

            userToolboxNode.map().once((petData, petId) => {
                if (petData && (petData.id || petId)) {
                    const id = petData.id || petId;
                    // Ensure spriteParams is an object, default if not
                    const validSpriteParams = (petData.spriteParams && typeof petData.spriteParams === 'object') 
                                              ? petData.spriteParams 
                                              : { shape: 'cube', color: '#cccccc', size: 0.5 }; // Default/fallback sprite
                    fetchedPets.push({ ...petData, id: id, spriteParams: validSpriteParams });
                }
            });

            setTimeout(() => {
                if (fetchedPets.length > 0) {
                    setPets(fetchedPets);
                } else {
                    setPets([]);
                }
                setLoadingPets(false);
            }, 500);

        } catch (e) {
            console.error('ToolboxComponent: Error fetching pets:', e);
            setFetchError(`Failed to fetch pets: ${e.message}`);
            setLoadingPets(false);
        }
    }, [currentUser]);

    React.useEffect(() => {
        if (currentUser && currentUser.pub) {
            fetchPets();
        } else {
            setLoadingPets(false);
            setPets([]);
        }
    }, [fetchPets, currentUser]);

    const handlePetSaved = (savedPetData) => {
        setShowPetForm(false);
        setEditingPet(null);
        fetchPets();
        alert(`Pet "${savedPetData.name}" saved successfully!`);
    };

    const handleCancelPetForm = () => {
        setShowPetForm(false);
        setEditingPet(null);
    };

    const handleEditPet = (pet) => {
        setEditingPet(pet);
        setShowPetForm(true);
    };

    const handleDeletePet = (petIdToDelete) => {
        if (!petIdToDelete) {
            console.error("Cannot delete pet: ID is undefined.");
            setFetchError("Cannot delete pet: ID is undefined.");
            return;
        }
        if (window.confirm(`Are you sure you want to delete this pet (${petIdToDelete})? This action cannot be undone.`)) {
            setLoadingPets(true);
            try {
                if (!window.gun) throw new Error("Gun.js instance not found.");
                const gun = window.gun;
                gun.user(currentUser.pub).get('toolbox').get(petIdToDelete).put(null, (ack) => {
                    if (ack.err) {
                        console.error(`Error unlinking pet ${petIdToDelete} from toolbox:`, ack.err);
                        setFetchError(`Failed to unlink pet: ${ack.err}.`);
                    } else {
                        console.log(`Pet ${petIdToDelete} unlinked from toolbox.`);
                    }
                    gun.get(petIdToDelete).put(null, (ackMain) => {
                        setLoadingPets(false);
                        if (ackMain.err) {
                            console.error(`Error nullifying main pet node ${petIdToDelete}:`, ackMain.err);
                            setFetchError(`Failed to delete pet data: ${ackMain.err}.`);
                        } else {
                            console.log(`Main pet node ${petIdToDelete} data nullified.`);
                            alert(`Pet ${petIdToDelete} deleted successfully.`);
                        }
                        fetchPets();
                    });
                });
            } catch (e) {
                setLoadingPets(false);
                console.error('Error during pet deletion:', e);
                setFetchError(`An unexpected error occurred during deletion: ${e.message}`);
                fetchPets();
            }
        }
    };
    
    if (showPetForm && typeof PetFormComponent === 'undefined') {
        return <p style={{ color: 'red' }}>Error: PetFormComponent not loaded.</p>;
    }
    // Check for PetSpriteComponent only when not in form view and pets are expected
    if (!showPetForm && pets.length > 0 && typeof PetSpriteComponent === 'undefined') {
        return <p style={{ color: 'red' }}>Error: PetSpriteComponent not loaded.</p>;
    }

    return (
        <div style={{ border: '1px solid green', padding: '20px', margin: '20px 0', backgroundColor: '#f0fff0' }}>
            <h3>My Toolbox</h3>
            <button onClick={onClose} style={{ float: 'right' }}>Close Toolbox</button>

            {loadingPets && <p>Loading your pets...</p>}
            {fetchError && <p style={{ color: 'red' }}>{fetchError}</p>}

            {!loadingPets && !showPetForm && (
                <div>
                    <button onClick={() => { setEditingPet(null); setShowPetForm(true); }} style={{ margin: '10px 0' }}>
                        Create New Pet
                    </button>
                    {pets.length === 0 && !fetchError && <p>No pets in your toolbox yet. Create one!</p>}
                    {pets.map(pet => (
                        <div key={pet.id} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0', display: 'flex', alignItems: 'center' }}>
                            {typeof PetSpriteComponent !== 'undefined' && (
                                <div style={{ marginRight: '15px' }}>
                                    <PetSpriteComponent 
                                        spriteParams={pet.spriteParams || {shape: 'cube', color: '#dddddd', size: 0.5}} // Default if undefined
                                        animation="rotate" 
                                    />
                                </div>
                            )}
                            <div style={{flexGrow: 1}}>
                                <h4>{pet.name}</h4>
                                <p>{pet.description ? pet.description.substring(0, 100) + (pet.description.length > 100 ? '...' : '') : 'No description.'}</p>
                                <p><small>ID: {pet.id}</small></p>
                                <button onClick={() => handleEditPet(pet)} style={{ marginRight: '5px' }}>Edit</button>
                                <button onClick={() => handleDeletePet(pet.id)} style={{ color: 'red' }}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showPetForm && (
                <PetFormComponent
                    currentUser={currentUser}
                    petToEdit={editingPet}
                    onSave={handlePetSaved}
                    onCancel={handleCancelPetForm}
                />
            )}
        </div>
    );
};

// window.ToolboxComponent = ToolboxComponent; // For global access if not using modules
