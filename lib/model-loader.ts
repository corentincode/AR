import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader"

// Cache for loaded models
const modelCache = new Map<string, THREE.Group>()

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

// Default model for letters without specific models
const DEFAULT_MODEL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pokedex_3d_pro_vaporeon-lu4Sdtq7SlzJwGKeWqITsTRDRIs4xv.glb"

// Initialize loaders
const gltfLoader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.5/")
gltfLoader.setDRACOLoader(dracoLoader)
const fontLoader = new FontLoader()

/**
 * Load a 3D model for a specific letter
 */
export async function getModelForLetter(letter: string): Promise<THREE.Group> {
  const upperLetter = letter.toUpperCase()

  // Return from cache if available
  if (modelCache.has(upperLetter)) {
    return modelCache.get(upperLetter)!.clone()
  }

  // Create a group to hold both the letter and the 3D model
  const group = new THREE.Group()

  try {
    // Get model info for the letter or use default
    const modelInfo = letterModelMap[upperLetter] || {
      url: DEFAULT_MODEL,
      name: `Model ${upperLetter}`,
    }

    // Load the 3D model
    const gltf = await loadGLTFModel(modelInfo.url)

    // Add name label
    const nameLabel = createTextMesh(modelInfo.name, 0.1, 0xffffff)
    nameLabel.position.set(0, -0.5, 0)
    group.add(nameLabel)

    // Add letter label
    const letterLabel = createTextMesh(upperLetter, 0.2, getColorForLetter(upperLetter))
    letterLabel.position.set(-0.5, -0.5, 0)
    group.add(letterLabel)

    // Center and scale the model
    const box = new THREE.Box3().setFromObject(gltf.scene)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())

    // Normalize the model size
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 1 / maxDim
    gltf.scene.scale.set(scale, scale, scale)

    // Center the model
    gltf.scene.position.sub(center.multiplyScalar(scale))
    gltf.scene.position.y += 0.5 // Lift it above the letter

    // Add the model to the group
    group.add(gltf.scene)

    // Cache the group
    modelCache.set(upperLetter, group.clone())

    return group
  } catch (error) {
    console.error(`Error loading model for letter ${upperLetter}:`, error)

    // Create a fallback cube with the letter on it
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({
      color: getColorForLetter(upperLetter),
    })
    const cube = new THREE.Mesh(geometry, material)

    // Add letter to the cube
    const letterLabel = createTextMesh(upperLetter, 0.5, 0xffffff)
    letterLabel.position.set(-0.25, 0, 0.51)
    cube.add(letterLabel)

    group.add(cube)

    // Cache the fallback
    modelCache.set(upperLetter, group.clone())

    return group
  }
}

/**
 * Load a GLTF model
 */
function loadGLTFModel(url: string): Promise<THREE.GLTF> {
  return new Promise((resolve, reject) => {
    gltfLoader.load(
      url,
      (gltf) => resolve(gltf),
      undefined,
      (error) => reject(error),
    )
  })
}

/**
 * Create a text mesh without using TextGeometry
 */
function createTextMesh(text: string, size: number, color: number): THREE.Mesh {
  // Create a canvas to render the text
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")
  if (!context) {
    throw new Error("Could not get canvas context")
  }

  // Set canvas size
  canvas.width = 256
  canvas.height = 128

  // Draw text on canvas
  context.fillStyle = "white"
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = "#" + color.toString(16).padStart(6, "0")
  context.font = "Bold 80px Arial"
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.fillText(text, canvas.width / 2, canvas.height / 2)

  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true

  // Create material with the texture
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
  })

  // Create plane geometry for the text
  const geometry = new THREE.PlaneGeometry(size * 2, size)

  // Create mesh with geometry and material
  return new THREE.Mesh(geometry, material)
}

/**
 * Get a color for a letter
 */
function getColorForLetter(letter: string): number {
  const colors = [
    0xff0000, // red
    0xff7f00, // orange
    0xffff00, // yellow
    0x00ff00, // green
    0x0000ff, // blue
    0x4b0082, // indigo
    0x9400d3, // violet
    0xff1493, // pink
    0x00ffff, // cyan
    0xff00ff, // magenta
  ]

  // Map letter to a color based on its position in the alphabet
  const index = letter.charCodeAt(0) - 65 // A is 65 in ASCII
  return colors[index % colors.length]
}

