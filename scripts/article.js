const STRAPI_URL = "https://landingspagina-felicks.onrender.com";
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

const titleEl = document.getElementById("articleTitle");
const imageEl = document.getElementById("articleImage");
const descEl = document.getElementById("articleDescription");
const catButtons = document.getElementById("categoryButtons");
const summaryEl = document.getElementById("articleSummary");

const CATEGORIES = ["Voeding", "Veiligheid", "Training", "Verzorging", "Activiteit"];

function renderCategories(activeCategory) {
  catButtons.innerHTML = "";
  CATEGORIES.forEach(category => {
    const btn = document.createElement("button");
    btn.textContent = category;
    btn.className = "category-button";
    if (category === activeCategory) btn.classList.add("active");
    btn.addEventListener("click", () => {
      window.location.href = `/tips.html?category=${category}`;
    });
    catButtons.appendChild(btn);
  });
}

async function loadArticle() {
  if (!slug) {
    titleEl.textContent = "Geen artikel gevonden (slug ontbreekt)";
    return;
  }



  try {
    const res = await fetch(`${STRAPI_URL}/api/articles?filters[slug][$eq]=${slug}&populate=*`);
    const data = await res.json();
    console.log("🔎 ARTIKELDATA:", data);

    if (!data.data || data.data.length === 0) {
      titleEl.textContent = "Geen artikel gevonden";
      return;
    }

    const articleData = data.data[0];
    const article = articleData.attributes || articleData; 

    const activeSlug = article.category.slug;
    //console.log("actieve slug:", activeSlug);


    document
      .querySelectorAll('#categoryButtons .category-button')
      .forEach(btn => {
        btn.classList.toggle(
          'active',
          btn.dataset.category === activeSlug
        );
      }); // zorgt voor aanduiding actieve categorie


    titleEl.textContent = article.title || "Geen titel";
    summaryEl.textContent = article.summary || "Geen samenvatting";



    console.log("🧪 Afbeeldingsdata = ", article.image);

    // Afbeelding
    let imageUrl = "/images/fallback.jpg";
    let imageAlt = article.title || "Artikel";

    if (Array.isArray(article.image) && article.image.length > 0 && article.image[0]?.url) {
      imageUrl = `${STRAPI_URL}${article.image[0].url}`;
      imageAlt = article.image[0].alternativeText || imageAlt;
    }

    imageEl.src = imageUrl;
    imageEl.alt = imageAlt;





    if (Array.isArray(article.description)) {
      descEl.innerHTML = article.description.map(block => {
        if (block.type === "paragraph") {
          return `<p>${block.children.map(child => child.text).join("")}</p>`;
        }
        if (block.type === "list") {
          const items = block.children.map(item =>
            `<li>${item.children.map(c => c.text).join("")}</li>`).join("");
          return `<ul>${items}</ul>`;
        }
        return "";
      }).join("");
    } else {
      descEl.innerHTML = article.description || "<p>Geen beschrijving beschikbaar.</p>";
    }

    const category = article.category?.data?.attributes?.name;
    if (category) renderCategories(category);


    document
      .querySelectorAll('#categoryButtons .category-button')
      .forEach(btn => {
        btn.addEventListener('click', () => {
        
          const catSlug = btn.getAttribute('data-category');
         
          window.location.href = `/tips.html?category=${encodeURIComponent(catSlug)}`;
        });
      }); // zorgt voor klikbaarheid andere categorieen




  } catch (error) {
    console.error("Fout bij laden artikel:", error);
    titleEl.textContent = "Er ging iets mis bij het ophalen van het artikel.";
  }


}

document.addEventListener("DOMContentLoaded", loadArticle);
