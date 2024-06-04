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
    }

    if (idRole == 1) { // Om du er Admin (1) kan du se disse
        document.getElementById('editUserForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'block';
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