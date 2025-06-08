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



// In je loadArticle(), bij description-parsing:

if (Array.isArray(article.description)) {
  let html   = "";
  let inList = false;

  article.description.forEach(block => {
    // 1) Paragraaf
    if (block.type === "paragraph") {
      if (inList) {
        html   += "</ul>";
        inList = false;
      }
      // Bouw de inline children, respect bold / italic
      const inline = (block.children || []).map(c => {
        let text = c.text || "";
        if (c.bold)   text = `<strong>${text}</strong>`;
        if (c.italic) text = `<em>${text}</em>`;
        return text;
      }).join("");
      html += `<p>${inline}</p>`;
    }

    // 2) Unordered List (Strapi 'list' block)
    else if (block.type === "list") {
      if (!inList) {
        html   += "<ul>";
        inList = true;
      }
      block.children.forEach(item => {
        // elk item is een list-item
        const itemHtml = (item.children || []).map(c => {
          let t = c.text || "";
          if (c.bold)   t = `<strong>${t}</strong>`;
          if (c.italic) t = `<em>${t}</em>`;
          return t;
        }).join("");
        html += `<li>${itemHtml}</li>`;
      });
    }

    // 3) Optioneel: losse list-item blokken
    else if (block.type === "list-item") {
      if (!inList) {
        html   += "<ul>";
        inList = true;
      }
      const itemHtml = (block.children || []).map(c => {
        let t = c.text || "";
        if (c.bold)   t = `<strong>${t}</strong>`;
        if (c.italic) t = `<em>${t}</em>`;
        return t;
      }).join("");
      html += `<li>${itemHtml}</li>`;
    }
  });

  if (inList) html += "</ul>";
  descEl.innerHTML = html;
}
else {
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
