import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import LatinQuiz from "../latin-quiz-tool";

const parseTSV = (text: string) => {
	const lines = text.trim().split("\n");
	return lines.slice(1).map((line) => {
		const values = line.split("\t").map((v) => v.trim());
		return {
			word: values[0] || "",
			pos: values[1] || "",
			dict: values[2] || "",
			weight: values[3] || "",
			total: parseInt(values[4]) || 0,
			type: values[5] || "",
		};
	});
};

function App() {
	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetch(`${import.meta.env.BASE_URL}data/spans_data_cleaned.tsv`)
			.then((res) => {
				if (!res.ok) throw new Error("Failed to load data file");
				return res.text();
			})
			.then((text) => {
				const parsed = parseTSV(text);
				setData(parsed);
				setLoading(false);
			})
			.catch((err) => {
				setError(err.message);
				setLoading(false);
			});
	}, []);

	return <LatinQuiz data={data} loading={loading} error={error} />;
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
