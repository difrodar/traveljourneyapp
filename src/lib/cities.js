const cities = [
	["San Diego", "California", "USA", "US", 32.7157, -117.1611, 1387000],
	["Los Angeles", "California", "USA", "US", 34.0522, -118.2437, 3899000],
	["San Francisco", "California", "USA", "US", 37.7749, -122.4194, 808000],
	["New York City", "New York", "USA", "US", 40.7128, -74.006, 8468000],
	["Honolulu", "Hawaii", "USA", "US", 21.3069, -157.8583, 350000],
	["Hilo", "Hawaii", "USA", "US", 19.7074, -155.0816, 44000],
	["Kahului", "Hawaii", "USA", "US", 20.8893, -156.4729, 28000],
	["Kailua-Kona", "Hawaii", "USA", "US", 19.64, -155.9969, 23000],
	["Las Vegas", "Nevada", "USA", "US", 36.1716, -115.1391, 647000],
	["Denver", "Colorado", "USA", "US", 39.7392, -104.9903, 716000],
	["Seattle", "Washington", "USA", "US", 47.6061, -122.3328, 737000],
	["Portland", "Oregon", "USA", "US", 45.5152, -122.6784, 635000],
	["Chicago", "Illinois", "USA", "US", 41.8781, -87.6298, 2697000],
	["Boston", "Massachusetts", "USA", "US", 42.3601, -71.0589, 654000],
	["Washington", "District of Columbia", "USA", "US", 38.9072, -77.0369, 672000],
	["Miami", "Florida", "USA", "US", 25.7617, -80.1918, 449000],
	["Orlando", "Florida", "USA", "US", 28.5383, -81.3792, 316000],
	["Tampa", "Florida", "USA", "US", 27.9506, -82.4572, 398000],
	["New Orleans", "Louisiana", "USA", "US", 29.9511, -90.0715, 370000],
	["Austin", "Texas", "USA", "US", 30.2672, -97.7431, 974000],
	["Dallas", "Texas", "USA", "US", 32.7767, -96.797, 1299000],
	["Houston", "Texas", "USA", "US", 29.7604, -95.3698, 2303000],
	["Phoenix", "Arizona", "USA", "US", 33.4484, -112.074, 1644000],
	["Salt Lake City", "Utah", "USA", "US", 40.7608, -111.891, 200000],
	["San Jose", "California", "USA", "US", 37.3382, -121.8863, 971000],
	["Santa Barbara", "California", "USA", "US", 34.4208, -119.6982, 88000],
	["Santa Monica", "California", "USA", "US", 34.0195, -118.4912, 91000],
	["Anaheim", "California", "USA", "US", 33.8366, -117.9143, 345000],
	["Sacramento", "California", "USA", "US", 38.5816, -121.4944, 525000],
	["San Antonio", "Texas", "USA", "US", 29.4252, -98.4946, 1472000],
	["Nashville", "Tennessee", "USA", "US", 36.1627, -86.7816, 690000],
	["Atlanta", "Georgia", "USA", "US", 33.749, -84.388, 499000],
	["Philadelphia", "Pennsylvania", "USA", "US", 39.9526, -75.1652, 1576000],
	["San Juan", "Puerto Rico", "USA", "US", 18.4655, -66.1057, 342000],
	["Anchorage", "Alaska", "USA", "US", 61.2176, -149.8997, 287000],
	["Tijuana", "Baja California", "Mexico", "MX", 32.5149, -117.0382, 1922000],
	["Mexico City", "Mexico City", "Mexico", "MX", 19.4326, -99.1332, 9209000],
	["Guadalajara", "Jalisco", "Mexico", "MX", 20.6597, -103.3496, 1385000],
	["Cancun", "Quintana Roo", "Mexico", "MX", 21.1619, -86.8515, 888000],
	["Vancouver", "British Columbia", "Canada", "CA", 49.2827, -123.1207, 662000],
	["Toronto", "Ontario", "Canada", "CA", 43.6532, -79.3832, 2794000],
	["Montreal", "Quebec", "Canada", "CA", 45.5019, -73.5674, 1762000],
	["Calgary", "Alberta", "Canada", "CA", 51.0447, -114.0719, 1306000],
	["Ottawa", "Ontario", "Canada", "CA", 45.4215, -75.6972, 1017000],
	["Zurich", "Zurich", "Switzerland", "CH", 47.3769, 8.5417, 421000],
	["Geneva", "Geneva", "Switzerland", "CH", 46.2044, 6.1432, 203000],
	["Basel", "Basel-Stadt", "Switzerland", "CH", 47.5596, 7.5886, 173000],
	["Bern", "Bern", "Switzerland", "CH", 46.948, 7.4474, 134000],
	["London", "England", "United Kingdom", "GB", 51.5072, -0.1276, 8799000],
	["Manchester", "England", "United Kingdom", "GB", 53.4808, -2.2426, 552000],
	["Edinburgh", "Scotland", "United Kingdom", "GB", 55.9533, -3.1883, 506000],
	["Dublin", "Leinster", "Ireland", "IE", 53.3498, -6.2603, 592000],
	["Paris", "Ile-de-France", "France", "FR", 48.8566, 2.3522, 2161000],
	["Lyon", "Auvergne-Rhone-Alpes", "France", "FR", 45.764, 4.8357, 522000],
	["Marseille", "Provence-Alpes-Cote d'Azur", "France", "FR", 43.2965, 5.3698, 873000],
	["Nice", "Provence-Alpes-Cote d'Azur", "France", "FR", 43.7102, 7.262, 343000],
	["Berlin", "Berlin", "Germany", "DE", 52.52, 13.405, 3645000],
	["Munich", "Bavaria", "Germany", "DE", 48.1351, 11.582, 1472000],
	["Hamburg", "Hamburg", "Germany", "DE", 53.5511, 9.9937, 1841000],
	["Frankfurt", "Hesse", "Germany", "DE", 50.1109, 8.6821, 753000],
	["Amsterdam", "North Holland", "Netherlands", "NL", 52.3676, 4.9041, 821000],
	["Rotterdam", "South Holland", "Netherlands", "NL", 51.9244, 4.4777, 655000],
	["Brussels", "Brussels", "Belgium", "BE", 50.8503, 4.3517, 188000],
	["Madrid", "Madrid", "Spain", "ES", 40.4168, -3.7038, 3223000],
	["Barcelona", "Catalonia", "Spain", "ES", 41.3874, 2.1686, 1620000],
	["Valencia", "Valencian Community", "Spain", "ES", 39.4699, -0.3763, 792000],
	["Lisbon", "Lisbon", "Portugal", "PT", 38.7223, -9.1393, 545000],
	["Porto", "Porto", "Portugal", "PT", 41.1579, -8.6291, 231000],
	["Rome", "Lazio", "Italy", "IT", 41.9028, 12.4964, 2873000],
	["Milan", "Lombardy", "Italy", "IT", 45.4642, 9.19, 1352000],
	["Venice", "Veneto", "Italy", "IT", 45.4408, 12.3155, 258000],
	["Florence", "Tuscany", "Italy", "IT", 43.7696, 11.2558, 382000],
	["Vienna", "Vienna", "Austria", "AT", 48.2082, 16.3738, 1897000],
	["Prague", "Prague", "Czechia", "CZ", 50.0755, 14.4378, 1309000],
	["Budapest", "Central Hungary", "Hungary", "HU", 47.4979, 19.0402, 1752000],
	["Warsaw", "Masovian", "Poland", "PL", 52.2297, 21.0122, 1794000],
	["Krakow", "Lesser Poland", "Poland", "PL", 50.0647, 19.945, 779000],
	["Copenhagen", "Capital Region", "Denmark", "DK", 55.6761, 12.5683, 653000],
	["Stockholm", "Stockholm", "Sweden", "SE", 59.3293, 18.0686, 975000],
	["Oslo", "Oslo", "Norway", "NO", 59.9139, 10.7522, 698000],
	["Helsinki", "Uusimaa", "Finland", "FI", 60.1699, 24.9384, 658000],
	["Athens", "Attica", "Greece", "GR", 37.9838, 23.7275, 637000],
	["Istanbul", "Istanbul", "Turkey", "TR", 41.0082, 28.9784, 15460000],
	["Tokyo", "Tokyo", "Japan", "JP", 35.6762, 139.6503, 13960000],
	["Kyoto", "Kyoto", "Japan", "JP", 35.0116, 135.7681, 1465000],
	["Osaka", "Osaka", "Japan", "JP", 34.6937, 135.5023, 2691000],
	["Seoul", "Seoul", "South Korea", "KR", 37.5665, 126.978, 9733000],
	["Busan", "Busan", "South Korea", "KR", 35.1796, 129.0756, 3390000],
	["Beijing", "Beijing", "China", "CN", 39.9042, 116.4074, 21540000],
	["Shanghai", "Shanghai", "China", "CN", 31.2304, 121.4737, 24870000],
	["Hong Kong", "Hong Kong", "Hong Kong", "HK", 22.3193, 114.1694, 7488000],
	["Taipei", "Taipei", "Taiwan", "TW", 25.033, 121.5654, 2603000],
	["Singapore", "Singapore", "Singapore", "SG", 1.3521, 103.8198, 5637000],
	["Bangkok", "Bangkok", "Thailand", "TH", 13.7563, 100.5018, 10539000],
	["Chiang Mai", "Chiang Mai", "Thailand", "TH", 18.7883, 98.9853, 127000],
	["Kuala Lumpur", "Kuala Lumpur", "Malaysia", "MY", 3.139, 101.6869, 1808000],
	["Manila", "Metro Manila", "Philippines", "PH", 14.5995, 120.9842, 1780000],
	["Jakarta", "Jakarta", "Indonesia", "ID", -6.2088, 106.8456, 10560000],
	["Denpasar", "Bali", "Indonesia", "ID", -8.65, 115.2167, 725000],
	["Hanoi", "Hanoi", "Vietnam", "VN", 21.0278, 105.8342, 8054000],
	["Ho Chi Minh City", "Ho Chi Minh City", "Vietnam", "VN", 10.8231, 106.6297, 8993000],
	["Mumbai", "Maharashtra", "India", "IN", 19.076, 72.8777, 20411000],
	["Delhi", "Delhi", "India", "IN", 28.7041, 77.1025, 16788000],
	["Bengaluru", "Karnataka", "India", "IN", 12.9716, 77.5946, 8444000],
	["Dubai", "Dubai", "United Arab Emirates", "AE", 25.2048, 55.2708, 3331000],
	["Abu Dhabi", "Abu Dhabi", "United Arab Emirates", "AE", 24.4539, 54.3773, 1483000],
	["Doha", "Doha", "Qatar", "QA", 25.2854, 51.531, 956000],
	["Tel Aviv", "Tel Aviv", "Israel", "IL", 32.0853, 34.7818, 460000],
	["Jerusalem", "Jerusalem", "Israel", "IL", 31.7683, 35.2137, 936000],
	["Sydney", "New South Wales", "Australia", "AU", -33.8688, 151.2093, 5312000],
	["Melbourne", "Victoria", "Australia", "AU", -37.8136, 144.9631, 5078000],
	["Brisbane", "Queensland", "Australia", "AU", -27.4698, 153.0251, 2560000],
	["Auckland", "Auckland", "New Zealand", "NZ", -36.8509, 174.7645, 1657000],
	["Wellington", "Wellington", "New Zealand", "NZ", -41.2865, 174.7762, 216000],
	["Queenstown", "Otago", "New Zealand", "NZ", -45.0312, 168.6626, 16000],
	["Buenos Aires", "Buenos Aires", "Argentina", "AR", -34.6037, -58.3816, 3120000],
	["Rio de Janeiro", "Rio de Janeiro", "Brazil", "BR", -22.9068, -43.1729, 6748000],
	["Sao Paulo", "Sao Paulo", "Brazil", "BR", -23.5558, -46.6396, 12330000],
	["Lima", "Lima", "Peru", "PE", -12.0464, -77.0428, 9675000],
	["Cusco", "Cusco", "Peru", "PE", -13.532, -71.9675, 428000],
	["Santiago", "Santiago Metropolitan", "Chile", "CL", -33.4489, -70.6693, 5614000],
	["Bogota", "Bogota", "Colombia", "CO", 4.711, -74.0721, 7181000],
	["Medellin", "Antioquia", "Colombia", "CO", 6.2442, -75.5812, 2529000],
	["Quito", "Pichincha", "Ecuador", "EC", -0.1807, -78.4678, 2011000],
	["Cape Town", "Western Cape", "South Africa", "ZA", -33.9249, 18.4241, 4618000],
	["Johannesburg", "Gauteng", "South Africa", "ZA", -26.2041, 28.0473, 5635000],
	["Cairo", "Cairo", "Egypt", "EG", 30.0444, 31.2357, 10200000],
	["Marrakech", "Marrakech-Safi", "Morocco", "MA", 31.6295, -7.9811, 928000],
	["Nairobi", "Nairobi", "Kenya", "KE", -1.2921, 36.8219, 4397000],
	["Accra", "Greater Accra", "Ghana", "GH", 5.6037, -0.187, 2291000]
];

