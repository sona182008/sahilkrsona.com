/* ==========================================
   Renu Store Pro - app.js
   Part 1 : Base Setup
========================================== */

"use strict";

/* ==========================================
   DOM ELEMENTS
========================================== */

const header = document.querySelector(".header");
const navLinks = document.querySelectorAll(".nav-links a");
const topBtn = document.getElementById("topBtn");

/* ==========================================
   STICKY HEADER
========================================== */

window.addEventListener("scroll", () => {

    if (!header) return;

    if (window.scrollY > 50) {
        header.classList.add("sticky");
    } else {
        header.classList.remove("sticky");
    }

});

/* ==========================================
   ACTIVE NAVIGATION
========================================== */

const currentPage = window.location.pathname.split("/").pop();

navLinks.forEach(link => {

    const href = link.getAttribute("href");

    if (href === currentPage || (currentPage === "" && href === "index.html")) {

        link.classList.add("active");

    } else {

        link.classList.remove("active");

    }

});

/* ==========================================
   SMOOTH SCROLL
========================================== */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        const target = document.querySelector(this.getAttribute("href"));

        if (!target) return;

        e.preventDefault();

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });

});

/* ==========================================
   BACK TO TOP BUTTON
========================================== */

if (topBtn) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 300) {
            topBtn.style.display = "flex";
        } else {
            topBtn.style.display = "none";
        }

    });

    topBtn.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

}

/* ==========================================
   PAGE LOADED
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    console.log("✅ Renu Store Pro Loaded Successfully");

});
/* ==========================================
   PART 2 : MENU, DARK MODE & SEARCH
========================================== */

/* ========= DOM ELEMENTS ========= */

const menuToggle = document.querySelector(".menu-toggle");
const navbar = document.querySelector(".navbar");

const themeToggle = document.querySelector(".theme-toggle");

const searchToggle = document.querySelector(".search-toggle");
const searchBox = document.querySelector(".search-box");

const pageLoader = document.getElementById("pageLoader");

/* ========= MOBILE MENU ========= */

if(menuToggle && navbar){

    menuToggle.addEventListener("click",()=>{

        navbar.classList.toggle("show");

        menuToggle.classList.toggle("active");

    });

}

/* ========= DARK MODE ========= */

const savedTheme = localStorage.getItem("theme");

if(savedTheme==="dark"){

    document.body.classList.add("dark-mode");

}

if(themeToggle){

    themeToggle.addEventListener("click",()=>{

        document.body.classList.toggle("dark-mode");

        if(document.body.classList.contains("dark-mode")){

            localStorage.setItem("theme","dark");

        }else{

            localStorage.setItem("theme","light");

        }

    });

}

/* ========= SEARCH ========= */

if(searchToggle && searchBox){

    searchToggle.addEventListener("click",()=>{

        searchBox.classList.toggle("active");

    });

}

/* ========= PAGE LOADER ========= */

window.addEventListener("load",()=>{

    if(pageLoader){

        pageLoader.style.opacity="0";

        setTimeout(()=>{

            pageLoader.style.display="none";

        },500);

    }

});

/* ========= ESC KEY ========= */

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        if(searchBox){

            searchBox.classList.remove("active");

        }

    }

});
/* ==========================================
   PART 3 : SCROLL ANIMATION & UTILITIES
========================================== */

/* ========= SCROLL REVEAL ========= */

const revealElements = document.querySelectorAll(
".hero,.categories,.featured-products,.offer,.why-us,.testimonials,.newsletter,.footer"
);

const revealOnScroll = () => {

    revealElements.forEach(element => {

        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if(elementTop < windowHeight - 120){
            element.classList.add("fade-up");
        }

    });

};

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

/* ========= LAZY IMAGE LOADING ========= */

const images = document.querySelectorAll("img[data-src]");

if(images.length){

    const imageObserver = new IntersectionObserver((entries, observer)=>{

        entries.forEach(entry=>{

            if(entry.isIntersecting){

                const img = entry.target;

                img.src = img.dataset.src;

                img.removeAttribute("data-src");

                observer.unobserve(img);

            }

        });

    });

    images.forEach(img=>imageObserver.observe(img));

}

