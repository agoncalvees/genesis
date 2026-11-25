import { createFileRoute } from "@tanstack/react-router";
import { Aceiro } from "../features/aceiro/aceiro";
import "../features/aceiro/aceiro.css";

export const Route = createFileRoute("/")({
	staticData: { language: "pt-BR" },
	component: Aceiro,
});
