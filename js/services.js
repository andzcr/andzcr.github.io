function initServicesAnimations() {
    let mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
        
        const tlServices = gsap.timeline({
            scrollTrigger: {
                trigger: ".services-section",
                start: "top top",
                end: "+=2500",
                pin: true,
                scrub: 1,
                anticipatePin: 1
            }
        });

        tlServices.to(".service-item[data-index='0']", { opacity: 0, duration: 1 })
                  .to("#img-1", { y: "-120%", filter: "brightness(0.6)", duration: 1 }, "<")
                  .to("#img-2", { y: "0%", filter: "brightness(1)", duration: 1 }, "<")
                  .to(".service-item[data-index='1']", { opacity: 1, pointerEvents: "auto", duration: 1 }, "<");

        tlServices.to(".service-item[data-index='1']", { opacity: 0, pointerEvents: "none", duration: 1 })
                  .to("#img-2", { y: "-120%", filter: "brightness(0.6)", duration: 1 }, "<")
                  .to("#img-3", { y: "0%", filter: "brightness(1)", duration: 1 }, "<")
                  .to(".service-item[data-index='2']", { opacity: 1, pointerEvents: "auto", duration: 1 }, "<");

        return () => {
            if (tlServices.scrollTrigger) {
                tlServices.scrollTrigger.kill();
            }
        };
    });
}

document.addEventListener('DOMContentLoaded', initServicesAnimations);