/* ==========================================
   Renu Store Pro - search.js
   Part 1 : Search Base
========================================== */

"use strict";

/* ==========================================
   DOM ELEMENTS
========================================== */

const searchInput = document.querySelector("#searchInput");
const productCards = document.querySelectorAll(".product-card");
const noResults = document.querySelector("#noResults");

/* ==========================================
   SEARCH PRODUCTS
========================================== */

function searchProducts(keyword){

    const search = keyword.toLowerCase().trim();

    let visibleProducts = 0;

    productCards.forEach(card => {

        const productName = card.dataset.name
            ? card.dataset.name.toLowerCase()
            : "";

        const productCategory = card.dataset.category
            ? card.dataset.category.toLowerCase()
            : "";

        if(
            productName.includes(search) ||
            productCategory.includes(search)
        ){

            card.style.display = "";

            visibleProducts++;

        }else{

            card.style.display = "none";

        }

    });

    if(noResults){

        noResults.style.display =
            visibleProducts === 0 ? "block" : "none";

    }

}

/* ==========================================
   SEARCH EVENT
========================================== */

if(searchInput){

    searchInput.addEventListener("input", (e)=>{

        searchProducts(e.target.value);

    });

}
/* ==========================================
   PART 2 : FILTER SYSTEM
========================================== */

/* ==========================================
   DOM ELEMENTS
========================================== */

const categoryFilter = document.querySelector("#categoryFilter");
const priceFilter = document.querySelector("#priceFilter");


/* ==========================================
   FILTER PRODUCTS
========================================== */

function filterProducts(){

    const selectedCategory = categoryFilter
        ? categoryFilter.value.toLowerCase()
        : "all";

    const selectedPrice = priceFilter
        ? priceFilter.value
        : "all";


    productCards.forEach(card=>{

        const category = card.dataset.category
            ? card.dataset.category.toLowerCase()
            : "";

        const price = Number(
            card.dataset.price || 0
        );


        let categoryMatch =
            selectedCategory === "all" ||
            category === selectedCategory;


        let priceMatch = true;


        if(selectedPrice === "low"){

            priceMatch = price <= 100;

        }
        else if(selectedPrice === "medium"){

            priceMatch = price > 100 && price <= 500;

        }
        else if(selectedPrice === "high"){

            priceMatch = price > 500;

        }


        if(categoryMatch && priceMatch){

            card.style.display = "";

        }else{

            card.style.display = "none";

        }


    });

}


/* ==========================================
   FILTER EVENTS
========================================== */

if(categoryFilter){

    categoryFilter.addEventListener(
        "change",
        filterProducts
    );

}


if(priceFilter){

    priceFilter.addEventListener(
        "change",
        filterProducts
    );

}
/* ==========================================
   PART 3 : LIVE SEARCH SUGGESTIONS
========================================== */


/* ==========================================
   DOM ELEMENTS
========================================== */

const suggestionBox = document.querySelector(".suggestion-box");


/* ==========================================
   PRODUCT DATA
========================================== */

function getProductSuggestions(keyword){

    const search = keyword.toLowerCase().trim();

    let suggestions = [];


    productCards.forEach(card=>{

        const name = card.dataset.name || "";

        if(
            name.toLowerCase()
            .includes(search)
        ){

            suggestions.push(name);

        }

    });


    return suggestions;

}


/* ==========================================
   SHOW SUGGESTIONS
========================================== */

function showSuggestions(keyword){

    if(!suggestionBox) return;


    const suggestions =
        getProductSuggestions(keyword);


    suggestionBox.innerHTML = "";


    if(keyword === "" || suggestions.length === 0){

        suggestionBox.style.display = "none";

        return;

    }


    suggestions.slice(0,5).forEach(item=>{


        const div = document.createElement("div");

        div.className = "suggestion-item";

        div.textContent = item;


        div.addEventListener("click",()=>{

            searchInput.value = item;

            searchProducts(item);

            suggestionBox.style.display="none";

            saveSearchHistory(item);

        });


        suggestionBox.appendChild(div);


    });


    suggestionBox.style.display="block";

}


/* ==========================================
   SEARCH HISTORY
========================================== */

const SEARCH_HISTORY_KEY = 
"renuSearchHistory";


