import { BadRequestException } from '../../errors/BadRequestException'
import { CreateSplitArguments, UpdateSplitArguments } from 'shared'

export function validateNormalSplitArgs(args: CreateSplitArguments | UpdateSplitArguments) {
  if (args.balances.findIndex(({ id }) => id === args.paidBy) === -1) {
    throw new BadRequestException('api.split.payerNotInTransaction')
  }

  const payerGetsBack = args.balances.find(({ id }) => id === args.paidBy)?.change
  const othersLose = args.balances.reduce(
    (sum, { id, change }) => (id !== args.paidBy ? sum + Number(change) : sum),
    0
  )

  if (payerGetsBack && Math.abs(Number(payerGetsBack) - Math.abs(othersLose)) > 0.01) {
    throw new BadRequestException('api.split.payerMustGetBackSumOthersLose')
  }
}

export function validateLendSplitArgs(args: CreateSplitArguments | UpdateSplitArguments) {
  validateNormalSplitArgs(args)

  const payerGetsBack = args.balances.find(({ id }) => id === args.paidBy)?.change
  const total = args.total

  if (Math.abs(Number(payerGetsBack) - Number(total)) >= 0.01) {
    throw new BadRequestException('api.split.payerMustGetBackSumOthersLose')
  }
}

export function validateDelayedSplitArgs(args: CreateSplitArguments | UpdateSplitArguments) {
  if (args.balances.length !== 1) {
    throw new BadRequestException('api.split.delayedSplitMustHaveOneParticipant')
  }

  if (args.balances[0].change !== '0.00') {
    throw new BadRequestException('api.split.delayedSplitMustHaveZeroChange')
  }

  if (args.balances[0].id !== args.paidBy) {
    throw new BadRequestException('api.split.delayedSplitMustHavePayerAsParticipant')
  }

  if (!args.paidBy) {
    throw new BadRequestException('api.split.payerNotInTransaction')
  }
}
