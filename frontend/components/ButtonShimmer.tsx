import { ShimmerPlaceholder } from './ShimmerPlaceholder'
import { useTheme } from '@styling/theme'

export interface ButtonShimmerProps<T> {
  argument: T
  children: (arg: Exclude<T, undefined | null>) => React.ReactNode
  offset?: number
}

export function ButtonShimmer<T>({ argument, children, offset }: ButtonShimmerProps<T>) {
  const theme = useTheme()

  return (
    <ShimmerPlaceholder
      style={{
        height: 48,
        minWidth: 180,
        borderRadius: 12,
        backgroundColor: argument ? 'transparent' : theme.colors.primaryContainer,
      }}
      shimmerStyle={{ borderRadius: 12, opacity: 0.25 }}
      color={theme.colors.onPrimaryContainer}
      argument={argument}
      offset={offset}
    >
      {children}
    </ShimmerPlaceholder>
  )
}
