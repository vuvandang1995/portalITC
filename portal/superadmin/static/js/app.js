jQuery(document).ready(function($){
            $('#news-slider').owlCarousel({
                slideSpeed : 2000,
                nav: false,
                autoplay: false,
                dots: true,
                loop: false,
                mouseDrag: true,
                navText: ['<i class="fa fa-angle-left"></i>','<i class="fa fa-angle-right"></i>'],
                responsiveClass:true,
                responsive: {
                    0 : {
                        items : 1
                    },
                    480 : {
                        items : 1
                    },
                    768 : {
                        items : 2
                    }
                }
            });
})