
import { useState } from 'react';
import { Star, Gift, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  rarity: 'common' | 'rare' | 'legendary';
  dateAcquired: Date;
}

interface PokemonCollectionProps {
  pokemon: Pokemon[];
  userLevel: number;
  currentXP: number;
  onPokemonAcquired: (pokemon: Pokemon) => void;
}

export const PokemonCollection = ({ 
  pokemon, 
  userLevel, 
  currentXP, 
  onPokemonAcquired 
}: PokemonCollectionProps) => {
  const [isOpening, setIsOpening] = useState(false);
  const [lastAcquired, setLastAcquired] = useState<Pokemon | null>(null);

  const xpCost = Math.max(50, userLevel * 25);
  const canAfford = currentXP >= xpCost;

  const rarityColors = {
    common: 'from-gray-400 to-gray-500',
    rare: 'from-blue-400 to-blue-600',
    legendary: 'from-purple-500 to-purple-700'
  };

  const rarityLabels = {
    common: 'Common',
    rare: 'Rare',
    legendary: 'Legendary'
  };

  const getRandomPokemon = async (): Promise<Pokemon> => {
    try {
      // Simple rarity system based on level
      const rarityChances = {
        common: 0.7 - (userLevel * 0.02),
        rare: 0.25 + (userLevel * 0.015),
        legendary: 0.05 + (userLevel * 0.005)
      };

      const random = Math.random();
      let rarity: 'common' | 'rare' | 'legendary' = 'common';
      let rarityQuery = 'rarity:common';
      
      if (random < rarityChances.legendary) {
        rarity = 'legendary';
        rarityQuery = 'rarity:"rare holo"';
      } else if (random < rarityChances.legendary + rarityChances.rare) {
        rarity = 'rare';
        rarityQuery = 'rarity:rare';
      }

      // Fetch random Pokémon card from TCG API
      const response = await fetch(
        `https://api.pokemontcg.io/v2/cards?q=${rarityQuery}&pageSize=250`,
        {
          headers: {
            'X-Api-Key': '016c6646-0a4b-4a35-ac11-1a8fa575b403'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Pokémon data');
      }

      const data = await response.json();
      const cards = data.data;

      if (cards.length === 0) {
        throw new Error('No cards found');
      }

      // Select random card from results
      const randomCard = cards[Math.floor(Math.random() * cards.length)];

      return {
        id: parseInt(randomCard.nationalPokedexNumbers?.[0] || randomCard.id.replace(/\D/g, '') || '1'),
        name: randomCard.name,
        sprite: randomCard.images?.small || randomCard.images?.large || '🎴',
        rarity,
        dateAcquired: new Date()
      };

    } catch (error) {
      console.error('Error fetching Pokémon:', error);
      
      // Fallback to local data if API fails
      const fallbackPokemon = {
        common: [
          { id: 1, name: 'Bulbasaur', sprite: '🌱' },
          { id: 4, name: 'Charmander', sprite: '🔥' },
          { id: 7, name: 'Squirtle', sprite: '💧' },
          { id: 25, name: 'Pikachu', sprite: '⚡' },
        ],
        rare: [
          { id: 150, name: 'Mewtwo', sprite: '🧬' },
          { id: 144, name: 'Articuno', sprite: '❄️' },
          { id: 145, name: 'Zapdos', sprite: '⚡' },
          { id: 146, name: 'Moltres', sprite: '🔥' },
        ],
        legendary: [
          { id: 249, name: 'Lugia', sprite: '🌊' },
          { id: 250, name: 'Ho-Oh', sprite: '🌈' },
          { id: 151, name: 'Mew', sprite: '✨' },
        ]
      };

      const rarityChances = {
        common: 0.7 - (userLevel * 0.02),
        rare: 0.25 + (userLevel * 0.015),
        legendary: 0.05 + (userLevel * 0.005)
      };

      const random = Math.random();
      let rarity: 'common' | 'rare' | 'legendary' = 'common';
      
      if (random < rarityChances.legendary) {
        rarity = 'legendary';
      } else if (random < rarityChances.legendary + rarityChances.rare) {
        rarity = 'rare';
      }

      const availablePokemon = fallbackPokemon[rarity];
      const selectedPokemon = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];

      return {
        ...selectedPokemon,
        rarity,
        dateAcquired: new Date()
      };
    }
  };

  const openPokeBall = async () => {
    if (!canAfford) return;

    setIsOpening(true);
    
    try {
      // Fetch Pokémon data from API
      const newPokemon = await getRandomPokemon();
      
      // Simulate opening animation delay
      setTimeout(() => {
        setLastAcquired(newPokemon);
        onPokemonAcquired(newPokemon);
        setIsOpening(false);
      }, 2000);
    } catch (error) {
      console.error('Error opening Poké Ball:', error);
      setIsOpening(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Poké Ball Opening */}
      <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="w-5 h-5" />
            <span>Mystery Poké Ball</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className={`text-6xl mb-4 ${isOpening ? 'animate-bounce' : ''}`}>
              ⚪
            </div>
            
            {isOpening ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Opening...</span>
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="h-full bg-white rounded-full animate-pulse" style={{ width: '100%' }} />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-red-100">
                  Spend {xpCost} XP to get a random Pokémon!
                </p>
                <Button
                  onClick={openPokeBall}
                  disabled={!canAfford}
                  className="w-full bg-white text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {canAfford ? 'Open Poké Ball!' : `Need ${xpCost - currentXP} more XP`}
                </Button>
              </div>
            )}
          </div>

          {lastAcquired && (
            <div className="mt-4 p-3 bg-white/10 rounded-lg text-center">
              <div className="text-2xl mb-2">
                {lastAcquired.sprite.startsWith('http') ? (
                  <img 
                    src={lastAcquired.sprite} 
                    alt={lastAcquired.name}
                    className="w-16 h-16 mx-auto rounded-lg"
                  />
                ) : (
                  lastAcquired.sprite
                )}
              </div>
              <div className="font-semibold">{lastAcquired.name}</div>
              <div className={`inline-block px-2 py-1 rounded text-xs font-medium bg-gradient-to-r ${rarityColors[lastAcquired.rarity]} text-white mt-1`}>
                {rarityLabels[lastAcquired.rarity]}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pokémon Collection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span>My Collection ({pokemon.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pokemon.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">⚪</div>
              <p className="text-gray-600">No Pokémon yet!</p>
              <p className="text-sm text-gray-500 mt-1">Complete tasks to earn XP and catch your first Pokémon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {pokemon.slice(-6).map((poke, index) => (
                <div
                  key={`${poke.id}-${index}`}
                  className="bg-gray-50 rounded-lg p-3 text-center hover:bg-gray-100 transition-colors"
                >
                  <div className="text-2xl mb-2 flex justify-center">
                    {poke.sprite.startsWith('http') ? (
                      <img 
                        src={poke.sprite} 
                        alt={poke.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      poke.sprite
                    )}
                  </div>
                  <div className="font-medium text-sm text-gray-900">{poke.name}</div>
                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium bg-gradient-to-r ${rarityColors[poke.rarity]} text-white mt-1`}>
                    {rarityLabels[poke.rarity]}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
