import { useMemo } from 'react'

interface GameRule {
  type: string
  allowed_values: (string | number)[]
  default: string | number
  description: string
}

interface GameRulesInput {
  [key: string]: GameRule
}

interface ParsedGameSetting {
  key: string
  label: string
  type: string
  availableValues: string[]
  defaultValue: string
  description: string
}

export const useGameSettings = ({
  supported_rules,
  current_rules,
}: {
  supported_rules?: GameRulesInput | null
  current_rules?: Record<string, any>
}): ParsedGameSetting[] => {
  return useMemo(() => {
    if (!supported_rules || typeof supported_rules !== 'object') {
      return []
    }

    return Object.entries(supported_rules).map(([key, rule]) => {
      const gameRule = rule as GameRule
      return {
        key,
        label: key
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        type: gameRule.type || 'string',
        availableValues: (gameRule.allowed_values || []).map(v => String(v)),
        defaultValue: String(gameRule.default || ''),
        description: gameRule.description || '',
      }
    })
  }, [supported_rules])
}