/* ========= TOAST NOTIFICATION ========= */

function showToast(message){

    const toast = document.createElement("div");

    toast.className = "toast";

    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(()=>{
        toast.classList.add("show");
    },100);

    setTimeout(()=>{
        toast.classList.remove("show");

        setTimeout(()=>{
            toast.remove();
        },300);

    },3000);

}

/* ========= ONLINE / OFFLINE STATUS ========= */

window.addEventListener("offline",()=>{

    showToast("⚠️ Internet Connection Lost");

});

window.addEventListener("online",()=>{

    showToast("✅ Internet Connected");

});

/* ========= IMAGE FALLBACK ========= */

document.querySelectorAll("img").forEach(img=>{

    img.addEventListener("error",()=>{

        img.src="assets/images/no-image.png";

    });

});
/* ==========================================
   PART 4 : WISHLIST & RECENTLY VIEWED
========================================== */

/* ========= LOCAL STORAGE ========= */

const Storage = {

    get(key){

        return JSON.parse(localStorage.getItem(key)) || [];

    },

    set(key,value){

        localStorage.setItem(key,JSON.stringify(value));

    }

};

/* ========= WISHLIST ========= */

function addToWishlist(product){

    let wishlist = Storage.get("wishlist");

    const exists = wishlist.find(item => item.id === product.id);

    if(!exists){

        wishlist.push(product);

        Storage.set("wishlist",wishlist);

        if(typeof showToast === "function"){
            showToast("❤️ Added to Wishlist");
        }

    }else{

        if(typeof showToast === "function"){
            showToast("ℹ️ Already in Wishlist");
        }

    }

}

/* ========= REMOVE WISHLIST ========= */

function removeFromWishlist(productId){

    let wishlist = Storage.get("wishlist");

    wishlist = wishlist.filter(item => item.id !== productId);

    Storage.set("wishlist",wishlist);

}

/* ========= RECENTLY VIEWED ========= */

function saveRecentlyViewed(product){

    let recent = Storage.get("recentProducts");

    recent = recent.filter(item => item.id !== product.id);

    recent.unshift(product);

    if(recent.length > 10){

        recent = recent.slice(0,10);

    }

    Storage.set("recentProducts",recent);

}

/* ========= GET RECENT ========= */

function getRecentlyViewed(){

    return Storage.get("recentProducts");

}

/* ========= QUICK VIEW ========= */

function quickView(product){

    console.log("Quick View:",product);

    if(typeof showToast === "function"){

        showToast("👀 Quick View Coming Soon");

    }

}
/* ==========================================
   PART 5 : FINAL INITIALIZATION
========================================== */

/* ========= DEBOUNCE ========= */

function debounce(func, delay = 300){

    let timeout;

    return function(...args){

        clearTimeout(timeout);

        timeout = setTimeout(() => {

            func.apply(this, args);

        }, delay);

    };

}

/* ========= THROTTLE ========= */

function throttle(func, limit = 200){

    let waiting = false;

    return function(...args){

        if(waiting) return;

        func.apply(this, args);

        waiting = true;

        setTimeout(() => {

            waiting = false;

        }, limit);

    };

}

/* ========= SAFE EVENT ========= */

function safeAddEvent(element, event, callback){

    if(element){

        element.addEventListener(event, callback);

    }

}

/* ========= PERFORMANCE ========= */

window.addEventListener("scroll",

    throttle(() => {

        revealOnScroll();

    }, 100)

);

/* ========= PAGE VISIBILITY ========= */

document.addEventListener("visibilitychange", () => {

    if(document.hidden){

        console.log("⏸️ Page Hidden");

    }else{

        console.log("▶️ Page Active");

    }

});

/* ========= ERROR HANDLER ========= */

window.addEventListener("error", (e) => {

    console.error("JavaScript Error:", e.message);

});

/* ========= FINAL INIT ========= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("🚀 Renu Store Pro Initialized Successfully");

});