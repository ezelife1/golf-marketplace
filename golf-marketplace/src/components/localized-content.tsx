"use client"

import { useLocale } from '@/contexts/locale-context'
import { Badge } from '@/components/ui/badge'

interface LocalizedConditionProps {
  condition: string
  className?: string
  variant?: 'default' | 'outline' | 'secondary'
}

export function LocalizedCondition({ condition, className, variant = 'outline' }: LocalizedConditionProps) {
  const { t } = useLocale()

  const getConditionTranslationKey = (condition: string) => {
    const conditionMap: Record<string, string> = {
      'New': 'condition.new',
      'Like New': 'condition.like-new',
      'Excellent': 'condition.excellent',
      'Very Good': 'condition.very-good',
      'Good': 'condition.good',
      'Fair': 'condition.fair'
    }
    return conditionMap[condition] || condition
  }

  const getConditionColor = (condition: string) => {
    const colorMap: Record<string, string> = {
      'New': 'text-blue-600 border-blue-200',
      'Like New': 'text-green-600 border-green-200',
      'Excellent': 'text-green-600 border-green-200',
      'Very Good': 'text-blue-600 border-blue-200',
      'Good': 'text-yellow-600 border-yellow-200',
      'Fair': 'text-orange-600 border-orange-200'
    }
    return colorMap[condition] || 'text-gray-600 border-gray-200'
  }

  return (
    <Badge variant={variant} className={`${getConditionColor(condition)} ${className}`}>
      {t(getConditionTranslationKey(condition), condition)}
    </Badge>
  )
}

interface LocalizedCategoryProps {
  category: string
  className?: string
}

export function LocalizedCategory({ category, className }: LocalizedCategoryProps) {
  const { t } = useLocale()

  const getCategoryTranslationKey = (category: string) => {
    const categoryMap: Record<string, string> = {
      'Drivers': 'category.drivers',
      'Irons': 'category.irons',
      'Putters': 'category.putters',
      'Wedges': 'category.wedges',
      'Fairway Woods': 'category.fairway-woods',
      'Hybrids': 'category.hybrids',
      'Golf Bags': 'category.golf-bags',
      'Apparel': 'category.apparel',
      'Accessories': 'category.accessories'
    }
    return categoryMap[category] || category
  }

  return (
    <span className={className}>
      {t(getCategoryTranslationKey(category), category)}
    </span>
  )
}

interface LocalizedTimeProps {
  date: Date | string
  relative?: boolean
  className?: string
}

export function LocalizedTime({ date, relative = false, className }: LocalizedTimeProps) {
  const { formatDate, formatRelativeTime } = useLocale()

  const dateObj = typeof date === 'string' ? new Date(date) : date

  return (
    <span className={className}>
      {relative ? formatRelativeTime(dateObj) : formatDate(dateObj)}
    </span>
  )
}

interface LocalizedGolfAssociationProps {
  countryCode: string
  className?: string
}

export function LocalizedGolfAssociation({ countryCode, className }: LocalizedGolfAssociationProps) {
  const { t } = useLocale()

  const getAssociationKey = (code: string) => {
    const associationMap: Record<string, string> = {
      'GB': 'golf.association.uk',
      'US': 'golf.association.us',
      'AU': 'golf.association.au',
      'CA': 'golf.association.ca',
      'EU': 'golf.association.eu'
    }
    return associationMap[code] || 'golf.association.uk'
  }

  return (
    <span className={className}>
      {t(getAssociationKey(countryCode))}
    </span>
  )
}
