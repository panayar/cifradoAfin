const loginContainer = document.getElementById("loginContainer");
const registrationContainer = document.getElementById("registrationContainer");
const toggleRegistration = document.getElementById("toggleRegistration");
const toggleLogin = document.getElementById("toggleLogin");
const loginForm = document.getElementById("loginForm");
const registrationForm = document.getElementById("registrationForm");

let loginAttempts = 0;
let disableDuration = 60000; // Initial disable duration in milliseconds
let maxFailedAttempts = 3; // Maximum number of failed attempts before increasing the lockout
let maxRetries = 3; // Maximum number of lockouts before locking the user indefinitely

// Function to disable login inputs
function disableLoginInputs() {
  const email = document.getElementById("loginEmail");
  const password = document.getElementById("loginPassword");
  const btnLogin = document.getElementById("btnLogin");
  email.disabled = true;
  password.disabled = true;
  btnLogin.disabled = true;
  setTimeout(enableLoginInputs, disableDuration);
}

// Function to enable login inputs
function enableLoginInputs() {
  const email = document.getElementById("loginEmail");
  const password = document.getElementById("loginPassword");
  const btnLogin = document.getElementById("btnLogin");
  email.disabled = false;
  password.disabled = false;
  btnLogin.disabled = false;
}

// Toggle between login and registration forms
toggleRegistration.addEventListener("click", () => {
  loginContainer.style.display = "none";
  registrationContainer.style.display = "block";
});

toggleLogin.addEventListener("click", () => {
  loginContainer.style.display = "block";
  registrationContainer.style.display = "none";
});

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyADBkWAeq_Png8DzmquefgAzFjzbeK4e2w",
  authDomain: "loginafin.firebaseapp.com",
  databaseURL: "https://loginafin-default-rtdb.firebaseio.com",
  projectId: "loginafin",
  storageBucket: "loginafin.appspot.com",
  messagingSenderId: "264180574004",
  appId: "1:264180574004:web:dfc593eea480d87be8e761",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference for databases
var userFormDB = firebase.database().ref("users");

// Registration form
registrationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  if (!passwordValidation(password)) {
    alert(
      "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
    );
  } else {
    saveUser(name, email, password);
    alert("User created successfully");

    // Reset values
    document.getElementById("registerName").value = "";
    document.getElementById("registerEmail").value = "";
    document.getElementById("registerPassword").value = "";
  }
});

// Save user to Firebase
function saveUser(name, email, password) {
  let newUser = userFormDB.push();

  newUser.set({
    name: name,
    email: email,
    password: password,
  });
}

function passwordValidation(password) {
  if (password.length < 8) {
    return false;
  }
  if (!/\d/.test(password)) {
    return false;
  }
  if (!/[a-z]/.test(password)) {
    return false;
  }
  if (!/[A-Z]/.test(password)) {
    return false;
  }
  return true;
}

// Login form
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  verifyLogin(email, password);
});

function verifyLogin(email, password) {
    if (loginAttempts >= maxRetries) {
      console.log("User account temporarily locked due to too many failed login attempts.");
      alert(
        "You have exceeded the maximum number of failed login attempts. Your account is temporarily locked for " +
          disableDuration / 1000 +
          " seconds"
      );
      disableLoginInputs();
    } else if (loginAttempts >= maxFailedAttempts) {
      disableDuration *= 2; // Double the lockout duration after 3 failed attempts
      console.log(
        "Too many failed login attempts. Lockout duration increased to " +
          disableDuration / 1000 +
          " seconds"
      );
      alert(
        "Too many failed login attempts. Please try again later in " +
          disableDuration / 1000 +
          " seconds"
      );
      disableLoginInputs();
    }
  
    userFormDB
      .orderByChild("email")
      .equalTo(email)
      .once("value")
      .then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          const userKey = Object.keys(userData)[0];
          const storedPassword = userData[userKey].password;
  
          if (storedPassword === password) {
            console.log("Login successful for user with email: " + email);
            alert("Login successful");
            loginAttempts = 0; // Reset failed attempts
            // Reset values
            document.getElementById("loginEmail").value = "";
            document.getElementById("loginPassword").value = "";
            window.location.href = "cifrado.html";
          } else {
            console.log("Incorrect password for user with email: " + email);
            alert("Incorrect password");
            loginAttempts++;
          }
        } else {
          console.log("User not found with email: " + email);
          alert("User not found");
          loginAttempts++;
        }
      })
      .catch((error) => {
        console.error("Error during login: " + error.message);
        alert("An error occurred during login. Please try again later.");
      });
  }
  