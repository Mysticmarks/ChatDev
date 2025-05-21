// Ensure this file is treated as JSX by Babel

// Import functions from gunService.js
// Assuming gunService.js is in the same directory.
// Note: Standard ES6 module imports might require a build setup for browsers.
// For this environment, we'll assume these are globally available or handle them in App.js if needed.
// For now, let's assume gunService functions are accessible. If not, we'll adjust.

const AuthPage = ({ onLoginSuccess }) => {
    const [alias, setAlias] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isRegisterMode, setIsRegisterMode] = React.useState(false);
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const resetForm = () => {
        setAlias('');
        setPassword('');
        setError('');
        setLoading(false);
    };

    const handleLogin = async () => {
        if (!alias || !password) {
            setError('Alias and password are required.');
            return;
        }
        setLoading(true);
        setError('');
        // Assuming loginUser is available (e.g., window.loginUser or imported via a global script)
        loginUser(alias, password, (ack) => {
            setLoading(false);
            if (ack.err) {
                setError(`Login failed: ${ack.err}`);
            } else if (ack.ok) {
                console.log('Login successful:', ack);
                resetForm();
                if (onLoginSuccess) {
                    onLoginSuccess(ack); // Pass the ack object which contains user details
                }
            } else {
                 setError('Login failed: Unknown error.');
            }
        });
    };

    const handleRegister = async () => {
        if (!alias || !password) {
            setError('Alias and password are required.');
            return;
        }
        setLoading(true);
        setError('');
        // Assuming registerUser is available
        registerUser(alias, password, (ack) => {
            setLoading(false);
            if (ack.err) {
                setError(`Registration failed: ${ack.err}`);
            } else if (ack.ok) {
                console.log('Registration successful:', ack);
                // Optionally, inform user to login, or attempt auto-login
                alert('Registration successful! Please login to continue.');
                setIsRegisterMode(false); // Switch to login mode
                resetForm();
                // Or, if registration implies login or returns enough data:
                // if (onLoginSuccess) onLoginSuccess(ack);
            } else {
                setError('Registration failed: Unknown error.');
            }
        });
    };

    return (
        <div>
            <h2>{isRegisterMode ? 'Register' : 'Login'}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <input
                    type="text"
                    placeholder="Alias"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    disabled={loading}
                />
            </div>
            <div>
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                />
            </div>
            {isRegisterMode ? (
                <button onClick={handleRegister} disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            ) : (
                <button onClick={handleLogin} disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            )}
            <button onClick={() => { setIsRegisterMode(!isRegisterMode); resetForm(); }} disabled={loading}>
                {isRegisterMode ? 'Switch to Login' : 'Switch to Register'}
            </button>
        </div>
    );
};

// If not using ES6 modules in the browser, ensure AuthPage is available globally or loaded appropriately.
// For example, window.AuthPage = AuthPage;
// This component will be imported and used in App.js
// ReactDOM.render(<AuthPage onLoginSuccess={(ack) => console.log("Login success from test", ack)} />, document.getElementById('root')); // For standalone testing
