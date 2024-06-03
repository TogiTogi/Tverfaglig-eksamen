const loginForm = document.getElementById('loginForm');
const loginFeedback = document.getElementById('loginFeedback');


loginForm.addEventListener('submit', login)

async function login(evt) {
    evt.preventDefault();
    try {
        const formData = new FormData(loginForm);
        const response = await fetch('/login', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        const user = await response.json();

        // Assuming the JSON response structure is { id: "someId", username: "someUsername" }
        // Adjust this according to your actual response structure
        if (user){ 
            console.log(user);
            window.location.href = '/app.html'; 
            // Possibly redirect the user or update UI to show a successful login
        } else {
            // Handle case where user data is not in the expected format
            throw new Error('Unsuccessful login. Please try again.');
        }
    } catch (error) {
        console.log('Failed to fetch thisUser:', error);
        loginFeedback.innerText = error.message || 'Unsuccessful login. Please try again.';
        loginFeedback.style.color = 'red';
    }
}