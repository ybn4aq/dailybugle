// let loginButton = document.getElementById("login-button");
// loginButton.addEventListener("click", async () => {
//   const username = document.getElementById("username").value;
//   const password = document.getElementById("password").value;
//   await logIn(username, password);
// });

// async function checkLogin() {
//   let loggedIn = localStorage.getItem("loggedIn");
//   if (!loggedIn) {
//     let ip = await getIpAddress();
//     return {
//       userid: 0,
//       username: "",
//       password: "",
//       role: "anon",
//       osBrowser: navigator.userAgent,
//       ip: ip,
//     };
//   } else {
//     return JSON.parse(localStorage.getItem("user"));
//   }
// }

// async function getIpAddress() {
//   return fetch("https://api.ipify.org?format=json")
//     .then((response) => response.json())
//     .then((data) => data.ip)
//     .catch((error) => {
//       console.error("Error fetching IP address:", error);
//       return "Unknown IP";
//     });
// }

// async function logIn(username, password) {
//   let response = await fetch("http://localhost:3002/login", {
//     method: "GET",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ username: username, password: password }),
//   });

//   if (!response.ok) {
//     console.error("Login failed:", response.statusText);
//     return { error: 1 };
//   }

//   const data = await response.json();
//   if (data) {
//     console.log("Login successful:", data);
//     localStorage.setItem("loggedIn", true);
//     localStorage.setItem("user", JSON.stringify(data));
//   } else {
//     console.error("Login response error.");
//     return { error: 1 };
//   }
// }


document.addEventListener("DOMContentLoaded", () => {
  checkLoginStatus();

  const loginForm = document.getElementById("login-form");
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://localhost:3002/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.ok) {
        alert("Login successful");
        localStorage.setItem("loggedIn", true);
        localStorage.setItem("user", JSON.stringify(data));
        displayUserInfo(data.username);
        handleViewRole(data.role);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
});

function checkLoginStatus() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    displayUserInfo(user.name);
    handleViewRole(user.role);
  }
  else {
    //Display one article with teasers and ad
    displayDefaultArticle();
  }
}

function displayDefaultArticle() {
  const articlesContainer = document.getElementById("articles");
  articlesContainer.innerHTML = `
    <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">John Pork Strikes Again!</h5>
        <p class="card-text">This is a brief introduction or teaser of an article.</p>
      </div>
    </div>
    <div class="row mt-4">
      <div class="col-md-6">
        <p><strong>Teaser 1:</strong> Catchy summary of a popular article.</p>
        <p><strong>Teaser 2:</strong> Another summary of a great article.</p>
      </div>
      <div class="col-md-6">
        <img src="path/to/ad-image.jpg" alt="Advertisement" class="img-fluid" />
      </div>
    </div>
  `;
}

function displayUserInfo(name) {
  const loginContainer = document.getElementById("login-container");
  if (loginContainer) {
    loginContainer.innerHTML = `<span>Welcome, ${name}!</span>
      <button class="btn btn-link" onclick="logout()">Logout</button>`;
  }
}

function handleViewRole(role) {
  const articlesContainer = document.getElementById("articles");
  if (role === "anonymous") {
    articlesContainer.innerHTML = "<p>Please log in to view more articles.</p>";
  } else if (role === "reader") {
    // Readers can view all articles but not edit
    fetchArticles(role);
  } else if (role === "editor") {
    // Editors can view and edit/create articles
    fetchArticles(role);

    // Ensure editor controls are appended only once
    editorcontrols.innerHTML = `
      <button class="btn btn-primary" id="create-article-btn">Create New Article</button>
      <p>You have editor access.</p>
    `;

    // Add functionality to the "Create New Article" button
    const createButton = document.getElementById("create-article-btn");
    createButton.addEventListener("click", () => {
      //test
      alert("Create New Article button clicked!");
    });
  }
}

function logout() {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("user");
  location.reload(); // Reload to update the UI
}

async function fetchArticles(role) {
  try {
    const response = await fetch("http://localhost:3002/articles");
    const articles = await response.json();
    const articlesContainer = document.getElementById("articles");

    articlesContainer.innerHTML = articles
      .map((article) => {
        // Create HTML for each article
        const editButton = role === 'editor' ? `<button class="btn btn-warning btn-sm" onclick="editArticle(${article.id})">Edit</button>` : '';

        return `
          <div class="card mb-3" id="article-${article.id}">
            <div class="card-body">
              <h5 class="card-title" id="title-${article.id}">${article.title}</h5>
              <p class="card-text" id="content-${article.id}">${article.content}</p>
              ${editButton}
            </div>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    console.error("Error fetching articles:", error);
  }
}