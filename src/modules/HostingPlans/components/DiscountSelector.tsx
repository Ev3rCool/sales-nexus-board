
import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface DiscountSelectorProps {
  planType: string
  value: number
  onChange: (value: number) => void
}

export const DiscountSelector: React.FC<DiscountSelectorProps> = ({
  planType,
  value,
  onChange
}) => {
  const [isCustom, setIsCustom] = React.useState(false)

  const getAvailableDiscounts = (type: string) => {
    const lowerType = type.toLowerCase()
    
    if (lowerType.includes('shared')) {
      return [0, 70, 75, 80, 85]
    } else if (lowerType.includes('vps') || lowerType.includes('dedicated')) {
      return [0, 5, 10, 20, 25, 30, 35]
    } else {
      return [0, 5, 10, 15, 20, 25, 30]
    }
  }

  const standardDiscounts = getAvailableDiscounts(planType)
  const isStandardDiscount = standardDiscounts.includes(value)

  React.useEffect(() => {
    setIsCustom(!isStandardDiscount && value > 0)
  }, [value, isStandardDiscount])

  const handleSelectChange = (stringValue: string) => {
    if (stringValue === 'custom') {
      setIsCustom(true)
      onChange(0)
    } else {
      setIsCustom(false)
      onChange(parseInt(stringValue))
    }
  }

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const customValue = parseInt(e.target.value) || 0
    onChange(Math.min(Math.max(customValue, 0), 100)) // Clamp between 0-100
  }

  if (isCustom) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            type="number"
            min="0"
            max="100"
            value={value}
            onChange={handleCustomChange}
            className="bg-white/5 border-white/10 text-white flex-1"
            placeholder="Enter custom discount %"
          />
          <button
            onClick={() => setIsCustom(false)}
            className="px-3 py-2 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/30 transition-colors"
          >
            Cancel
          </button>
        </div>
        <p className="text-xs text-gray-400">Custom discount: {value}%</p>
      </div>
    )
  }

  return (
    <Select 
      value={isStandardDiscount ? value.toString() : 'custom'} 
      onValueChange={handleSelectChange}
    >
      <SelectTrigger className="bg-white/5 border-white/10 text-white">
        <SelectValue placeholder="Select discount %" />
      </SelectTrigger>
      <SelectContent className="bg-gray-900 border-white/10">
        {standardDiscounts.map((discount) => (
          <SelectItem 
            key={discount} 
            value={discount.toString()}
            className="text-white hover:bg-white/10"
          >
            {discount}%
          </SelectItem>
        ))}
        <SelectItem 
          value="custom"
          className="text-blue-400 hover:bg-white/10"
        >
          Custom Discount
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
