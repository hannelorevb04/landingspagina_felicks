
const STRAPI_URL = 'http://localhost:1337'; 


const categoryButtons = document.getElementById('categoryButtons');
const articlesList = document.getElementById('articlesList');
const articleTemplate = document.getElementById('articleTemplate');


let activeCategory = null;
let categories = [];
let articles = [];

document.addEventListener('DOMContentLoaded', () => {
  fetchArticles(); 

  const buttons = document.querySelectorAll('.category-button');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      if (activeCategory === category) {
        activeCategory = null;
        fetchArticles(); // alles tonen
      } else {
        activeCategory = category;
        fetchArticles(category);
      }
      buttons.forEach(btn => btn.classList.remove('active'));
      if (activeCategory) {
        button.classList.add('active');
      }
    });
  });
});

async function fetchArticles(categorySlug = null) {
  try {
    articlesList.innerHTML = '<p class="loading">Artikels laden...</p>';

    let url = `${STRAPI_URL}/api/articles?populate=*`;
    if (categorySlug) {
      url += `&filters[category][slug][$eq]=${categorySlug}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    articles = data.data;
    renderArticles();
  } catch (err) {
    console.error('Artikels ophalen mislukt:', err);
    articlesList.innerHTML = '<p class="error">Kan artikels niet laden.</p>';
  }
}



async function fetchArticles(categorySlug = null) {
  try {
    articlesList.innerHTML = '<p class="loading">Artikels laden...</p>';

    let url = `${STRAPI_URL}/api/articles?populate=*`;
    if (categorySlug) {
      url += `&filters[category][slug][$eq]=${categorySlug}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    articles = data.data;
    renderArticles();
  } catch (err) {
    console.error('Artikels ophalen mislukt:', err);
    articlesList.innerHTML = '<p class="error">Artikels laden...</p>';
  }
}

function renderCategories() {
  categoryButtons.innerHTML = '';

  categories.forEach(category => {
    const slug = category.attributes?.slug;
    const name = category.attributes?.name;
    if (!slug || !name) return;

    const btn = document.createElement('button');
    btn.className = 'category-button';
    btn.textContent = name;

    btn.addEventListener('click', () => {
      activeCategory = slug;
      fetchArticles(slug);
      renderCategories(); 
    });

    if (activeCategory === slug) {
      btn.classList.add('active');
    }

    categoryButtons.appendChild(btn);
  });
}





function renderArticles() {
  articlesList.innerHTML = '';


  if (articles.length === 0) {
    articlesList.innerHTML = '<p class="error">Geen artikels gevonden.</p>';
    return;
  }

  articles.forEach(article => {

    console.log('DEBUG artikel =', article);
    const clone = articleTemplate.content.cloneNode(true);
    const title = article.title || 'Geen titel';
    const summary = article.summary || 'Geen samenvatting';
    const slug = article.slug || '#';
    const category = article.category?.name || 'Onbekend';
    const img = clone.querySelector('img');

    
    let imageUrl = '/images/fallback.jpg';
    let imageAlt = 'Standaardafbeelding';

    if (Array.isArray(article.image) && article.image.length > 0) {
      const imageData = article.image[0];
      if (imageData?.url) {
        imageUrl = `${STRAPI_URL}${imageData.url}`;
        imageAlt = article.title || 'Artikel';
      }
    }

    img.src = imageUrl;
    img.alt = imageAlt;


    clone.querySelector('h3').textContent = title;
    clone.querySelector('.summary').textContent = summary;

    clone.querySelectorAll('.tag').forEach(tag => {
      tag.textContent = category;
    });
    
    clone.querySelector('.read-more').href = `/article.html?slug=${slug}`;


    articlesList.appendChild(clone);
  });
}






document.addEventListener('DOMContentLoaded', () => {
  fetchCategories();
  fetchArticles();
});

