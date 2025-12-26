"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { sendVote, getRanking } from "../lib/api";

const initialGifts = [
  "Lego", "Cuffie", "Libro", "Calzini", "Tazza",
  "Bottiglia", "Cioccolato", "Gioco", "Candela", "Agenda"
];

export default function Home() {
  const [user, setUser] = useState("");
  const [gifts, setGifts] = useState(initialGifts);
  const [ranking, setRanking] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRanking() {
      const data = await getRanking();
      setRanking(data);
    }
    fetchRanking();
  }, []);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(gifts);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setGifts(items);
  };

  const handleSubmit = async () => {
    if (!user) return alert("Inserisci il tuo nome");
    try {
      await sendVote(user, gifts);
      alert("Voti salvati!");
      const data = await getRanking();
      setRanking(data);
    } catch (err) {
      console.error(err);
      alert("Errore nell'invio");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🎁 Secret Santa</h1>
      <input
        type="text"
        placeholder="Il tuo nome"
        value={user}
        onChange={(e) => setUser(e.target.value)}
        style={{ marginBottom: "1rem" }}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="gifts">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {gifts.map((gift, index) => (
                <Draggable key={gift} draggableId={gift} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        userSelect: "none",
                        padding: 16,
                        margin: "0 0 8px 0",
                        minHeight: "50px",
                        backgroundColor: "#4caf50",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        ...provided.draggableProps.style,
                      }}
                    >
                      <span>{index + 1}. {gift}</span>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button onClick={handleSubmit} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
        Invia
      </button>

      <h2 style={{ marginTop: "2rem" }}>🏆 Classifica finale</h2>
      <ul>
        {ranking.map((r: any, i: number) => (
          <li key={i}>{r.user}: {r.score}</li>
        ))}
      </ul>
    </div>
  );
}
