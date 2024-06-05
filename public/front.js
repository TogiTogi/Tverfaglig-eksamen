const editUserFeedback = document.getElementById('editUserFeedback');
const delUserFeedback = document.getElementById('delUserFeedback');

class User {
    constructor(id, username, role) {
        this.id = id;
        this.username = username;
        this.role = role;
    }
}

let users = null;
let tasks = null;
let done = null;
let thisUser = null;

async function main() {
    hideElementsBasedOnRole();
    fetchCurrentUser();
}

document.addEventListener('DOMContentLoaded', main);

document.getElementById('btnRedirectWorker').addEventListener('click', function() {//window.location.href = bytt til fane
    window.location.href = './worker.html';
});
document.getElementById('KunnskapsbaseBrukerveiledning').addEventListener('click', function() {//window.open = åpne i ny fane
    window.open('./img/Sea_of_Thieves_Screenshot.png');
});
document.getElementById('ArbeiderFormsTest').addEventListener('click', function() {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSfJv0GydyYN4r-1Q5pmlq1-sHK1z8Kwac-7_oQcoVKmvXgEyA/viewform?usp=sf_link');
});

async function fetchCurrentUser() {
    try {
        const response = await fetch('/currentUser');
        let user = await response.json();
        thisUser = new User(user[0], user[1], user[2]);
        document.getElementById('loggedInAs').innerText = "logged in as: " + thisUser.username;
        console.log(thisUser);
    } catch (error) {
        console.log('Failed to fetch thisUser:', error);
    }
}

fetch('/currentUser')
    .then(response => response.json())
    .catch(error => console.error('Error:', error));

async function fetchCurrentUserRole() {
    try {
        const response = await fetch('/currentUser');
        let user = await response.json();
        return user[2]; // user[2] is the idRole
    } catch (error) {
        console.log('Failed to fetch currentUser:', error);
    }
}

async function hideElementsBasedOnRole() {
    const idRole = await fetchCurrentUserRole();
    console.log(`idRole: ${idRole}`); // Log the value of idRole
    if (idRole == 1 || idRole == 2 || idRole == 3) { // Om du er en arbeider (1), (2) eller (3), kan du se dette
        document.getElementById('btnRedirectWorker').style.display = 'block';
        document.getElementById('KunnskapsbaseBrukerveiledning').style.display = 'block';
        document.getElementById('ArbeiderFormsTest').style.display = 'block';
    }
}

// Fetch solcelle data from the server
fetch('/solcelleInfo')
    .then(response => response.json())
    .then(solcelleData => {
        // Get the select element
        const solcelleSelect = document.getElementById('solcelleSelect');

        // Create an option element for each solcelle
        solcelleData.forEach(solcelle => {
            const option = document.createElement('option');
            option.value = solcelle.id;
            option.text = solcelle.name;
            solcelleSelect.appendChild(option);
        });

        // Add an event listener to the select element to display the selected solcelle's info
        solcelleSelect.addEventListener('change', () => {
            displaySolcelleInfo(solcelleSelect.value, solcelleData, 'solcelleSelectInfo');
        });
    });

function displaySolcelleInfo(solcelleId, solcelleData, elementId) {
    let selectedSolcelle = solcelleData.find(solcelle => solcelle.id == solcelleId);
    if (selectedSolcelle) {
        document.getElementById(elementId).innerHTML = 
            '<br><h3>' + selectedSolcelle.name + '</h3> <br>' +
            selectedSolcelle.description;
    }
}