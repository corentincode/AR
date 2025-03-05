"use client"

import { useState, useEffect } from "react"
import { Loader } from "@/components/ui/loader"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"
import Head from "next/head"

export default function Home() {
  const [selectedLetter, setSelectedLetter] = useState("V")
  const [loading, setLoading] = useState(true)
  const [showInstructions, setShowInstructions] = useState(true)
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "prompt">("prompt")
  const [arSupported, setArSupported] = useState(true)

  // Map letters to Pokémon models
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

  // Check browser compatibility
  useEffect(() => {
    // Check if WebGL is supported
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")

    if (!gl) {
      setArSupported(false)
      setLoading(false)
      return
    }

    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setArSupported(false)
      setLoading(false)
      return
    }

    setLoading(false)
  }, [])

  // Request camera access explicitly
  const requestCameraAccess = async () => {
    try {
      setLoading(true)
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })

      // Stop the stream immediately, we just needed the permission
      stream.getTracks().forEach((track) => track.stop())

      setCameraPermission("granted")
      setLoading(false)

      // Redirect to AR experience
      window.location.href = "/ar-experience.html"
    } catch (err) {
      console.error("Error requesting camera access:", err)
      setCameraPermission("denied")
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader text="Initialisation..." />
      </div>
    )
  }

  if (!arSupported) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-black p-4 text-white">
        <h2 className="text-xl font-bold text-red-500">Appareil non compatible</h2>
        <p className="text-center">
          Votre navigateur ou appareil ne prend pas en charge les fonctionnalités WebGL ou caméra nécessaires pour cette
          expérience AR.
        </p>
        <div className="mt-8 max-w-md rounded-lg bg-gray-900 p-6">
          <h3 className="mb-4 text-lg font-bold">Pokémon disponibles</h3>
          <div className="mb-4 flex flex-col items-center">
            <div className="text-lg font-medium">{letterModelMap[selectedLetter].name}</div>
            <div className="text-4xl font-bold text-blue-500">{selectedLetter}</div>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {Object.keys(letterModelMap).map((letter) => (
              <Button
                key={letter}
                variant={selectedLetter === letter ? "default" : "outline"}
                className={`h-10 w-10 text-lg font-bold ${
                  selectedLetter === letter
                    ? "bg-primary text-primary-foreground"
                    : "bg-black/50 text-white hover:bg-black/70"
                }`}
                onClick={() => setSelectedLetter(letter)}
              >
                {letter}
              </Button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-black p-4 text-white">
      <Head>
        <title>AR Pokémon Alphabet</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <div className="max-w-md rounded-lg bg-black/80 p-6 backdrop-blur">
        <h2 className="mb-4 text-xl font-bold">Visualiseur AR Pokémon</h2>

        <div className="mb-6 flex flex-col items-center">
          <Camera className="mb-4 h-16 w-16 text-blue-500" />
          <p className="text-center">
            Cette application AR nécessite l'accès à votre caméra pour fonctionner. Vous serez redirigé vers
            l'expérience AR après avoir autorisé l'accès.
          </p>
        </div>

        <ol className="mb-6 list-decimal space-y-2 pl-5">
          <li>Cliquez sur le bouton ci-dessous pour autoriser l'accès à la caméra</li>
          <li>Pointez votre caméra vers un marqueur Hiro</li>
          <li>Un modèle 3D de Pokémon apparaîtra sur le marqueur</li>
          <li>Utilisez le sélecteur pour changer de Pokémon</li>
        </ol>

        <div className="mb-6 flex justify-center">
          <img
            src="https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png"
            alt="Marqueur Hiro"
            className="h-32 w-32 border border-white/20"
          />
        </div>

        <Button className="w-full" size="lg" onClick={requestCameraAccess}>
          Démarrer l'expérience AR
        </Button>

        {cameraPermission === "denied" && (
          <p className="mt-4 text-center text-red-400">
            L'accès à la caméra a été refusé. Veuillez modifier les paramètres de votre navigateur pour autoriser
            l'accès.
          </p>
        )}
      </div>
    </div>
  )
}

