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
 * @author   Steinar Utstrand
 * @license  https://github.com/stonescar/FancyLoad/blob/master/LICENSE  MIT License
 */


class FancyLoad {
	/**
	 * Initialize properties and prepare elements for animation
	 * 
	 * @param  {Nodelist}  elements  List of elements to fancy load together
	 * @param  {Object}    options   Options object
	 */
	constructor(elements, options = {style: {top: "100px", opacity: 0}}) {
		/**
		 * Array of elements to be fancy loaded
		 * 
		 * @type  {Array}
		 */
		this.elements = Array.from(elements);

		/**
		 * Options object
		 * Settings in provided options object will override defaults
		 * 
		 * @type  {Object}
		 *        @property  {Object}   style           Object of css properties
		 *        @property  {Number}   duration        Duration of the transition
		 *        @property  {String}   timingFunction  Transition timing function
		 *        @property  {Integer}  delay           Delay between the animations
		 *        @property  {Integer}  windowMinWidth  Minimum window width required to fancy load
		 *        @property  {Integer}  windowMaxWidth  Maximum window width required to fancy load
		 */
		this.options = Object.assign({
			style: {},
			duration: .3,
			timingFunction: "ease-out",
			delay: 100,
			windowMinWidth: 1024,
			windowMaxWidth: 99999,
		}, options);

		/**
		 * Abort if window width is not in required range
		 */
		if (window.innerWidth < this.windowMinWidth || window.innerWidth > this.windowMaxWidth) return;

		/**
		 * Array of initial styles.
		 * Each object corresponds to the same indexed element in this.loadElements
		 *
		 * @type {Array}
		 */
		this.initialStyles = this.elements.map(element => {
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

		/**
		 * Object containing the initial position of the elements in the DOM
		 *
		 * @type  {Object}
		 */
		this.initialPosition = {
			top: this.elements[0].offsetTop,
			bottom: this.elements[0].offsetTop + this.elements[0].offsetHeight,
		};

		this.setInitialState();
	}

	/**
	 * Returns default property value based on property name
	 *
	 * @param   {String}  property  CSS property name
	 *
	 * @return  {Mixed}             Default value of given property
	 */
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

	/**
	 * Sets the initial state of each element and adds scroll event listeners
	 */
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
			window.setTimeout(this.loadElements.bind(this), this.options.delay * 2);
		} else {
			window.addEventListener("scroll", this.loadElements.bind(this));
		}
	}

	/**
	 * Sets elements back to their original state and removes event listener
	 */
	loadElements() {
		if (this.elementInView()) {
			for (let i = 0; i < this.elements.length; i++) {
				window.setTimeout(() => {
					Object.keys(this.options.style).forEach(key => {
						if (["scale", "rotate"].includes(key)) {
							this.elements[i].style.transform = this.initialStyles[i].transform;
						} else {
							this.elements[i].style[key] = this.initialStyles[i][key];
						}
					});
				}, this.options.delay * i)

				window.setTimeout(() => {
					this.elements[i].style.transition = this.initialStyles.transition;
					this.elements[i].style.position = this.initialStyles.position;
				}, this.options.delay * this.elements.length);
			}
			window.removeEventListener("scroll", this.loadElements);
		}
	}

	/**
	 * Helper function to see if the elements are in window view or not
	 *
	 * @return  {Boolean}  Returns true if elements are in window view
	 */
	elementInView() {
		const topInView = (this.initialPosition.top > window.scrollY);
		const bottomInView = (this.initialPosition.bottom < (window.scrollY + window.innerHeight));

		return (topInView && bottomInView);
	}
}