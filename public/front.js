const editUserFeedback = document.getElementById('editUserFeedback');
const delUserFeedback = document.getElementById('delUserFeedback');

class User {
    constructor(id, username, role) {
    this.id = id;
    this.username = username;
    this.role = role;
    }
}
  
  
let users = null
let tasks = null
let done = null
let thisUser = null

async function main() {
    hideElementsBasedOnRole()
    fetchCurrentUser()
}

document.addEventListener('DOMContentLoaded', main)

async function fetchCurrentUser() {
    try {
        const response = await fetch('/currentUser')
        
        let user = await response.json()
        thisUser = new User(user[0], user[1], user[2])
        document.getElementById('loggedInAs').innerText = "logged in as: " + thisUser.username;
        console.log(thisUser)
    } catch (error) {
        console.log('Failed to fetch thisUser:', error);
    }
  }
  fetch('/currentUser')
    .then(response => response.json())
    //.then(data => console.log(data))
    .catch(error => console.error('Error:', error));
  
    
  //Funker ikke, vet ikke hvorfor
  async function fetchCurrentUserRole() {
    try {
        const response = await fetch('/currentUser')
        
        let user = await response.json()
        return user[2]; // user[2] is the idRole
    } catch (error) {
        console.log('Failed to fetch currentUser:', error);
    }
}

async function hideElementsBasedOnRole() {
    const idRole = await fetchCurrentUserRole();
    console.log(`idRole: ${idRole}`); // Log the value of idRole
    
    if (idRole == 1 ) { //Om du er Admin (1) kan du se denne
      document.getElementById('delUserForm').style.display = 'block';
    }

    if (idRole == 2) { //om du er Lærer (2) kan du se denne
        document.getElementById('GDPRtestForm').style.display = 'block';
    }

    if (idRole == 1 || idRole == 4) { //Om du er Admin (1), Staff (2) eller IT (4) kan du se isse
      document.getElementById('editUserForm').style.display = 'block';
      document.getElementById('registerForm').style.display = 'block';
      document.getElementById('GDPRtestForm').style.display = 'block';
    }

}



document.getElementById('GDPRtest').addEventListener('click', function() {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSfA0pX4VLh2Ul5pXBbs1_DSrXT-2iL7YJR21OhYILOxveyVoA/viewform?usp=sf_link');
});

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
}).catch(error => console.error('Error:', error));

fetch('/klasse')
.then(response => response.json())
.then(data => {
    const select = document.getElementById('regKlasseId');
    data.data.forEach(klasse => {
        const option = document.createElement('option');
        option.value = klasse.id;
        option.text = klasse.name;
        select.appendChild(option);
    });
}).catch(error => console.error('Error:', error));

fetch('/User')
.then(response => response.json())
.then(data => {
    const delSelect = document.getElementById('delUserId');
    const editSelect = document.getElementById('editUserId'); // Get the editUserId select element
    let users = data.data; // Define users here
    users.forEach(user => {
        const delOption = document.createElement('option');
        delOption.value = user.id;
        delOption.text = "VG"+user.idKlasse + " " + user.firstname + " " + user.lastname;
        delSelect.appendChild(delOption);

        const editOption = document.createElement('option'); // Create an option for the editUserId select
        editOption.value = user.id;
        editOption.text = "VG"+user.idKlasse + " " + user.firstname + " " + user.lastname;
        editSelect.appendChild(editOption); // Add the option to the editUserId select
    });

    // Add event listener to delUserId select
    delSelect.addEventListener('change', function() {
        displayUserInfo(this.value, users, 'delUserInfo');
    });

    // Add event listener to editUserId select
    editSelect.addEventListener('change', function() {
        displayUserInfoEdit(this.value, users, 'editUserInfo');
    });
}).catch(error => console.error('Error:', error));

function displayUserInfo(userId, users, elementId) {
    // Find the selected user's information
    let selectedUser = users.find(user => user.id == userId);
    if (selectedUser) {
        // Display the selected user's information
        document.getElementById(elementId).innerHTML = 
            'Name: ' + selectedUser.firstname + " " + selectedUser.lastname +
            '<br> Username: '+ selectedUser.username + 
            '<br> Email: ' + selectedUser.email +
            '<br> Tel: ' + selectedUser.tel +
            '<br> Address :' + selectedUser.address +
            '<br> Class: VG' + selectedUser.idKlasse +
            '<br> Role: ' + selectedUser.idRole;
    }
}
function displayUserInfoEdit(userId, users) {
    // Find the selected user's information
    let selectedUser = users.find(user => user.id == userId);
    if (selectedUser) {
        // Display the selected user's information in the input fields
        document.getElementById('editFirstname').value = selectedUser.firstname;
        document.getElementById('editLastname').value = selectedUser.lastname;
        document.getElementById('editUsername').value = selectedUser.username;
        document.getElementById('editEmail').value = selectedUser.email;
        document.getElementById('editTel').value = selectedUser.tel;
        document.getElementById('editAddress').value = selectedUser.address;
        document.getElementById('editKlasse').value = selectedUser.idKlasse;
        document.getElementById('editRole').value = selectedUser.idRole;
        // Set the value of the other input fields as needed
    }
}

document.getElementById('editUserForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const id = document.getElementById('editUserId').value;
    const firstname = document.getElementById('editFirstname').value;
    const lastname = document.getElementById('editLastname').value;
    const username = document.getElementById('editUsername').value;
    const email = document.getElementById('editEmail').value;
    const tel = document.getElementById('editTel').value;
    const address = document.getElementById('editAddress').value;
    const idKlasse = document.getElementById('editKlasse').value;
    const idRole = document.getElementById('editRole').value;
    
    const updatedUser = {
        firstname: firstname,
        lastname: lastname,
        username: username,
        email: email,
        tel: tel,
        address: address,
        idKlasse: idKlasse,
        idRole: idRole,
        // Include the other fields
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
    event.preventDefault(); // Prevent the form from submitting normally
    var userId = document.getElementById('delUserId').value;
    fetch('/userDel/' + userId, {
        method: 'DELETE',
        redirect: 'follow'  // Set the redirect option to 'follow'
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