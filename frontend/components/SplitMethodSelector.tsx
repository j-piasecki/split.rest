import { Selector } from '@components/Selector'
import { useTranslation } from 'react-i18next'
import { SplitMethod } from 'shared'

const OrderedSplitMethods = [
  SplitMethod.Equal,
  SplitMethod.ExactAmounts,
  SplitMethod.Shares,
  SplitMethod.BalanceChanges,
  SplitMethod.Lend,
  SplitMethod.Delayed,
]

interface SplitMethodContent {
  title: string
  description: string
  icon: 'equal' | 'barChart' | 'exactAmount' | 'pieChart' | 'payment' | 'schedule'
}

function ConcreteSplitTypeCard({
  method,
  selectedMethods,
  onSelect,
  startExpanded = true,
  disabledMethods,
}: {
  method: SplitMethod
  selectedMethods: SplitMethod[]
  onSelect: (method: SplitMethod) => void
  startExpanded?: boolean
  disabledMethods?: SplitMethod[]
}) {
  const { t } = useTranslation()

  const methodConfigs: Record<SplitMethod, SplitMethodContent> = {
    [SplitMethod.Equal]: {
      title: t('splitType.equalAmounts'),
      description: t('splitTypeDescription.equalAmounts'),
      icon: 'equal',
    },
    [SplitMethod.BalanceChanges]: {
      title: t('splitType.balanceChanges'),
      description: t('splitTypeDescription.balanceChanges'),
      icon: 'barChart',
    },
    [SplitMethod.ExactAmounts]: {
      title: t('splitType.exactAmounts'),
      description: t('splitTypeDescription.exactAmounts'),
      icon: 'exactAmount',
    },
    [SplitMethod.Shares]: {
      title: t('splitType.shares'),
      description: t('splitTypeDescription.shares'),
      icon: 'pieChart',
    },
    [SplitMethod.Lend]: {
      title: t('splitType.lend'),
      description: t('splitTypeDescription.lend'),
      icon: 'payment',
    },
    [SplitMethod.Delayed]: {
      title: t('splitType.delayed'),
      description: t('splitTypeDescription.delayed'),
      icon: 'schedule',
    },
  }

  const config = methodConfigs[method]
  if (!config) {
    return null
  }

  return (
    <Selector.Item
      title={config.title}
      description={config.description}
      icon={config.icon}
      selected={selectedMethods.includes(method)}
      onSelect={() => onSelect(method)}
      startExpanded={startExpanded}
      disabled={disabledMethods?.includes(method) ?? false}
    />
  )
}

interface BaseSplitMethodSelectorProps {
  displayedMethods: SplitMethod[]
  allowedMethods: SplitMethod[]
  disabledMethods?: SplitMethod[]
  startExpanded?: boolean
}

interface SingleSplitMethodSelectorProps extends BaseSplitMethodSelectorProps {
  multiple: false
  selectedMethod?: SplitMethod
  onSelect: (method: SplitMethod) => void
}

interface MultipleSplitMethodSelectorProps extends BaseSplitMethodSelectorProps {
  multiple: true
  selectedMethods: SplitMethod[]
  onSelectionChange: (methods: SplitMethod[]) => void
}

export type SplitMethodSelectorProps =
  | SingleSplitMethodSelectorProps
  | MultipleSplitMethodSelectorProps

export function SplitMethodSelector(props: SplitMethodSelectorProps) {
  const selectedMethods = props.multiple
    ? props.selectedMethods
    : props.selectedMethod === undefined
      ? []
      : [props.selectedMethod]
  const methodsToDisplay = OrderedSplitMethods.filter(
    (method) => props.displayedMethods.includes(method) && props.allowedMethods.includes(method)
  )
  const startExpanded = props.startExpanded ?? methodsToDisplay.length <= 4

  function onSelect(method: SplitMethod) {
    if (props.multiple) {
      const newSelectedMethods = selectedMethods.includes(method)
        ? selectedMethods.filter((m) => m !== method)
        : [...selectedMethods, method]
      props.onSelectionChange(newSelectedMethods)
    } else {
      props.onSelect(method)
    }
  }

  return (
    <Selector>
      {methodsToDisplay.map((method) => (
        <ConcreteSplitTypeCard
          key={method}
          method={method}
          selectedMethods={selectedMethods}
          onSelect={onSelect}
          startExpanded={startExpanded}
          disabledMethods={props.disabledMethods}
        />
      ))}
    </Selector>
  )
}
