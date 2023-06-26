//segmented control
const titleBtn = document.getElementById('titleBtn');
const genreBtn = document.getElementById('genreBtn');
const titleField = document.querySelector('.title');
const genreField = document.querySelector('.genre');
const downArrow = document.getElementById('down-arrow');
const buttonLoader = document.getElementById('fetchButton');
const buttonLoader2 = document.getElementById('fetchButton2');

titleBtn.addEventListener('click', function() {
  titleBtn.classList.add('active');
  genreBtn.classList.remove('active');
  titleField.style.display = 'block';
  genreField.style.display = 'none';
  titleField.classList.add('show');
  genreField.classList.remove('show');

  if (!titleBtn.classList.contains("active")) {
    titleBtn.classList.add("active");
    titleBtn.classList.remove("active");
  }
});

genreBtn.addEventListener('click', function() {
  genreBtn.classList.add('active');
  titleBtn.classList.remove('active');
  titleField.style.display = 'none';
  genreField.style.display = 'block';
  genreField.classList.add('show');
  titleField.classList.remove('show');

  if (!genreBtn.classList.contains("active")) {
    genreBtn.classList.add("active");
    genreBtn.classList.remove("active");
  }
});
//end of segmented control

let startIndex = 0;
const maxResults = 4;
let currentQuery = '';
let displayedBooks = [];

// Hide the 'Show More' button initially
const showMoreButton = document.getElementById('showMoreButton');
showMoreButton.style.display = 'none';

// document.getElementById('titleForm').addEventListener('submit', function(e) {
//   e.preventDefault();
//   const title = document.getElementById('titleInput').value.trim(); // Trim whitespace
//   if (title !== '') {
//     currentQuery = title;
//     startIndex = 0;
//     getRecommendationsByTitle(title);
//   }
// });
//
// document.getElementById('genreForm').addEventListener('submit', function(e) {
//   e.preventDefault();
//   const genre = document.getElementById('genreInput').value.trim(); // Trim whitespace
//   const author = document.getElementById('authorInput').value.trim(); // Trim whitespace
//   if (genre !== '' || author !== '') {
//     currentQuery = genre + ' / ' + author;
//     startIndex = 0;
//     getRecommendationsByGenreAndAuthor(genre, author);
//   }
// });

document.getElementById('titleForm').addEventListener('submit', function(e) {
  e.preventDefault();
  clearErrorMessage();

  const title = document.getElementById('titleInput').value.trim();
  const language = document.getElementById("titleLanguage").value;

  if (!title) {
    displayError("Title Field Cannot Be Empty");
    return; // Return early if input is empty
  }

  currentQuery = `Title: ${title}`;
  startIndex = 0;
  clearRecommendations(); // Clear existing recommendations
  getRecommendationsByTitle(title, language); // Include the language parameter
});



document.getElementById('genreForm').addEventListener('submit', function(e) {
  e.preventDefault();

  clearErrorMessage();

  const genre = document.getElementById('genreInput').value.trim(); // Trim whitespace
  const author = document.getElementById('authorInput').value.trim(); // Trim whitespace
  const language = document.getElementById("genreLanguage").value;

  if (!genre) {
    displayError("Genre Field Cannot Be Empty");
    return; // Return early if input is empty
  }

    currentQuery = genre + ' / ' + author;
    startIndex = 0;
    getRecommendationsByGenreAndAuthor(genre, author, language);
});


document.getElementById('showMoreButton').addEventListener('click', async function(e) {
  showMoreButton.innerHTML = '<span class="button-loader"></span>';
  e.preventDefault();

  if (currentQuery.includes('Title:')) {
    await getRecommendationsByTitle(currentQuery.substring(7));
  } else {
    const genreAuthor = currentQuery.split(' / ');
    await getRecommendationsByGenreAndAuthor(genreAuthor[0], genreAuthor[1]);
  }

  showMoreButton.innerHTML = 'More Books';

  document.getElementById('showMoreButton').scrollIntoView({
    behavior: 'smooth'
  });
});


async function getRecommendationsByTitle(title, language) {
  buttonLoader.innerHTML = '<span class="button-loader"></span>';

  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${title}&startIndex=${startIndex}&maxResults=${maxResults}&langRestrict=${language}`);
    const data = await response.json();
    if (startIndex === 0) {
      clearRecommendations();
    }
    if (data.items && data.items.length > 0) {
      displayRecommendations(data.items, 'Title: ' + title);
      startIndex += maxResults;
      toggleShowMoreButton(data.totalItems);
    } else if (startIndex === 0) {
      displayError('No book recommendations found.');
    } else if (!showMoreButton.classList.contains('no-matches-error')) {
      displayError('No more matches found.');
      showMoreButton.classList.add('no-matches-error');
    }

    buttonLoader.innerHTML = 'Search by Title';
  } catch (error) {
    displayError('An error occurred while fetching your books.');
  }
}

async function getRecommendationsByGenreAndAuthor(genre, author, language) {
  buttonLoader2.innerHTML = '<span class="button-loader"></span>';
  try {
    let query = `subject:${genre}`;
    if (author) {
      query += `+inauthor:${author}`;
    }
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&startIndex=${startIndex}&maxResults=${maxResults}&langRestrict=${language}`);
    const data = await response.json();
    if (startIndex === 0) {
      clearRecommendations();
    }
    if (data.items && data.items.length > 0) {
      displayRecommendations(data.items, 'Genre: ' + genre + ' / ' + author);
      startIndex += maxResults;
      toggleShowMoreButton(data.totalItems);
    } else if (startIndex === 0) {
      displayError('No book recommendations found.');
    } else if (!showMoreButton.classList.contains('no-matches-error')) {
      displayError('No more matches found.');
      showMoreButton.classList.add('no-matches-error');
    }
    buttonLoader2.innerHTML = 'Search by Genre';
  } catch (error) {
    displayError('An error occurred while fetching book recommendations.');
  }
}

