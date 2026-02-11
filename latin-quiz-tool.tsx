import React, { useState, useEffect, useMemo } from "react";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";

// Fixed quiz type lists
const VERB_TENSES = [
	{ type: "tense", value: "present", display: "present" },
	{ type: "tense", value: "imperfect", display: "imperfect" },
	{ type: "tense", value: "future", display: "future" },
	{ type: "tense", value: "perfect", display: "perfect" },
	{ type: "tense", value: "pluperfect", display: "pluperfect" },
	{ type: "tense", value: "future perfect", display: "future perfect" },
];

const VERB_PERSON_NUMBERS = [
	{ type: "person-number", value: "1 singular", display: "1st sg." },
	{ type: "person-number", value: "2 singular", display: "2nd sg." },
	{ type: "person-number", value: "3 singular", display: "3rd sg." },
	{ type: "person-number", value: "1 plural", display: "1st pl." },
	{ type: "person-number", value: "2 plural", display: "2nd pl." },
	{ type: "person-number", value: "3 plural", display: "3rd pl." },
];

const NOUN_ADJ_CASES = [
	{ type: "case", value: "nominative", display: "nominative" },
	{ type: "case", value: "genitive", display: "genitive" },
	{ type: "case", value: "dative", display: "dative" },
	{ type: "case", value: "accusative", display: "accusative" },
	{ type: "case", value: "ablative", display: "ablative" },
	{ type: "case", value: "vocative", display: "vocative" },
];

const NOUN_ADJ_CASES_NO_VOCATIVE = [
	{ type: "case", value: "nominative", display: "nominative" },
	{ type: "case", value: "genitive", display: "genitive" },
	{ type: "case", value: "dative", display: "dative" },
	{ type: "case", value: "accusative", display: "accusative" },
	{ type: "case", value: "ablative", display: "ablative" },
];

const NOUN_ADJ_NUMBERS = [
	{ type: "number", value: "singular", display: "singular" },
	{ type: "number", value: "plural", display: "plural" },
];

const VERB_CONJUGATIONS = [
	{ value: "1", display: "1st" },
	{ value: "2", display: "2nd" },
	{ value: "3", display: "3rd" },
	{ value: "3/4", display: "3rd io" },
	{ value: "4", display: "4th" },
	{ value: "irreg", display: "Irregulars" },
];

const NOUN_DECLENSIONS = [
	{ value: "1", display: "1st" },
	{ value: "2", display: "2nd" },
	{ value: "3", display: "3rd" },
	{ value: "4", display: "4th" },
	{ value: "5", display: "5th" },
	{ value: "irregs", display: "Irregulars" },
];

const PARTICIPLE_TYPES = [
	{ value: "all", display: "All", tense: null, voice: null, mood: null },
	{
		value: "present-active",
		display: "Present Active",
		tense: "p",
		voice: "a",
		mood: "p",
	},
	{
		value: "perfect-passive",
		display: "Perfect Passive",
		tense: "r",
		voice: "p",
		mood: "p",
	},
	{
		value: "future-active",
		display: "Future Active",
		tense: "f",
		voice: "a",
		mood: "p",
	},
	{
		value: "gerundive",
		display: "Future Passive (Gerundive)",
		tense: null,
		voice: null,
		mood: "g",
	},
];