function saveSearchHistory(value){

    let history =
        JSON.parse(
            localStorage.getItem(
                SEARCH_HISTORY_KEY
            )
        ) || [];


    history =
        history.filter(
            item=>item!==value
        );


    history.unshift(value);


    if(history.length > 5){

        history = history.slice(0,5);

    }


    localStorage.setItem(
        SEARCH_HISTORY_KEY,
        JSON.stringify(history)
    );

}


/* ==========================================
   SEARCH INPUT EVENT
========================================== */

if(searchInput){

    searchInput.addEventListener(
        "input",
        (e)=>{

            showSuggestions(
                e.target.value
            );

        }
    );


    searchInput.addEventListener(
        "keydown",
        ()=>{

            saveSearchHistory(
                searchInput.value
            );

        }
    );

}


/* ==========================================
   CLOSE SUGGESTIONS
========================================== */

document.addEventListener(
"click",
(e)=>{

    if(
        suggestionBox &&
        !e.target.closest(".search-area")
    ){

        suggestionBox.style.display="none";

    }

});
/* ==========================================
   PART 4 : PRODUCT SORTING
========================================== */


/* ==========================================
   DOM ELEMENTS
========================================== */

const sortSelect = document.querySelector("#sortProducts");

const productContainer =
document.querySelector(".product-grid");


/* ==========================================
   SORT PRODUCTS
========================================== */

function sortProducts(){

    if(!sortSelect || !productContainer) return;


    const cards = Array.from(
        productCards
    );


    const sortValue =
    sortSelect.value;


    cards.sort((a,b)=>{


        const priceA =
        Number(a.dataset.price || 0);

        const priceB =
        Number(b.dataset.price || 0);


        const nameA =
        (a.dataset.name || "")
        .toLowerCase();

        const nameB =
        (b.dataset.name || "")
        .toLowerCase();



        switch(sortValue){


            case "price-low":

                return priceA - priceB;


            case "price-high":

                return priceB - priceA;


            case "name-a-z":

                return nameA.localeCompare(nameB);


            case "name-z-a":

                return nameB.localeCompare(nameA);


            default:

                return 0;

        }


    });


    productContainer.innerHTML="";


    cards.forEach(card=>{

        productContainer.appendChild(card);

    });

}


/* ==========================================
   SORT EVENT
========================================== */

if(sortSelect){

    sortSelect.addEventListener(
        "change",
        sortProducts
    );

}
/* ==========================================
   PART 5 : FINAL SEARCH UTILITIES
========================================== */


/* ==========================================
   CLEAR SEARCH
========================================== */

function clearSearch(){

    if(searchInput){

        searchInput.value = "";

    }

    searchProducts("");

    if(suggestionBox){

        suggestionBox.style.display = "none";

    }

}


/* ==========================================
   RESET FILTERS
========================================== */

function resetFilters(){

    if(categoryFilter){

        categoryFilter.value = "all";

    }


    if(priceFilter){

        priceFilter.value = "all";

    }


    if(sortSelect){

        sortSelect.value = "default";

    }


    productCards.forEach(card=>{

        card.style.display = "";

    });

}


/* ==========================================
   GET SEARCH HISTORY
========================================== */

function getSearchHistory(){

    return JSON.parse(
        localStorage.getItem(
            SEARCH_HISTORY_KEY
        )
    ) || [];

}


/* ==========================================
   DISPLAY SEARCH HISTORY
========================================== */

function showSearchHistory(){

    const historyBox =
    document.querySelector(".search-history");


    if(!historyBox) return;


    const history =
    getSearchHistory();


    historyBox.innerHTML="";


    history.forEach(item=>{


        const div =
        document.createElement("div");


        div.className =
        "history-item";


        div.textContent = item;


        div.onclick = ()=>{

            if(searchInput){

                searchInput.value=item;

                searchProducts(item);

            }

        };


        historyBox.appendChild(div);


    });

}


/* ==========================================
   CLEAR HISTORY
========================================== */

function clearSearchHistory(){

    localStorage.removeItem(
        SEARCH_HISTORY_KEY
    );


    showSearchHistory();


}


/* ==========================================
   INITIALIZE SEARCH
========================================== */

document.addEventListener(
"DOMContentLoaded",
()=>{

    showSearchHistory();

    console.log(
        "🔍 Search System Ready"
    );

});