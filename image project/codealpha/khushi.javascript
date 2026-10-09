document.addEventListener("DOMContentLoaded", function () {

    const galleryItems = document.querySelectorAll(".gallery-item");
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const caption = document.getElementById("caption");

    const closeBtn = document.getElementById("closeBtn");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    let currentIndex = 0;

    function openLightbox(index) {

        currentIndex = index;

        const item = galleryItems[currentIndex];
        const image = item.querySelector("img");
        const title = item.querySelector("h3");

        lightboxImage.src = image.src;

        if (title) {
            caption.textContent = title.textContent;
        }

        lightbox.classList.add("show");
    }

    galleryItems.forEach(function (item, index) {

        item.addEventListener("click", function () {
            openLightbox(index);
        });

    });

    closeBtn.addEventListener("click", function () {
        lightbox.classList.remove("show");
    });

    nextBtn.addEventListener("click", function () {

        currentIndex++;

        if (currentIndex >= galleryItems.length) {
            currentIndex = 0;
        }

        openLightbox(currentIndex);
    });

    prevBtn.addEventListener("click", function () {

        currentIndex--;

        if (currentIndex < 0) {
            currentIndex = galleryItems.length - 1;
        }

        openLightbox(currentIndex);
    });

});