export const worldCities = cities.map(([name, admin, country, iso2, lat, lng, population]) => ({
	name,
	admin,
	country,
	iso2,
	lat,
	lng,
	population
}));

function normalize(value) {
	return String(value || "")
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

export function cityLabel(city) {
	return `${city.name}, ${city.admin}, ${city.country}`;
}

function cityScore(city, term) {
	const name = normalize(city.name);
	const admin = normalize(city.admin);
	const country = normalize(city.country);
	const label = normalize(cityLabel(city));
	let score = 0;

	if (name === term) score += 140;
	else if (name.startsWith(term)) score += 100;
	else if (name.includes(term)) score += 60;
	else if (label.includes(term)) score += 34;
	else if (admin.includes(term) || country.includes(term)) score += 18;
	else return 0;

	if (city.country === "USA") score += 10;
	if (city.admin === "California" || city.admin === "Hawaii") score += 8;
	if (name === "san diego") score += 10;
	score += Math.min(28, Math.log10(city.population || 1) * 4);
	return score;
}

export function searchCities(query, limit = 8) {
	const term = normalize(query);
	if (term.length < 2) return [];
	return worldCities
		.map((city) => ({ city, score: cityScore(city, term) }))
		.filter((item) => item.score > 0)
		.sort((a, b) => b.score - a.score || b.city.population - a.city.population)
		.slice(0, limit)
		.map((item) => item.city);
}

export function findCityCoordinates({ city = "", country = "" } = {}) {
	const cityTerm = normalize(city);
	const countryTerm = normalize(country);
	if (!cityTerm) return null;

	const exact = worldCities.find((item) => {
		const sameCity = normalize(item.name) === cityTerm;
		const sameCountry = !countryTerm || normalize(item.country) === countryTerm || normalize(item.iso2) === countryTerm;
		return sameCity && sameCountry;
	});
	if (exact) return { lat: exact.lat, lng: exact.lng };

	const result = searchCities(`${city} ${country}`.trim(), 1)[0] || searchCities(city, 1)[0];
	return result ? { lat: result.lat, lng: result.lng } : null;
}
