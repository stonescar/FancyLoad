/**
 *  oooooooooooo                                             ooooo                                   .o
 *	`888'     `8                                             `888'                                 "888
 *	 888          .oooo.   ooo. .oo.    .ooooo.  oooo    ooo  888          .ooooo.   .oooo.    .oooo888
 *	 888oooo8    `P  )88b  `888P"Y88b  d88' `"Y8  `88.  .8'   888         d88' `88b `P  )88b  d88' `888
 *	 888    "     .oP"888   888   888  888         `88..8'    888         888   888  .oP"888  888   888
 *	 888         d8(  888   888   888  888   .o8    `888'     888       o 888   888 d8(  888  888   888
 *	o888o        `Y888""8o o888o o888o `Y8bod8P'     .8'     o888ooooood8 `Y8bod8P' `Y888""8o `Y8bod88P"
 *	                                             .o..P'
 *	                                             `Y8P'
 *
 *
 * A library that adds animations to HTML elements when scrolled into view
 *
 *
 * @author Steinar Utstrand
 */


class FancyLoad {
	constructor(elements, options = {style: {top: "100px", opacity: 0}}) {
		window.fl = this;

		this.elements = elements;

		this.options = Object.assign({
			style: {},
			duration: .3,
			timingFunction: "ease",
			delay: 100,
			windowMinWidth: 1024,
			windowMaxWidth: 99999,
		}, options);

		if (window.innerWidth < this.windowMinWidth || window.innerWidth > this.windowMaxWidth) return;

		this.initialStyles = Array.from(elements).map(element => {
			let styles = {};
			Object.keys(this.options.style).forEach(key => {
				if (["scale", "rotate"].includes(key)) {
					styles.transform = element.style.transform || this.getPropertyDefault("transform");
				} else {
					styles[key] = element.style[key] || this.getPropertyDefault(key);
				}
			});
			styles.position = element.style.position;
			styles.transition = element.style.transition;

			return styles;
		});

		this.initialPosition = {
			top: this.elements[0].offsetTop,
			bottom: this.elements[0].offsetTop + this.elements[0].offsetHeight,
		};

		this.setInitialState();
	}

	getPropertyDefault(property) {
		switch (property) {
			case "opacity":
				return 1;
				break;
			case "transform":
				return "scale(1) rotate(0deg)";
				break;
			default:
				return 0;
				break;
		}
	}

	setInitialState() {
		this.elements.forEach(element => {
			element.style.transition = "";
			if (element.style.position != "absolute") element.style.position = "relative";

			Object.keys(this.options.style).forEach(key => {
				if (!["scale", "rotate"].includes(key)) element.style[key] = this.options.style[key];
			});

			const transform = [];
			if (this.options.style.scale) transform.push(`scale(${this.options.style.scale})`);
			if (this.options.style.rotate) transform.push(`rotate(${this.options.style.rotate}deg)`);

			if (transform) element.style.transform = transform.join(" ");

			element.style.transition = `all ${this.options.duration}s ${this.options.timingFunction}`;
		});

		if (this.elementInView()) {
			window.setTimeout(this.loadElements, this.options.delay * 2);
		} else {
			window.addEventListener("scroll", this.loadElements);
		}
	}

	loadElements() {
		const _this = window.fl;
		if (_this.elementInView()) {
			for (let i = 0; i < _this.elements.length; i++) {
				window.setTimeout(() => {
					Object.keys(_this.options.style).forEach(key => {
						if (["scale", "rotate"].includes(key)) {
							_this.elements[i].style.transform = _this.initialStyles[i].transform;
						} else {
							_this.elements[i].style[key] = _this.initialStyles[i][key];
						}
					});
				}, _this.options.delay * i)

				window.setTimeout(() => {
					_this.elements[i].style.transition = _this.initialStyles.transition;
					_this.elements[i].style.position = _this.initialStyles.position;
				}, _this.options.delay * _this.elements.length);
			}
			window.removeEventListener("scroll", _this.loadElements);
		}
	}

	elementInView() {
		const topInView = (this.initialPosition.top > window.scrollY);
		const bottomInView = (this.initialPosition.bottom < (window.scrollY + window.innerHeight));

		return (topInView && bottomInView);
	}
}