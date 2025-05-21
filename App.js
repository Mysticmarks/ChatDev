// Ensure this file is treated as JSX by Babel

// Assuming gunService.js, AuthPage.js are loaded globally or via <script> tags in index.html
// For a module system, you'd use:
// import { gunInstance, user, registerUser, loginUser, logoutUser, getCurrentUser, isUserLoggedIn } from './gunService.js';
// import AuthPage from './AuthPage.js';

const App = () => {
    const [currentView, setCurrentView] = React.useState('login'); // 'login' or 'dashboard'
    const [currentUser, setCurrentUser] = React.useState(null); // Stores user data (e.g., ack.put or ack.pub)

    // Check for existing session on initial load
    React.useEffect(() => {
        // Ensure gunService functions are available
        if (typeof isUserLoggedIn === 'function' && typeof getCurrentUser === 'function') {
            if (isUserLoggedIn()) {
                const userSession = getCurrentUser().is; // .is contains {pub: key, alias: name}
                console.log("User session found on load:", userSession);
                setCurrentUser(userSession); // Store user session data
                setCurrentView('dashboard');
            } else {
                console.log("No active user session on load.");
                setCurrentView('login'); // Ensure login view if no session
            }
        } else {
            console.error("gunService functions not available on load. Ensure gunService.js is loaded before App.js");
            // Fallback or error display might be needed here
        }
    }, []); // Empty dependency array means this runs once on mount

    const handleLoginSuccess = (userData) => {
        console.log("Login successful in App, user data:", userData);
        // userData from loginUser ack typically includes ack.put (user graph), ack.sea (keypair), ack.pub
        // We can store ack.put or just ack.pub or the whole ack.is object
        setCurrentUser(userData.put || { pub: userData.pub, alias: userData.put?.alias }); // Store user's graph or key info
        setCurrentView('dashboard');
    };

    const handleLogout = () => {
        if (typeof logoutUser === 'function') {
            logoutUser(() => {
                console.log("Logout successful in App.");
                setCurrentUser(null);
                setCurrentView('login');
            });
        } else {
            console.error("logoutUser function not available.");
             // Fallback: clear state even if gun logout fails
            setCurrentUser(null);
            setCurrentView('login');
        }
    };

    // Navigation function passed to AuthPage (which is now handleLoginSuccess)
    // navigateToDashboard is essentially handleLoginSuccess

    // navigateToLogin is essentially handleLogout

    let viewComponent;
    // Check if AuthPage and DashboardComponent components are available
    if (typeof AuthPage === 'undefined') {
        viewComponent = <p>Error: AuthPage component not loaded. Ensure AuthPage.js is included before App.js.</p>;
    } else if (typeof DashboardComponent === 'undefined') {
        viewComponent = <p>Error: DashboardComponent not loaded. Ensure DashboardComponent.js is included before App.js.</p>;
    } else if (currentView === 'login' && !currentUser) { // Show AuthPage if not logged in
        viewComponent = <AuthPage onLoginSuccess={handleLoginSuccess} />;
    } else if (currentView === 'dashboard' && currentUser) { // Show Dashboard if logged in
        viewComponent = <DashboardComponent currentUser={currentUser} onLogout={handleLogout} />;
    } else if (currentUser && currentView !== 'dashboard') {
        // If currentUser is set but view is not dashboard, redirect to dashboard (e.g. after initial load effect)
        // This case might be redundant if useEffect correctly sets the view.
        setCurrentView('dashboard'); // Trigger re-render for dashboard
        viewComponent = <p>Loading dashboard...</p>; // Or render DashboardComponent directly if confident
    } else {
        // Fallback or loading state if view/currentUser state is inconsistent
        // This could happen if useEffect hasn't run yet or if state is manually changed to an invalid one
        viewComponent = <p>Loading or inconsistent state...</p>;
        if (!currentUser && currentView !== 'login') {
            // If somehow logged out but view isn't login, force login view
            console.log("State inconsistency: No user, but view is not login. Forcing login view.");
            setCurrentView('login');
            // This will cause a re-render, AuthPage should then be shown.
            // To avoid showing "Loading or inconsistent state..." briefly,
            // you might want to return <AuthPage onLoginSuccess={handleLoginSuccess} /> directly here.
            // However, the re-render triggered by setCurrentView should handle it.
        } else if (currentUser && currentView === 'login') {
            // If user is logged in, but view is login, force dashboard view
            console.log("State inconsistency: User logged in, but view is login. Forcing dashboard view.");
            setCurrentView('dashboard');
        }
    }

    return (
        <div>
            <h1>My SPA with React and Gun.js</h1>
            {viewComponent}
        </div>
    );
};

// Render the App component into the div#root
// Ensure gunService.js and AuthPage.js are loaded before this script in index.html
// so that gun, user, AuthPage etc. are defined.
if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
    ReactDOM.render(
        React.createElement(App),
        document.getElementById('root')
    );
} else {
    console.error("React or ReactDOM not loaded. Check script tags in index.html.");
}