function hideShowMoreButton() {
  const showMoreButton = document.getElementById('showMoreButton');
  showMoreButton.style.display = 'none';
}

function toggleShowMoreButton(totalItems) {
  const showMoreButton = document.getElementById('showMoreButton');
  if (startIndex < totalItems) {
    showMoreButton.style.display = 'block';
  } else {
    hideShowMoreButton();
  }
}

function clearRecommendations() {
  const recommendationContainer = document.getElementById('recommendations');
  recommendationContainer.innerHTML = '';
}

function displayRecommendations(items, label) {
  clearErrorMessage();
  const recommendationContainer = document.getElementById('recommendations');

  // Remove existing pop-up elements
  const existingPopUps = recommendationContainer.querySelectorAll('.box-modal');
  existingPopUps.forEach(popUp => popUp.remove());

  if (items && items.length > 0) {
    items.forEach((item, index) => {

      const bookIdentifier = getBookIdentifier(item);
      if (displayedBooks.includes(bookIdentifier)) {
        return; // Skip displaying this book
      }

      const book = document.createElement('div');
      book.classList.add('book');
      book.id = `book-${index}`;

      const popUp = document.createElement('div');
      popUp.classList.add('box-modal');
      popUp.id = `popUp-${index}`;

      const title = item.volumeInfo.title;
      const authors = item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown Author';
      const description = item.volumeInfo.description ? item.volumeInfo.description : 'No description available';
      const thumbnail = item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : 'book-alt.png';
      const genre = item.volumeInfo.categories ? item.volumeInfo.categories.join(', ') : 'Unknown Genre';
      const isbn = item.volumeInfo.industryIdentifiers ? item.volumeInfo.industryIdentifiers.find(identifier => identifier.type === 'ISBN_13')?.identifier : 'Unknown ISBN';
      const buylink = items[0].saleInfo.buyLink ? items[0].saleInfo.buyLink : items[0].volumeInfo.infoLink;
      const bookContent = `
  <h3 class="book-title text-ani">${title}</h3>
  <p><span class="sub-title">Genre:</span> ${genre}</p>
  <p><span class="sub-title">Authors:</span> ${authors}</p>
  <a href= ${buylink} style="color: white" target="_blank"><span class="sub-title">Buy Link  </span><i class="fa-solid fa-link" style="color: #2e7bff;"></i></a>
  <p class="book-description"><span class="sub-title">Description:</span> ${description}</p>
  <button class="edit read-more" data-target="${popUp.id}">Read more</button>
`;

      book.innerHTML = bookContent;

      book.style.backgroundImage = `url('${thumbnail}')`;

      const overlay = document.createElement('div');
      overlay.classList.add('background-overlay');
      book.appendChild(overlay);

      const popUpContent = `
        <div class="overlay"></div>
        <div class="body-modal">
          <div class="inner-body-modal">
          <button class="close-button" data-target="${popUp.id}">&times;</button>
          <div class="row popUp-book">
            <div class="book-image">
              <img class="popUp-img" src="${thumbnail}">
            </div>
            <div class="book-info">
              <h3 class="popUp-title">${title}</h3>
              <p><span class="sub-title">Genre:</span> ${genre}</p>
              <p><span class="sub-title">Authors:</span> ${authors}</p>
              <p class="popUp-description"><span class="sub-title">Description:</span> ${description}</p>
            </div>
          </div>
          </div>
        </div>
      `;
      popUp.innerHTML = popUpContent;

      recommendationContainer.appendChild(book);
      recommendationContainer.appendChild(popUp);
      displayedBooks.push(bookIdentifier);
    });

    function getBookIdentifier(item) {
      return item.id;
    }

    recommendationContainer.addEventListener('click', function(event) {
      if (event.target.classList.contains('edit')) {
        const targetId = event.target.getAttribute('data-target');
        const targetPopUp = document.getElementById(targetId);
        if (targetPopUp) {
          document.body.classList.add('active-modal');
          targetPopUp.classList.add('modal-show');
        }
      } else if (event.target.classList.contains('overlay')) {
        document.body.classList.remove('active-modal');
        const popUps = document.getElementsByClassName('box-modal');
        for (let i = 0; i < popUps.length; i++) {
          popUps[i].classList.remove('modal-show');
        }
      } else if (event.target.classList.contains('close-button')) {
        const targetId = event.target.getAttribute('data-target');
        const targetPopUp = document.getElementById(targetId);
        if (targetPopUp) {
          document.body.classList.remove('active-modal');
          targetPopUp.classList.remove('modal-show');
        }
      }
    });


    document.getElementById("recommendations").scrollIntoView({
      behavior: 'smooth'
    });
  } else {
    displayError('No book recommendations found.');
  }
}

function clearErrorMessage() {
  const errorContainer = document.getElementById('errorSection');
  const errorMessage = errorContainer.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.remove();
  }
}

function displayError(message) {
  const errorContainer = document.getElementById('errorSection');
  const errorMessage = document.createElement('p');
  errorMessage.classList.add('error-message');
  errorMessage.textContent = message;
  errorContainer.appendChild(errorMessage);
  hideShowMoreButton(); // Hide the "Show More" button
  alert("If you keep facing errors, try refreshing the page");
}

//read more button
const readMoreBtn = document.querySelector('.readMore-btn');

readMoreBtn.addEventListener('click', function() {
  this.classList.toggle('collapse');
});


