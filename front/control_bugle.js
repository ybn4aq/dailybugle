document.addEventListener("DOMContentLoaded", () => {
  checkLogIn();
  //--------- AD STUFF----------
  const ads = [
    {
      src: "ads/ad1.jpg",
      url: "https://shop.mccormick.com/collections/condiments-sauces",
    },
    { src: "ads/ad2.jpg", url: "https://www.coca-colastore.com/" },
    { src: "ads/ad3.jpeg", url: "https://www.mcdonalds.com/us/en-us.html" },
    {
      src: "ads/ad4.jpg",
      url: "https://www.xbox.com/en-US/consoles/all-consoles",
    },
    {
      src: "ads/ad5.png",
      url: "https://www.heinz.com/products/00013000006408-tomato-ketchup",
    },
    {
      src: "ads/ad6.jpg",
      url: "https://www.mcdonalds.com/us/en-us/product/big-mac.html",
    },
  ];

  const adImpressions =
    JSON.parse(localStorage.getItem("adImpressions")) || //persistent storage of impressions
    ads.reduce((acc, ad) => {
      acc[ad.src] = 0;
      return acc;
    }, {});

  const adImage = document.getElementById("ad-image");
  const impressionCountElement = document.getElementById("impression-count");

  let currentAdUrl = "";
  function saveImpressions() {
    localStorage.setItem("adImpressions", JSON.stringify(adImpressions));
  }

  function displayRandomAd() {
    if (!adImage) return;

    const randomIndex = Math.floor(Math.random() * ads.length);
    const selectedAd = ads[randomIndex];

    adImage.src = selectedAd.src;
    adImage.alt = `Advertisement for ${selectedAd.url}`;
    currentAdUrl = selectedAd.url;
    if (impressionCountElement) {
      impressionCountElement.textContent = adImpressions[selectedAd.src];
    }
    console.log(`Displaying ad: ${selectedAd.src}`);
  }

  function handleAdClick() {
    if (!adImage || !adImage.src) return;

    const currentAd = adImage.src.split("/").pop();
    const adPath = ads.find((ad) => ad.src.includes(currentAd));

    if (adPath && adImpressions[adPath.src] !== undefined) {
      adImpressions[adPath.src] += 1;
      saveImpressions();
      if (impressionCountElement) {
        impressionCountElement.textContent = adImpressions[adPath.src];
      }

      console.log(
        `Ad "${adPath.src}" clicked. Total impressions: ${
          adImpressions[adPath.src]
        }`
      );
      if (currentAdUrl) {
        window.location.href = currentAdUrl;
      }
    } else {
      console.warn(`Ad path "${currentAd}" not found in impressions tracking.`);
    }
  }
  if (adImage) {
    adImage.addEventListener("click", handleAdClick);
  }
  displayRandomAd();
  //--------- AD STUFF----------

  const createArticleForm = document.getElementById("create-article-form");
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
        checkLogIn();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });

  createArticleForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("article-title").value;
    const body = document.getElementById("article-body").value;
    const teaser = document.getElementById("article-teaser").value;
    const categories = document.getElementById("article-categories").value;
    const creationDate = new Date().toLocaleString();
    const editDate = new Date().toLocaleString();
    try {
      const response = await fetch("http://localhost:3002/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, teaser, categories, creationDate, editDate }),
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
    showSearchBox();
    fetchArticles(role);
  } else if (role === "editor") {
    document.getElementById("ad-container").innerHTML = "";
    document.getElementById("ad-container").style.border = "0px";
    document.getElementById("ad-container").style.height = 0;
    document.getElementById("impression-container").innerHTML = "";
    showSearchBox();

    fetchArticles(role);
    editorcontrols.innerHTML = `
      <button id="create-article-btn" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createArticleModal">Create Article</button>
      <p>You have editor access.</p>
    `;
  }
}

function logout() {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("user");
  location.reload();
}

