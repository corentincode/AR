"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface LetterSelectorProps {
  selectedLetter: string
  onSelectLetter: (letter: string) => void
  availableLetters: string[]
}

export function LetterSelector({ selectedLetter, onSelectLetter, availableLetters }: LetterSelectorProps) {
  const pokemonNames: Record<string, string> = {
    V: "Vaporeon",
    F: "Flareon",
    J: "Jolteon",
    E: "Espeon",
    G: "Glaceon",
    L: "Leafeon",
  }

  // Get current index
  const currentIndex = availableLetters.indexOf(selectedLetter)

  // Get previous letter
  const getPrevLetter = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : availableLetters.length - 1
    return availableLetters[prevIndex]
  }

  // Get next letter
  const getNextLetter = () => {
    const nextIndex = currentIndex < availableLetters.length - 1 ? currentIndex + 1 : 0
    return availableLetters[nextIndex]
  }

  return (
    <div className="w-full bg-black/80 p-4 backdrop-blur-md">
      <div className="mx-auto max-w-md">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-2 text-center text-sm font-medium text-white">{pokemonNames[selectedLetter]}</div>

          <div className="flex w-full items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 bg-black/50 text-white hover:bg-black/70"
              onClick={() => onSelectLetter(getPrevLetter())}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-white">{selectedLetter}</div>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 bg-black/50 text-white hover:bg-black/70"
              onClick={() => onSelectLetter(getNextLetter())}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-6 gap-2">
            {availableLetters.map((letter) => (
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
    </div>
  )
}

