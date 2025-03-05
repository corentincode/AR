"use client"

import { useEffect, useRef, useState } from "react"
import { LetterSelector } from "@/components/letter-selector"
import { Button } from "@/components/ui/button"
import { Info, Camera, RefreshCw } from "lucide-react"
import { Loader } from "@/components/ui/loader"

interface ARSceneProps {
  selectedLetter: string
  onSelectLetter: (letter: string) => void
}

export default function ARScene({ selectedLetter, onSelectLetter }: ARSceneProps) {
  const [showInstructions, setShowInstructions] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markerDetected, setMarkerDetected] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "prompt">("prompt")
  const sceneContainerRef = useRef<HTMLDivElement>(null)
  const [scriptLoadAttempt, setScriptLoadAttempt] = useState(0)

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

  // Check camera permissions
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        // Check if navigator.permissions is supported
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: "camera" as PermissionName })
          setCameraPermission(result.state as "granted" | "denied" | "prompt")

          // Listen for permission changes
          result.addEventListener("change", () => {
            setCameraPermission(result.state as "granted" | "denied" | "prompt")
          })
        }
      } catch (err) {
        console.error("Error checking camera permission:", err)
      }
    }

    checkCameraPermission()
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

      // Reload scripts after permission is granted
      setScriptLoadAttempt((prev) => prev + 1)
    } catch (err) {
      console.error("Error requesting camera access:", err)
      setCameraPermission("denied")
      setError(
        "Accès à la caméra refusé. Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur.",
      )
      setLoading(false)
    }
  }

  // Load AR.js and A-Frame scripts manually
  useEffect(() => {
    const loadScripts = async () => {
      try {
        setLoading(true)
        setError(null)

        // Alternative script URLs to try
        const scriptSources = {
          aframe: [
            "https://aframe.io/releases/1.3.0/aframe.min.js",
            "https://cdn.jsdelivr.net/npm/aframe@1.3.0/dist/aframe-master.min.js",
            "https://unpkg.com/aframe@1.3.0/dist/aframe-master.min.js",
          ],
          arjs: [
            "https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js",
            "https://unpkg.com/ar.js@2.3.4/aframe/build/aframe-ar.js",
            "https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@master/aframe/build/aframe-ar.js",
          ],
        }

        // Get the current attempt index (cycle through if we've tried all)
        const attemptIndex = scriptLoadAttempt % scriptSources.aframe.length

        console.log(`Attempting to load scripts (attempt ${scriptLoadAttempt + 1})`)
        console.log(`Using A-Frame source: ${scriptSources.aframe[attemptIndex]}`)
        console.log(`Using AR.js source: ${scriptSources.arjs[attemptIndex]}`)

        // Load A-Frame first
        await loadScript(scriptSources.aframe[attemptIndex])
        console.log("A-Frame loaded successfully")

        // Then load AR.js
        await loadScript(scriptSources.arjs[attemptIndex])
        console.log("AR.js loaded successfully")

        // Initialize AR scene
        initARScene()

        setLoading(false)
      } catch (err) {
        console.error("Error loading scripts:", err)
        setError(
          `Failed to load AR scripts (attempt ${scriptLoadAttempt + 1}). ${err instanceof Error ? err.message : ""}`,
        )
        setLoading(false)
      }
    }

    loadScripts()

    return () => {
      // Clean up any global event listeners if needed
    }
  }, [scriptLoadAttempt])

  // Helper function to load scripts
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        console.log(`Script already loaded: ${src}`)
        resolve()
        return
      }

      const script = document.createElement("script")
      script.src = src
      script.crossOrigin = "anonymous"

      // Set a timeout to reject if loading takes too long
      const timeoutId = setTimeout(() => {
        reject(new Error(`Script load timeout: ${src}`))
      }, 10000) // 10 seconds timeout

      script.onload = () => {
        clearTimeout(timeoutId)
        resolve()
      }

      script.onerror = () => {
        clearTimeout(timeoutId)
        reject(new Error(`Failed to load script: ${src}`))
      }

      document.head.appendChild(script)
    })
  }

  // Initialize AR scene
  const initARScene = () => {
    if (!sceneContainerRef.current) return

    // Clear previous scene if any
    while (sceneContainerRef.current.firstChild) {
      sceneContainerRef.current.removeChild(sceneContainerRef.current.firstChild)
    }

    try {
      // Check if AFRAME is defined
      if (typeof window.AFRAME === "undefined") {
        throw new Error("A-Frame not loaded properly")
      }

      // Create a-scene element
      const scene = document.createElement("a-scene")
      scene.setAttribute("embedded", "")
      scene.setAttribute("vr-mode-ui", "enabled: false")
      scene.setAttribute("renderer", "logarithmicDepthBuffer: true")
      scene.setAttribute("arjs", "trackingMethod: best; sourceType: webcam; debugUIEnabled: false;")
      scene.style.position = "absolute"
      scene.style.top = "0"
      scene.style.left = "0"
      scene.style.width = "100%"
      scene.style.height = "100%"
      scene.style.zIndex = "1"

      // Create a-marker element
      const marker = document.createElement("a-marker")
      marker.setAttribute("preset", "hiro")
      marker.setAttribute("emitevents", "true")
      marker.setAttribute("id", "hiro-marker")

      // Add event listeners for marker detection
      marker.addEventListener("markerFound", () => {
        console.log("Marker found!")
        setMarkerDetected(true)
      })

      marker.addEventListener("markerLost", () => {
        console.log("Marker lost!")
        setMarkerDetected(false)
      })

      // Create a-entity for the model
      const modelEntity = document.createElement("a-entity")
      modelEntity.setAttribute("id", "pokemon-model")
      modelEntity.setAttribute("position", "0 0 0")
      modelEntity.setAttribute("rotation", "0 0 0")
      modelEntity.setAttribute("scale", "0.5 0.5 0.5")
      modelEntity.setAttribute("gltf-model", letterModelMap[selectedLetter].url)

      // Add model to marker
      marker.appendChild(modelEntity)

      // Add text label for the Pokémon name
      const textEntity = document.createElement("a-text")
      textEntity.setAttribute("value", letterModelMap[selectedLetter].name)
      textEntity.setAttribute("position", "0 -0.5 0")
      textEntity.setAttribute("align", "center")
      textEntity.setAttribute("color", "white")
      textEntity.setAttribute("scale", "0.5 0.5 0.5")
      marker.appendChild(textEntity)

      // Add letter label
      const letterEntity = document.createElement("a-text")
      letterEntity.setAttribute("value", selectedLetter)
      letterEntity.setAttribute("position", "0 0.5 0")
      letterEntity.setAttribute("align", "center")
      letterEntity.setAttribute("color", "#4285f4")
      letterEntity.setAttribute("scale", "1 1 1")
      marker.appendChild(letterEntity)

      // Add camera with specific attributes
      const camera = document.createElement("a-entity")
      camera.setAttribute("camera", "")
      camera.setAttribute("position", "0 0 0")

      // Add marker and camera to scene
      scene.appendChild(marker)
      scene.appendChild(camera)

      // Add scene to container
      sceneContainerRef.current.appendChild(scene)
    } catch (err) {
      console.error("Error initializing AR scene:", err)
      setError(`Failed to initialize AR scene: ${err instanceof Error ? err.message : ""}`)
    }
  }

  // Update model when selected letter changes
  useEffect(() => {
    if (loading || error) return

    try {
      const modelEntity = document.getElementById("pokemon-model")
      if (modelEntity) {
        modelEntity.setAttribute("gltf-model", letterModelMap[selectedLetter].url)
      }

      const textEntities = document.querySelectorAll("a-text")
      if (textEntities.length >= 1) {
        textEntities[0].setAttribute("value", letterModelMap[selectedLetter].name)
      }

      if (textEntities.length >= 2) {
        textEntities[1].setAttribute("value", selectedLetter)
      }
    } catch (err) {
      console.error("Error updating model:", err)
    }
  }, [selectedLetter, loading, error])

  // Handle retry
  const handleRetry = () => {
    setScriptLoadAttempt((prev) => prev + 1)
  }

  // Show camera permission request if needed
  if (cameraPermission === "prompt" || cameraPermission === "denied") {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-black p-4 text-white">
        <Camera className="h-16 w-16 text-blue-500" />
        <h2 className="text-2xl font-bold">Accès à la caméra requis</h2>
        <p className="max-w-md text-center">
          Cette application AR nécessite l'accès à votre caméra pour fonctionner. Veuillez autoriser l'accès à la caméra
          lorsque vous y êtes invité.
        </p>
        <Button onClick={requestCameraAccess} className="mt-4" size="lg">
          Autoriser l'accès à la caméra
        </Button>
        {cameraPermission === "denied" && (
          <p className="mt-2 text-center text-red-400">
            L'accès à la caméra a été refusé. Veuillez modifier les paramètres de votre navigateur pour autoriser
            l'accès.
          </p>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader text="Chargement de l'expérience AR..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-black p-4 text-white">
        <h2 className="text-xl font-bold text-red-500">Erreur</h2>
        <p className="text-center">{error}</p>
        <div className="flex gap-4">
          <Button onClick={handleRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Réessayer avec une autre source
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline">
            Rafraîchir la page
          </Button>
        </div>

        {/* Fallback content */}
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
                onClick={() => onSelectLetter(letter)}
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
    <>
      {/* AR Scene Container */}
      <div ref={sceneContainerRef} className="h-full w-full" />

      {/* Instructions Overlay */}
      {showInstructions && (
        <div className="absolute left-0 top-0 z-20 flex h-full w-full flex-col items-center justify-center bg-black/70 p-4 text-white">
          <div className="max-w-md rounded-lg bg-black/80 p-6 backdrop-blur">
            <h2 className="mb-4 text-xl font-bold">Visualiseur AR Pokémon</h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>Autorisez l'accès à votre caméra</li>
              <li>Pointez votre caméra vers un marqueur Hiro</li>
              <li>Un modèle 3D de Pokémon apparaîtra sur le marqueur</li>
              <li>Utilisez le sélecteur en bas pour changer de Pokémon</li>
            </ol>
            <div className="mt-4 flex justify-center">
              <img
                src="https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png"
                alt="Marqueur Hiro"
                className="h-32 w-32 border border-white/20"
              />
            </div>
            <Button className="mt-4 w-full" onClick={() => setShowInstructions(false)}>
              Commencer
            </Button>
          </div>
        </div>
      )}

      {/* Info Button */}
      {!showInstructions && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-4 z-10 bg-black/50 text-white hover:bg-black/70"
          onClick={() => setShowInstructions(true)}
        >
          <Info className="h-4 w-4" />
        </Button>
      )}

      {/* Marker Status Indicator */}
      <div
        className={`absolute left-1/2 top-4 z-10 -translate-x-1/2 transform rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
          markerDetected ? "bg-green-500/80 text-white" : "bg-red-500/80 text-white"
        }`}
      >
        {markerDetected ? "Marqueur détecté" : "Recherche de marqueur..."}
      </div>

      {/* Letter Selector */}
      <div className="absolute bottom-0 left-0 z-10 w-full">
        <LetterSelector
          selectedLetter={selectedLetter}
          onSelectLetter={onSelectLetter}
          availableLetters={Object.keys(letterModelMap)}
        />
      </div>
    </>
  )
}