async function fetchArticles(role) {
  try {
    const response = await fetch("http://localhost:3002/articles");
    const articles = await response.json();
    const articlesContainer = document.getElementById("articles");

    articlesContainer.innerHTML = "";

    if (role === "reader") {
      let currentArticleIndex = 0;

      const renderArticle = (index) => {
        const article = articles[index];
        if (!article) return;

        articlesContainer.innerHTML = `
          <div class="card mb-3" id="article-${article._id}">
            <div class="card-body">
              <h5 class="card-title" id="title-${article._id}">${
          article.title
        }</h5>
        <p class="card-text"> Created on: ${article.creationDate}</p>
              <p class="card-text"> Last edited: ${article.editDate}</p>
              <p class="card-text" id="content-${article._id}">${
          article.body
        }</p>
              <div id="comments-${article._id}" class="comments-section"></div>
              <form onsubmit="event.preventDefault(); submitComment('${
                article._id
              }', document.getElementById('commentInput-${
          article._id
        }').value, JSON.parse(localStorage.getItem('user')).username);">
                <textarea id="commentInput-${
                  article._id
                }" placeholder="Add a comment..." required></textarea>
                <button type="submit" class="btn btn-primary">Post Comment</button>
              </form>
              <div class="navigation-buttons">
                <button class="btn btn-secondary" id="backButton" ${
                  index === 0 ? "disabled" : ""
                }>Back</button>
                <button class="btn btn-secondary" id="nextButton" ${
                  index === articles.length - 1 ? "disabled" : ""
                }>Next</button>
              </div>
            </div>
          </div>
        `;

        fetchComments(article._id);

        document.getElementById("backButton").onclick = () => {
          if (currentArticleIndex > 0) {
            currentArticleIndex--;
            renderArticle(currentArticleIndex);
          }
        };

        document.getElementById("nextButton").onclick = () => {
          if (currentArticleIndex < articles.length - 1) {
            currentArticleIndex++;
            renderArticle(currentArticleIndex);
          }
        };
      };

      renderArticle(currentArticleIndex);
    } else {
      articles.forEach((article) => {
        const editButton =
          role === "editor"
            ? `<button class="btn btn-warning btn-sm" onclick="editArticle('${article._id}')">Edit</button>`
            : "";

        const editCommentsButton =
          role === "editor"
            ? `<button class="btn btn-info btn-sm" onclick="editComments('${article._id}')">Edit Comments</button>`
            : "";

        const articleHTML = `
          <div class="card mb-3" id="article-${article._id}">
            <div class="card-body">
              <h5 class="card-title" id="title-${article._id}">${article.title}</h5>
              <p class="card-text"> Created on: ${article.creationDate}</p>
              <p class="card-text"> Last edited: ${article.editDate}</p>
              <p class="card-text" id="content-${article._id}">${article.body}</p>
              ${editButton}
              ${editCommentsButton}
              <div id="comments-${article._id}" class="comments-section"></div>
              <form onsubmit="event.preventDefault(); submitComment('${article._id}', document.getElementById('commentInput-${article._id}').value, JSON.parse(localStorage.getItem('user')).username);">
                <textarea id="commentInput-${article._id}" placeholder="Add a comment..." required></textarea>
                <button type="submit" class="btn btn-primary">Post Comment</button>
              </form>
            </div>
          `;

        articlesContainer.insertAdjacentHTML("beforeend", articleHTML);

        fetchComments(article._id);
      });
    }
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
    displayDefaultArticle();
  }
}

function checkLoginStatus() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    displayUserInfo(user.name);
    handleViewRole(user.role);
  } else {
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

async function editArticle(articleId) {
  const response = await fetch(`http://localhost:3002/articles/${articleId}`);
  const articleData = await response.json();
  const { title, body, categories, teaser } = articleData;

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
                <input type="text" id="edit-title" class="form-control" value="${title}" required />
              </div>
              <div class="mb-3">
                <label for="edit-content" class="form-label">Content:</label>
                <textarea id="edit-content" class="form-control" required>${body}</textarea>
              </div>
              <div class="mb-3">
                <label for="edit-categories" class="form-label">Categories:</label>
                <textarea id="edit-categories" class="form-control" required>${categories}</textarea>
              </div>
              <div class="mb-3">
                <label for="edit-teasers" class="form-label">Teasers:</label>
                <textarea id="edit-teasers" class="form-control" required>${teaser}</textarea>
              </div>
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", editFormHTML);
  const editModal = new bootstrap.Modal(document.getElementById("editModal"));
  editModal.show();

  // Handle the form submission
  document
    .getElementById("edit-article-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const newTitle = document.getElementById("edit-title").value;
      const newContent = document.getElementById("edit-content").value;
      const newCategory = document.getElementById("edit-categories").value;
      const newTeaser = document.getElementById("edit-teasers").value;

      // Save the updated article (send it to your backend or update locally)
      await saveArticleChanges(
        articleId,
        newTitle,
        newContent,
        newCategory,
        newTeaser
      );

      // Save the updated article (send it to your backend or update locally)
      await saveArticleChanges(articleId, newTitle, newContent);

      // Close the modal after saving
      editModal.hide();
    });
}

