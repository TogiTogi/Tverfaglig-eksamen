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

document.getElementById('btnRedirectApp').addEventListener('click', function() {
    window.location.href = './app.html';
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

    if (idRole == 1) { // Om du er Admin (1) kan du se denne
        document.getElementById('delUserForm').style.display = 'block';        
        document.getElementById('editUserForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'block';

        document.getElementById('delSolcelleForm').style.display = 'block';
        document.getElementById('editSolcelleForm').style.display = 'block';
        ocument.getElementById('userSettingsHeader').style.display = 'block';
    }   
    if (idRole == 1 ||idRole == 2 || idRole == 3) { // Om du er Admin (1) kan du se disse
        document.getElementById('registerSolcelleForm').style.display = 'block';
    }
}

fetch('/roles')
    .then(response => response.json())
    .then(data => {
        const select = document.getElementById('regRoleId');
        data.data.forEach(role => {
            const option = document.createElement('option');
            option.value = role.id;
            option.text = role.name;
            select.appendChild(option);
        });
    })
    .catch(error => console.error('Error:', error));

fetch('/User')
    .then(response => response.json())
    .then(data => {
        const delSelect = document.getElementById('delUserId');
        const editSelect = document.getElementById('editUserId');
        let users = data.data;
        users.forEach(user => {
            const delOption = document.createElement('option');
            delOption.value = user.id;
            delOption.text = user.firstname + " " + user.lastname;
            delSelect.appendChild(delOption);

            const editOption = document.createElement('option');
            editOption.value = user.id;
            editOption.text = user.firstname + " " + user.lastname;
            editSelect.appendChild(editOption);
        });

        delSelect.addEventListener('change', function() {
            displayUserInfo(this.value, users, 'delUserInfo');
        });

        editSelect.addEventListener('change', function() {
            displayUserInfoEdit(this.value, users);
        });
    })
    .catch(error => console.error('Error:', error));

function displayUserInfo(userId, users, elementId) {
    let selectedUser = users.find(user => user.id == userId);
    if (selectedUser) {
        document.getElementById(elementId).innerHTML = 
            'Name: ' + selectedUser.firstname + " " + selectedUser.lastname +
            '<br> Username: ' + selectedUser.username + 
            '<br> Email: ' + selectedUser.email +
            '<br> Role: ' + selectedUser.idRole;
    }
}


function displayUserInfoEdit(userId, users) {
    let selectedUser = users.find(user => user.id == userId);
    if (selectedUser) {
        document.getElementById('editFirstname').value = selectedUser.firstname;
        document.getElementById('editLastname').value = selectedUser.lastname;
        document.getElementById('editUsername').value = selectedUser.username;
        document.getElementById('editEmail').value = selectedUser.email;
        document.getElementById('editRole').value = selectedUser.idRole;
    }
}

document.getElementById('editUserForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const id = document.getElementById('editUserId').value;
    const firstname = document.getElementById('editFirstname').value;
    const lastname = document.getElementById('editLastname').value;
    const username = document.getElementById('editUsername').value;
    const email = document.getElementById('editEmail').value;
    const idRole = document.getElementById('editRole').value;

    const updatedUser = {
        firstname: firstname,
        lastname: lastname,
        username: username,
        email: email,
        idRole: idRole,
    };

    fetch('/User/' + id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            editUserFeedback.innerText = 'User updated successfully';
            editUserFeedback.style.color = 'green';
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});

document.getElementById('delUserForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var userId = document.getElementById('delUserId').value;
    fetch('/userDel/' + userId, {
        method: 'DELETE',
        redirect: 'follow'
    })
        .then(response => {
            if (response.redirected) {
                window.location.href = response.url;
            } else {
                return response.json();
            }
        })
        .then(data => {
            if (data && data.message) {
                alert(data.message);
                delUserFeedback.innerText = 'User deleted successfully';
                delUserFeedback.style.color = 'green';
            }
        })
        .catch(error => console.error('Error:', error));
});



function displaySolcelleInfoEdit(solcelleId, solcelles) {
    let selectedSolcelle = solcelles.find(solcelle => solcelle.id == solcelleId);
    if (selectedSolcelle) {
        document.getElementById('editName').value = selectedSolcelle.name;
        document.getElementById('editDescription').value = selectedSolcelle.description;
    }
}

const editSolcelleFeedback = document.getElementById('editSolcelleFeedback');

document.getElementById('editSolcelleForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const id = document.getElementById('editSolcelleId').value;
    const name = document.getElementById('editName').value;
    const description = document.getElementById('editDescription').value;

    const updatedSolcelle = {
        name: name,
        description: description,
    };

    fetch('/solcelleInfo/' + id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSolcelle),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            editSolcelleFeedback.innerText = 'Solcelle updated successfully';
            editSolcelleFeedback.style.color = 'green';
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});



fetch('/solcelleInfo')
    .then(response => response.json())
    .then(solcelleData => {
        // Get the select element
        const delSolcelleSelect = document.getElementById('delSolcelle');
        const editSolcelleSelect = document.getElementById('editSolcelleId');
        

        // Create an option element for each solcelle
        solcelleData.forEach(solcelle => {
            const delOption = document.createElement('option');
            delOption.value = solcelle.id;
            delOption.text = solcelle.name;
            delSolcelleSelect.appendChild(delOption);

            const editOption = document.createElement('option');
            editOption.value = solcelle.id;
            editOption.text = solcelle.name;
            editSolcelleSelect.appendChild(editOption);
        });
        delSolcelleSelect.addEventListener('change', () => {
            displaySolcelleInfo(delSolcelleSelect.value, solcelleData, 'delSolcelleInfo');
        });
        editSolcelleSelect.addEventListener('change', () => {
            displaySolcelleInfoEdit(editSolcelleSelect.value, solcelleData);
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

// Get the form and select elements
const delSolcelleForm = document.getElementById('delSolcelleForm');
const delSolcelleSelect = document.getElementById('delSolcelle');
const delSolcelleFeedback = document.getElementById('delSolcelleFeedback');

// Add an event listener to the form's submit event
delSolcelleForm.addEventListener('submit', event => {
    // Prevent the form from being submitted normally
    event.preventDefault();

    // Get the selected solcelle id
    const solcelleId = delSolcelleSelect.value;

    // Send a DELETE request to the server
    fetch('/solcelleDel/' + solcelleId, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // Reload the page or do something else here
        location.reload();
    })
    .then(data => {
        if (data && data.message) {
            alert(data.message);
            delSolcelleFeedback.innerText = 'Solcelle-logg deleted successfully';
            delSolcelleFeedback.style.color = 'green';
        }
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
});