"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { ARButton } from "three/examples/jsm/webxr/ARButton"
import { getModelForLetter } from "@/lib/model-loader"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"

interface ARViewerProps {
  selectedLetter: string
}

export default function ARViewer({ selectedLetter }: ARViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const modelRef = useRef<THREE.Group | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const arButtonRef = useRef<HTMLElement | null>(null) // Added arButtonRef
  const [showInstructions, setShowInstructions] = useState(true)
  const [arStarted, setArStarted] = useState(false)
  const [isARMode, setIsARMode] = useState(false)

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return

    // Create scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5
    cameraRef.current = camera

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.xr.enabled = true
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Add controls for non-AR mode
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controlsRef.current = controls

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(0, 10, 5)
    scene.add(directionalLight)

    // Add AR button to the DOM
    try {
      const arButton = ARButton.createButton(renderer, {
        optionalFeatures: ["dom-overlay"],
        domOverlay: { root: document.body },
      })
      arButton.style.position = "absolute"
      arButton.style.top = "10px"
      arButton.style.right = "10px"
      arButton.style.zIndex = "100"
      arButton.addEventListener("click", () => {
        setArStarted(true)
        setIsARMode(true)
        setShowInstructions(false)
      })
      document.body.appendChild(arButton)
      arButtonRef.current = arButton // Added arButtonRef assignment
    } catch (error) {
      console.error("AR not supported:", error)
    }

    // Handle window resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(window.innerWidth, window.innerHeight)
      }
    }
    window.addEventListener("resize", handleResize)

    // Animation loop
    renderer.setAnimationLoop(() => {
      if (controlsRef.current && !isARMode) {
        controlsRef.current.update()
      }

      if (modelRef.current) {
        modelRef.current.rotation.y += 0.01
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    })

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      if (rendererRef.current) {
        rendererRef.current.setAnimationLoop(null)
        rendererRef.current.dispose()
      }
      if (arButtonRef.current && document.body.contains(arButtonRef.current)) {
        // Updated cleanup
        document.body.removeChild(arButtonRef.current)
      }
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
      }
    }
  }, [isARMode]) // Added isARMode to dependencies

  // Update AR mode state
  useEffect(() => {
    const handleARStart = () => {
      setIsARMode(true)
    }

    const handleAREnd = () => {
      setIsARMode(false)
    }

    if (rendererRef.current) {
      rendererRef.current.xr.addEventListener("sessionstart", handleARStart)
      rendererRef.current.xr.addEventListener("sessionend", handleAREnd)
    }

    return () => {
      if (rendererRef.current) {
        rendererRef.current.xr.removeEventListener("sessionstart", handleARStart)
        rendererRef.current.xr.removeEventListener("sessionend", handleAREnd)
      }
    }
  }, [])

  // Load model when selected letter changes
  useEffect(() => {
    if (!sceneRef.current) return

    // Remove previous model if exists
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current)
      modelRef.current = null
    }

    // Load new model based on selected letter
    const loadModel = async () => {
      try {
        const model = await getModelForLetter(selectedLetter)
        if (model && sceneRef.current) {
          // Add model to the scene
          sceneRef.current.add(model)
          modelRef.current = model
        }
      } catch (error) {
        console.error("Error loading model:", error)
      }
    }

    loadModel()
  }, [selectedLetter])

  return (
    <div ref={containerRef} className="h-full w-full">
      {showInstructions && !arStarted && (
        <div className="absolute left-0 top-0 z-20 flex h-full w-full flex-col items-center justify-center bg-black/70 p-4 text-white">
          <div className="max-w-md rounded-lg bg-black/80 p-6 backdrop-blur">
            <h2 className="mb-4 text-xl font-bold">AR Pokémon Alphabet Viewer</h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>Click "Start AR" to begin the experience</li>
              <li>Point your camera at a flat surface</li>
              <li>Use the letter selector at the bottom to change Pokémon models</li>
              <li>Special Pokémon are available for letters V, F, J, E, G, and L</li>
            </ol>
            <Button className="mt-4 w-full" onClick={() => setShowInstructions(false)}>
              Got it
            </Button>
          </div>
        </div>
      )}

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
    </div>
  )
}

