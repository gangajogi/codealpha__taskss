// Smooth scrolling for navigation links

document.querySelectorAll("nav a").forEach(function(link) {

    link.addEventListener("click", function(event) {

        event.preventDefault();

        const target = document.querySelector(
            this.getAttribute("href")
        );

        target.scrollIntoView({
            behavior: "smooth"
        });

    });

});


// Contact form message

const form = document.querySelector("form");

form.addEventListener("submit", function(event) {

    event.preventDefault();

    alert("Thank you for contacting Janga Jogi!");

    form.reset();

});