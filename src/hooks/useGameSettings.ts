import { useMemo } from 'react'

export interface SupportedRule {
  type: string
  min?: number | null
  max?: number | null
  default: any
  description: string
}

export interface GameSettingsInput {
  supported_rules?: Record<string, SupportedRule>
  current_rules?: Record<string, any>
}

export interface SettingConfig {
  label: string
  key: string
  availableValues: string[]
  defaultValue: string
  type: 'select' | 'range'
  description: string
}

export const useGameSettings = (gameInfo: GameSettingsInput | null) => {
  const gameSettings = useMemo(() => {
    if (!gameInfo?.supported_rules) return []

    const settings: SettingConfig[] = []

    Object.entries(gameInfo.supported_rules).forEach(([key, rule]) => {
      const label = key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      if (rule.type === 'integer' && rule.min !== null && rule.min !== undefined && rule.max !== null && rule.max !== undefined) {
        // Generate range of integers
        const values: string[] = []
        for (let i = rule.min; i <= rule.max; i++) {
          values.push(String(i))
        }

        settings.push({
          label,
          key,
          availableValues: values,
          defaultValue: String(rule.default),
          type: 'range',
          description: rule.description,
        })
      } else if (rule.type === 'string') {
        // For string types, we need to infer possible values from the description or default
        // Common pattern: 'none', 'total_time', 'per_turn'
        let values: string[] = []

        if (key === 'timeout_type') {
          values = ['none', 'total_time', 'per_turn']
        } else {
          // Fallback: just use the default value
          values = [String(rule.default)]
        }

        settings.push({
          label,
          key,
          availableValues: values,
          defaultValue: String(rule.default),
          type: 'select',
          description: rule.description,
        })
      }
    })

    return settings
  }, [gameInfo?.supported_rules])

  return gameSettings
}
