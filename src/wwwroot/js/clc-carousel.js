(function () {
	const currentScript = document.currentScript;
	const scriptOrigin = getScriptOrigin(currentScript);
	const defaultEndpoint = scriptOrigin + "/home/jsonp";
	const splideInstances = new Map();
	const resizeObservers = new Map();
	const resizeTimers = new WeakMap();
	const requestControllers = new WeakMap();
	let carouselIndex = 0;
	let windowResizeTimer = null;

	window.clcSplideCarousel = {
		init: initCarousels,
		render: renderCarousel,
		refresh: refreshCarousels,
		reload: reloadCarousels,
		destroy: destroyCarousel
	};

	function getScriptOrigin(script) {
		if (script && script.src) {
			try {
				const url = new URL(script.src, window.location.href);

				if (url.protocol === "http:" || url.protocol === "https:") {
					return url.origin;
				}
			} catch (error) {
				console.warn("Unable to determine carousel script origin.", error);
			}
		}

		return "https://localhost:7177";
	}

	function initCarousels() {
		const carousels = document.querySelectorAll(".clc-carousel[data-rsid]");

		carousels.forEach(function (carousel) {
			initializeCarouselElement(carousel);
		});
	}

	function initializeCarouselElement(carousel) {
		const title = carousel.getAttribute("data-title") || "";
		const label = carousel.getAttribute("data-label") || "Catalog records";

		if (!carousel.getAttribute("data-rsid")) {
			console.warn("Carousel is missing data-rsid.", carousel);
			return;
		}

		if (carousel.getAttribute("data-clc-carousel-initialized") === "true") {
			return;
		}

		carousel.setAttribute("data-clc-carousel-initialized", "true");

		if (!carousel.id) {
			carousel.id = "clc-carousel-" + (++carouselIndex);
		}

		buildCarouselScaffolding(carousel, title, label);
		observeCarouselSize(carousel);
		loadCarouselData(carousel);
	}

	function buildCarouselScaffolding(carousel, title, label) {
		const accessibleName = title || label || "Catalog records";
		const role = getCarouselRole(carousel);
		const headingLevel = getHeadingLevel(carousel);
		const titleId = carousel.id + "-title";
		const titleHtml = title
			? '<h' + headingLevel + ' id="' + escapeAttribute(titleId) + '" class="clc-carousel-title">' + escapeHtml(title) + '</h' + headingLevel + '>'
			: "";

		carousel.classList.add("splide");
		carousel.setAttribute("role", role);
		carousel.setAttribute("aria-roledescription", "carousel");

		if (title) {
			carousel.setAttribute("aria-labelledby", titleId);
			carousel.removeAttribute("aria-label");
		} else {
			carousel.setAttribute("aria-label", accessibleName);
			carousel.removeAttribute("aria-labelledby");
		}

		carousel.innerHTML =
			titleHtml +
			'<div class="clc-carousel-shell">' +
			'<div class="splide__arrows">' +
			'<button class="splide__arrow splide__arrow--prev" type="button" aria-label="' + escapeAttribute("Show previous " + accessibleName) + '">' +
			'<span class="glyphicon glyphicon-menu-left" aria-hidden="true"></span>' +
			'</button>' +
			'<button class="splide__arrow splide__arrow--next" type="button" aria-label="' + escapeAttribute("Show next " + accessibleName) + '">' +
			'<span class="glyphicon glyphicon-menu-right" aria-hidden="true"></span>' +
			'</button>' +
			'</div>' +
			'<div class="clc-carousel-frame">' +
			'<div class="splide__track">' +
			'<ul class="splide__list carousel-container"></ul>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'<div class="clc-carousel-message" role="status" hidden></div>';
	}

	function getCarouselRole(carousel) {
		const role = (carousel.getAttribute("data-role") || "group").toLowerCase();

		if (role === "region" || role === "group") {
			return role;
		}

		return "group";
	}

	function getHeadingLevel(carousel) {
		const level = parseInt(carousel.getAttribute("data-heading-level"), 10);

		if (Number.isFinite(level) && level >= 2 && level <= 6) {
			return level;
		}

		return 2;
	}

	function getCarouselRequestUrl(carousel) {
		const rsid = carousel.getAttribute("data-rsid");

		if (!rsid) {
			return "";
		}

		const ctx = carousel.getAttribute("data-ctx") || "17";
		const url = new URL(defaultEndpoint);

		url.searchParams.set("rsid", rsid);
		url.searchParams.set("ctx", ctx);

		return url.toString();
	}

	function loadCarouselData(carousel) {
		const requestUrl = getCarouselRequestUrl(carousel);

		if (!requestUrl) {
			showCarouselMessage(carousel, getErrorMessage(carousel));
			return;
		}

		abortCarouselRequest(carousel);
		showLoadingState(carousel);

		const controller = new AbortController();
		requestControllers.set(carousel, controller);

		fetch(requestUrl, {
			method: "GET",
			mode: "cors",
			credentials: "omit",
			headers: {
				"Accept": "application/json"
			},
			signal: controller.signal
		})
			.then(function (response) {
				if (!response.ok) {
					throw new Error("Carousel request failed with status " + response.status + ".");
				}

				return response.json();
			})
			.then(function (payload) {
				if (requestControllers.get(carousel) === controller) {
					requestControllers.delete(carousel);
				}

				renderCarousel(carousel, payload);
			})
			.catch(function (error) {
				if (error && error.name === "AbortError") {
					return;
				}

				if (requestControllers.get(carousel) === controller) {
					requestControllers.delete(carousel);
				}

				showCarouselMessage(carousel, getErrorMessage(carousel));
				console.error("Unable to load carousel JSON endpoint.", error);
			});
	}

	function renderCarousel(selectorOrElement, payload, options) {
		const carousel = getCarouselElement(selectorOrElement);

		if (!carousel) {
			console.warn("Carousel element was not found.", selectorOrElement);
			return;
		}

		const list = carousel.querySelector(".carousel-container");

		if (!list) {
			console.warn("Carousel list element was not found.", carousel);
			return;
		}

		const items = getItemsFromPayload(payload).filter(hasUsableCarouselItem);

		list.innerHTML = "";
		carousel.clcCarouselItems = items;
		carousel.clcCarouselOptions = options || {};
		carousel.classList.remove("clc-carousel-loading");

		items.forEach(function (item) {
			list.appendChild(createSlide(carousel, item));
		});

		if (!items.length) {
			showCarouselMessage(carousel, getEmptyMessage(carousel));
			console.warn("No usable carousel items were found.", payload);
			return;
		}

		clearCarouselMessage(carousel);
		mountCarousel(carousel, carousel.clcCarouselOptions);
	}

	function getCarouselElement(selectorOrElement) {
		if (typeof selectorOrElement === "string") {
			return document.querySelector(selectorOrElement);
		}

		return selectorOrElement;
	}

	function getItemsFromPayload(payload) {
		const data = parsePayload(payload);

		if (Array.isArray(data)) {
			return data;
		}

		if (data && Array.isArray(data.Items)) {
			return data.Items;
		}

		if (data && Array.isArray(data.items)) {
			return data.items;
		}

		return [];
	}

	function parsePayload(payload) {
		if (typeof payload !== "string") {
			return payload;
		}

		try {
			return JSON.parse(payload);
		} catch (error) {
			console.error("The carousel response was a string, but it was not valid JSON.", error, payload);
			return null;
		}
	}

	function hasUsableCarouselItem(item) {
		return Boolean(getItemImageUrl(item) && getItemHref(item));
	}

	function createSlide(carousel, item) {
		const title = getItemTitle(item);
		const href = getItemHref(item);
		const src = getItemImageUrl(item);
		const openInNewTab = shouldOpenInNewTab(carousel);

		const slide = document.createElement("li");
		slide.className = "splide__slide";

		const link = document.createElement("a");
		link.className = "carousel-link";
		link.href = href;

		if (openInNewTab) {
			link.target = "_blank";
			link.rel = "noopener noreferrer";
		}

		const hiddenLabel = document.createElement("span");
		hiddenLabel.className = "clc-carousel-sr-only";
		hiddenLabel.textContent = openInNewTab
			? "View catalog record for " + title + ", opens in a new tab"
			: "View catalog record for " + title;

		const image = document.createElement("img");
		image.className = "carousel-image";
		image.src = src;
		image.alt = "";
		image.setAttribute("aria-hidden", "true");
		image.loading = "lazy";

		link.appendChild(hiddenLabel);
		link.appendChild(image);
		slide.appendChild(link);

		return slide;
	}

	function getItemTitle(item) {
		return item.Title || item.title || "Catalog item";
	}

	function getItemHref(item) {
		return item.CatalogLink || item.catalogLink || item.Url || item.url || item.Link || item.link || "";
	}

	function getItemImageUrl(item) {
		return item.ImageUrl || item.imageUrl || item.Image || item.image || item.CoverImage || item.coverImage || "";
	}

	function shouldOpenInNewTab(carousel) {
		return String(carousel.getAttribute("data-open-new-tab")).toLowerCase() === "true";
	}

	function mountCarousel(carousel, options) {
		if (typeof Splide !== "function") {
			showCarouselMessage(carousel, getErrorMessage(carousel));
			console.error("Splide is not available.");
			return;
		}

		const layout = getResponsiveLayout(carousel);
		const existingInstance = splideInstances.get(carousel);
		const previousIndex = existingInstance ? existingInstance.index : 0;
		const layoutSignature = [
			layout.itemWidth,
			layout.perPage,
			layout.frameWidth,
			layout.shellWidth,
			layout.canSlide
		].join("|");

		if (!layout.canMeasure) {
			return;
		}

		if (existingInstance && carousel.clcCarouselLayoutSignature === layoutSignature) {
			existingInstance.refresh();
			return;
		}

		if (existingInstance) {
			existingInstance.destroy(true);
		}

		carousel.style.setProperty("--clc-carousel-frame-width", layout.frameWidth + "px");
		carousel.style.setProperty("--clc-carousel-shell-width", layout.shellWidth + "px");
		carousel.style.setProperty("--clc-carousel-item-width", layout.itemWidth + "px");
		carousel.classList.toggle("clc-carousel-no-arrows", !layout.canSlide);
		carousel.clcCarouselLayoutSignature = layoutSignature;

		const splide = new Splide(carousel, Object.assign({
			type: layout.canSlide ? "loop" : "slide",
			fixedWidth: layout.itemWidth + "px",
			fixedHeight: "120px",
			perPage: layout.perPage,
			perMove: layout.perPage,
			gap: 0,
			arrows: layout.canSlide,
			pagination: false,
			drag: layout.canSlide,
			speed: shouldReduceMotion() ? 0 : 400
		}, options || {}));

		splide.mount();

		if (previousIndex > 0 && carousel.clcCarouselItems && carousel.clcCarouselItems.length) {
			splide.go(Math.min(previousIndex, carousel.clcCarouselItems.length - 1));
		}

		splideInstances.set(carousel, splide);
	}

	function getResponsiveLayout(carousel) {
		const itemWidth = getPositiveIntegerAttribute(carousel, "data-item-width", 100);
		const maxItems = getPositiveIntegerAttribute(carousel, "data-max-items", 6);
		const arrowGutter = getPositiveIntegerAttribute(carousel, "data-arrow-gutter", 50);
		const availableWidth = getAvailableCarouselWidth(carousel);
		const itemCount = carousel.clcCarouselItems ? carousel.clcCarouselItems.length : maxItems;

		if (availableWidth <= 0) {
			return {
				itemWidth: itemWidth,
				perPage: 1,
				canSlide: itemCount > 1,
				canMeasure: false,
				frameWidth: itemWidth,
				shellWidth: itemWidth
			};
		}

		let usableTrackWidth = availableWidth - (arrowGutter * 2);
		let perPage = Math.floor(usableTrackWidth / itemWidth);
		let gutter = arrowGutter;

		if (perPage < 1) {
			perPage = 1;
			gutter = Math.max(0, Math.floor((availableWidth - itemWidth) / 2));
		}

		perPage = Math.min(perPage, maxItems);
		perPage = Math.min(perPage, Math.max(1, itemCount));

		const canSlide = itemCount > perPage;

		if (!canSlide) {
			gutter = 0;
		}

		return {
			itemWidth: itemWidth,
			perPage: perPage,
			canSlide: canSlide,
			canMeasure: true,
			frameWidth: perPage * itemWidth,
			shellWidth: (perPage * itemWidth) + (gutter * 2)
		};
	}

	function getAvailableCarouselWidth(carousel) {
		if (!carousel.offsetParent && getComputedStyle(carousel).position !== "fixed") {
			return 0;
		}

		const parent = carousel.parentElement;
		const carouselWidth = carousel.clientWidth;
		const parentWidth = parent ? parent.clientWidth : window.innerWidth;
		const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
		const availableWidth = Math.min(nonZero(carouselWidth, parentWidth), parentWidth, viewportWidth);

		return Math.max(0, availableWidth);
	}

	function nonZero(value, fallback) {
		return value > 0 ? value : fallback;
	}

	function getPositiveIntegerAttribute(element, attributeName, fallback) {
		const value = parseInt(element.getAttribute(attributeName), 10);

		if (Number.isFinite(value) && value > 0) {
			return value;
		}

		return fallback;
	}

	function getLoadingMessage(carousel) {
		return carousel.getAttribute("data-loading-message") || "";
	}

	function getEmptyMessage(carousel) {
		return carousel.getAttribute("data-empty-message") || "No carousel items are currently available.";
	}

	function getErrorMessage(carousel) {
		return carousel.getAttribute("data-error-message") || "Carousel items could not be loaded.";
	}

	function showLoadingState(carousel) {
		const loadingMessage = getLoadingMessage(carousel);

		carousel.classList.add("clc-carousel-loading");

		if (loadingMessage) {
			showCarouselMessage(carousel, loadingMessage);
		}
	}

	function showCarouselMessage(carousel, message) {
		const existingInstance = splideInstances.get(carousel);
		const messageElement = carousel.querySelector(".clc-carousel-message");
		const list = carousel.querySelector(".carousel-container");

		if (existingInstance) {
			existingInstance.destroy(true);
			splideInstances.delete(carousel);
		}

		if (list) {
			list.innerHTML = "";
		}

		carousel.classList.remove("clc-carousel-loading");
		carousel.classList.add("clc-carousel-has-message");
		carousel.classList.add("clc-carousel-no-arrows");

		if (messageElement) {
			messageElement.textContent = message;
			messageElement.hidden = false;
		}
	}

	function clearCarouselMessage(carousel) {
		const messageElement = carousel.querySelector(".clc-carousel-message");

		carousel.classList.remove("clc-carousel-has-message");
		carousel.classList.remove("clc-carousel-loading");

		if (messageElement) {
			messageElement.textContent = "";
			messageElement.hidden = true;
		}
	}

	function refreshCarousels(selectorOrElement) {
		if (selectorOrElement) {
			const carousel = getCarouselElement(selectorOrElement);

			if (carousel && carousel.clcCarouselItems && carousel.clcCarouselItems.length) {
				mountCarousel(carousel, carousel.clcCarouselOptions || {});
			}

			return;
		}

		document.querySelectorAll(".clc-carousel[data-clc-carousel-initialized='true']").forEach(function (carousel) {
			if (carousel.clcCarouselItems && carousel.clcCarouselItems.length) {
				mountCarousel(carousel, carousel.clcCarouselOptions || {});
			}
		});
	}

	function reloadCarousels(selectorOrElement) {
		if (selectorOrElement) {
			const carousel = getCarouselElement(selectorOrElement);

			if (carousel) {
				loadCarouselData(carousel);
			}

			return;
		}

		document.querySelectorAll(".clc-carousel[data-clc-carousel-initialized='true']").forEach(loadCarouselData);
	}

	function destroyCarousel(selectorOrElement) {
		if (!selectorOrElement) {
			document.querySelectorAll(".clc-carousel[data-clc-carousel-initialized='true']").forEach(destroyOneCarousel);
			return;
		}

		const carousel = getCarouselElement(selectorOrElement);

		if (carousel) {
			destroyOneCarousel(carousel);
		}
	}

	function destroyOneCarousel(carousel) {
		const splide = splideInstances.get(carousel);
		const observer = resizeObservers.get(carousel);
		const timer = resizeTimers.get(carousel);

		abortCarouselRequest(carousel);

		if (timer) {
			window.clearTimeout(timer);
			resizeTimers.delete(carousel);
		}

		if (splide) {
			splide.destroy(true);
			splideInstances.delete(carousel);
		}

		if (observer) {
			observer.disconnect();
			resizeObservers.delete(carousel);
		}

		carousel.classList.remove(
			"clc-carousel-loading",
			"clc-carousel-has-message",
			"clc-carousel-no-arrows"
		);

		delete carousel.clcCarouselItems;
		delete carousel.clcCarouselOptions;
		delete carousel.clcCarouselLayoutSignature;
		carousel.removeAttribute("data-clc-carousel-initialized");
	}

	function abortCarouselRequest(carousel) {
		const controller = requestControllers.get(carousel);

		if (controller) {
			controller.abort();
			requestControllers.delete(carousel);
		}
	}

	function observeCarouselSize(carousel) {
		if (!("ResizeObserver" in window)) {
			return;
		}

		if (resizeObservers.has(carousel)) {
			return;
		}

		const observer = new ResizeObserver(function () {
			queueCarouselRefresh(carousel);
		});

		observer.observe(carousel);

		if (carousel.parentElement) {
			observer.observe(carousel.parentElement);
		}

		resizeObservers.set(carousel, observer);
	}

	function queueCarouselRefresh(carousel) {
		const currentTimer = resizeTimers.get(carousel);

		if (currentTimer) {
			window.clearTimeout(currentTimer);
		}

		const nextTimer = window.setTimeout(function () {
			resizeTimers.delete(carousel);
			refreshCarousels(carousel);
		}, 150);

		resizeTimers.set(carousel, nextTimer);
	}

	function shouldReduceMotion() {
		return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	}

	function escapeHtml(value) {
		const div = document.createElement("div");
		div.textContent = value;
		return div.innerHTML;
	}

	function escapeAttribute(value) {
		return escapeHtml(value).replace(/"/g, "&quot;");
	}

	window.addEventListener("resize", function () {
		window.clearTimeout(windowResizeTimer);

		windowResizeTimer = window.setTimeout(function () {
			refreshCarousels();
		}, 150);
	});

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initCarousels);
	} else {
		initCarousels();
	}
})();
