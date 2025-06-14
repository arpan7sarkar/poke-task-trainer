
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Star, Crown } from 'lucide-react';

interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  rarity: 'common' | 'rare' | 'legendary';
  dateAcquired: Date;
}

interface PokeBallSelectorProps {
  userLevel: number;
  currentXP: number;
  onPokemonAcquired: (pokemon: Pokemon, xpCost: number) => void;
}

type BallType = 'poke' | 'great' | 'master';

interface BallConfig {
  name: string;
  emoji: string;
  xpCost: number;
  rarityWeights: {
    common: number;
    rare: number;
    legendary: number;
  };
  levelRequired: number;
  color: string;
  icon: React.ReactNode;
  description: string;
}

export const PokeBallSelector = ({ userLevel, currentXP, onPokemonAcquired }: PokeBallSelectorProps) => {
  const [isOpening, setIsOpening] = useState(false);
  const [selectedBall, setSelectedBall] = useState<BallType | null>(null);
  const [lastAcquired, setLastAcquired] = useState<Pokemon | null>(null);

  const ballConfigs: Record<BallType, BallConfig> = {
    poke: {
      name: 'Poké Ball',
      emoji: '⚪',
      xpCost: Math.max(50, userLevel * 15),
      rarityWeights: { common: 0.8, rare: 0.18, legendary: 0.02 },
      levelRequired: 1,
      color: 'from-red-500 to-red-600',
      icon: <Sparkles className="w-4 h-4" />,
      description: 'Basic catch rate'
    },
    great: {
      name: 'Great Ball',
      emoji: '🔵',
      xpCost: Math.max(100, userLevel * 25),
      rarityWeights: { common: 0.6, rare: 0.35, legendary: 0.05 },
      levelRequired: 5,
      color: 'from-blue-500 to-blue-600',
      icon: <Star className="w-4 h-4" />,
      description: 'Better rare chances'
    },
    master: {
      name: 'Master Ball',
      emoji: '🟣',
      xpCost: Math.max(200, userLevel * 40),
      rarityWeights: { common: 0.3, rare: 0.5, legendary: 0.2 },
      levelRequired: 10,
      color: 'from-purple-500 to-purple-600',
      icon: <Crown className="w-4 h-4" />,
      description: 'Legendary guaranteed!'
    }
  };

  const getRandomPokemon = async (ballType: BallType): Promise<Pokemon> => {
    const config = ballConfigs[ballType];
    
    try {
      const random = Math.random();
      let rarity: 'common' | 'rare' | 'legendary' = 'common';
      let rarityQuery = 'rarity:common';
      
      if (random < config.rarityWeights.legendary) {
        rarity = 'legendary';
        rarityQuery = 'rarity:"rare holo"';
      } else if (random < config.rarityWeights.legendary + config.rarityWeights.rare) {
        rarity = 'rare';
        rarityQuery = 'rarity:rare';
      }

      const response = await fetch(
        `https://api.pokemontcg.io/v2/cards?q=${rarityQuery}&pageSize=250`,
        {
          headers: {
            'X-Api-Key': '016c6646-0a4b-4a35-ac11-1a8fa575b403'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch Pokémon data');

      const data = await response.json();
      const cards = data.data;

      if (cards.length === 0) throw new Error('No cards found');

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
      
      // Fallback with weighted probabilities
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

      const random = Math.random();
      let rarity: 'common' | 'rare' | 'legendary' = 'common';
      
      if (random < config.rarityWeights.legendary) {
        rarity = 'legendary';
      } else if (random < config.rarityWeights.legendary + config.rarityWeights.rare) {
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

  const openPokeBall = async (ballType: BallType) => {
    const config = ballConfigs[ballType];
    if (currentXP < config.xpCost || userLevel < config.levelRequired) return;

    setSelectedBall(ballType);
    setIsOpening(true);
    
    try {
      const newPokemon = await getRandomPokemon(ballType);
      
      setTimeout(() => {
        setLastAcquired(newPokemon);
        onPokemonAcquired(newPokemon, config.xpCost);
        setIsOpening(false);
        setSelectedBall(null);
      }, 2000);
    } catch (error) {
      console.error('Error opening Poké Ball:', error);
      setIsOpening(false);
      setSelectedBall(null);
    }
  };

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

  return (
    <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5" />
          <span>Choose Your Poké Ball</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isOpening && selectedBall ? (
          <div className="text-center space-y-4">
            <div className={`text-6xl mb-4 animate-bounce`}>
              {ballConfigs[selectedBall].emoji}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Opening {ballConfigs[selectedBall].name}...</span>
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="h-full bg-white rounded-full animate-pulse" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {(Object.entries(ballConfigs) as [BallType, BallConfig][]).map(([ballType, config]) => {
              const canAfford = currentXP >= config.xpCost;
              const levelMet = userLevel >= config.levelRequired;
              const canUse = canAfford && levelMet;

              return (
                <div
                  key={ballType}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    canUse 
                      ? 'border-white/40 bg-white/20 hover:bg-white/30 cursor-pointer dark:border-white/50 dark:bg-white/10 dark:hover:bg-white/20' 
                      : 'border-white/20 bg-white/10 opacity-60 dark:border-white/30 dark:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{config.emoji}</div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-white">{config.name}</span>
                          {config.icon}
                        </div>
                        <p className="text-sm text-white/90 dark:text-white/80">{config.description}</p>
                        <div className="text-xs text-white/70 dark:text-white/60">
                          Level {config.levelRequired}+ • {config.xpCost} XP
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => openPokeBall(ballType)}
                      disabled={!canUse}
                      className={`bg-gradient-to-r ${config.color} hover:opacity-90 disabled:opacity-40 text-white border-0`}
                      size="sm"
                    >
                      {!levelMet ? `Level ${config.levelRequired}` : 
                       !canAfford ? `Need ${config.xpCost - currentXP} XP` : 
                       'Use'}
                    </Button>
                  </div>
                  
                  {/* Rarity percentages */}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-white/80 dark:text-white/70">Common</div>
                      <div className="font-semibold text-white">{Math.round(config.rarityWeights.common * 100)}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-200 dark:text-blue-300">Rare</div>
                      <div className="font-semibold text-white">{Math.round(config.rarityWeights.rare * 100)}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-200 dark:text-purple-300">Legendary</div>
                      <div className="font-semibold text-white">{Math.round(config.rarityWeights.legendary * 100)}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {lastAcquired && (
          <div className="mt-4 p-4 bg-white/20 dark:bg-white/10 rounded-lg text-center border border-white/30 dark:border-white/20">
            <div className="text-3xl mb-2">
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
            <div className="font-semibold text-lg text-white">{lastAcquired.name}</div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${rarityColors[lastAcquired.rarity]} text-white mt-2`}>
              {rarityLabels[lastAcquired.rarity]}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
