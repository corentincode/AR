"use client"

import { useState, useEffect } from "react"
import { Loader } from "@/components/ui/loader"
import { Button } from "@/components/ui/button"
import { ChevronRight, Download, Play, Scan, BookOpen, Layers } from "lucide-react"
import Head from "next/head"

export default function Home() {
  const [selectedLetter, setSelectedLetter] = useState("A")
  const [loading, setLoading] = useState(true)
  const [showInstructions, setShowInstructions] = useState(true)
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "prompt">("prompt")
  const [arSupported, setArSupported] = useState(true)
  const [activeTab, setActiveTab] = useState("home")

  // Map letters to animal models
  const letterModelMap: Record<string, { url: string; name: string; category: string }> = {
    A: { url: "/alpaca.glb", name: "Alpaga", category: "mammals" },
    B: { url: "/buffalo.glb", name: "Buffalo", category: "mammals" },
    C: { url: "/dog.glb", name: "Chien", category: "mammals" },
    D: { url: "/dolphin.glb", name: "Dauphin", category: "aquatic" },
    E: { url: "/elefant.glb", name: "Elephant", category: "mammals" },
    F: { url: "/flamant.glb", name: "Flamant", category: "birds" },
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
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-950 to-slate-900">
        <Loader text="Initialisation..." />
      </div>
    )
  }

  if (!arSupported) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-indigo-950 to-slate-900 p-4 text-white">
        <h2 className="text-xl font-bold text-red-500">Appareil non compatible</h2>
        <p className="text-center">
          Votre navigateur ou appareil ne prend pas en charge les fonctionnalités WebGL ou caméra nécessaires pour cette
          expérience AR.
        </p>
        <div className="mt-8 max-w-md rounded-lg bg-slate-800/80 p-6 backdrop-blur">
          <h3 className="mb-4 text-lg font-bold">Animaux disponibles</h3>
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
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 text-white overflow-auto">
      <Head>
        <title>AR Alphabet Animaux</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              AR Alphabet Animaux
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("home")}
                className={`px-3 py-1 rounded-full text-sm transition-all ${activeTab === "home" ? "bg-blue-600 text-white" : "text-white/70 hover:text-white"}`}
              >
                Accueil
              </button>
              <button
                onClick={() => setActiveTab("how")}
                className={`px-3 py-1 rounded-full text-sm transition-all ${activeTab === "how" ? "bg-blue-600 text-white" : "text-white/70 hover:text-white"}`}
              >
                Comment ça marche
              </button>
              <button
                onClick={() => setActiveTab("animals")}
                className={`px-3 py-1 rounded-full text-sm transition-all ${activeTab === "animals" ? "bg-blue-600 text-white" : "text-white/70 hover:text-white"}`}
              >
                Animaux
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="relative py-16 mb-16">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-600/20 blur-3xl"></div>
            <div className="absolute top-40 -left-20 w-72 h-72 rounded-full bg-indigo-600/10 blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-40 h-40 rounded-full bg-blue-600/20 blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="block mb-2">Découvrez l'alphabet</span>
                <span className="bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-400 bg-clip-text text-transparent">
                  en réalité augmentée
                </span>
              </h1>

              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto lg:mx-0">
                Une expérience éducative et ludique pour apprendre l'alphabet avec des animaux en 3D qui prennent vie
                devant vos yeux.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  onClick={requestCameraAccess}
                  size="lg"
                  className="group relative overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-blue-500/25"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Démarrer l'expérience <Play className="h-5 w-5" />
                  </span>
                  <span className="absolute inset-0 z-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                </Button>

                <a
                  href="https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png"
                  download
                  className="flex items-center justify-center gap-2 rounded-full bg-white/10 border border-white/20 px-6 py-3 font-medium text-white transition-all duration-300 hover:bg-white/20"
                >
                  <Download className="h-5 w-5" /> Télécharger le marqueur
                </a>
              </div>

              {cameraPermission === "denied" && (
                <p className="mt-4 text-center lg:text-left text-red-400">
                  L'accès à la caméra a été refusé. Veuillez modifier les paramètres de votre navigateur.
                </p>
              )}
            </div>

            <div className="lg:w-1/2 flex justify-center">
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-500/30 to-indigo-500/30 blur-xl"></div>

                <div className="relative flex items-center justify-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl">
                  <img
                    src="https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png"
                    alt="Marqueur Hiro"
                    className="w-64 h-64 object-cover rounded-xl border-2 border-white/20 shadow-lg transition-transform duration-500 hover:scale-105"
                  />

                  {/* Floating animal emojis */}
                  <div className="absolute -top-6 -right-6 w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-3xl animate-bounce shadow-lg">
                    🦁
                  </div>
                  <div
                    className="absolute -bottom-6 -left-6 w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-3xl animate-bounce shadow-lg"
                    style={{ animationDelay: "0.5s" }}
                  >
                    🐘
                  </div>
                  <div
                    className="absolute top-1/2 -right-8 transform -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-2xl animate-bounce shadow-lg"
                    style={{ animationDelay: "1s" }}
                  >
                    🦒
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                Une expérience immersive
              </span>
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Découvrez les fonctionnalités qui rendent cette application unique et engageante pour tous les âges.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Layers className="h-8 w-8 text-blue-400" />,
                title: "Alphabet complet",
                description: "Explorez les 26 lettres de l'alphabet, chacune associée à un animal différent en 3D.",
              },
              {
                icon: <Scan className="h-8 w-8 text-indigo-400" />,
                title: "Réalité augmentée",
                description: "Les modèles 3D prennent vie devant vos yeux grâce à la technologie de réalité augmentée.",
              },
              {
                icon: <BookOpen className="h-8 w-8 text-blue-400" />,
                title: "Apprentissage ludique",
                description:
                  "Une façon amusante et interactive d'apprendre l'alphabet et de découvrir le monde animal.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="relative group p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:border-blue-500/30"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-t-2xl"></div>
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                Comment ça marche ?
              </span>
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Suivez ces étapes simples pour commencer votre expérience en réalité augmentée.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-blue-500/30 transform -translate-y-1/2 hidden md:block"></div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: 1,
                  title: "Imprimez le marqueur",
                  description:
                    "Téléchargez et imprimez le marqueur Hiro qui servira de base pour la réalité augmentée.",
                },
                {
                  step: 2,
                  title: "Lancez l'expérience",
                  description: 'Cliquez sur le bouton "Démarrer" et autorisez l\'accès à votre caméra.',
                },
                {
                  step: 3,
                  title: "Pointez votre caméra",
                  description: "Dirigez votre caméra vers le marqueur imprimé pour voir apparaître les animaux en 3D.",
                },
                {
                  step: 4,
                  title: "Explorez l'alphabet",
                  description: "Naviguez entre les différentes lettres pour découvrir tous les animaux.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="relative z-10 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:-translate-y-2 hover:bg-white/10"
                >
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-lg font-bold shadow-lg">
                    {item.step}
                  </div>
                  <div className="pt-6">
                    <h3 className="text-xl font-semibold mb-3 text-center">{item.title}</h3>
                    <p className="text-white/70 text-center">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Animal Preview */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                Aperçu des animaux
              </span>
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Découvrez quelques-uns des animaux disponibles dans notre alphabet AR.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(letterModelMap).map(([letter, animal]) => (
              <div
                key={letter}
                className="group p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:border-blue-500/30 flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                    {letter}
                  </span>
                </div>
                <div className="text-sm text-white/80">{animal.name}</div>
              </div>
            ))}
            {/* Placeholder animals to fill the grid */}
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:border-blue-500/30 flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    {String.fromCharCode(71 + index)} {/* Starting from G */}
                  </span>
                </div>
                <div className="text-sm text-white/80">À découvrir</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-20">
          <div className="relative p-8 md:p-12 rounded-3xl overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 backdrop-blur-md"></div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-2/3">
                <h2 className="text-3xl font-bold mb-4">Prêt à commencer l'aventure ?</h2>
                <p className="text-white/80 mb-0 max-w-xl">
                  Lancez l'expérience AR maintenant et découvrez le monde animal en 3D. N'oubliez pas d'imprimer votre
                  marqueur !
                </p>
              </div>
              <div className="md:w-1/3 flex justify-center">
                <Button
                  onClick={requestCameraAccess}
                  size="lg"
                  className="group relative overflow-hidden rounded-full bg-white px-8 py-6 text-lg font-semibold text-blue-600 shadow-lg transition-all duration-300 hover:shadow-white/25"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Démarrer maintenant{" "}
                    <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-white/10 text-center text-white/60">
          <p>© 2023 AR Alphabet Animaux. Tous droits réservés.</p>
          <p className="mt-2">Une expérience éducative en réalité augmentée pour tous les âges.</p>
        </footer>
      </div>
    </div>
  )
}

