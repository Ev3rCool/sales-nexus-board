import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

export interface HostingCategory {
  id: string
  name: string
  description: string
  icon: string
}

const categories: HostingCategory[] = [
  {
    id: 'shared',
    name: 'Shared Hosting',
    description: 'Perfect for personal websites and small businesses',
    icon: '🌐'
  },
  {
    id: 'vps',
    name: 'Cloud SSD VPS',
    description: 'Scalable virtual private servers with SSD storage',
    icon: '☁️'
  },
  {
    id: 'dedicated',
    name: 'Dedicated CPU Servers',
    description: 'High-performance dedicated server resources',
    icon: '🖥️'
  }
]

interface CategorySelectorProps {
  selectedCategory: string | null
  onCategorySelect: (categoryId: string) => void
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategorySelect
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Choose Hosting Category</h3>
        <p className="text-sm text-gray-400">Select the type of hosting service</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card
            key={category.id}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              selectedCategory === category.id
                ? 'bg-primary/20 border-primary/40 ring-2 ring-primary/30'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
            onClick={() => onCategorySelect(category.id)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">{category.icon}</div>
              <h4 className="text-white font-medium mb-1">{category.name}</h4>
              <p className="text-xs text-gray-400">{category.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}