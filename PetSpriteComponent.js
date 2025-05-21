// Ensure this file is treated as JSX by Babel

const PetSpriteComponent = ({ spriteParams, animation }) => {
    const mountRef = React.useRef(null);
    const animationFrameId = React.useRef(null);

    React.useEffect(() => {
        if (!mountRef.current || typeof THREE === 'undefined') {
            console.error("THREE.js not loaded or mount point not available.");
            return;
        }

        // Scene Setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xeeeeee); // Light grey background for better visibility

        const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
        
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        mountRef.current.appendChild(renderer.domElement);

        // Geometry & Material
        const params = spriteParams || {};
        const shape = params.shape || 'cube';
        const size = typeof params.size === 'number' && params.size > 0 ? params.size : 1;
        const color = params.color || '#00ff00'; // Default to green

        let geometry;
        switch (shape) {
            case 'sphere':
                geometry = new THREE.SphereGeometry(size / 2, 32, 16);
                break;
            case 'cube':
            default:
                geometry = new THREE.BoxGeometry(size, size, size);
                break;
        }

        // Using MeshStandardMaterial for better appearance with lighting
        const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.5, metalness: 0.5 });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft white light
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // White, half intensity
        directionalLight.position.set(1, 1, 1).normalize(); // From top-right-front
        scene.add(directionalLight);
        
        // Position Camera
        camera.position.z = size * 2; // Adjust camera based on object size for better framing

        // Animation Loop
        const animate = () => {
            animationFrameId.current = requestAnimationFrame(animate);
            if (animation === 'rotate' && mesh) {
                mesh.rotation.x += 0.01;
                mesh.rotation.y += 0.01;
            }
            renderer.render(scene, camera);
        };

        if (animation) { // Start animation loop if animation prop is present
            animate();
        } else {
            renderer.render(scene, camera); // Single render if no animation
        }

        // Cleanup Function
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            // Dispose of Three.js objects
            if (renderer) {
                renderer.dispose();
            }
            if (material) {
                material.dispose();
            }
            if (geometry) {
                geometry.dispose();
            }
            // Scene children are disposed automatically by renderer.dispose() but good practice if handling manually
            // scene.traverse(object => {
            //     if (object.geometry) object.geometry.dispose();
            //     if (object.material) object.material.dispose();
            // });

            // Remove canvas from DOM
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };

    }, [spriteParams, animation]); // Re-run effect if spriteParams or animation changes

    return (
        <div 
            ref={mountRef} 
            style={{ 
                width: '100px', 
                height: '100px', 
                border: '1px solid #ccc', 
                margin: '5px auto' // Center it a bit if needed
            }} 
        />
    );
};

// window.PetSpriteComponent = PetSpriteComponent; // For global access if not using modules
