function normalize(value) {
	return String(value || "")
		.toLowerCase()
		.trim();
}

function wikimedia(fileName, width = 1200) {
	return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=${width}`;
}

export const locationMedia = {
	"balboa park": {
		imageUrl: wikimedia("Balboa Park San Diego.jpg"),
		imageAlt: "Spanish-style buildings and gardens in Balboa Park, San Diego",
		imageCredit: "Hosiyar singh bhambhu / Wikimedia Commons",
		imageLicense: "CC BY-SA 4.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Balboa_Park_San_Diego.jpg"
	},
	"la jolla cove": {
		imageUrl: wikimedia("La Jolla Cove, San Diego.jpg"),
		imageAlt: "Ocean cliffs and water at La Jolla Cove in San Diego",
		imageCredit: "Stephen Bay / Wikimedia Commons",
		imageLicense: "CC BY",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:La_Jolla_Cove,_San_Diego.jpg"
	},
	"pacific beach": {
		imageUrl: wikimedia("Pacific Beach, San Diego.jpg"),
		imageAlt: "Wide beach and ocean view at Pacific Beach in San Diego",
		imageCredit: "Krithika03 / Wikimedia Commons",
		imageLicense: "CC BY-SA 4.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Pacific_Beach,_San_Diego.jpg"
	},
	"gaslamp quarter": {
		imageUrl: wikimedia("San Diego Gaslamp Quarter.jpg"),
		imageAlt: "Street sign and buildings in San Diego Gaslamp Quarter",
		imageCredit: "Ekrem Canli / Wikimedia Commons",
		imageLicense: "CC BY-SA 4.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:San_Diego_Gaslamp_Quarter.jpg"
	},
	"coronado island": {
		imageUrl: wikimedia("Coronado beach.jpg"),
		imageAlt: "Coronado Beach in California",
		imageCredit: "Ashley / Wikimedia Commons",
		imageLicense: "CC BY 2.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Coronado_beach.jpg"
	},
	"sunset cliffs": {
		imageUrl: wikimedia("La Jolla Cove, San Diego.jpg"),
		imageAlt: "Coastal cliffs and ocean near San Diego",
		imageCredit: "Stephen Bay / Wikimedia Commons",
		imageLicense: "CC BY",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:La_Jolla_Cove,_San_Diego.jpg"
	},
	"los angeles": {
		imageUrl: wikimedia("California Road Trip (16570143476).jpg"),
		imageAlt: "Road trip scenery in California",
		imageCredit: "moonjazz / Wikimedia Commons",
		imageLicense: "CC BY-SA 2.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:California_Road_Trip_(16570143476).jpg"
	},
	travel: {
		imageUrl: wikimedia("California Road Trip (16570143476).jpg"),
		imageAlt: "Open road travel scene in California",
		imageCredit: "moonjazz / Wikimedia Commons",
		imageLicense: "CC BY-SA 2.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:California_Road_Trip_(16570143476).jpg"
	},
	"griffith observatory": {
		imageUrl: wikimedia("Griffith Observatory, Los Angeles 2015-07-19.jpg"),
		imageAlt: "Griffith Observatory in Los Angeles",
		imageCredit: "Eric C Gardner / Wikimedia Commons",
		imageLicense: "CC BY-SA 4.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Griffith_Observatory,_Los_Angeles_2015-07-19.jpg"
	},
	tijuana: {
		imageUrl: wikimedia("Tijuana skyline.jpg"),
		imageAlt: "Tijuana skyline from Colonia La Cacho",
		imageCredit: "Urbaner44 / Wikimedia Commons",
		imageLicense: "CC BY-SA 4.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Tijuana_skyline.jpg"
	},
	"avenida revolucion": {
		imageUrl: wikimedia("Tijuana skyline.jpg"),
		imageAlt: "Tijuana skyline from Colonia La Cacho",
		imageCredit: "Urbaner44 / Wikimedia Commons",
		imageLicense: "CC BY-SA 4.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Tijuana_skyline.jpg"
	},
	denver: {
		imageUrl: wikimedia("Denver Skyline (15242286069).jpg"),
		imageAlt: "Denver skyline seen from Rocky Mountain Arsenal National Wildlife Refuge",
		imageCredit: "USFWS Mountain-Prairie / Wikimedia Commons",
		imageLicense: "CC BY 2.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Denver_Skyline_(15242286069).jpg"
	},
	"red rocks park and amphitheatre": {
		imageUrl: wikimedia("Denver Skyline (15242286069).jpg"),
		imageAlt: "Denver skyline seen from Rocky Mountain Arsenal National Wildlife Refuge",
		imageCredit: "USFWS Mountain-Prairie / Wikimedia Commons",
		imageLicense: "CC BY 2.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Denver_Skyline_(15242286069).jpg"
	},
	"san francisco": {
		imageUrl: wikimedia("San Francisco golden gate bridge.JPG"),
		imageAlt: "Golden Gate Bridge in San Francisco",
		imageCredit: "Rhasan / Wikimedia Commons",
		imageLicense: "CC BY-SA 3.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:San_Francisco_golden_gate_bridge.JPG"
	},
	"golden gate bridge": {
		imageUrl: wikimedia("San Francisco golden gate bridge.JPG"),
		imageAlt: "Golden Gate Bridge in San Francisco",
		imageCredit: "Rhasan / Wikimedia Commons",
		imageLicense: "CC BY-SA 3.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:San_Francisco_golden_gate_bridge.JPG"
	},
	"new york": {
		imageUrl: wikimedia("Iconic Skyline of New York City.jpg"),
		imageAlt: "New York City skyline",
		imageCredit: "Farida Belal / Wikimedia Commons",
		imageLicense: "CC0 1.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Iconic_Skyline_of_New_York_City.jpg"
	},
	"new york city": {
		imageUrl: wikimedia("Iconic Skyline of New York City.jpg"),
		imageAlt: "New York City skyline",
		imageCredit: "Farida Belal / Wikimedia Commons",
		imageLicense: "CC0 1.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Iconic_Skyline_of_New_York_City.jpg"
	},
	"central park": {
		imageUrl: wikimedia("Iconic Skyline of New York City.jpg"),
		imageAlt: "New York City skyline",
		imageCredit: "Farida Belal / Wikimedia Commons",
		imageLicense: "CC0 1.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Iconic_Skyline_of_New_York_City.jpg"
	},
	tokyo: {
		imageUrl: wikimedia("Students on campus.jpg"),
		imageAlt: "Students walking on campus",
		imageCredit: "Bathsofm / Wikimedia Commons",
		imageLicense: "CC BY 3.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Students_on_campus.jpg"
	},
	zurich: {
		imageUrl: wikimedia("Bicycle on the Beach (49877305071).jpg"),
		imageAlt: "Bicycle on a beach",
		imageCredit: "Channel City Camera Club / Wikimedia Commons",
		imageLicense: "CC BY 2.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Bicycle_on_the_Beach_(49877305071).jpg"
	},
	"zürich": {
		imageUrl: wikimedia("Bicycle on the Beach (49877305071).jpg"),
		imageAlt: "Bicycle on a beach",
		imageCredit: "Channel City Camera Club / Wikimedia Commons",
		imageLicense: "CC BY 2.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Bicycle_on_the_Beach_(49877305071).jpg"
	},
	london: {
		imageUrl: wikimedia("Tulane Students Studying.jpg"),
		imageAlt: "College students studying",
		imageCredit: "Tulane public relations / Wikimedia Commons",
		imageLicense: "CC BY 2.5",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Tulane_Students_Studying.jpg"
	},
	paris: {
		imageUrl: wikimedia("California Road Trip (16570143476).jpg"),
		imageAlt: "Road trip scenery",
		imageCredit: "moonjazz / Wikimedia Commons",
		imageLicense: "CC BY-SA 2.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:California_Road_Trip_(16570143476).jpg"
	}
};

export const categoryMedia = {
	beach: locationMedia["pacific beach"],
	food: {
		imageUrl: wikimedia("Fish taco-1.jpg"),
		imageAlt: "Fresh fish tacos with lime and salsa in San Diego",
		imageCredit: "Leo Chiou / Wikimedia Commons",
		imageLicense: "CC BY-SA 4.0",
		imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Fish_taco-1.jpg"
	},
	party: {
		imageUrl: wikimedia("Rooftop Bar, Metropolitan Museum Of Art (5894065780).jpg"),
		imageAlt: "Rooftop bar with skyline view",
		imageCredit: "Alex Proimos / Wikimedia Commons",
		imageLicense: "CC BY 2.0",
		imageSourceUrl:
			"https://commons.wikimedia.org/wiki/File:Rooftop_Bar,_Metropolitan_Museum_Of_Art_(5894065780).jpg"
	},
	"weekend trip": locationMedia.travel,
	study: locationMedia.london,
	culture: locationMedia["balboa park"],
	outdoor: locationMedia.zurich,
	sightseeing: locationMedia.travel
};

export const eventMedia = {
	"taco tuesday in pacific beach": categoryMedia.food,
	"gaslamp rooftop night": categoryMedia.party,
	"weekend trip to los angeles": locationMedia["griffith observatory"],
	"coronado beach bike ride": locationMedia["coronado island"],
	"sunset cliffs memory walk": locationMedia["sunset cliffs"],
	"day trip to tijuana": locationMedia["avenida revolucion"],
	"denver mountain weekend": locationMedia["red rocks park and amphitheatre"],
	"golden gate photo walk": locationMedia["golden gate bridge"],
	"weekend trip to nyc": locationMedia["central park"]
};

export function resolveLocationMedia(location = {}) {
	if (location.imageUrl) {
		return {
			imageUrl: location.imageUrl,
			imageAlt: location.imageAlt || `${location.name} in ${location.city || "San Diego"}`,
			imageCredit: location.imageCredit || "",
			imageLicense: location.imageLicense || "",
			imageSourceUrl: location.imageSourceUrl || ""
		};
	}

	const name = normalize(location.name);
	const city = normalize(location.city);
	return locationMedia[name] || locationMedia[city] || categoryMedia[normalize(location.backgroundType)] || null;
}

export function resolveEventMedia(event = {}, location = {}) {
	if (event.imageUrl) {
		return {
			imageUrl: event.imageUrl,
			imageAlt: event.imageAlt || event.title,
			imageCredit: event.imageCredit || "",
			imageLicense: event.imageLicense || "",
			imageSourceUrl: event.imageSourceUrl || ""
		};
	}

	return (
		eventMedia[normalize(event.title)] ||
		resolveLocationMedia(location) ||
		categoryMedia[normalize(event.category)] ||
		locationMedia.travel
	);
}
