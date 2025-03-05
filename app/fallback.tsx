"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LetterSelector } from "@/components/letter-selector"

export default function FallbackView() {
  const [selectedLetter, setSelectedLetter] = useState("V")

  const letterModelMap: Record<string, { url: string; name: string }> = {
    V: {
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pokedex_3d_pro_vaporeon-lu4Sdtq7SlzJwGKeWqITsTRDRIs4xv.glb",
      name: "Vaporeon",
    },
    F: {
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pokedex_3d_pro_flareon-ha6lLa8iAKSulkAgu5sby1mvilmWui.glb",
      name: "Flareon",
    },
    J: {
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pokedex_3d_pro_jolteon-Chq0i0bWWUsgJR3mi0Qg7qF3yBQpgm.glb",
      name: "Jolteon",
    },
    E: {
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pokedex_3d_pro_espeon-aqxxplrVA2dMeoC3cHPWinJuiSDcrg.glb",
      name: "Espeon",
    },
    G: {
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pokedex_3d_pro_glaceon-7VWYKqy58HMQTN0k2WdnksUDQQTSiL.glb",
      name: "Glaceon",
    },
    L: {
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pokedex_3d_pro_leafeon-JHXyPt5E1MNXhJJQqNGtkI1e6gpuPI.glb",
      name: "Leafeon",
    },
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-black p-4 text-white">
      <div className="max-w-md rounded-lg bg-gray-900 p-6">
        <h1 className="mb-4 text-2xl font-bold">Mode Fallback</h1>
        <p className="mb-4">
          L'expérience AR n'a pas pu être chargée. Voici une vue alternative des Pokémon disponibles.
        </p>

        <div className="mb-6 flex flex-col items-center justify-center">
          <div className="mb-2 text-xl font-bold">{letterModelMap[selectedLetter].name}</div>
          <div className="text-6xl font-bold text-blue-500">{selectedLetter}</div>
        </div>

        <div className="mb-4">
          <img
            src="https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png"
            alt="Marqueur Hiro"
            className="mx-auto h-32 w-32 border border-white/20"
          />
          <p className="mt-2 text-center text-sm text-gray-400">Imprimez ce marqueur Hiro pour l'expérience AR</p>
        </div>

        <Button className="mb-4 w-full" onClick={() => window.location.reload()}>
          Réessayer l'expérience AR
        </Button>

        <LetterSelector
          selectedLetter={selectedLetter}
          onSelectLetter={setSelectedLetter}
          availableLetters={Object.keys(letterModelMap)}
        />
      </div>
    </div>
  )
}