function editComments(articleId) {
  // const articleElement = document.getElementById(`article-${articleId}`);
  // const comments = Array.from(
  //   articleElement.querySelectorAll(`#comments-${articleId} p[data-comment-id]`)
  // ).map((commentElement) => {
  //   const textNode = commentElement.childNodes[2]?.nodeValue.trim() || "";
  //   return {
  //     id: commentElement.dataset.commentId,
  //     text: textNode, 
  //   };
  // });
  const articleElement = document.getElementById(`article-${articleId}`);
  if (!articleElement) {
    console.error(`Article element with ID "article-${articleId}" not found.`);
    return [];
  }

  const commentsContainer = articleElement.querySelector(`#comments-${articleId}`);
  if (!commentsContainer) {
    console.error(`Comments container with ID "comments-${articleId}" not found.`);
    return [];
  }

  // Query the comment elements within the container
  const comments = Array.from(commentsContainer.querySelectorAll(`[data-comment-id]`)).map((commentElement) => {
    const textNode = commentElement.textContent.trim(); // Adjusted to use textContent
    return {
      id: commentElement.dataset.commentId,
      text: textNode,
    };
  });
  
  if (comments.length === 0) {
    console.error("No comments found to edit.");
    return;
  }

  const existingModal = document.getElementById("editCommentsModal");
  if (existingModal) existingModal.remove();

  const editFormHTML = `
    <div class="modal fade" id="editCommentsModal" tabindex="-1" aria-labelledby="editCommentsModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editCommentsModalLabel">Edit Comments</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="edit-comments-form">
              ${comments
                .map(
                  (comment) => `
                  <div class="mb-3">
                    <label for="edit-comment-${comment.id}" class="form-label">Comment:</label>
                    <textarea id="edit-comment-${comment.id}" class="form-control" data-comment-id="${comment.id}" required>${comment.text}</textarea>
                  </div>
                `
                )
                .join("")}
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", editFormHTML);

  const editModal = new bootstrap.Modal(
    document.getElementById("editCommentsModal")
  );
  editModal.show();

  document
    .getElementById("edit-comments-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const updatedComments = comments.map((comment) => ({
        id: comment.id,
        text: document.getElementById(`edit-comment-${comment.id}`).value,
      }));

      await saveCommentsChanges(articleId, updatedComments);

      editModal.hide();
    });
}

async function saveCommentsChanges(articleId, updatedComments) {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const response = await fetch(
      `http://localhost:3002/articles/${articleId}/comments`,
      {
        method: "PUT", // Assuming PUT method for bulk update
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comments: updatedComments,
        }),
      }
    );

    if (response.ok) {
      alert("Comments updated successfully!");
      // Reload articles and comments after updating
      fetchArticles(user.role);
    } else {
      alert("Failed to update comments.");
    }
  } catch (error) {
    console.error("Error updating comments:", error);
  }
}

async function saveArticleChanges(
  articleId,
  newTitle,
  newContent,
  newCategory,
  newTeaser
) {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const response = await fetch(
      `http://localhost:3002/articles/${articleId}`,
      {
        method: "PUT", // Use PUT to update the article
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
          body: newContent,
          categories: newCategory,
          teaser: newTeaser,
        }),
      }
    );

    if (response.ok) {
      alert("Article updated successfully!");
      // Reload articles after updating
      fetchArticles(user.role);
    } else {
      alert("Failed to update article.");
    }
  } catch (error) {
    console.error("Error updating article:", error);
  }
}

