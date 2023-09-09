
const imageDir = "";
const images = [
    "page1.jpg",
    "page2.jpg",
    "page2.jpg",
    "demo.jpg",
];
const thumbs = [
    "demo.jpg",
    "demo.jpg",
    "demo.jpg",
    "demo.jpg",
    "demo.jpg"
];

const app = new Vue({
    el: "#app",
    data: {

        zoomLevel: 0,
        showThumbnails: true,
        currentIndex: 0,
        modalImageUrl: null,
        thumbnailsPerPage: 3, // Количество выводимых миниатюр на странице
        currentPage: 0, // Текущая страница миниатюр
        currentIndexOnPage: 0, 

        images: images.map((image, index) => ({
            src: imageDir + image,
            alt: `Image ${index + 1}`
        })),

        Thumbs: thumbs.map((image, index) => ({
            src: imageDir + image,
            alt: `Image ${index + 1}`
        })),


    },

    computed: {
        // Вычисляемое свойство для определения видимых миниатюр на текущей странице
        visibleThumbnails() {
            const start = this.currentPage * this.thumbnailsPerPage;
            const end = start + this.thumbnailsPerPage;
            const visibleThumbnails = this.Thumbs.slice(start, end);
            this.currentIndexOnPage = this.currentIndex - start;
            return visibleThumbnails.map((thumbnail, index) => ({
                ...thumbnail,
                index: start + index, // Добавляем индекс слайда
                active: index === this.currentIndexOnPage, // Проверяем активность
            }));
        },
    },
    methods: {
        // Ваши методы
        
        // Функция для управления отображением миниатюр при смене слайда
        updateThumbnails() {
            const currentPageStart = this.currentPage * this.thumbnailsPerPage;
            const currentPageEnd = currentPageStart + this.thumbnailsPerPage;
            const currentIndex = this.currentIndex;
            
            // Устанавливаем видимость каждой миниатюры
            this.Thumbs.forEach((thumbnail, index) => {
                thumbnail.visible = index >= currentPageStart && index < currentPageEnd;
                thumbnail.active = index === currentIndex;
            });
        },
        openModal(index) {
            if (this.Thumbs.length > this.images.length){
                this.Thumbs.pop();
            }
            this.currentIndex = index;
            this.modalImageUrl = this.images[index].src;
            document.getElementById("myModal").style.display = "block";
        },

        closeModal() {
            document.getElementById("myModal").style.display = "none";
        },

        prevImage() {
            this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
            this.modalImageUrl = null;
            if (this.currentIndex + 1 <= this.thumbnailsPerPage * (this.currentPage + 1) ){
                this.prevThumbnails();
            }
            setTimeout(() => {
                this.modalImageUrl = this.images[this.currentIndex].src;
            }, 10);
        },

        nextImage() {
            this.currentIndex = (this.currentIndex + 1) % this.images.length;
            this.modalImageUrl = null;
            
            if (this.currentIndex + 1 > this.thumbnailsPerPage * (this.currentPage + 1)){
                this.nextThumbnails();
            }
            setTimeout(() => {
            
                this.modalImageUrl = this.images[this.currentIndex].src;
            }, 10);
        },
       // Методы для переключения страниц миниатюр
       prevThumbnails() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.updateThumbnails(); // Обновление видимости и активности миниатюр
        }
    },
    nextThumbnails() {
        const totalPages = Math.ceil(this.Thumbs.length / this.thumbnailsPerPage);
        if (this.currentPage < totalPages - 1) {
            this.currentPage++;
            this.updateThumbnails(); // Обновление видимости и активности миниатюр
        }
    },
        toggleThumbnails() {
            this.showThumbnails = !this.showThumbnails;
        },
        toggleZoom() {
            const modalImage = document.getElementById("modalImage");
            if (this.zoomLevel === 0) {
                this.zoomLevel = 1;
                modalImage.classList.add("zoomed-1");
            } else if (this.zoomLevel === 1) {
                this.zoomLevel = 2;
                modalImage.classList.remove("zoomed-1");
                modalImage.classList.add("zoomed-2");
            } else {
                this.zoomLevel = 0;
                modalImage.classList.remove("zoomed-2");
            }
        }, lazyLoadImage() {
            const image = document.querySelector("[loading='lazy']");
            if (image && !image.src) {
                image.src = image.getAttribute("data-src");
            }
        },
    },
    created() {
        // Добавление обработчика события смены слайда
        this.$on("after-enter", this.lazyLoadImage);
    },
    destroyed() {
        // Удаление обработчика события смены слайда при уничтожении компонента
        this.$off("after-enter", this.lazyLoadImage);
    },        // Добавьте вызовы методов в соответствующие события
    openModal(index) {
        this.openModal(index);
        this.currentPage = Math.floor(index / this.thumbnailsPerPage); // Переключение страницы миниатюр при открытии модального окна
    },
});

document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
        app.prevImage();
    } else if (event.key === "ArrowRight") {
        app.nextImage();
    } else if (event.key === "Escape") {
        app.closeModal();
    }
});
