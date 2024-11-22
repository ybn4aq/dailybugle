document.addEventListener("DOMContentLoaded", () => {
  console.log("helo");
  checkLogIn();
  displayRandomAd();
  console.log("here?");
  const createArticleForm = document.getElementById("create-article-form");
  const loginForm = document.getElementById("login-form");
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    console.log("here?");
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
        const ip = await getIpAddress();
        const user = {
          username: data.username,
          password: data.password,
          role: data.role,
          ip: ip,
          info: navigator.userAgent,
        };
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("loggedIn", true);
        console.log("Stored user:", localStorage.getItem("user"));
        userLoggedIn(data.username);
        displayUserInfo(data.username);
        handleViewRole(data.role);
        console.log("here?");
        checkLogIn();
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error("Error:", error);
      }
      console.log("here?");

  });
 
  createArticleForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("article-title").value;
    const body = document.getElementById("article-body").value;
    const teaser = document.getElementById("article-teaser").value;
    const categories = document.getElementById("article-categories").value;
    try {
      const response = await fetch("http://localhost:3002/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, teaser, categories }),
      });
      if (response.ok) {
        //alert("Article successfully created!");
        createArticleForm.reset();
        const createArticleModal = bootstrap.Modal.getInstance(
          document.getElementById("createArticleModal")
        );
        createArticleModal.hide();
        alert("about to fetch");
        fetchArticles();
      }
    } catch (error) {
      console.error(error);
    }
  });
});

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
      <button id="create-article-btn" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createArticleModal">Create Article</button>
      <p>You have editor access.</p>
    `;
  }
}

function logout() {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("user");
  location.reload(); // Reload to update the UI
}


async function fetchArticles(role) {
  console.log("fetching articles!");
  //alert("hello?????");
  try {
    console.log("fetching articles!");
   // alert("hello?????");
    const response = await fetch("http://localhost:3002/articles");
    const articles = await response.json();
    const articlesContainer = document.getElementById("articles");

    // Clear the container initially
    articlesContainer.innerHTML = '';

    // Append each article, including the comment section
    articles.forEach((article) => {
      const editButton =
        role === "editor"
          ? `<button class="btn btn-warning btn-sm" onclick="editArticle('${article._id}')">Edit</button>`
          : "";

      // Create the article HTML with a comment form
      const articleHTML = `
        <div class="card mb-3" id="article-${article._id}">
          <div class="card-body">
            <h5 class="card-title" id="title-${article._id}">${article.title}</h5>
            <p class="card-text" id="content-${article._id}">${article.body}</p>
            ${editButton}
            <div id="comments-${article._id}" class="comments-section"></div>
            <form onsubmit="event.preventDefault(); submitComment('${article._id}', document.getElementById('commentInput-${article._id}').value, JSON.parse(localStorage.getItem('user')).username);">
              <textarea id="commentInput-${article._id}" placeholder="Add a comment..." required></textarea>
              <button type="submit" class="btn btn-primary">Post Comment</button>
            </form>
          </div>
        </div>
      `;

      // Append the article HTML to the container
      articlesContainer.insertAdjacentHTML('beforeend', articleHTML);

      // Fetch and display comments for each article
      fetchComments(article._id);
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
  }
}


function checkLogIn() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    userLoggedIn(user.username);
    displayUserInfo(user.username);
    handleViewRole(user.role);
  } else {
    //Display one article with teasers and ad
    displayDefaultArticle();
  }
}

function checkLoginStatus() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    displayUserInfo(user.name);
    handleViewRole(user.role);
  } else {
    //Display one article with teasers and ad
    displayDefaultArticle();
  }
}

function userLoggedIn(username) {
  const loginButton = document.getElementById("login-button");
  const loginModal = bootstrap.Modal.getInstance(
    document.getElementById("loginModal")
  );

  if (loginModal) {
    loginModal.hide();
  }

  loginButton.disabled = true;
  loginButton.textContent = `Welcome, ${username}`;
  loginButton.classList.remove("btn-outline-secondary");
  loginButton.classList.add("btn-success");
}

async function getIpAddress() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Error fetching IP address:", error);
    return "Unknown IP";
  }
}

function editArticle(articleId) {
  const articleElement = document.getElementById(`article-${articleId}`);
  const articleTitle = articleElement.querySelector(".card-title").textContent;
  const articleContent = articleElement.querySelector(".card-text").textContent;

  // Create a modal or form to edit the article
  const editFormHTML = `
    <div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editModalLabel">Edit Article</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="edit-article-form">
              <div class="mb-3">
                <label for="edit-title" class="form-label">Title:</label>
                <input type="text" id="edit-title" class="form-control" value="${articleTitle}" required />
              </div>
              <div class="mb-3">
                <label for="edit-content" class="form-label">Content:</label>
                <textarea id="edit-content" class="form-control" required>${articleContent}</textarea>
              </div>
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Append the form to the body and show the modal
  document.body.insertAdjacentHTML("beforeend", editFormHTML);
  const editModal = new bootstrap.Modal(document.getElementById("editModal"));
  editModal.show();

  // Handle the form submission
  document.getElementById("edit-article-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const newTitle = document.getElementById("edit-title").value;
    const newContent = document.getElementById("edit-content").value;

    // Save the updated article (send it to your backend or update locally)
    await saveArticleChanges(articleId, newTitle, newContent);

    // Close the modal after saving
    editModal.hide();
  });
}

async function saveArticleChanges(articleId, newTitle, newContent) {
  try {
    const response = await fetch(`http://localhost:3002/articles/${articleId}`, {
      method: "PUT", // Use PUT to update the article
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newTitle,
        body: newContent,
      }),
    });

    if (response.ok) {
      alert("Article updated successfully!");
      // Reload articles after updating
      fetchArticles();
    } else {
      alert("Failed to update article.");
    }
  } catch (error) {
    console.error("Error updating article:", error);
  }
}

async function fetchComments(articleId) {
    try {
      const response = await fetch(`http://localhost:3002/articles/${articleId}/comments`);
      const comments = await response.json();
      const commentsContainer = document.getElementById(`comments-${articleId}`);
  
      if (Array.isArray(comments)) {
        commentsContainer.innerHTML = comments.map(comment => `
          <p><strong>${comment.user_id}:</strong> ${comment.comment} <em>${new Date(comment.dateCreated).toLocaleString()}</em></p>
        `).join("");
      } else {
        console.error("Comments data is not an array:", comments);
        commentsContainer.innerHTML = "<p>No comments found.</p>";
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }
  



async function submitComment(articleId, commentText, userId) {
  try {
    const response = await fetch(`http://localhost:3002/articles/${articleId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment: commentText, user_id: userId }),
    });

    if (response.ok) {
      alert("Comment added successfully!");
      fetchComments(articleId); 
    } else {
      alert("Failed to add comment.");
    }
  } catch (error) {
    console.error("Error adding comment:", error);
  }
}
function displayRandomAd() {
  console.log("displayRandomAd is being hit");
  const ads = [
    "ads/coke-ad.jpg",
    "ads/dude-ad.jpg",
    "ads/heinz-ad.png",
    "ads/mc-ad.jpg",
  ];

  const randomIndex = Math.floor(Math.random() * ads.length);
  const selectedAd = ads[randomIndex];

  const adContainer = document.getElementById("ad-container");

  if (adContainer) {
    adContainer.innerHTML = `<img src="${selectedAd}" alt="Advertisement" class="img-fluid" />`;
  }
}

const ads = [
  "ads/coke-ad.jpg",
  "ads/dude-ad.jpg",
  "ads/heniz-ad.png",
  "ads/mc-ad.jpg",
];