// async function fetchComments(articleId) {
//     try {
//       const response = await fetch(`http://localhost:3002/articles/${articleId}/comments`);
//       const comments = await response.json();
//       const commentsContainer = document.getElementById(`comments-${articleId}`);
//       if (Array.isArray(comments)) {
//         commentsContainer.innerHTML = comments.map(comment => `
//           <p><strong>${comment.user_id}:</strong> ${comment.comment} <em>${new Date(comment.dateCreated).toLocaleString()}</em></p>
//         `).join("");
//       } else {
//         console.error("Comments data is not an array:", comments);
//         commentsContainer.innerHTML = "<p>No comments found.</p>";
//       }
//     } catch (error) {
//       console.error("Error fetching comments:", error);
//     }
//   }
async function fetchComments(articleId) {
  try {
    const response = await fetch(
      `http://localhost:3002/articles/${articleId}/comments`
    );
    const comments = await response.json();
    const commentsContainer = document.getElementById(`comments-${articleId}`);

    if (Array.isArray(comments)) {
      commentsContainer.innerHTML = comments
        .map(
          (comment) => `
          <p><strong>${comment.user_id}:</strong> ${
            comment.comment
          } <em>${new Date(comment.dateCreated).toLocaleString()}</em></p>
        `
        )
        .join("");
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
    const response = await fetch(
      `http://localhost:3002/articles/${articleId}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment: commentText, user_id: userId }),
      }
    );

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

function showSearchBox() {
  document.getElementById("search-comment-container").hidden = false;
  document.getElementById("search-article-container").hidden = false;
}

async function searchComment(query) {
  console.log(query);
  try {
    const response = await fetch(
      `http://localhost:3002/search-comments/${query}`,
      {
        method: "GET",
        headers: { "Content-type": "application/json" },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch comments");
    }
    const comments = await response.json();
    const commentsContainer = document.getElementById("comment-search-results");
    commentsContainer.innerHTML = "";
    if (comments.length === 0) {
      commentsContainer.innerHTML = `<p>No comments found.</p>`;
      return;
    }
    commentsContainer.innerHTML = comments
      .map(
        (comment) => `
          <p><strong>${comment.user_id}:</strong> ${
          comment.comment
        } <em>${new Date(comment.dateCreated).toLocaleString()}</em></p>
        `
      )
      .join("");
  } catch (e) {
    console.error("Error fetching comments", e);
  }
}

async function searchArticle(query) {
  console.log(query);
  try {
    const response = await fetch(
      `http://localhost:3002/search-articles/${query}`,
      {
        method: "GET",
        headers: { "Content-type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch articles");
    }
    const articles = await response.json();
    const resultsContainer = document.getElementById("article-search-results");
    resultsContainer.innerHTML = "";
    if (articles.length === 0) {
      resultsContainer.innerHTML = "<p>No articles found.</p>";
      return;
    }

    articles.forEach((article) => {
      const articleHTML = `
        <div class="card mb-3" id="article-${article._id}">
          <div class="card-body">
            <h5 class="card-title" id="title-${article._id}">${article.title}</h5>
            <p class="card-text"> Created on: ${article.creationDate}</p>
            <p class="card-text"> Last edited: ${article.editDate}</p>
            <p class="card-text" id="content-${article._id}">${article.body}</p>
            <div id="comments-${article._id}" class="comments-section"></div>
            <form onsubmit="event.preventDefault(); submitComment('${article._id}', document.getElementById('commentInput-${article._id}').value, JSON.parse(localStorage.getItem('user')).username);">
              <textarea id="commentInput-${article._id}" placeholder="Add a comment..." required></textarea>
              <button type="submit" class="btn btn-primary">Post Comment</button>
            </form>
          </div>
        </div>
      `;
      resultsContainer.insertAdjacentHTML("beforeend", articleHTML);
    });
  } catch (e) {
    console.error("Error fetching search results:", e);
    const resultsContainer = document.getElementById("article-search-results");
    resultsContainer.innerHTML =
      "<p>Failed to load search results. Please try again later.</p>";
  }
}