const LatinQuiz = ({
	data,
	loading,
	error,
}: {
	data: any[];
	loading: boolean;
	error: string | null;
}) => {
	const [filteredData, setFilteredData] = useState([]);
	const [quizCategory, setQuizCategory] = useState(null);

	// State for filtering
	const [verbOptions, setVerbOptions] = useState({
		passives: false,
		subjunctives: false,
		infinitives: false,
	});
	const [verbConjugationAll, setVerbConjugationAll] = useState(true);
	const [verbConjugations, setVerbConjugations] = useState(
		VERB_CONJUGATIONS.map((c) => c.value),
	);
	const [nounDeclensionAll, setNounDeclensionAll] = useState(true);
	const [nounDeclensions, setNounDeclensions] = useState(
		NOUN_DECLENSIONS.map((d) => d.value),
	);
	const [adjectiveType, setAdjectiveType] = useState("all");
	const [pronounType, setPronounType] = useState("all");
	const [participleType, setParticipleType] = useState("all");
	const [participleConjugationAll, setParticipleConjugationAll] =
		useState(true);
	const [participleConjugations, setParticipleConjugations] = useState(
		VERB_CONJUGATIONS.map((c) => c.value),
	);

	// Quiz state
	const [quizWords, setQuizWords] = useState([]);
	const [selectedWords, setSelectedWords] = useState(new Set());
	const [quizStarted, setQuizStarted] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [verbQuizTypes, setVerbQuizTypes] = useState({ random: true });
	const [nounQuizTypes, setNounQuizTypes] = useState({ random: true });
	const [adjQuizTypes, setAdjQuizTypes] = useState({ random: true });
	const [participleQuizTypes, setParticipleQuizTypes] = useState({
		random: true,
	});
	const [helpMode, setHelpMode] = useState(false);
	const [targetCategory, setTargetCategory] = useState(null);

	const posTagSchema = [
		{
			name: "pos",
			values: {
				v: "verb",
				n: "noun",
				a: "adjective",
				p: "pronoun",
				d: "adverb",
				c: "conjunction",
				r: "preposition",
				m: "numeral",
				e: "exclamation",
			},
		},
		{ name: "person", values: { "-": null, "1": "1", "2": "2", "3": "3" } },
		{ name: "number", values: { "-": null, s: "sg.", p: "pl." } },
		{
			name: "tense",
			values: {
				"-": null,
				p: "present",
				r: "perfect",
				i: "imperfect",
				f: "future",
				t: "future perfect",
				l: "pluperfect",
			},
		},
		{
			name: "mood",
			values: {
				"-": null,
				i: "indicative",
				n: "infinitive",
				s: "subjunctive",
				m: "imperative",
				d: "gerund",
				g: "gerundive",
				u: "supine",
				p: "participle",
			},
		},
		{
			name: "voice",
			values: {
				"-": null,
				a: "active",
				d: "deponent",
				p: "passive",
				e: "medio-passive",
			},
		},
		{
			name: "gender",
			values: { "-": null, m: "masculine", f: "feminine", n: "neuter" },
		},
		{
			name: "case",
			values: {
				"-": null,
				n: "nominative",
				g: "genitive",
				d: "dative",
				a: "accusative",
				b: "ablative",
				v: "vocative",
				l: "locative",
			},
		},
		{
			name: "degree",
			values: { "-": null, p: "positive", c: "comparative", s: "superlative" },
		},
	];

	const decodePosTag = (posTag) => {
		if (!posTag || posTag.length !== 9) return {};
		const decoded = {};
		for (let i = 0; i < posTagSchema.length; i++) {
			const schema = posTagSchema[i];
			const char = posTag[i];
			const value = schema.values[char];
			if (value) {
				decoded[schema.name] = value;
			}
		}
		return decoded;
	};

	// Abbreviated POS tag display for quiz results
	const posAbbrev = {
		// person (index 1) — no abbreviation, just the digit
		person: { "1": "1", "2": "2", "3": "3" },
		// number (index 2)
		number: { s: "sg.", p: "pl." },
		// tense (index 3)
		tense: {
			p: "pres.",
			r: "pf.",
			i: "impf.",
			f: "fut.",
			t: "fut.pf.",
			l: "plupf.",
		},
		// mood (index 4)
		mood: {
			i: "indic.",
			n: "infin.",
			s: "subj.",
			m: "imperat.",
			d: "gerund",
			g: "gerundive",
			u: "supine",
			p: "participle",
		},
		// voice (index 5)
		voice: {
			a: "act.",
			d: "depon.",
			p: "pass.",
			e: "mid.-pass.",
		},
		// gender (index 6)
		gender: { m: "m.", f: "f.", n: "n." },
		// case (index 7)
		case: {
			n: "nom.",
			g: "gen.",
			d: "dat.",
			a: "acc.",
			b: "abl.",
			v: "voc.",
			l: "loc.",
		},
	};

	const formatPosTag = (posTag, wordForm?) => {
		if (!posTag || posTag.length !== 9) return "";
		const partOfSpeech = posTag[0];
		const ch = (idx) => posTag[idx]; // shortcut to get char at index

		if (partOfSpeech === "v") {
			const mood = ch(4);

			// Participles/Gerundives: tense, voice, participle, case, number
			if (mood === "p" || mood === "g") {
				const parts = [];
				const tense = posAbbrev.tense[ch(3)];
				if (tense) parts.push(tense);
				const voice = posAbbrev.voice[ch(5)];
				if (voice) parts.push(voice);
				const moodAbbrev = posAbbrev.mood[mood];
				if (moodAbbrev) parts.push(moodAbbrev);
				const cas = posAbbrev.case[ch(7)];
				if (cas) parts.push(cas);
				const number = posAbbrev.number[ch(2)];
				if (number) parts.push(number);
				return parts.join(" ");
			}

			// Regular Verbs: person+number (no space), tense, voice, mood
			const parts = [];
			const person = posAbbrev.person[ch(1)];
			const number = posAbbrev.number[ch(2)];
			if (person && number) parts.push(person + number);
			else if (person) parts.push(person);
			else if (number) parts.push(number);

			const tense = posAbbrev.tense[ch(3)];
			if (tense) parts.push(tense);
			const voice = posAbbrev.voice[ch(5)];
			if (voice) parts.push(voice);
			const moodAbbrev = posAbbrev.mood[mood];
			if (moodAbbrev) parts.push(moodAbbrev);
			return parts.join(" ");
		} else if (partOfSpeech === "n" || partOfSpeech === "a") {
			// Nouns/Adjectives: case, number, gender
			const parts = [];
			const cas = posAbbrev.case[ch(7)];
			if (cas) parts.push(cas);
			const number = posAbbrev.number[ch(2)];
			if (number) parts.push(number);

			// For adjectives, collapse genders from all alternative rows
			// that share the same case and number
			if (partOfSpeech === "a" && wordForm) {
				const alts = wordAlternatives.get(wordForm) || [];
				const genderOrder = ["m.", "f.", "n."];
				const genders = new Set();
				for (const alt of alts) {
					if (
						alt.pos &&
						alt.pos.length === 9 &&
						alt.pos[0] === "a" &&
						alt.pos[7] === ch(7) && // same case
						alt.pos[2] === ch(2) // same number
					) {
						const g = posAbbrev.gender[alt.pos[6]];
						if (g) genders.add(g);
					}
				}
				if (genders.size > 0) {
					const sortedGenders = genderOrder.filter((g) => genders.has(g));
					parts.push(sortedGenders.join("/"));
				}
			} else {
				const gender = posAbbrev.gender[ch(6)];
				if (gender) parts.push(gender);
			}

			return parts.join(" ");
		}
		// Fallback for other POS: use the old generic format
		return Object.entries(decodePosTag(posTag))
			.map(([k, v]) => v)
			.filter(Boolean)
			.join(", ");
	};

	// Lookup map: word form → all data rows with that form (for ambiguous forms)
	const wordAlternatives = useMemo(() => {
		const map = new Map();
		for (const item of data) {
			const existing = map.get(item.word) || [];
			existing.push(item);
			map.set(item.word, existing);
		}
		return map;
	}, [data]);

	// Main Filter Effect
	useEffect(() => {
		if (!quizCategory) {
			setFilteredData([]);
			return;
		}

		let filtered = data;

		if (quizCategory === "verbs") {
			filtered = data.filter((item) => {
				if (!item.pos || item.pos.length !== 9) return false;
				if (item.pos[0] !== "v") return false;

				// Filter by conjugation (skip if "All" is selected)
				if (!verbConjugationAll && item.type) {
					const typeTrimmed = item.type.trim();
					const typeLower = typeTrimmed.toLowerCase();
					const matchesConjugation = verbConjugations.some((conj) => {
						if (conj === "irreg") return typeLower.includes("irreg");
						return typeTrimmed === conj;
					});
					if (!matchesConjugation) return false;
				}

				// Exclude participles and gerundives from verb quiz (they have their own quiz)
				const mood = item.pos[4];
				if (mood === "p" || mood === "g") return false;

				const decoded = decodePosTag(item.pos);
				if (!verbOptions.passives && decoded.voice === "passive") return false;
				if (!verbOptions.subjunctives && decoded.mood === "subjunctive")
					return false;
				if (!verbOptions.infinitives && decoded.mood === "infinitive")
					return false;
				return true;
			});
		} else if (quizCategory === "nouns") {
			filtered = data.filter((item) => {
				if (!item.pos || item.pos.length !== 9) return false;
				if (item.pos[0] !== "n") return false;

				// If "All" is selected, skip declension filtering
				if (nounDeclensionAll) return true;

				if (!item.type) return true;

				const typeTrimmed = item.type.trim();
				const typeLower = item.type.toLowerCase();

				const matchesAnyDeclension = nounDeclensions.some((decl) => {
					if (decl === "irregs") {
						return typeLower.includes("irreg");
					}
					return typeTrimmed === decl || typeLower.includes(decl.toLowerCase());
				});

				return matchesAnyDeclension;
			});
		} else if (quizCategory === "adjectives") {
			filtered = data.filter((item) => {
				if (!item.pos || item.pos.length !== 9) return false;
				if (item.pos[0] !== "a") return false;
				if (adjectiveType === "all") return true;
				if (item.type) {
					const typeTrimmed = item.type.trim();
					if (
						adjectiveType === "us-a-um" &&
						(typeTrimmed === "1/2" || typeTrimmed.includes("1/2"))
					)
						return true;
					if (
						adjectiveType === "3rd" &&
						(typeTrimmed === "3" || typeTrimmed === "3rd")
					)
						return true;
				}
				return false;
			});
		} else if (quizCategory === "pronouns") {
			filtered = data.filter((item) => {
				if (!item.pos || item.pos.length !== 9) return false;
				if (item.pos[0] !== "p") return false;
				if (pronounType === "all") return true;
				if (item.type && item.type.toLowerCase().includes(pronounType))
					return true;
				return false;
			});
		} else if (quizCategory === "participles") {
			filtered = data.filter((item) => {
				if (!item.pos || item.pos.length !== 9) return false;
				if (item.pos[0] !== "v") return false;

				// Check if it's a participle (mood 'p') or gerundive (mood 'g')
				const mood = item.pos[4];
				if (mood !== "p" && mood !== "g") return false;

				// Filter by conjugation (skip if "All" is selected)
				if (!participleConjugationAll && item.type) {
					const typeTrimmed = item.type.trim();
					const typeLower = typeTrimmed.toLowerCase();
					const matchesConjugation = participleConjugations.some((conj) => {
						if (conj === "irreg") return typeLower.includes("irreg");
						return typeTrimmed === conj;
					});
					if (!matchesConjugation) return false;
				}

				// Filter by participle type
				if (participleType === "all") return true;

				const selectedType = PARTICIPLE_TYPES.find(
					(t) => t.value === participleType,
				);
				if (!selectedType) return true;

				// Check for gerundive (mood 'g')
				if (selectedType.mood === "g") {
					return mood === "g";
				}

				// Check for participles (mood 'p') with specific tense/voice
				if (mood === "p") {
					const tense = item.pos[3];
					const voice = item.pos[5];

					if (selectedType.tense && tense !== selectedType.tense) return false;
					if (selectedType.voice && voice !== selectedType.voice) return false;
					return true;
				}

				return false;
			});
		} else if (quizCategory === "combined") {
			filtered = data.filter((item) => {
				if (!item.pos || item.pos.length !== 9) return false;
				const posType = item.pos[0];
				if (["n", "a", "p"].includes(posType)) return true;
				if (posType === "v") {
					const decoded = decodePosTag(item.pos);
					return decoded.mood === "participle";
				}
				return false;
			});
		}

		setFilteredData(filtered);
	}, [
		quizCategory,
		verbOptions,
		verbConjugationAll,
		verbConjugations,
		nounDeclensionAll,
		nounDeclensions,
		adjectiveType,
		pronounType,
		participleType,
		participleConjugationAll,
		participleConjugations,
		data,
	]);

	const isCorrectAnswer = (word) => {
		const alternatives = wordAlternatives.get(word.word) || [word];
		return alternatives.some((alt) =>
			isCorrectAnswerForCategory(alt, targetCategory),
		);
	};

	// For display: find the POS tag that actually matches the target category
	const getMatchingPosTag = (word) => {
		const alternatives = wordAlternatives.get(word.word) || [word];
		const match = alternatives.find((alt) =>
			isCorrectAnswerForCategory(alt, targetCategory),
		);
		return match ? match.pos : word.pos;
	};

	const toggleVerbConjugation = (conj) => {
		setVerbConjugations((prev) => {
			if (prev.includes(conj)) {
				const newList = prev.filter((c) => c !== conj);
				return newList.length === 0 ? prev : newList;
			} else {
				return [...prev, conj];
			}
		});
	};

	const toggleNounDeclension = (decl) => {
		setNounDeclensions((prev) => {
			if (prev.includes(decl)) {
				const newList = prev.filter((d) => d !== decl);
				return newList.length === 0 ? prev : newList;
			} else {
				return [...prev, decl];
			}
		});
	};

	const toggleParticipleConjugation = (conj) => {
		setParticipleConjugations((prev) => {
			if (prev.includes(conj)) {
				const newList = prev.filter((c) => c !== conj);
				return newList.length === 0 ? prev : newList;
			} else {
				return [...prev, conj];
			}
		});
	};

	const getQuizTypesForCategory = () => {
		if (quizCategory === "verbs") return verbQuizTypes;
		if (quizCategory === "nouns") return nounQuizTypes;
		if (quizCategory === "participles") return participleQuizTypes;
		return adjQuizTypes;
	};

	const setQuizTypesForCategory = (updater) => {
		if (quizCategory === "verbs") setVerbQuizTypes(updater);
		else if (quizCategory === "nouns") setNounQuizTypes(updater);
		else if (quizCategory === "participles") setParticipleQuizTypes(updater);
		else setAdjQuizTypes(updater);
	};

	const toggleQuizType = (type) => {
		const current = getQuizTypesForCategory();
		if (type === "random") {
			setQuizTypesForCategory({ random: !current.random });
		} else {
			setQuizTypesForCategory((prev) => ({
				...prev,
				[type]: !prev[type],
			}));
		}
	};

	const getSelectedQuizTypes = () => {
		const current = getQuizTypesForCategory();
		if (current.random) {
			if (quizCategory === "verbs") {
				return [...VERB_TENSES, ...VERB_PERSON_NUMBERS];
			}
			if (quizCategory === "participles") {
				// For participles, we can test tense/voice or case (excluding vocative unless explicitly selected)
				return [
					...PARTICIPLE_TYPES.filter((t) => t.value !== "all").map((t) => ({
						type: "participle-type",
						value: t.value,
						display: t.display,
					})),
					...NOUN_ADJ_CASES_NO_VOCATIVE,
				];
			}
			// For nouns/adjectives, exclude vocative from random selection
			return [...NOUN_ADJ_CASES_NO_VOCATIVE, ...NOUN_ADJ_NUMBERS];
		}
		if (quizCategory === "verbs") {
			return [...VERB_TENSES, ...VERB_PERSON_NUMBERS].filter(
				(cat) => current[cat.display],
			);
		}
		if (quizCategory === "participles") {
			const participleTypeOptions = PARTICIPLE_TYPES.filter(
				(t) => t.value !== "all",
			).map((t) => ({
				type: "participle-type",
				value: t.value,
				display: t.display,
			}));
			return [...participleTypeOptions, ...NOUN_ADJ_CASES].filter(
				(cat) => current[cat.display],
			);
		}
		return [...NOUN_ADJ_CASES, ...NOUN_ADJ_NUMBERS].filter(
			(cat) => current[cat.display],
		);
	};

	const isCorrectAnswerForCategory = (word, category) => {
		if (!word.pos || word.pos.length !== 9 || !category) return false;
		const decoded = decodePosTag(word.pos);

		if (category.type === "tense") {
			return decoded.tense === category.value;
		} else if (category.type === "person-number") {
			const parts = category.value.split(" ");
			return decoded.person === parts[0] && decoded.number === parts[1];
		} else if (category.type === "tense-person-number") {
			const parts = category.personNumber.split(" ");
			return (
				decoded.tense === category.tense &&
				decoded.person === parts[0] &&
				decoded.number === parts[1]
			);
		} else if (category.type === "case") {
			return decoded.case === category.value;
		} else if (category.type === "number") {
			return decoded.number === category.value;
		} else if (category.type === "case-number") {
			return (
				decoded.case === category.case && decoded.number === category.number
			);
		} else if (category.type === "participle-type") {
			const particType = PARTICIPLE_TYPES.find(
				(t) => t.value === category.value,
			);
			if (!particType) return false;

			const mood = word.pos[4];

			// Check for gerundive (mood 'g')
			if (particType.mood === "g") {
				return mood === "g";
			}

			// Check for participles with specific tense/voice
			if (mood === "p") {
				const tense = word.pos[3];
				const voice = word.pos[5];

				if (particType.tense && tense !== particType.tense) return false;
				if (particType.voice && voice !== particType.voice) return false;
				return true;
			}

			return false;
		} else if (category.type === "participle-type-case") {
			// Combined tense/voice + case
			const particType = PARTICIPLE_TYPES.find(
				(t) => t.value === category.participleType,
			);
			if (!particType) return false;

			const mood = word.pos[4];

			// Check mood and tense/voice match
			if (particType.mood === "g") {
				if (mood !== "g") return false;
			} else if (mood === "p") {
				const tense = word.pos[3];
				const voice = word.pos[5];
				if (particType.tense && tense !== particType.tense) return false;
				if (particType.voice && voice !== particType.voice) return false;
			} else {
				return false;
			}

			// Check case match
			return decoded.case === category.case;
		}

		return false;
	};

	const startQuiz = () => {
		if (filteredData.length < 10) return;

		const possibleTypes = getSelectedQuizTypes();
		if (possibleTypes.length === 0) return;

		let selectedCategory;

		if (quizCategory === "verbs") {
			const tenses = possibleTypes.filter((c) => c.type === "tense");
			const personNumbers = possibleTypes.filter(
				(c) => c.type === "person-number",
			);

			const canDoTenseOnly = tenses.length > 0;
			const canDoPersonNumberOnly = personNumbers.length > 0;
			const canDoBoth = tenses.length > 0 && personNumbers.length > 0;

			const availableOptions = [];
			if (canDoTenseOnly) availableOptions.push("tense");
			if (canDoPersonNumberOnly) availableOptions.push("person-number");
			if (canDoBoth) availableOptions.push("both");

			if (availableOptions.length === 0) return;

			const choice =
				availableOptions[Math.floor(Math.random() * availableOptions.length)];

			if (choice === "tense") {
				selectedCategory = tenses[Math.floor(Math.random() * tenses.length)];
			} else if (choice === "person-number") {
				selectedCategory =
					personNumbers[Math.floor(Math.random() * personNumbers.length)];
			} else {
				const randomTense = tenses[Math.floor(Math.random() * tenses.length)];
				const randomPN =
					personNumbers[Math.floor(Math.random() * personNumbers.length)];
				selectedCategory = {
					type: "tense-person-number",
					tense: randomTense.value,
					personNumber: randomPN.value,
					display: randomTense.display + " " + randomPN.display,
				};
			}
		} else if (quizCategory === "participles") {
			const participleTypes = possibleTypes.filter(
				(c) => c.type === "participle-type",
			);
			const cases = possibleTypes.filter((c) => c.type === "case");

			const canDoTypeOnly = participleTypes.length > 0;
			const canDoCaseOnly = cases.length > 0;
			const canDoBoth = participleTypes.length > 0 && cases.length > 0;

			const availableOptions = [];
			if (canDoTypeOnly) availableOptions.push("type");
			if (canDoCaseOnly) availableOptions.push("case");
			if (canDoBoth) availableOptions.push("both");

			if (availableOptions.length === 0) return;

			const choice =
				availableOptions[Math.floor(Math.random() * availableOptions.length)];

			if (choice === "type") {
				selectedCategory =
					participleTypes[Math.floor(Math.random() * participleTypes.length)];
			} else if (choice === "case") {
				selectedCategory = cases[Math.floor(Math.random() * cases.length)];
			} else {
				const randomType =
					participleTypes[Math.floor(Math.random() * participleTypes.length)];
				const randomCase = cases[Math.floor(Math.random() * cases.length)];
				selectedCategory = {
					type: "participle-type-case",
					participleType: randomType.value,
					case: randomCase.value,
					display: randomType.display + " " + randomCase.display,
				};
			}
		} else if (quizCategory === "nouns" || quizCategory === "adjectives") {
			const cases = possibleTypes.filter((c) => c.type === "case");
			const numbers = possibleTypes.filter((c) => c.type === "number");

			const canDoCaseOnly = cases.length > 0;
			const canDoNumberOnly = numbers.length > 0;
			const canDoBoth = cases.length > 0 && numbers.length > 0;

			const availableOptions = [];
			if (canDoCaseOnly) availableOptions.push("case");
			if (canDoNumberOnly) availableOptions.push("number");
			if (canDoBoth) availableOptions.push("both");

			if (availableOptions.length === 0) return;

			const choice =
				availableOptions[Math.floor(Math.random() * availableOptions.length)];

			if (choice === "case") {
				selectedCategory = cases[Math.floor(Math.random() * cases.length)];
			} else if (choice === "number") {
				selectedCategory = numbers[Math.floor(Math.random() * numbers.length)];
			} else {
				const randomCase = cases[Math.floor(Math.random() * cases.length)];
				const randomNumber =
					numbers[Math.floor(Math.random() * numbers.length)];
				selectedCategory = {
					type: "case-number",
					case: randomCase.value,
					number: randomNumber.value,
					display: randomCase.display + " " + randomNumber.display,
				};
			}
		}

		const weightedRandomSelect = (array, count) => {
			if (array.length === 0) return [];

			const selected = [];
			const available = [...array];
			const usedDicts = new Set();

			while (selected.length < count && available.length > 0) {
				const totalWeight = available.reduce(
					(sum, item) => sum + (item.total || 1),
					0,
				);
				let random = Math.random() * totalWeight;
				let selectedIndex = 0;

				for (let j = 0; j < available.length; j++) {
					random -= available[j].total || 1;
					if (random <= 0) {
						selectedIndex = j;
						break;
					}
				}

				const selectedItem = available[selectedIndex];

				if (!usedDicts.has(selectedItem.dict)) {
					selected.push(selectedItem);
					usedDicts.add(selectedItem.dict);
				}

				available.splice(selectedIndex, 1);
			}

			return selected;
		};

		const shuffleArray = (array) => {
			const shuffled = [...array];
			for (let i = shuffled.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
			}
			return shuffled;
		};

		// Try up to 20 times to find a category with enough matching words
		let finalCategory = selectedCategory;
		let matching, nonMatching, uniqueMatchingDicts, uniqueNonMatchingDicts;

		for (let attempt = 0; attempt < 20; attempt++) {
			if (attempt > 0) {
				// Re-roll the category
				if (quizCategory === "verbs") {
					const tenses = possibleTypes.filter((c) => c.type === "tense");
					const personNumbers = possibleTypes.filter(
						(c) => c.type === "person-number",
					);
					const availableOptions = [];
					if (tenses.length > 0) availableOptions.push("tense");
					if (personNumbers.length > 0) availableOptions.push("person-number");
					if (tenses.length > 0 && personNumbers.length > 0)
						availableOptions.push("both");
					const choice =
						availableOptions[
							Math.floor(Math.random() * availableOptions.length)
						];
					if (choice === "tense") {
						finalCategory = tenses[Math.floor(Math.random() * tenses.length)];
					} else if (choice === "person-number") {
						finalCategory =
							personNumbers[Math.floor(Math.random() * personNumbers.length)];
					} else {
						const randomTense =
							tenses[Math.floor(Math.random() * tenses.length)];
						const randomPN =
							personNumbers[Math.floor(Math.random() * personNumbers.length)];
						finalCategory = {
							type: "tense-person-number",
							tense: randomTense.value,
							personNumber: randomPN.value,
							display: randomTense.display + " " + randomPN.display,
						};
					}
				} else if (quizCategory === "participles") {
					const participleTypes = possibleTypes.filter(
						(c) => c.type === "participle-type",
					);
					const cases = possibleTypes.filter((c) => c.type === "case");
					const availableOptions = [];
					if (participleTypes.length > 0) availableOptions.push("type");
					if (cases.length > 0) availableOptions.push("case");
					if (participleTypes.length > 0 && cases.length > 0)
						availableOptions.push("both");
					const choice =
						availableOptions[
							Math.floor(Math.random() * availableOptions.length)
						];
					if (choice === "type") {
						finalCategory =
							participleTypes[
								Math.floor(Math.random() * participleTypes.length)
							];
					} else if (choice === "case") {
						finalCategory = cases[Math.floor(Math.random() * cases.length)];
					} else {
						const randomType =
							participleTypes[
								Math.floor(Math.random() * participleTypes.length)
							];
						const randomCase = cases[Math.floor(Math.random() * cases.length)];
						finalCategory = {
							type: "participle-type-case",
							participleType: randomType.value,
							case: randomCase.value,
							display: randomType.display + " " + randomCase.display,
						};
					}
				} else {
					const cases = possibleTypes.filter((c) => c.type === "case");
					const numbers = possibleTypes.filter((c) => c.type === "number");
					const availableOptions = [];
					if (cases.length > 0) availableOptions.push("case");
					if (numbers.length > 0) availableOptions.push("number");
					if (cases.length > 0 && numbers.length > 0)
						availableOptions.push("both");
					const choice =
						availableOptions[
							Math.floor(Math.random() * availableOptions.length)
						];
					if (choice === "case") {
						finalCategory = cases[Math.floor(Math.random() * cases.length)];
					} else if (choice === "number") {
						finalCategory = numbers[Math.floor(Math.random() * numbers.length)];
					} else {
						const randomCase = cases[Math.floor(Math.random() * cases.length)];
						const randomNumber =
							numbers[Math.floor(Math.random() * numbers.length)];
						finalCategory = {
							type: "case-number",
							case: randomCase.value,
							number: randomNumber.value,
							display: randomCase.display + " " + randomNumber.display,
						};
					}
				}
			}

			// Debug: test a known word
			const testWord = filteredData.find(
				(w) =>
					w.pos && w.pos[3] === "t" && w.pos[1] === "2" && w.pos[2] === "s",
			);
			if (testWord && finalCategory.type === "tense-person-number") {
				const d = decodePosTag(testWord.pos);
				const parts = finalCategory.personNumber.split(" ");
				console.log("DEBUG test word:", testWord.word, "pos:", testWord.pos);
				console.log("  decoded:", JSON.stringify(d));
				console.log("  category:", JSON.stringify(finalCategory));
				console.log(
					"  tense match:",
					d.tense,
					"===",
					finalCategory.tense,
					"→",
					d.tense === finalCategory.tense,
				);
				console.log(
					"  person match:",
					d.person,
					"===",
					parts[0],
					"→",
					d.person === parts[0],
				);
				console.log(
					"  number match:",
					d.number,
					"===",
					parts[1],
					"→",
					d.number === parts[1],
				);
				console.log(
					"  direct check result:",
					isCorrectAnswerForCategory(testWord, finalCategory),
				);
				const alts = wordAlternatives.get(testWord.word) || [testWord];
				console.log("  alternatives count:", alts.length);
				console.log(
					"  any alt match:",
					alts.some((alt) => isCorrectAnswerForCategory(alt, finalCategory)),
				);
			}

			matching = filteredData.filter((item) => {
				const alts = wordAlternatives.get(item.word) || [item];
				return alts.some((alt) =>
					isCorrectAnswerForCategory(alt, finalCategory),
				);
			});
			nonMatching = filteredData.filter((item) => {
				const alts = wordAlternatives.get(item.word) || [item];
				return !alts.some((alt) =>
					isCorrectAnswerForCategory(alt, finalCategory),
				);
			});

			uniqueMatchingDicts = new Set(matching.map((w) => w.dict)).size;
			uniqueNonMatchingDicts = new Set(nonMatching.map((w) => w.dict)).size;

			if (uniqueMatchingDicts >= 2 && uniqueNonMatchingDicts >= 2) break;
		}

		// If we still can't find a valid category, bail
		if (uniqueMatchingDicts < 2 || uniqueNonMatchingDicts < 2) return;

		setTargetCategory(finalCategory);

		// Clamp numMatching to [2, 8], within what each pool can actually provide
		const minMatching = Math.max(2, 10 - uniqueNonMatchingDicts);
		const maxMatching = Math.min(8, uniqueMatchingDicts);
		const numMatching =
			minMatching > maxMatching
				? maxMatching
				: Math.floor(Math.random() * (maxMatching - minMatching + 1)) +
					minMatching;
		const numNonMatching = 10 - numMatching;

		const selectedMatching = weightedRandomSelect(matching, numMatching);
		const selectedNonMatching = weightedRandomSelect(
			nonMatching,
			numNonMatching,
		);

		const quiz = shuffleArray([...selectedMatching, ...selectedNonMatching]);

		setQuizWords(quiz);
		setSelectedWords(new Set());
		setShowResults(false);
		setQuizStarted(true);
	};

	const toggleWord = (index) => {
		if (showResults) return;
		setSelectedWords((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(index)) {
				newSet.delete(index);
			} else {
				newSet.add(index);
			}
			return newSet;
		});
	};

	const getScore = () => {
		let correct = 0;
		let incorrect = 0;

		quizWords.forEach((word, index) => {
			const isSelected = selectedWords.has(index);
			const shouldBeSelected = isCorrectAnswer(word);

			if (isSelected && shouldBeSelected) correct++;
			if (isSelected && !shouldBeSelected) incorrect++;
			if (!isSelected && shouldBeSelected) incorrect++;
		});

		return { correct, incorrect };
	};

	const getWordStyle = (word, index) => {
		const isSelected = selectedWords.has(index);
		const shouldBeSelected = isCorrectAnswer(word);

		if (!showResults) {
			return isSelected
				? "bg-blue-100 border-blue-500"
				: "bg-white border-gray-300 hover:border-blue-400";
		}

		if (isSelected && shouldBeSelected) return "bg-green-100 border-green-500";
		if (isSelected && !shouldBeSelected) return "bg-red-100 border-red-500";
		if (!isSelected && shouldBeSelected)
			return "bg-orange-100 border-orange-500";
		return "bg-white border-gray-300";
	};

	const getWordIcon = (word, index) => {
		const isSelected = selectedWords.has(index);
		const shouldBeSelected = isCorrectAnswer(word);

		if (!showResults) return null;

		if (isSelected && shouldBeSelected)
			return <CheckCircle className="w-5 h-5 text-green-600" />;
		if (isSelected && !shouldBeSelected)
			return <XCircle className="w-5 h-5 text-red-600" />;
		if (!isSelected && shouldBeSelected)
			return <XCircle className="w-5 h-5 text-orange-600" />;
		return null;
	};

	const resetToStart = () => {
		setQuizCategory(null);
		setQuizStarted(false);
		setShowResults(false);
		setSelectedWords(new Set());
		setTargetCategory(null);
		setVerbQuizTypes({ random: true });
		setNounQuizTypes({ random: true });
		setAdjQuizTypes({ random: true });
		setParticipleQuizTypes({ random: true });
		setHelpMode(false);
		setVerbOptions({
			passives: false,
			subjunctives: false,
			infinitives: false,
		});
		setVerbConjugationAll(true);
		setVerbConjugations(VERB_CONJUGATIONS.map((c) => c.value));
		setNounDeclensionAll(true);
		setNounDeclensions(NOUN_DECLENSIONS.map((d) => d.value));
		setAdjectiveType("all");
		setPronounType("all");
		setParticipleType("all");
		setParticipleConjugationAll(true);
		setParticipleConjugations(VERB_CONJUGATIONS.map((c) => c.value));
	};

	// Quiz type selector for case/number categories (nouns or adjectives)
	const renderCaseNumberQuizTypeSelector = () => {
		const qt = getQuizTypesForCategory();
		return (
			<>
				<h2 className="text-xl sm:text-2xl font-semibold text-indigo-900 mb-4">
					Select quiz type
				</h2>
				<div className="mb-6">
					<div className="flex gap-2 mb-4">
						<button
							onClick={() => {
								const updated = { ...qt, random: true };
								setQuizTypesForCategory(updated);
							}}
							className={
								"px-4 py-2 rounded-lg border-2 transition font-semibold " +
								(qt.random
									? "bg-indigo-100 border-indigo-500 text-indigo-700"
									: "bg-white border-gray-300 hover:border-indigo-300")
							}
						>
							Randomized quiz
						</button>
						<button
							onClick={() => {
								const updated = { ...qt, random: false };
								setQuizTypesForCategory(updated);
							}}
							className={
								"px-4 py-2 rounded-lg border-2 transition font-semibold " +
								(!qt.random
									? "bg-indigo-100 border-indigo-500 text-indigo-700"
									: "bg-white border-gray-300 hover:border-indigo-300")
							}
						>
							Select options
						</button>
					</div>

					{!qt.random && (
						<div className="ml-6 space-y-2 border-l-2 border-indigo-200 pl-4">
							<p className="text-sm italic text-gray-500 mb-3">
								Choose as many as you like
							</p>
							<p className="text-sm font-semibold text-gray-700 mb-2">Cases</p>
							{NOUN_ADJ_CASES.map((cat, idx) => (
								<label
									key={idx}
									className="flex items-center space-x-3 cursor-pointer"
								>
									<input
										type="checkbox"
										checked={qt[cat.display] || false}
										onChange={() => toggleQuizType(cat.display)}
										className="w-4 h-4"
									/>
									<span className="text-sm">{cat.display}</span>
								</label>
							))}
							<p className="text-sm font-semibold text-gray-700 mb-2 mt-3">
								Number
							</p>
							{NOUN_ADJ_NUMBERS.map((cat, idx) => (
								<label
									key={idx}
									className="flex items-center space-x-3 cursor-pointer"
								>
									<input
										type="checkbox"
										checked={qt[cat.display] || false}
										onChange={() => toggleQuizType(cat.display)}
										className="w-4 h-4"
									/>
									<span className="text-sm">{cat.display}</span>
								</label>
							))}
						</div>
					)}
				</div>
			</>
		);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<h1 className="text-3xl sm:text-4xl font-bold text-indigo-900 mb-6 sm:mb-8 text-center">
					Latin wordforms quizzer
				</h1>

				{/* Loading / Error states */}
				{loading && (
					<div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 mb-6 sm:mb-8 text-center">
						<p className="text-lg text-gray-600">Loading quiz data...</p>
					</div>
				)}

				{error && (
					<div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 mb-6 sm:mb-8 text-center">
						<p className="text-lg text-red-600">Error: {error}</p>
						<p className="text-sm text-gray-500 mt-2">
							Make sure <code>public/data/spans_data_cleaned.tsv</code> exists.
						</p>
					</div>
				)}

				{/* Quiz Type Selection (Home) */}
				{!loading && !error && data.length > 0 && !quizCategory && (
					<div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 mb-6 sm:mb-8">
						<h2 className="text-xl sm:text-2xl font-semibold text-indigo-900 mb-6">
							Select quiz type
						</h2>
						<div className="space-y-4">
							<button
								onClick={() => setQuizCategory("verbs")}
								className="w-full text-left p-4 border-2 border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition"
							>
								<div className="font-semibold text-lg text-indigo-900">
									Verbs
								</div>
								<div className="text-sm text-gray-600">
									Test tense, person, and number
								</div>
							</button>
							<div className="ml-8">
								<button
									onClick={() => setQuizCategory("participles")}
									className="w-full text-left p-4 pl-6 border-2 border-indigo-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition bg-indigo-50/30"
								>
									<div className="font-semibold text-base text-indigo-800">
										↳ Participles
									</div>
									<div className="text-sm text-gray-600">
										Test participle type and case
									</div>
								</button>
							</div>
							<button
								onClick={() => setQuizCategory("nouns")}
								className="w-full text-left p-4 border-2 border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition"
							>
								<div className="font-semibold text-lg text-indigo-900">
									Nouns
								</div>
								<div className="text-sm text-gray-600">
									Test case and number
								</div>
							</button>
							<button
								onClick={() => setQuizCategory("adjectives")}
								className="w-full text-left p-4 border-2 border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition"
							>
								<div className="font-semibold text-lg text-indigo-900">
									Adjectives
								</div>
								<div className="text-sm text-gray-600">
									Test case and number
								</div>
							</button>
						</div>
					</div>
				)}

				{/* No data loaded */}
				{!loading && !error && data.length === 0 && (
					<div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 mb-6 sm:mb-8 text-center">
						<p className="text-lg text-gray-600">No data found.</p>
						<p className="text-sm text-gray-500 mt-2">
							Place your TSV data in{" "}
							<code>public/data/spans_data_cleaned.tsv</code> and reload.
						</p>
					</div>
				)}

				{/* Verb Options */}
				{data.length > 0 && quizCategory === "verbs" && !quizStarted && (
					<div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 mb-6 sm:mb-8">
						<div className="flex justify-between items-center mb-4">
							<button
								onClick={() => setQuizCategory(null)}
								className="text-indigo-600 hover:text-indigo-800"
							>
								← Back
							</button>
							<button
								onClick={resetToStart}
								className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
							>
								🏠 Home
							</button>
						</div>

						<h2 className="text-xl sm:text-2xl font-semibold text-indigo-900 mb-4">
							Select verb conjugations
						</h2>
						<div className="flex flex-wrap gap-2 mb-8">
							<button
								onClick={() => setVerbConjugationAll(true)}
								className={
									"px-4 py-2 rounded-lg border-2 transition " +
									(verbConjugationAll
										? "bg-indigo-100 border-indigo-500 text-indigo-700"
										: "bg-white border-gray-300 hover:border-indigo-300")
								}
							>
								All
							</button>
							{VERB_CONJUGATIONS.map((conj) => (
								<button
									key={conj.value}
									onClick={() => {
										if (verbConjugationAll) {
											setVerbConjugationAll(false);
											setVerbConjugations([conj.value]);
										} else {
											toggleVerbConjugation(conj.value);
										}
									}}
									className={
										"px-4 py-2 rounded-lg border-2 transition " +
										(verbConjugationAll
											? "bg-gray-100 border-gray-200 text-gray-400 cursor-default"
											: verbConjugations.includes(conj.value)
												? "bg-indigo-100 border-indigo-500 text-indigo-700"
												: "bg-white border-gray-300 hover:border-indigo-300")
									}
								>
									{conj.display}
								</button>
							))}
						</div>

						<div className="space-y-3 mb-8">
							<label className="flex items-center space-x-3 cursor-pointer">
								<input
									type="checkbox"
									checked={verbOptions.passives}
									onChange={(e) =>
										setVerbOptions({
											...verbOptions,
											passives: e.target.checked,
										})
									}
									className="w-5 h-5"
								/>
								<span>Include Passives</span>
							</label>
							<label className="flex items-center space-x-3 cursor-pointer">
								<input
									type="checkbox"
									checked={verbOptions.subjunctives}
									onChange={(e) =>
										setVerbOptions({
											...verbOptions,
											subjunctives: e.target.checked,
										})
									}
									className="w-5 h-5"
								/>
								<span>Include Subjunctives</span>
							</label>
							<label className="flex items-center space-x-3 cursor-pointer">
								<input
									type="checkbox"
									checked={verbOptions.infinitives}
									onChange={(e) =>
										setVerbOptions({
											...verbOptions,
											infinitives: e.target.checked,
										})
									}
									className="w-5 h-5"
								/>
								<span>Include Infinitives</span>
							</label>
						</div>

						<h2 className="text-xl sm:text-2xl font-semibold text-indigo-900 mb-4">
							Select quiz type
						</h2>
						<div className="mb-6">
							<div className="flex gap-2 mb-4">
								<button
									onClick={() =>
										setVerbQuizTypes({ ...verbQuizTypes, random: true })
									}
									className={
										"px-4 py-2 rounded-lg border-2 transition font-semibold " +
										(verbQuizTypes.random
											? "bg-indigo-100 border-indigo-500 text-indigo-700"
											: "bg-white border-gray-300 hover:border-indigo-300")
									}
								>
									Randomized quiz
								</button>
								<button
									onClick={() =>
										setVerbQuizTypes({ ...verbQuizTypes, random: false })
									}
									className={
										"px-4 py-2 rounded-lg border-2 transition font-semibold " +
										(!verbQuizTypes.random
											? "bg-indigo-100 border-indigo-500 text-indigo-700"
											: "bg-white border-gray-300 hover:border-indigo-300")
									}
								>
									Select options
								</button>
							</div>

							{!verbQuizTypes.random && (
								<div className="ml-6 space-y-2 border-l-2 border-indigo-200 pl-4">
									<p className="text-sm italic text-gray-500 mb-3">
										Choose as many as you like
									</p>
									<p className="text-sm font-semibold text-gray-700 mb-2">
										Tenses
									</p>
									{VERB_TENSES.map((cat, idx) => (
										<label
											key={idx}
											className="flex items-center space-x-3 cursor-pointer"
										>
											<input
												type="checkbox"
												checked={verbQuizTypes[cat.display] || false}
												onChange={() => toggleQuizType(cat.display)}
												className="w-4 h-4"
											/>
											<span className="text-sm">{cat.display}</span>
										</label>
									))}
									<p className="text-sm font-semibold text-gray-700 mb-2 mt-3">
										Person/Number
									</p>
									{VERB_PERSON_NUMBERS.map((cat, idx) => (
										<label
											key={idx}
											className="flex items-center space-x-3 cursor-pointer"
										>
											<input
												type="checkbox"
												checked={verbQuizTypes[cat.display] || false}
												onChange={() => toggleQuizType(cat.display)}
												className="w-4 h-4"
											/>
											<span className="text-sm">{cat.display}</span>
										</label>
									))}
								</div>
							)}
						</div>

						<div className="p-4 bg-blue-50 rounded-lg mb-6">
							<p className="text-sm">
								<strong>Available words:</strong> {filteredData.length}
							</p>
							<p className="text-sm text-gray-600 mt-2">
								{verbQuizTypes.random
									? "The quiz will randomly test a tense, a person/number, or both"
									: `The quiz will test: ${getSelectedQuizTypes()
											.map((c) => c.display)
											.join(", ")}`}
							</p>
							{filteredData.length === 0 && (
								<p className="text-sm text-red-600 mt-2">
									No words found with these settings.
								</p>
							)}
						</div>
						<button
							onClick={startQuiz}
							disabled={
								filteredData.length < 10 || getSelectedQuizTypes().length === 0
							}
							className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 transition"
						>
							Start Quiz
						</button>
					</div>
				)}

				{/* Noun Options */}
				{data.length > 0 && quizCategory === "nouns" && !quizStarted && (
					<div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 mb-6 sm:mb-8">
						<div className="flex justify-between items-center mb-4">
							<button
								onClick={() => setQuizCategory(null)}
								className="text-indigo-600 hover:text-indigo-800"
							>
								← Back
							</button>
							<button
								onClick={resetToStart}
								className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
							>
								🏠 Home
							</button>
						</div>

						<h2 className="text-xl sm:text-2xl font-semibold text-indigo-900 mb-4">
							Select noun declensions
						</h2>
						<div className="flex flex-wrap gap-2 mb-8">
							<button
								onClick={() => setNounDeclensionAll(!nounDeclensionAll)}
								className={
									"px-4 py-2 rounded-lg border-2 transition " +
									(nounDeclensionAll
										? "bg-indigo-100 border-indigo-500 text-indigo-700"
										: "bg-white border-gray-300 hover:border-indigo-300")
								}
							>
								All
							</button>
							{NOUN_DECLENSIONS.map((decl) => (
								<button
									key={decl.value}
									onClick={() => {
										if (nounDeclensionAll) {
											setNounDeclensionAll(false);
											setNounDeclensions([decl.value]);
										} else {
											toggleNounDeclension(decl.value);
										}
									}}
									className={
										"px-4 py-2 rounded-lg border-2 transition " +
										(nounDeclensionAll
											? "bg-gray-100 border-gray-200 text-gray-400 cursor-default"
											: nounDeclensions.includes(decl.value)
												? "bg-indigo-100 border-indigo-500 text-indigo-700"
												: "bg-white border-gray-300 hover:border-indigo-300")
									}
								>
									{decl.display}
								</button>
							))}
						</div>

						{renderCaseNumberQuizTypeSelector()}

						<div className="p-4 bg-blue-50 rounded-lg mb-6">
							<p className="text-sm">
								<strong>Available words:</strong> {filteredData.length}
							</p>
							<p className="text-sm text-gray-600 mt-2">
								{getQuizTypesForCategory().random
									? "The quiz will randomly test a case, a number, or both"
									: `The quiz will test: ${getSelectedQuizTypes()
											.map((c) => c.display)
											.join(", ")}`}
							</p>
							{filteredData.length === 0 && (
								<p className="text-sm text-red-600 mt-2">
									No words found with these options. Try different settings or
									check your data format.
								</p>
							)}
						</div>
						<button
							onClick={startQuiz}
							disabled={
								filteredData.length < 10 || getSelectedQuizTypes().length === 0
							}
							className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 transition"
						>
							Start Quiz
						</button>
					</div>
				)}

				{/* Adjective Options */}
				{data.length > 0 && quizCategory === "adjectives" && !quizStarted && (
					<div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 mb-6 sm:mb-8">
						<div className="flex justify-between items-center mb-4">
							<button
								onClick={() => setQuizCategory(null)}
								className="text-indigo-600 hover:text-indigo-800"
							>
								← Back
							</button>
							<button
								onClick={resetToStart}
								className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
							>
								🏠 Home
							</button>
						</div>

						<h2 className="text-xl sm:text-2xl font-semibold text-indigo-900 mb-6">
							Select adjective types
						</h2>
						<div className="flex flex-wrap gap-2 mb-8">
							{["all", "us-a-um", "3rd"].map((type) => (
								<button
									key={type}
									onClick={() => setAdjectiveType(type)}
									className={
										"px-4 py-2 rounded-lg border-2 transition " +
										(adjectiveType === type
											? "bg-indigo-100 border-indigo-500 text-indigo-700"
											: "bg-white border-gray-300 hover:border-indigo-300")
									}
								>
									{type === "us-a-um"
										? "-us -a -um"
										: type.charAt(0).toUpperCase() + type.slice(1)}
								</button>
							))}
						</div>

						{renderCaseNumberQuizTypeSelector()}

						<div className="p-4 bg-blue-50 rounded-lg mb-6">
							<p className="text-sm">
								<strong>Available words:</strong> {filteredData.length}
							</p>
							<p className="text-sm text-gray-600 mt-2">
								{getQuizTypesForCategory().random
									? "The quiz will randomly test a case, a number, or both"
									: `The quiz will test: ${getSelectedQuizTypes()
											.map((c) => c.display)
											.join(", ")}`}
							</p>
							{filteredData.length === 0 && adjectiveType !== "all" && (
								<p className="text-sm text-red-600 mt-2">
									No words found with this type. Try selecting "All" or check
									your data format.
								</p>
							)}
						</div>
						<button
							onClick={startQuiz}
							disabled={
								filteredData.length < 10 || getSelectedQuizTypes().length === 0
							}
							className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 transition"
						>
							Start Quiz
						</button>
					</div>
				)}

				{/* Participle Options */}
				{data.length > 0 && quizCategory === "participles" && !quizStarted && (
					<div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 mb-6 sm:mb-8">
						<div className="flex justify-between items-center mb-4">
							<button
								onClick={() => setQuizCategory(null)}
								className="text-indigo-600 hover:text-indigo-800"
							>
								← Back
							</button>
							<button
								onClick={resetToStart}
								className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
							>
								🏠 Home
							</button>
						</div>

						<h2 className="text-xl sm:text-2xl font-semibold text-indigo-900 mb-4">
							Select participle types
						</h2>
						<div className="flex flex-wrap gap-2 mb-8">
							{PARTICIPLE_TYPES.map((type) => (
								<button
									key={type.value}
									onClick={() => setParticipleType(type.value)}
									className={
										"px-4 py-2 rounded-lg border-2 transition " +
										(participleType === type.value
											? "bg-indigo-100 border-indigo-500 text-indigo-700"
											: "bg-white border-gray-300 hover:border-indigo-300")
									}
								>
									{type.display}
								</button>
							))}
						</div>

						<h2 className="text-xl sm:text-2xl font-semibold text-indigo-900 mb-4">
							Select verb conjugations
						</h2>
						<div className="flex flex-wrap gap-2 mb-8">
							<button
								onClick={() => setParticipleConjugationAll(true)}
								className={
									"px-4 py-2 rounded-lg border-2 transition " +
									(participleConjugationAll
										? "bg-indigo-100 border-indigo-500 text-indigo-700"
										: "bg-white border-gray-300 hover:border-indigo-300")
								}
							>
								All
							</button>
							{VERB_CONJUGATIONS.map((conj) => (
								<button
									key={conj.value}
									onClick={() => {
										if (participleConjugationAll) {
											setParticipleConjugationAll(false);
											setParticipleConjugations([conj.value]);
										} else {
											toggleParticipleConjugation(conj.value);
										}
									}}
									className={
										"px-4 py-2 rounded-lg border-2 transition " +
										(participleConjugationAll
											? "bg-gray-100 border-gray-200 text-gray-400 cursor-default"
											: participleConjugations.includes(conj.value)
												? "bg-indigo-100 border-indigo-500 text-indigo-700"
												: "bg-white border-gray-300 hover:border-indigo-300")
									}
								>
									{conj.display}
								</button>
							))}
						</div>

						<h2 className="text-xl sm:text-2xl font-semibold text-indigo-900 mb-4">
							Select quiz type
						</h2>
						<div className="mb-6">
							<div className="flex gap-2 mb-4">
								<button
									onClick={() =>
										setParticipleQuizTypes({
											...participleQuizTypes,
											random: true,
										})
									}
									className={
										"px-4 py-2 rounded-lg border-2 transition font-semibold " +
										(participleQuizTypes.random
											? "bg-indigo-100 border-indigo-500 text-indigo-700"
											: "bg-white border-gray-300 hover:border-indigo-300")
									}
								>
									Randomized quiz
								</button>
								<button
									onClick={() =>
										setParticipleQuizTypes({
											...participleQuizTypes,
											random: false,
										})
									}
									className={
										"px-4 py-2 rounded-lg border-2 transition font-semibold " +
										(!participleQuizTypes.random
											? "bg-indigo-100 border-indigo-500 text-indigo-700"
											: "bg-white border-gray-300 hover:border-indigo-300")
									}
								>
									Select options
								</button>
							</div>

							{!participleQuizTypes.random && (
								<div className="ml-6 space-y-2 border-l-2 border-indigo-200 pl-4">
									<p className="text-sm italic text-gray-500 mb-3">
										Choose as many as you like
									</p>
									<p className="text-sm font-semibold text-gray-700 mb-2">
										Participle Types
									</p>
									{PARTICIPLE_TYPES.filter((t) => t.value !== "all")
										.map((t) => ({
											type: "participle-type",
											value: t.value,
											display: t.display,
										}))
										.map((cat, idx) => (
											<label
												key={idx}
												className="flex items-center space-x-3 cursor-pointer"
											>
												<input
													type="checkbox"
													checked={participleQuizTypes[cat.display] || false}
													onChange={() => toggleQuizType(cat.display)}
													className="w-4 h-4"
												/>
												<span className="text-sm">{cat.display}</span>
											</label>
										))}
									<p className="text-sm font-semibold text-gray-700 mb-2 mt-3">
										Cases
									</p>
									{NOUN_ADJ_CASES.map((cat, idx) => (
										<label
											key={idx}
											className="flex items-center space-x-3 cursor-pointer"
										>
											<input
												type="checkbox"
												checked={participleQuizTypes[cat.display] || false}
												onChange={() => toggleQuizType(cat.display)}
												className="w-4 h-4"
											/>
											<span className="text-sm">{cat.display}</span>
										</label>
									))}
								</div>
							)}
						</div>

						<div className="p-4 bg-blue-50 rounded-lg mb-6">
							<p className="text-sm">
								<strong>Available words:</strong> {filteredData.length}
							</p>
							<p className="text-sm text-gray-600 mt-2">
								{participleQuizTypes.random
									? "The quiz will randomly test a participle type, a case, or both"
									: `The quiz will test: ${getSelectedQuizTypes()
											.map((c) => c.display)
											.join(", ")}`}
							</p>
							{filteredData.length === 0 && (
								<p className="text-sm text-red-600 mt-2">
									No words found with these settings. Try different options or
									check your data format.
								</p>
							)}
						</div>
						<button
							onClick={startQuiz}
							disabled={
								filteredData.length < 10 || getSelectedQuizTypes().length === 0
							}
							className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 transition"
						>
							Start Quiz
						</button>
					</div>
				)}

				{/* Active Quiz */}
				{quizStarted && (
					<div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
						<div className="flex justify-end mb-2">
							<button
								onClick={resetToStart}
								className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
							>
								🏠 Home
							</button>
						</div>
						<div className="mb-6">
							<div className="flex justify-between items-center mb-2">
								<h2 className="text-xl sm:text-2xl font-semibold text-indigo-900">
									Select all words that are{" "}
									<span className="text-indigo-600">
										{targetCategory?.display}
									</span>
								</h2>
								<button
									onClick={() => setHelpMode(!helpMode)}
									className={
										"px-4 py-2 rounded-lg border-2 transition text-sm " +
										(helpMode
											? "bg-indigo-100 border-indigo-500 text-indigo-700"
											: "border-gray-300 text-gray-600 hover:border-indigo-300")
									}
								>
									{helpMode ? "✓ Help Mode" : "Help Mode"}
								</button>
							</div>
							{helpMode && (
								<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
									<p className="text-sm text-yellow-800">
										<span className="hidden sm:inline">
											Help Mode: Hover over any word to see its dictionary form
										</span>
										<span className="sm:hidden">
											Help Mode: Dictionary forms shown below each word
										</span>
									</p>
								</div>
							)}
							{showResults && (
								<div className="mt-2 p-4 bg-indigo-50 rounded-lg">
									<p className="text-lg font-semibold text-indigo-900">
										Score: {getScore().correct} correct, {getScore().incorrect}{" "}
										incorrect
									</p>
									<div className="mt-2 text-sm text-gray-700">
										<p>
											<span className="inline-block w-4 h-4 bg-green-100 border-2 border-green-500 rounded mr-2"></span>
											Correct
										</p>
										<p>
											<span className="inline-block w-4 h-4 bg-red-100 border-2 border-red-500 rounded mr-2"></span>
											Incorrect
										</p>
										<p>
											<span className="inline-block w-4 h-4 bg-orange-100 border-2 border-orange-500 rounded mr-2"></span>
											Missed
										</p>
									</div>
								</div>
							)}
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
							{quizWords.map((word, index) => (
								<div key={index} className="relative group">
									<button
										onClick={() => toggleWord(index)}
										disabled={showResults}
										className={
											"p-4 border-2 rounded-lg transition flex items-center justify-between w-full " +
											getWordStyle(word, index) +
											(showResults ? " cursor-default" : " cursor-pointer")
										}
									>
										<div className="text-left break-words overflow-hidden">
											<div className="font-semibold text-lg text-gray-900 break-words">
												{word.word}
											</div>
											{showResults && (
												<div className="text-xs text-gray-600 mt-1">
													{formatPosTag(
														isCorrectAnswer(word)
															? getMatchingPosTag(word)
															: word.pos,
														word.word,
													)}
												</div>
											)}
										</div>
										{getWordIcon(word, index)}
									</button>
									{helpMode && word.dict && (
										<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
											{word.dict}
											<div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
										</div>
									)}
								</div>
							))}
						</div>

						<div className="flex gap-4">
							{!showResults && (
								<button
									onClick={() => setShowResults(true)}
									className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
								>
									Check Answers
								</button>
							)}
							{showResults && (
								<>
									<button
										onClick={() => {
											setShowResults(false);
											setSelectedWords(new Set());
											startQuiz();
										}}
										className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition flex items-center justify-center gap-2"
									>
										<RefreshCw className="w-5 h-5" />
										New Quiz
									</button>
									<button
										onClick={resetToStart}
										className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
									>
										Change Type
									</button>
								</>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default LatinQuiz;
